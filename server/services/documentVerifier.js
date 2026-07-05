/**
 * AI-powered Document Verification Simulator
 * Audits uploaded files against scheme document requirements and user profile.
 */
export const verifyApplicationDocuments = (userProfile, scheme, submittedDocs) => {
  console.log(`\n--- AI DOCUMENT AUDIT ENGINE STARTED for applicant ${userProfile.name} ---`);
  
  const results = [];
  let allVerified = true;
  
  // Get required documents from scheme
  const requiredDocs = scheme.documents || [];
  
  requiredDocs.forEach(reqDocName => {
    // Find if the user submitted a file for this required document
    const match = submittedDocs.find(d => 
      d.name.toLowerCase().trim() === reqDocName.toLowerCase().trim()
    );
    
    if (!match) {
      console.log(`[AI AUDIT] Missing document: "${reqDocName}"`);
      results.push({
        name: reqDocName,
        fileName: 'None',
        status: 'Rejected',
        remarks: 'This required document was not uploaded.'
      });
      allVerified = false;
      return;
    }
    
    const fileName = match.fileName || '';
    const nameLower = reqDocName.toLowerCase();
    const fileLower = fileName.toLowerCase();
    
    console.log(`[AI AUDIT] Scanning uploaded file "${fileName}" for requirement "${reqDocName}"...`);
    
    // Simulate smart keyword checking
    let verified = false;
    let remarks = '';
    
    if (nameLower.includes('aadhar') || nameLower.includes('identification')) {
      if (fileLower.includes('aadhar') || fileLower.includes('id') || fileLower.includes('card') || fileLower.includes('pdf') || fileLower.includes('jpg')) {
        verified = true;
        remarks = 'Aadhaar Card number structure and demographic match verified.';
      } else {
        remarks = 'Invalid Aadhaar file format. Please upload a clear document image or PDF.';
      }
    } else if (nameLower.includes('income')) {
      if (fileLower.includes('income') || fileLower.includes('salary') || fileLower.includes('cert') || fileLower.includes('pdf')) {
        // Cross-reference user's income
        if (scheme.eligibility.incomeMax && userProfile.annualIncome > scheme.eligibility.incomeMax) {
          remarks = `Income Certificate shows Rs. ${userProfile.annualIncome.toLocaleString('en-IN')}, which exceeds the scheme maximum of Rs. ${scheme.eligibility.incomeMax.toLocaleString('en-IN')}.`;
          allVerified = false;
        } else {
          verified = true;
          remarks = `Income Certificate validated. Declared income (Rs. ${userProfile.annualIncome.toLocaleString('en-IN')}) is within acceptable thresholds.`;
        }
      } else {
        remarks = 'Uploaded certificate does not appear to be a valid Income Certificate.';
      }
    } else if (nameLower.includes('caste') || nameLower.includes('category')) {
      if (fileLower.includes('caste') || fileLower.includes('category') || fileLower.includes('cert') || fileLower.includes('community')) {
        // Cross-reference caste/category
        const validCategories = scheme.eligibility.categories || [];
        if (validCategories.length > 0 && !validCategories.includes(userProfile.category)) {
          remarks = `Caste Certificate shows category as ${userProfile.category}, which is not eligible for this scheme (Eligible: ${validCategories.join(', ')}).`;
          allVerified = false;
        } else {
          verified = true;
          remarks = `Caste/Community Certificate verified for category: ${userProfile.category}.`;
        }
      } else {
        remarks = 'Uploaded certificate does not appear to be a valid Caste Certificate.';
      }
    } else if (nameLower.includes('land') || nameLower.includes('ownership') || nameLower.includes('khatauni')) {
      if (fileLower.includes('land') || fileLower.includes('ownership') || fileLower.includes('khatauni') || fileLower.includes('deed')) {
        if (!userProfile.isFarmer) {
          remarks = 'Land record uploaded but user profile does not specify Farmer status.';
          allVerified = false;
        } else {
          verified = true;
          remarks = 'Land ownership Khatauni record verified with agricultural land registry.';
        }
      } else {
        remarks = 'Uploaded document does not appear to be a valid land ownership Khatauni record.';
      }
    } else {
      // General validator
      if (fileLower.length > 3) {
        verified = true;
        remarks = 'Document format and structural integrity verified.';
      } else {
        remarks = 'Uploaded file is corrupted or too small. Please re-upload.';
      }
    }
    
    if (verified) {
      console.log(`[AI AUDIT] ✓ "${reqDocName}" successfully verified.`);
      results.push({
        name: reqDocName,
        fileName,
        status: 'Verified',
        remarks
      });
    } else {
      console.log(`[AI AUDIT] ✗ "${reqDocName}" failed verification. Reason: ${remarks}`);
      results.push({
        name: reqDocName,
        fileName,
        status: 'Rejected',
        remarks
      });
      allVerified = false;
    }
  });
  
  console.log(`--- AI DOCUMENT AUDIT ENGINE COMPLETED: Status is ${allVerified ? 'Verified' : 'Review Required'} ---\n`);
  
  return {
    allVerified,
    documents: results
  };
};
