import mongoose from 'mongoose';

const { Schema } = mongoose;

// User Schema
const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: { type: Number },
  gender: { type: String },
  state: { type: String },
  district: { type: String },
  occupation: { type: String },
  annualIncome: { type: Number },
  education: { type: String },
  category: { type: String }, // General, OBC, SC, ST
  isFarmer: { type: Boolean, default: false },
  isStudent: { type: Boolean, default: false },
  isSeniorCitizen: { type: Boolean, default: false },
  isDisabled: { type: Boolean, default: false },
  isWidow: { type: Boolean, default: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

// Scheme Schema
const schemeSchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  category: { type: String, required: true }, // Agriculture, Health, Education, Pension, Housing, etc.
  state: { type: String, default: 'Central' }, // State name or 'Central'
  eligibility: {
    ageMin: { type: Number },
    ageMax: { type: Number },
    incomeMax: { type: Number },
    gender: { type: String }, // 'Male', 'Female', 'All'
    isFarmer: { type: Boolean },
    isStudent: { type: Boolean },
    isSeniorCitizen: { type: Boolean },
    isDisabled: { type: Boolean },
    isWidow: { type: Boolean },
    occupations: [String], // Array of valid occupations
    educationMin: { type: String },
    categories: [String], // e.g. ['SC', 'ST', 'OBC', 'General']
    states: [String] // Specific states applicable
  },
  benefits: { type: String, required: true },
  documents: [{ type: String }],
  officialWebsite: { type: String },
  deadline: { type: String },
  department: { type: String },
  vectorEmbeddings: { type: [Number] } // Storing embeddings for vector search
}, { timestamps: true });

// Bookmark Schema
const bookmarkSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  scheme: { type: Schema.Types.ObjectId, ref: 'Scheme', required: true }
}, { timestamps: true });

// Report Schema
const reportSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  criteria: { type: Schema.Types.Mixed, required: true },
  eligibleSchemes: [{
    schemeId: { type: Schema.Types.ObjectId, ref: 'Scheme' },
    name: { type: String },
    benefits: { type: String },
    eligibilityReason: { type: String },
    documents: [{ type: String }],
    applicationSteps: [{ type: String }],
    officialLinks: { type: String }
  }]
}, { timestamps: true });

// Search History Schema
const searchHistorySchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  criteria: { type: Schema.Types.Mixed, required: true },
  timestamp: { type: Date, default: Date.now }
});

// Feedback Schema
const feedbackSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  name: { type: String },
  email: { type: String },
  message: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5 },
  timestamp: { type: Date, default: Date.now }
});

// Chat History Schema
const chatHistorySchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: String, enum: ['user', 'assistant'], required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

// Application Schema
const applicationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  scheme: { type: Schema.Types.ObjectId, ref: 'Scheme', required: true },
  trackingNumber: { type: String, required: true, unique: true },
  status: { 
    type: String, 
    enum: ['Pending Verification', 'Documents Verified', 'Under Review', 'Approved', 'Rejected'], 
    default: 'Pending Verification' 
  },
  documents: [{
    name: { type: String, required: true },
    fileName: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Verified', 'Rejected'], default: 'Pending' },
    remarks: { type: String, default: '' }
  }],
  remarks: { type: String, default: '' }
}, { timestamps: true });

// Notification Schema
const notificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false }
}, { timestamps: true });

// Register models
export const User = mongoose.model('User', userSchema);
export const Scheme = mongoose.model('Scheme', schemeSchema);
export const Bookmark = mongoose.model('Bookmark', bookmarkSchema);
export const Report = mongoose.model('Report', reportSchema);
export const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);
export const Feedback = mongoose.model('Feedback', feedbackSchema);
export const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);
export const Application = mongoose.model('Application', applicationSchema);
export const Notification = mongoose.model('Notification', notificationSchema);
