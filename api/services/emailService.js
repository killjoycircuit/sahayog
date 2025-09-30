const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter with environment configuration
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false // For development only
    }
  });
};

// Generate invoice HTML template (on-demand generation)
const generateInvoiceHTML = (invoiceData) => {
  const {
    invoiceNumber,
    contributionDate,
    amount,
    contributorName,
    contributorEmail,
    eventTitle,
    eventCreator,
    transactionId,
    status
  } = invoiceData;

  const formattedDate = new Date(contributionDate).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Contribution Invoice - ${invoiceNumber}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .invoice-container {
          background: white;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #008080, #006666);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 2.5em;
          font-weight: 300;
        }
        .header p {
          margin: 10px 0 0 0;
          opacity: 0.9;
          font-size: 1.1em;
        }
        .content {
          padding: 40px;
        }
        .invoice-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 40px;
        }
        .detail-section h3 {
          color: #008080;
          margin-bottom: 15px;
          font-size: 1.2em;
          border-bottom: 2px solid #e9ecef;
          padding-bottom: 5px;
        }
        .detail-item {
          margin-bottom: 10px;
          display: flex;
          justify-content: space-between;
        }
        .detail-label {
          font-weight: 600;
          color: #666;
        }
        .detail-value {
          color: #333;
        }
        .amount-section {
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
          border-radius: 8px;
          padding: 25px;
          text-align: center;
          margin: 30px 0;
        }
        .amount-section h2 {
          color: #008080;
          margin: 0 0 10px 0;
          font-size: 2em;
        }
        .status {
          display: inline-block;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.9em;
        }
        .status.completed {
          background-color: #d4edda;
          color: #155724;
        }
        .status.pending {
          background-color: #fff3cd;
          color: #856404;
        }
        .thank-you {
          background: #f8f9fa;
          border-left: 4px solid #008080;
          padding: 20px;
          margin: 30px 0;
          border-radius: 0 8px 8px 0;
        }
        .footer {
          text-align: center;
          padding: 30px;
          background: #f8f9fa;
          color: #666;
          font-size: 0.9em;
        }
        .footer a {
          color: #008080;
          text-decoration: none;
        }
        @media (max-width: 600px) {
          .invoice-details {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .header h1 {
            font-size: 2em;
          }
          .content {
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="header">
          <h1>Sahayog</h1>
          <p>Contribution Invoice</p>
        </div>
        
        <div class="content">
          <div class="invoice-details">
            <div class="detail-section">
              <h3>Invoice Information</h3>
              <div class="detail-item">
                <span class="detail-label">Invoice Number:</span>
                <span class="detail-value">${invoiceNumber}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${formattedDate}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Transaction ID:</span>
                <span class="detail-value">${transactionId}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Status:</span>
                <span class="detail-value">
                  <span class="status ${status}">${status}</span>
                </span>
              </div>
            </div>
            
            <div class="detail-section">
              <h3>Contributor Details</h3>
              <div class="detail-item">
                <span class="detail-label">Name:</span>
                <span class="detail-value">${contributorName}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${contributorEmail}</span>
              </div>
            </div>
          </div>
          
          <div class="detail-section">
            <h3>Campaign Details</h3>
            <div class="detail-item">
              <span class="detail-label">Campaign:</span>
              <span class="detail-value">${eventTitle}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Campaign Creator:</span>
              <span class="detail-value">${eventCreator}</span>
            </div>
          </div>
          
          <div class="amount-section">
            <h2>${formattedAmount}</h2>
            <p>Total Contribution Amount</p>
          </div>
          
          <div class="thank-you">
            <h3 style="margin-top: 0; color: #008080;">Thank You for Your Contribution!</h3>
            <p>Your generous support helps bring meaningful projects to life. This invoice serves as your receipt for tax and record-keeping purposes.</p>
          </div>
        </div>
        
        <div class="footer">
          <p>
            This is an automated invoice generated by Sahayog.<br>
            For questions, please contact us at <a href="mailto:support@sahayog.com">support@sahayog.com</a>
          </p>
          <p style="margin-top: 15px; font-size: 0.8em; color: #999;">
            © ${new Date().getFullYear()} Sahayog. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send invoice email
const sendInvoiceEmail = async (recipientEmail, invoiceData) => {
  try {
    const transporter = createTransporter();
    
    // Generate invoice HTML on-demand
    const invoiceHTML = generateInvoiceHTML(invoiceData);
    
    const mailOptions = {
      from: {
        name: 'Sahayog',
        address: process.env.EMAIL_USER
      },
      to: recipientEmail,
      subject: `Invoice ${invoiceData.invoiceNumber} - Thank you for your contribution!`,
      html: invoiceHTML,
      text: `
        Thank you for your contribution to Sahayog!
        
        Invoice Details:
        Invoice Number: ${invoiceData.invoiceNumber}
        Date: ${new Date(invoiceData.contributionDate).toLocaleDateString()}
        Amount: ₹${invoiceData.amount}
        Campaign: ${invoiceData.eventTitle}
        Status: ${invoiceData.status}
        
        Your contribution helps bring meaningful projects to life.
        
        Best regards,
        The Sahayog Team
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Invoice email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending invoice email:', error);
    throw new Error('Failed to send invoice email');
  }
};

// Send welcome email for new contributions
const sendWelcomeEmail = async (recipientEmail, contributorName, eventTitle) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: 'Sahayog',
        address: process.env.EMAIL_USER
      },
      to: recipientEmail,
      subject: 'Welcome to the Sahayog Community!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #008080, #006666); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0;">Welcome to Sahayog!</h1>
          </div>
          <div style="padding: 30px;">
            <h2>Thank you, ${contributorName}!</h2>
            <p>Your contribution to <strong>${eventTitle}</strong> has been received successfully.</p>
            <p>You are now part of a community that believes in turning ideas into reality. Your support makes a real difference!</p>
            <p>You will receive a detailed invoice shortly with all the transaction details.</p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #008080; margin-top: 0;">What's Next?</h3>
              <ul>
                <li>Track your contributions in your dashboard</li>
                <li>Get updates on the campaign's progress</li>
                <li>Discover more amazing projects to support</li>
              </ul>
            </div>
            <p>Thank you for being part of the change!</p>
            <p>Best regards,<br>The Sahayog Team</p>
          </div>
        </div>
      `,
      text: `
        Welcome to Sahayog, ${contributorName}!
        
        Thank you for your contribution to ${eventTitle}. Your support makes a real difference!
        
        You will receive a detailed invoice shortly with all transaction details.
        
        Best regards,
        The Sahayog Team
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw new Error('Failed to send welcome email');
  }
};

// Test email configuration
const testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('Email configuration is valid');
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
};

module.exports = {
  sendInvoiceEmail,
  sendWelcomeEmail,
  testEmailConfig,
  generateInvoiceHTML
};