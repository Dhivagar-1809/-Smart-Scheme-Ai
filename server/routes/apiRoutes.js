import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { User, Scheme, Bookmark, Report, SearchHistory, Feedback, ChatHistory, Application, Notification } from '../models/schemas.js';
import { evaluateEligibility, chatWithAssistant } from '../services/geminiService.js';
import { searchVectorSchemes, reindexSchemes } from '../services/vectorStoreService.js';
import { generateReportPDF } from '../services/pdfService.js';
import { verifyApplicationDocuments } from '../services/documentVerifier.js';
import { sendStatusEmail } from '../services/emailService.js';

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'smart_scheme_secret_key_12345';

// Helper to generate token
const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
};

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

// Register
router.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please enter all required fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const isFirstAccount = (await User.countDocuments({})) === 0;
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: isFirstAccount ? 'admin' : 'user' // Auto-promote first user to admin
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: `Registration failed: ${error.message}` });
  }
});

// Login
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        age: user.age,
        gender: user.gender,
        state: user.state,
        district: user.district,
        occupation: user.occupation,
        annualIncome: user.annualIncome,
        education: user.education,
        category: user.category,
        isFarmer: user.isFarmer,
        isStudent: user.isStudent,
        isSeniorCitizen: user.isSeniorCitizen,
        isDisabled: user.isDisabled,
        isWidow: user.isWidow
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: `Login failed: ${error.message}` });
  }
});

// ==========================================
// PROFILE ROUTES
// ==========================================

// Get Profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving profile' });
  }
});

// Update Profile
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const fieldsToUpdate = [
      'name', 'age', 'gender', 'state', 'district', 'occupation',
      'annualIncome', 'education', 'category', 'isFarmer',
      'isStudent', 'isSeniorCitizen', 'isDisabled', 'isWidow'
    ];

    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// ==========================================
// ELIGIBILITY CHECK ROUTE
// ==========================================

router.post('/eligibility', protect, async (req, res) => {
  try {
    const criteria = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Save criteria as history
    await SearchHistory.create({
      user: user._id,
      criteria
    });

    // 1. Fetch ALL candidate schemes from MongoDB for matching
    const schemes = await Scheme.find({});
    
    // 2. Perform a basic filter pre-screen to filter out highly irrelevant schemes
    // (e.g. if scheme is state-specific and user is in a different state)
    const candidates = schemes.filter(scheme => {
      // State matching: scheme is Central or matches user's state
      if (scheme.state !== 'Central' && criteria.state && scheme.state.toLowerCase() !== criteria.state.toLowerCase()) {
        return false;
      }
      // Gender exclusion
      if (scheme.eligibility.gender && scheme.eligibility.gender !== 'All' && criteria.gender && scheme.eligibility.gender.toLowerCase() !== criteria.gender.toLowerCase()) {
        return false;
      }
      // Income exclusion
      if (scheme.eligibility.incomeMax && criteria.annualIncome && criteria.annualIncome > scheme.eligibility.incomeMax) {
        return false;
      }
      // Age exclusions
      if (scheme.eligibility.ageMin && criteria.age && criteria.age < scheme.eligibility.ageMin) {
        return false;
      }
      if (scheme.eligibility.ageMax && criteria.age && criteria.age > scheme.eligibility.ageMax) {
        return false;
      }
      // Special flags mapping
      if (scheme.eligibility.isFarmer && !criteria.isFarmer) return false;
      if (scheme.eligibility.isStudent && !criteria.isStudent) return false;
      if (scheme.eligibility.isSeniorCitizen && !criteria.isSeniorCitizen) return false;
      if (scheme.eligibility.isDisabled && !criteria.isDisabled) return false;
      if (scheme.eligibility.isWidow && !criteria.isWidow) return false;

      return true;
    });

    if (candidates.length === 0) {
      const report = await Report.create({
        user: user._id,
        criteria,
        eligibleSchemes: []
      });
      return res.json({ reportId: report._id, eligibleSchemes: [] });
    }

    // 3. Forward filtered candidates to Gemini for deep AI qualification details
    console.log(`Sending ${candidates.length} candidate schemes to Gemini for audit...`);
    const evaluation = await evaluateEligibility(criteria, candidates);
    
    // Add DB scheme IDs back
    const processedEligibleSchemes = evaluation.eligibleSchemes.map(eligible => {
      const matched = candidates.find(c => c.name === eligible.name || c._id.toString() === eligible.schemeId);
      return {
        ...eligible,
        schemeId: matched ? matched._id : eligible.schemeId
      };
    });

    // 4. Save audit report to MongoDB
    const report = await Report.create({
      user: user._id,
      criteria,
      eligibleSchemes: processedEligibleSchemes
    });

    res.json({
      reportId: report._id,
      eligibleSchemes: processedEligibleSchemes
    });
  } catch (error) {
    console.error('Eligibility check error:', error);
    res.status(500).json({ message: 'Error checking eligibility. Please try again.' });
  }
});

// ==========================================
// WELFARE SCHEMES ROUTES
// ==========================================

// Get Schemes (with Search & Vector semantic search support)
router.get('/schemes', async (req, res) => {
  try {
    const { category, state, search, type } = req.query;
    
    // If type is 'vector' and search exists, perform semantic search
    if (type === 'vector' && search) {
      const semanticResults = await searchVectorSchemes(search, 8);
      return res.json(semanticResults);
    }

    let filter = {};
    if (category) filter.category = category;
    if (state && state !== 'All') {
      filter.$or = [{ state: 'Central' }, { state: { $regex: state, $options: 'i' } }];
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    const schemes = await Scheme.find(filter).select('-vectorEmbeddings');
    res.json(schemes);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving schemes' });
  }
});

// Get single scheme
router.get('/schemes/:id', async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id).select('-vectorEmbeddings');
    if (!scheme) {
      return res.status(404).json({ message: 'Scheme not found' });
    }
    res.json(scheme);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving scheme details' });
  }
});

// ==========================================
// CHATBOT ROUTES
// ==========================================

// Get Chat history
router.get('/chat/history', protect, async (req, res) => {
  try {
    const history = await ChatHistory.find({ user: req.user.userId })
                                     .sort({ timestamp: 1 })
                                     .limit(50);
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving chat history' });
  }
});

// Post Chat message
router.post('/chat', protect, async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ message: 'Query string is required' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Save user message to DB
    await ChatHistory.create({
      user: user._id,
      sender: 'user',
      message: query
    });

    // Retrieve recent chat history as context
    const recentHistory = await ChatHistory.find({ user: user._id })
                                           .sort({ timestamp: -1 })
                                           .limit(10);
    recentHistory.reverse(); // put in chronological order

    // Fetch Gemini Response
    const responseText = await chatWithAssistant(query, recentHistory, user);

    // Save assistant message to DB
    await ChatHistory.create({
      user: user._id,
      sender: 'assistant',
      message: responseText
    });

    res.json({ response: responseText });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message: 'Error processing chatbot message' });
  }
});

// ==========================================
// BOOKMARK ROUTES
// ==========================================

// Get Bookmarks
router.get('/bookmarks', protect, async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user.userId })
                                    .populate('scheme', '-vectorEmbeddings');
    res.json(bookmarks);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving bookmarks' });
  }
});

// Create Bookmark
router.post('/bookmarks', protect, async (req, res) => {
  try {
    const { schemeId } = req.body;
    if (!schemeId) {
      return res.status(400).json({ message: 'Scheme ID is required' });
    }

    // Prevent duplicate bookmarks
    const exists = await Bookmark.findOne({ user: req.user.userId, scheme: schemeId });
    if (exists) {
      return res.status(400).json({ message: 'Scheme already bookmarked' });
    }

    const bookmark = await Bookmark.create({
      user: req.user.userId,
      scheme: schemeId
    });

    res.status(201).json(bookmark);
  } catch (error) {
    res.status(500).json({ message: 'Error bookmarking scheme' });
  }
});

// Delete Bookmark
router.delete('/bookmarks/:schemeId', protect, async (req, res) => {
  try {
    const bookmark = await Bookmark.findOneAndDelete({
      user: req.user.userId,
      scheme: req.params.schemeId
    });
    if (!bookmark) {
      return res.status(404).json({ message: 'Bookmark not found' });
    }
    res.json({ message: 'Bookmark removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing bookmark' });
  }
});

// ==========================================
// SEARCH HISTORY ROUTES
// ==========================================

router.get('/history', protect, async (req, res) => {
  try {
    const history = await SearchHistory.find({ user: req.user.userId })
                                       .sort({ timestamp: -1 })
                                       .limit(20);
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving search history' });
  }
});

// ==========================================
// REPORTS ROUTES (PDF DOWNLOADS)
// ==========================================

// Get list of generated reports
router.get('/reports', protect, async (req, res) => {
  try {
    const reports = await Report.find({ user: req.user.userId })
                                .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving reports' });
  }
});

// Download PDF
router.get('/reports/:reportId/pdf', protect, async (req, res) => {
  try {
    const report = await Report.findById(req.params.reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Verify ownership
    if (report.user.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized access to report' });
    }

    const userProfile = await User.findById(report.user);
    generateReportPDF(res, report, userProfile);
  } catch (error) {
    console.error('PDF generation endpoint error:', error);
    res.status(500).json({ message: 'Error generating PDF report file' });
  }
});

// ==========================================
// FEEDBACK SYSTEM
// ==========================================

router.post('/feedback', async (req, res) => {
  try {
    const { name, email, message, rating, userId } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Feedback message is required' });
    }

    const feedback = await Feedback.create({
      user: userId || null,
      name,
      email,
      message,
      rating: rating || 5
    });

    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting feedback' });
  }
});

// ==========================================
// ADMIN DASHBOARD & CRUD ROUTES
// ==========================================

// Get admin stats/analytics
router.get('/admin/analytics', protect, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalSearches = await SearchHistory.countDocuments({});
    const totalSchemes = await Scheme.countDocuments({});
    
    // Aggregate category distribution for popular schemes
    const bookmarks = await Bookmark.find().populate('scheme');
    const schemeCounts = {};
    bookmarks.forEach(b => {
      if (b.scheme) {
        schemeCounts[b.scheme.name] = (schemeCounts[b.scheme.name] || 0) + 1;
      }
    });

    const popularSchemes = Object.keys(schemeCounts).map(name => ({
      name,
      bookmarksCount: schemeCounts[name]
    })).sort((a, b) => b.bookmarksCount - a.bookmarksCount).slice(0, 5);

    // Simple feedback statistics
    const feedbacks = await Feedback.find({});
    const avgRating = feedbacks.length > 0 
      ? (feedbacks.reduce((sum, f) => sum + (f.rating || 5), 0) / feedbacks.length).toFixed(1) 
      : '5.0';

    // Mock active sessions/traffic simulator
    const dailyTraffic = [
      { day: 'Mon', visits: 145 },
      { day: 'Tue', visits: 232 },
      { day: 'Wed', visits: 198 },
      { day: 'Thu', visits: 310 },
      { day: 'Fri', visits: 280 },
      { day: 'Sat', visits: 190 },
      { day: 'Sun', visits: 220 }
    ];

    res.json({
      stats: {
        totalUsers,
        totalSearches,
        totalSchemes,
        avgRating
      },
      popularSchemes,
      dailyTraffic
    });
  } catch (error) {
    console.error('Analytics retrieving failed:', error);
    res.status(500).json({ message: 'Error compiling analytics records' });
  }
});

// Create scheme
router.post('/admin/schemes', protect, adminOnly, async (req, res) => {
  try {
    const scheme = await Scheme.create(req.body);
    // Trigger embedding generation in background
    const embeddingText = `${scheme.name}. ${scheme.description} Category: ${scheme.category}. State: ${scheme.state}. Benefits: ${scheme.benefits}`;
    getEmbedding(embeddingText).then(async (embedding) => {
      scheme.vectorEmbeddings = embedding;
      await scheme.save();
      console.log(`Generated embedding for newly created admin scheme: ${scheme.name}`);
    }).catch(err => console.error('BG Embedding build failed for scheme:', err));

    res.status(201).json(scheme);
  } catch (error) {
    res.status(500).json({ message: 'Error creating new scheme' });
  }
});

// Update scheme
router.put('/admin/schemes/:id', protect, adminOnly, async (req, res) => {
  try {
    const scheme = await Scheme.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!scheme) return res.status(404).json({ message: 'Scheme not found' });
    
    // Update embedding in background
    const embeddingText = `${scheme.name}. ${scheme.description} Category: ${scheme.category}. State: ${scheme.state}. Benefits: ${scheme.benefits}`;
    getEmbedding(embeddingText).then(async (embedding) => {
      scheme.vectorEmbeddings = embedding;
      await scheme.save();
      console.log(`Updated embedding for edited admin scheme: ${scheme.name}`);
    }).catch(err => console.error('BG Embedding update failed for scheme:', err));

    res.json(scheme);
  } catch (error) {
    res.status(500).json({ message: 'Error updating scheme' });
  }
});

// Delete scheme
router.delete('/admin/schemes/:id', protect, adminOnly, async (req, res) => {
  try {
    const scheme = await Scheme.findByIdAndDelete(req.params.id);
    if (!scheme) return res.status(404).json({ message: 'Scheme not found' });
    res.json({ message: 'Scheme deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting scheme' });
  }
});

// Manage Users (Admin only)
router.get('/admin/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user accounts list' });
  }
});

// ==========================================
// NOTIFICATIONS SYSTEM
// ==========================================

// Get user notifications
router.get('/notifications', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.userId })
                                            .sort({ createdAt: -1 })
                                            .limit(30);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

// Mark all as read
router.put('/notifications/read', protect, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user.userId, read: false }, { read: true });
    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notifications' });
  }
});

// ==========================================
// APPLICATIONS LIFECYCLE & STEPS
// ==========================================

// Apply for a scheme with document uploads
router.post('/applications/apply', protect, async (req, res) => {
  try {
    const { schemeId, documents } = req.body; // documents: [{ name, fileName }]
    
    if (!schemeId || !documents || !Array.isArray(documents)) {
      return res.status(400).json({ message: 'Scheme ID and documents are required' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User account not found' });
    }

    const scheme = await Scheme.findById(schemeId);
    if (!scheme) {
      return res.status(404).json({ message: 'Government scheme not found' });
    }

    // Check if user has already applied for this scheme to prevent duplicate applications
    const existingApplication = await Application.findOne({ user: user._id, scheme: schemeId });
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already submitted an application for this scheme.' });
    }

    // Generate unique tracking number (e.g. SCH-K29A1L)
    const charPool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) { code += charPool.charAt(Math.floor(Math.random() * charPool.length)); }
    const trackingNumber = `SCH-${code}`;

    // Perform AI-powered automatic document verification
    const verificationResult = verifyApplicationDocuments(user, scheme, documents);
    
    // Set status based on document audit
    const appStatus = verificationResult.allVerified ? 'Under Review' : 'Pending Verification';

    // Create the Application record
    const application = await Application.create({
      user: user._id,
      scheme: scheme._id,
      trackingNumber,
      status: appStatus,
      documents: verificationResult.documents,
      remarks: verificationResult.allVerified 
        ? 'All required documents successfully passed AI verification checks.' 
        : 'AI verification identified matching issues or missing files. Admin review required.'
    });

    // Create a real-time Notification for dashboard
    await Notification.create({
      user: user._id,
      title: 'Application Submitted',
      message: `Your application for ${scheme.name} (Tracking ID: ${trackingNumber}) is now ${appStatus}.`
    });

    // Send Simulated SMTP Email Notification
    sendStatusEmail(
      user.email, 
      user.name, 
      scheme.name, 
      trackingNumber, 
      appStatus, 
      application.remarks
    );

    res.status(201).json({
      message: 'Application submitted successfully',
      application: {
        id: application._id,
        trackingNumber: application.trackingNumber,
        status: application.status,
        documents: application.documents,
        remarks: application.remarks
      }
    });

  } catch (error) {
    console.error('Submit application error:', error);
    res.status(500).json({ message: 'Failed to submit application. Please try again.' });
  }
});

// Get logged-in user's applications
router.get('/applications/my-applications', protect, async (req, res) => {
  try {
    const applications = await Application.find({ user: req.user.userId })
                                          .populate('scheme', '-vectorEmbeddings')
                                          .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user applications' });
  }
});

// Direct tracking by ID (No auth required for basic check)
router.get('/applications/track/:trackingNumber', async (req, res) => {
  try {
    const application = await Application.findOne({ trackingNumber: req.params.trackingNumber.toUpperCase() })
                                          .populate('scheme', 'name category agency department state')
                                          .populate('user', 'name');
    if (!application) {
      return res.status(404).json({ message: 'Application not found with this tracking code' });
    }
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Error searching tracking details' });
  }
});

// Admin list all applications
router.get('/admin/applications', protect, adminOnly, async (req, res) => {
  try {
    const applications = await Application.find({})
                                          .populate('user', 'name email category annualIncome state occupation')
                                          .populate('scheme', 'name category documents')
                                          .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving system applications' });
  }
});

// Admin update application status
router.put('/admin/applications/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status, remarks, documentStatuses } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const application = await Application.findById(req.params.id)
                                          .populate('user', 'name email')
                                          .populate('scheme', 'name');
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = status;
    if (remarks !== undefined) {
      application.remarks = remarks;
    }

    // Update individual document verification statuses if supplied by admin
    if (documentStatuses && Array.isArray(documentStatuses)) {
      documentStatuses.forEach(update => {
        const doc = application.documents.find(d => d.name === update.name);
        if (doc) {
          doc.status = update.status;
          if (update.remarks) doc.remarks = update.remarks;
        }
      });
    }

    await application.save();

    // Create Notification
    await Notification.create({
      user: application.user._id,
      title: `Application Status: ${status}`,
      message: `Your application for ${application.scheme.name} is now ${status}. Remarks: ${remarks || 'None'}`
    });

    // Send Simulated Email
    sendStatusEmail(
      application.user.email,
      application.user.name,
      application.scheme.name,
      application.trackingNumber,
      status,
      remarks
    );

    res.json({ message: 'Application updated successfully', application });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Failed to update application status' });
  }
});

export default router;
