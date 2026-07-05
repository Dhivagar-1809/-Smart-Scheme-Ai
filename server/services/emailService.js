/**
 * Email Notification Simulator
 * Simulates sending SMTP email alerts to the citizen about application status changes.
 */
export const sendStatusEmail = (toEmail, userName, schemeName, trackingNumber, newStatus, remarks) => {
  const border = "=".repeat(65);
  const emailTemplate = `
${border}
EMAIL NOTIFICATION SENT SUCCESSFULLY (SIMULATED SMTP)
Recipient: ${toEmail}
Subject: Update on your Government Welfare Application - ${trackingNumber}
${border}
Dear ${userName},

This is an automated update regarding your application for:
"${schemeName}"

Details:
* Application Tracking ID: ${trackingNumber}
* Current Status: ${newStatus.toUpperCase()}
* Latest Update Date: ${new Date().toLocaleString('en-IN')}

${remarks ? `Remarks / Action Required:\n"${remarks}"` : "Remarks:\nYour application parameters have been successfully logged and processed."}

You can track your application status anytime on the Smart Scheme AI Dashboard.

Regards,
The Smart Scheme AI Team
Government Welfare Portal
${border}
`;
  console.log(emailTemplate);
  return true;
};
