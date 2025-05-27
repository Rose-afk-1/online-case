import * as SibApiV3Sdk from '@getbrevo/brevo';

export interface EmailData {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  from?: { email: string; name: string };
}

export async function sendEmail(data: EmailData): Promise<boolean> {
  try {
    const { to, subject, htmlContent, textContent, from } = data;
    
    console.log(`Attempting to send email with subject: "${subject}" to: ${to.map(recipient => recipient.email).join(', ')}`);
    
    // Configure API key authorization
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    const apiKey = process.env.BREVO_API_KEY;
    
    if (!apiKey) {
      console.error('BREVO_API_KEY is not defined in environment variables');
      return false;
    }
    
    apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, apiKey);
    
    // Create email object
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    
    // Set required fields
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;
    if (textContent) {
      sendSmtpEmail.textContent = textContent;
    }
    
    // Set sender
    sendSmtpEmail.sender = from || {
      name: 'Online Case Filing System',
      email: 'rose85you@gmail.com',
    };
    
    // Set recipients
    sendSmtpEmail.to = to;
    
    console.log('Email payload prepared, attempting to send...');
    
    // Send the email
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`Email sent successfully to ${to.map(recipient => recipient.email).join(', ')}`, response);
    return true;
  } catch (error) {
    console.error(`Failed to send email with subject: "${data.subject}"`, error);
    return false;
  }
}

// Helper function for common emails
export function sendCaseStatusEmail(
  userEmail: string, 
  userName: string, 
  caseNumber: string, 
  caseTitle: string, 
  newStatus: string
): Promise<boolean> {
  const statusColors = {
    pending: '#FFC107',
    approved: '#4CAF50',
    rejected: '#F44336',
    inProgress: '#2196F3',
    completed: '#4CAF50',
    closed: '#9E9E9E',
  };
  
  const statusColor = statusColors[newStatus as keyof typeof statusColors] || '#9E9E9E';
  
  return sendEmail({
    to: [{ email: userEmail, name: userName }],
    subject: `Case Status Update: ${caseNumber}`,
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Case Status Update</h2>
        <p>Dear ${userName},</p>
        <p>Your case has been updated.</p>
        
        <div style="border: 1px solid #ddd; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Case Number:</strong> ${caseNumber}</p>
          <p><strong>Case Title:</strong> ${caseTitle}</p>
          <p><strong>New Status:</strong> <span style="background-color: ${statusColor}; color: white; padding: 3px 8px; border-radius: 3px;">${newStatus}</span></p>
        </div>
        
        <p>You can log in to your account to view more details about this case update.</p>
        <p>Thank you for using our Online Case Filing System.</p>
      </div>
    `,
    textContent: `
      Case Status Update
      
      Dear ${userName},
      
      Your case has been updated.
      
      Case Number: ${caseNumber}
      Case Title: ${caseTitle}
      New Status: ${newStatus}
      
      You can log in to your account to view more details about this case update.
      
      Thank you for using our Online Case Filing System.
    `,
  });
}

/**
 * Send a welcome email to newly registered users
 */
export function sendWelcomeEmail(
  userEmail: string,
  userName: string
): Promise<boolean> {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
  return sendEmail({
    to: [{ email: userEmail, name: userName }],
    subject: `Welcome to Online Case Filing System`,
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Online Case Filing System</h2>
        <p>Dear ${userName},</p>
        <p>Thank you for registering with our Online Case Filing System.</p>
        
        <div style="border: 1px solid #ddd; padding: 15px; border-radius: 5px; margin: 20px 0; background-color: #f9f9f9;">
          <p>Your account has been created successfully.</p>
        </div>
        
        <h3>Getting Started:</h3>
        <ol style="line-height: 1.6;">
          <li>Log in to your account</li>
          <li>Complete your profile information</li>
          <li>Start filing your cases or track existing ones</li>
        </ol>
        
        <p>If you have any questions or need assistance, please contact our support team.</p>
        <p>Thank you for choosing our service.</p>
      </div>
    `,
    textContent: `
      Welcome to Online Case Filing System
      
      Dear ${userName},
      
      Thank you for registering with our Online Case Filing System.
      
      Your account has been created successfully.
      
      Getting Started:
      1. Log in to your account
      2. Complete your profile information
      3. Start filing your cases or track existing ones
      
      If you have any questions or need assistance, please contact our support team.
      
      Thank you for choosing our service.
    `,
  });
}

/**
 * Send notification emails to admin users
 * Used for system alerts, new registrations, case submissions, etc.
 */
export async function sendAdminNotificationEmail(
  adminEmails: string[],
  subject: string,
  contentType: 'new_user' | 'new_case' | 'system_alert' | 'summary',
  data: any
): Promise<boolean> {
  // Early return if no admin emails provided
  if (!adminEmails.length) {
    console.error('No admin emails provided for notification');
    return false;
  }
  
  // Format the email recipients
  const recipients = adminEmails.map(email => ({ email }));
  
  // Generate email content based on notification type
  let htmlContent = '';
  let textContent = '';
  
  switch (contentType) {
    case 'new_user':
      const { name, email, role, registeredAt } = data;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New User Registration</h2>
          <p>A new user has registered on the system.</p>
          
          <div style="border: 1px solid #ddd; padding: 15px; border-radius: 5px; margin: 20px 0; background-color: #f9f9f9;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Role:</strong> ${role}</p>
            <p><strong>Registered:</strong> ${new Date(registeredAt).toLocaleString()}</p>
          </div>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="${process.env.NEXTAUTH_URL}/admin/users" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              View User Management
            </a>
          </div>
          
          <p>You're receiving this email because you're an administrator of the Online Case Filing System.</p>
        </div>
      `;
      textContent = `
        New User Registration
        
        A new user has registered on the system.
        
        Name: ${name}
        Email: ${email}
        Role: ${role}
        Registered: ${new Date(registeredAt).toLocaleString()}
        
        To view user management, visit: ${process.env.NEXTAUTH_URL}/admin/users
        
        You're receiving this email because you're an administrator of the Online Case Filing System.
      `;
      break;
      
    case 'new_case':
      const { caseNumber, title, userId, filedBy, filedAt } = data;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Case Submission</h2>
          <p>A new case has been filed in the system.</p>
          
          <div style="border: 1px solid #ddd; padding: 15px; border-radius: 5px; margin: 20px 0; background-color: #f9f9f9;">
            <p><strong>Case Number:</strong> ${caseNumber}</p>
            <p><strong>Title:</strong> ${title}</p>
            <p><strong>Filed By:</strong> ${filedBy}</p>
            <p><strong>Filed At:</strong> ${new Date(filedAt).toLocaleString()}</p>
          </div>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="${process.env.NEXTAUTH_URL}/admin/cases/${userId}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Review Case
            </a>
          </div>
          
          <p>You're receiving this email because you're an administrator of the Online Case Filing System.</p>
        </div>
      `;
      textContent = `
        New Case Submission
        
        A new case has been filed in the system.
        
        Case Number: ${caseNumber}
        Title: ${title}
        Filed By: ${filedBy}
        Filed At: ${new Date(filedAt).toLocaleString()}
        
        To review the case, visit: ${process.env.NEXTAUTH_URL}/admin/cases/${userId}
        
        You're receiving this email because you're an administrator of the Online Case Filing System.
      `;
      break;
      
    case 'system_alert':
      const { alertType, message, details } = data;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>System Alert: ${alertType}</h2>
          <p style="color: #D32F2F; font-weight: bold;">${message}</p>
          
          <div style="border: 1px solid #ff9999; padding: 15px; border-radius: 5px; margin: 20px 0; background-color: #fff8f8;">
            <h3>Details:</h3>
            <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto;">${JSON.stringify(details, null, 2)}</pre>
          </div>
          
          <p>This is an automated alert from the system. Please investigate as needed.</p>
          <p>You're receiving this email because you're an administrator of the Online Case Filing System.</p>
        </div>
      `;
      textContent = `
        System Alert: ${alertType}
        
        ${message}
        
        Details:
        ${JSON.stringify(details, null, 2)}
        
        This is an automated alert from the system. Please investigate as needed.
        
        You're receiving this email because you're an administrator of the Online Case Filing System.
      `;
      break;
      
    case 'summary':
      const { period, stats } = data;
      htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>System Summary Report: ${period}</h2>
          <p>Here's a summary of activity in the Online Case Filing System:</p>
          
          <div style="border: 1px solid #ddd; padding: 15px; border-radius: 5px; margin: 20px 0; background-color: #f9f9f9;">
            <p><strong>New Users:</strong> ${stats.newUsers}</p>
            <p><strong>New Cases:</strong> ${stats.newCases}</p>
            <p><strong>Cases Updated:</strong> ${stats.casesUpdated}</p>
            <p><strong>Approved Cases:</strong> ${stats.approvedCases}</p>
            <p><strong>Rejected Cases:</strong> ${stats.rejectedCases}</p>
          </div>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="${process.env.NEXTAUTH_URL}/admin/dashboard" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              View Dashboard
            </a>
          </div>
          
          <p>You're receiving this email because you're an administrator of the Online Case Filing System.</p>
        </div>
      `;
      textContent = `
        System Summary Report: ${period}
        
        Here's a summary of activity in the Online Case Filing System:
        
        New Users: ${stats.newUsers}
        New Cases: ${stats.newCases}
        Cases Updated: ${stats.casesUpdated}
        Approved Cases: ${stats.approvedCases}
        Rejected Cases: ${stats.rejectedCases}
        
        To view the dashboard, visit: ${process.env.NEXTAUTH_URL}/admin/dashboard
        
        You're receiving this email because you're an administrator of the Online Case Filing System.
      `;
      break;
      
    default:
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>${subject}</h2>
          <p>${JSON.stringify(data)}</p>
          <p>You're receiving this email because you're an administrator of the Online Case Filing System.</p>
    </div>
  `;
      textContent = `
        ${subject}
        
        ${JSON.stringify(data)}
        
        You're receiving this email because you're an administrator of the Online Case Filing System.
      `;
  }
  
  // Send the email
  return sendEmail({
    to: recipients,
    subject,
    htmlContent,
    textContent,
  });
}

/**
 * Send hearing notification emails to users
 * Used for scheduled, postponed, completed, cancelled, or closed hearings
 */
export function sendHearingNotificationEmail(
  userEmail: string,
  userName: string,
  caseNumber: string,
  caseTitle: string,
  hearingDate: Date,
  hearingTime: string,
  hearingLocation: string,
  hearingStatus: 'scheduled' | 'postponed' | 'closed' | 'completed' | 'cancelled',
  previousDate?: Date,
  reason?: string
): Promise<boolean> {
  // Set status-specific colors and messages
  const statusColors = {
    scheduled: '#4CAF50', // Green
    postponed: '#FFC107', // Yellow/amber
    closed: '#9E9E9E', // Gray
    completed: '#2196F3', // Blue
    cancelled: '#F44336', // Red
  };
  
  const statusColor = statusColors[hearingStatus] || statusColors.closed;
  
  // Status-specific subject line
  let subjectLine = '';
  switch (hearingStatus) {
    case 'scheduled':
      subjectLine = `Hearing Scheduled: ${caseNumber}`;
      break;
    case 'postponed':
      subjectLine = `Hearing Postponed: ${caseNumber}`;
      break;
    case 'closed':
      subjectLine = `Hearing Closed: ${caseNumber}`;
      break;
    case 'completed':
      subjectLine = `Hearing Completed: ${caseNumber}`;
      break;
    case 'cancelled':
      subjectLine = `Hearing Cancelled: ${caseNumber}`;
      break;
  }
  
  // Format dates for display
  let formattedHearingDate = '';
  try {
    formattedHearingDate = hearingDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    console.log(`Formatted hearing date: ${formattedHearingDate}`);
  } catch (error) {
    console.error('Error formatting hearing date:', error);
    formattedHearingDate = String(hearingDate);
  }
  
  let formattedPreviousDate = '';
  if (previousDate) {
    try {
      formattedPreviousDate = previousDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      console.log(`Formatted previous date: ${formattedPreviousDate}`);
    } catch (error) {
      console.error('Error formatting previous date:', error);
      formattedPreviousDate = String(previousDate);
    }
  }
  
  // Status-specific content blocks
  let statusSpecificHtml = '';
  let statusSpecificText = '';
  
  switch (hearingStatus) {
    case 'scheduled':
      statusSpecificHtml = `
        <p>A hearing has been scheduled for your case.</p>
        <p style="font-weight: bold; color: #4CAF50;">Please make arrangements to attend at the specified date, time and location.</p>
      `;
      statusSpecificText = `
A hearing has been scheduled for your case.
Please make arrangements to attend at the specified date, time and location.
      `;
      break;
      
    case 'postponed':
      statusSpecificHtml = `
        <p>The hearing previously scheduled for ${formattedPreviousDate} has been postponed.</p>
        <p style="font-weight: bold; color: #FFC107;">New hearing details are provided below.</p>
        ${reason ? `<p><strong>Reason for postponement:</strong> ${reason}</p>` : ''}
      `;
      statusSpecificText = `
The hearing previously scheduled for ${formattedPreviousDate} has been postponed.
New hearing details are provided below.
${reason ? `Reason for postponement: ${reason}` : ''}
      `;
      break;
      
    case 'completed':
      statusSpecificHtml = `
        <p>The hearing scheduled for ${formattedHearingDate} has been marked as <strong style="color: #2196F3;">completed</strong>.</p>
        <p>You can log in to your account to view any updates to your case status.</p>
      `;
      statusSpecificText = `
The hearing scheduled for ${formattedHearingDate} has been marked as completed.
You can log in to your account to view any updates to your case status.
      `;
      break;
      
    case 'cancelled':
      statusSpecificHtml = `
        <p>The hearing scheduled for ${formattedHearingDate} has been <strong style="color: #F44336;">cancelled</strong>.</p>
        ${reason ? `<p><strong>Reason for cancellation:</strong> ${reason}</p>` : ''}
        <p>You can log in to your account to view any updates to your case status.</p>
      `;
      statusSpecificText = `
The hearing scheduled for ${formattedHearingDate} has been cancelled.
${reason ? `Reason for cancellation: ${reason}` : ''}
You can log in to your account to view any updates to your case status.
      `;
      break;
      
    case 'closed':
      statusSpecificHtml = `
        <p>The hearing scheduled for ${formattedHearingDate} has been marked as closed.</p>
        <p>You can log in to your account to view any updates to your case status.</p>
      `;
      statusSpecificText = `
The hearing scheduled for ${formattedHearingDate} has been marked as closed.
You can log in to your account to view any updates to your case status.
      `;
      break;
  }
  
  return sendEmail({
    to: [{ email: userEmail, name: userName }],
    subject: subjectLine,
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hearing Notification</h2>
        <p>Dear ${userName},</p>
        
        ${statusSpecificHtml}
        
        <div style="border: 1px solid #ddd; padding: 15px; border-radius: 5px; margin: 20px 0; background-color: #f9f9f9;">
          <p><strong>Case Number:</strong> ${caseNumber}</p>
          <p><strong>Case Title:</strong> ${caseTitle}</p>
          <p><strong>Hearing Status:</strong> <span style="background-color: ${statusColor}; color: white; padding: 3px 8px; border-radius: 3px;">${hearingStatus}</span></p>
          <p><strong>Date:</strong> ${formattedHearingDate}</p>
          <p><strong>Time:</strong> ${hearingTime}</p>
          <p><strong>Location:</strong> ${hearingLocation}</p>
        </div>
        
        <p>For any questions, please contact the court administration.</p>
        <p>Thank you for using our Online Case Filing System.</p>
      </div>
    `,
    textContent: `
      Hearing Notification
      
      Dear ${userName},
      
      ${statusSpecificText}
      
      Case Number: ${caseNumber}
      Case Title: ${caseTitle}
      Hearing Status: ${hearingStatus}
      Date: ${formattedHearingDate}
      Time: ${hearingTime}
      Location: ${hearingLocation}
      
      For any questions, please contact the court administration.
      
      Thank you for using our Online Case Filing System.
    `,
  });
}

/**
 * Send case filing confirmation email to user
 * Used when a user successfully files a new case
 */
export function sendCaseFilingConfirmationEmail(
  userEmail: string,
  userName: string,
  caseNumber: string,
  caseTitle: string,
  filingDate: Date,
  filingFee: number
): Promise<boolean> {
  const formattedFilingDate = filingDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return sendEmail({
    to: [{ email: userEmail, name: userName }],
    subject: `Case Filed Successfully: ${caseNumber}`,
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">Case Filed Successfully</h2>
        <p>Dear ${userName},</p>
        <p>Thank you for filing your case with our Online Case Filing System. Your case has been successfully submitted and is now under review.</p>
        
        <div style="border: 1px solid #ddd; padding: 15px; border-radius: 5px; margin: 20px 0; background-color: #f9f9f9;">
          <p><strong>Case Number:</strong> ${caseNumber}</p>
          <p><strong>Case Title:</strong> ${caseTitle}</p>
          <p><strong>Filing Date:</strong> ${formattedFilingDate}</p>
          <p><strong>Filing Fee:</strong> ₹${filingFee}</p>
          <p><strong>Status:</strong> <span style="background-color: #FFC107; color: white; padding: 3px 8px; border-radius: 3px;">Pending Review</span></p>
        </div>
        
        <h3>What happens next?</h3>
        <ol style="line-height: 1.6;">
          <li>Your case will be reviewed by our administrative team</li>
          <li>You will receive email notifications about any status updates</li>
          <li>You can track your case progress by logging into your account</li>
          <li>Additional documentation or evidence may be requested</li>
        </ol>
        
        <div style="text-align: center; margin: 25px 0;">
          <a href="${process.env.NEXTAUTH_URL}/user/cases" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            View My Cases
          </a>
        </div>
        
        <p>If you have any questions about your case or need assistance, please contact our support team.</p>
        <p>Thank you for using our Online Case Filing System.</p>
      </div>
    `,
    textContent: `
      Case Filed Successfully
      
      Dear ${userName},
      
      Thank you for filing your case with our Online Case Filing System. Your case has been successfully submitted and is now under review.
      
      Case Details:
      Case Number: ${caseNumber}
      Case Title: ${caseTitle}
      Filing Date: ${formattedFilingDate}
      Filing Fee: ₹${filingFee}
      Status: Pending Review
      
      What happens next?
      1. Your case will be reviewed by our administrative team
      2. You will receive email notifications about any status updates
      3. You can track your case progress by logging into your account
      4. Additional documentation or evidence may be requested
      
      To view your cases, visit: ${process.env.NEXTAUTH_URL}/user/cases
      
      If you have any questions about your case or need assistance, please contact our support team.
      
      Thank you for using our Online Case Filing System.
    `,
  });
}

/**
 * Send evidence status notification emails to users
 * Used when evidence is approved or rejected
 */
export function sendEvidenceStatusEmail(
  userEmail: string,
  userName: string,
  caseNumber: string,
  caseTitle: string,
  evidenceTitle: string,
  evidenceStatus: 'approved' | 'rejected',
  rejectionReason?: string
): Promise<boolean> {
  // Set status-specific colors and messages
  const statusColors = {
    approved: '#4CAF50', // Green
    rejected: '#F44336', // Red
  };
  
  const statusColor = statusColors[evidenceStatus];
  
  // Status-specific messaging
  let statusSpecificHtml = '';
  let statusSpecificText = '';
  
  if (evidenceStatus === 'approved') {
    statusSpecificHtml = `
      <p>We are pleased to inform you that your submitted evidence has been <strong style="color: #4CAF50;">approved</strong>.</p>
      <p>This evidence will be considered in the proceedings of your case.</p>
    `;
    statusSpecificText = `
We are pleased to inform you that your submitted evidence has been APPROVED.
This evidence will be considered in the proceedings of your case.
    `;
  } else {
    statusSpecificHtml = `
      <p>We regret to inform you that your submitted evidence has been <strong style="color: #F44336;">rejected</strong>.</p>
      ${rejectionReason ? `<p><strong>Reason for rejection:</strong> ${rejectionReason}</p>` : ''}
      <p>You may submit alternative evidence or contact the court administration for further clarification.</p>
    `;
    statusSpecificText = `
We regret to inform you that your submitted evidence has been REJECTED.
${rejectionReason ? `Reason for rejection: ${rejectionReason}` : ''}
You may submit alternative evidence or contact the court administration for further clarification.
    `;
  }
  
  return sendEmail({
    to: [{ email: userEmail, name: userName }],
    subject: `Evidence ${evidenceStatus === 'approved' ? 'Approved' : 'Rejected'}: ${caseNumber}`,
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Evidence Status Update</h2>
        <p>Dear ${userName},</p>
        
        ${statusSpecificHtml}
        
        <div style="border: 1px solid #ddd; padding: 15px; border-radius: 5px; margin: 20px 0; background-color: #f9f9f9;">
          <p><strong>Case Number:</strong> ${caseNumber}</p>
          <p><strong>Case Title:</strong> ${caseTitle}</p>
          <p><strong>Evidence Title:</strong> ${evidenceTitle}</p>
          <p><strong>Status:</strong> <span style="background-color: ${statusColor}; color: white; padding: 3px 8px; border-radius: 3px;">${evidenceStatus}</span></p>
        </div>
        
        <p>You can log in to your account to view more details about your case and evidence.</p>
        <p>Thank you for using our Online Case Filing System.</p>
      </div>
    `,
    textContent: `
      Evidence Status Update
      
      Dear ${userName},
      
      ${statusSpecificText}
      
      Case Number: ${caseNumber}
      Case Title: ${caseTitle}
      Evidence Title: ${evidenceTitle}
      Status: ${evidenceStatus}
      
      You can log in to your account to view more details about your case and evidence.
      
      Thank you for using our Online Case Filing System.
    `,
  });
} 