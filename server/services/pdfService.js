import PDFDocument from 'pdfkit';

/**
 * Generate a professional eligibility report PDF and stream it to the response.
 */
export const generateReportPDF = (res, reportData, userProfile) => {
  const doc = new PDFDocument({
    margin: 50,
    size: 'A4'
  });

  // Set response headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=Smart_Scheme_Report_${Date.now()}.pdf`);

  // Pipe to response
  doc.pipe(res);

  // Styling Constants
  const primaryColor = '#2563EB'; // Royal Blue
  const secondaryColor = '#7C3AED'; // Violet
  const darkColor = '#1E293B'; // Slate 800
  const lightGray = '#F1F5F9'; // Slate 100
  const dividerColor = '#CBD5E1'; // Slate 300

  // --- HEADER SECTION ---
  doc.rect(0, 0, 595.28, 120) // A4 width is 595.28 pt
     .fill(primaryColor);

  doc.fillColor('#FFFFFF')
     .font('Helvetica-Bold')
     .fontSize(26)
     .text('SMART SCHEME ASSISTANT', 50, 40);

  doc.fontSize(12)
     .font('Helvetica-Oblique')
     .text('"Find Government Benefits You\'re Eligible For in Seconds."', 50, 75);

  doc.font('Helvetica')
     .fontSize(10)
     .text(`Report Generated: ${new Date().toLocaleDateString('en-IN')}`, 400, 45, { align: 'right' });

  // Move cursor below header banner
  doc.y = 150;

  // --- USER PROFILE SUMMARY ---
  doc.fillColor(darkColor)
     .font('Helvetica-Bold')
     .fontSize(14)
     .text('Applicant Profile Summary', 50, doc.y);

  doc.moveTo(50, doc.y + 5)
     .lineTo(545, doc.y + 5)
     .strokeColor(dividerColor)
     .stroke();

  doc.y += 15;

  // Render a two-column key-value grid for profile info
  const profileItems = [
    { label: 'Full Name', value: userProfile.name || 'N/A' },
    { label: 'Age', value: userProfile.age ? `${userProfile.age} Years` : 'N/A' },
    { label: 'Gender', value: userProfile.gender || 'N/A' },
    { label: 'State', value: userProfile.state || 'N/A' },
    { label: 'Occupation', value: userProfile.occupation || 'N/A' },
    { label: 'Annual Income', value: userProfile.annualIncome ? `Rs. ${userProfile.annualIncome.toLocaleString('en-IN')}` : 'N/A' },
    { label: 'Education', value: userProfile.education || 'N/A' },
    { label: 'Category', value: userProfile.category || 'N/A' },
    { label: 'Special Attributes', value: [
      userProfile.isFarmer ? 'Farmer' : null,
      userProfile.isStudent ? 'Student' : null,
      userProfile.isSeniorCitizen ? 'Senior Citizen' : null,
      userProfile.isDisabled ? 'Specially Abled' : null,
      userProfile.isWidow ? 'Widow' : null
    ].filter(Boolean).join(', ') || 'None' }
  ];

  let leftColX = 50;
  let rightColX = 300;
  let startY = doc.y;

  profileItems.forEach((item, index) => {
    const isLeft = index % 2 === 0;
    const currentX = isLeft ? leftColX : rightColX;
    const currentY = startY + Math.floor(index / 2) * 20;

    doc.font('Helvetica-Bold')
       .fontSize(10)
       .fillColor(primaryColor)
       .text(`${item.label}:`, currentX, currentY);

    doc.font('Helvetica')
       .fillColor(darkColor)
       .text(item.value, currentX + 90, currentY, { width: 150 });
  });

  doc.y = startY + Math.ceil(profileItems.length / 2) * 20 + 25;

  // --- SCHEMES SECTION ---
  doc.fillColor(secondaryColor)
     .font('Helvetica-Bold')
     .fontSize(16)
     .text('Eligible Government Welfare Schemes', 50, doc.y);

  doc.moveTo(50, doc.y + 5)
     .lineTo(545, doc.y + 5)
     .strokeColor(secondaryColor)
     .stroke();

  doc.y += 20;

  if (!reportData.eligibleSchemes || reportData.eligibleSchemes.length === 0) {
    doc.font('Helvetica')
       .fillColor(darkColor)
       .fontSize(11)
       .text('No schemes found matching your profile characteristics.', 50, doc.y);
  } else {
    reportData.eligibleSchemes.forEach((scheme, index) => {
      // Page break check (leave 150pt margin for scheme block start)
      if (doc.y > 650) {
        doc.addPage();
        doc.y = 50; // top margin
      }

      // Scheme Header Box
      doc.rect(50, doc.y, 495, 30)
         .fill(lightGray);

      doc.fillColor(primaryColor)
         .font('Helvetica-Bold')
         .fontSize(12)
         .text(`${index + 1}. ${scheme.name}`, 60, doc.y + 8, { width: 475 });

      doc.y += 38;

      // Benefits
      doc.fillColor(darkColor)
         .font('Helvetica-Bold')
         .fontSize(10)
         .text('Expected Benefits: ', 60, doc.y, { continued: true });
      doc.font('Helvetica')
         .text(scheme.benefits);

      doc.y += 10;

      // Reason
      doc.font('Helvetica-Bold')
         .text('Why You Qualify: ', 60, doc.y, { continued: true });
      doc.font('Helvetica')
         .text(scheme.eligibilityReason);

      doc.y += 10;

      // Required Documents
      doc.font('Helvetica-Bold')
         .text('Required Documents Checklist:');
      
      doc.font('Helvetica');
      scheme.documents.forEach(docName => {
        doc.text(`  [ ] ${docName}`, 70);
      });

      doc.y += 10;

      // Application Steps
      doc.font('Helvetica-Bold')
         .text('How to Apply Steps:');
      
      doc.font('Helvetica');
      scheme.applicationSteps.forEach((step, sIdx) => {
        doc.text(`  ${sIdx + 1}. ${step}`, 70);
      });

      doc.y += 10;

      // Links
      doc.font('Helvetica-Bold')
         .text('Official Portal: ', 60, doc.y, { continued: true });
      doc.font('Helvetica')
         .fillColor(primaryColor)
         .text(scheme.officialLinks || 'N/A', { link: scheme.officialLinks });

      doc.y += 25; // Space between schemes
    });
  }

  // --- FOOTER AND DISCLAIMER ---
  // Add final page footer if space allows, otherwise add page
  if (doc.y > 700) {
    doc.addPage();
    doc.y = 50;
  }

  doc.y = 750;
  doc.moveTo(50, doc.y)
     .lineTo(545, doc.y)
     .strokeColor(dividerColor)
     .stroke();

  doc.y += 10;
  doc.fontSize(8)
     .fillColor('#64748B')
     .font('Helvetica-Oblique')
     .text('Disclaimer: The schemes and eligibility criteria displayed in this report are analyzed by an AI engine based on current available government data. Citizens are advised to verify details with the official department website before final application submission.', 50, doc.y, { align: 'center', width: 495 });

  doc.end();
};
