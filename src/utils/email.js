const nodemailer = require("nodemailer");

async function sendEmail(to, subject, htmlContent,  ) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}: ${info.response}`);
  } catch (error) {
    console.error("Error sending email:", error.message);
  }
}

function getOtpEmailTemplate(otp) {
  return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OTP Email</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .email-container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .email-header {
            background-color: #007bff;
            color: #ffffff;
            text-align: center;
            padding: 20px;
            font-size: 24px;
          }
          .email-body {
            padding: 20px;
            color: #333333;
          }
          .email-body p {
            margin: 0 0 16px;
            line-height: 1.6;
          }
          .otp-code {
            display: flex;
            justtify-content: center;
            align-items: center;
            text-align: center;
            background-color: #f0f0f0;
            padding: 10px 20px;
            font-size: 20px;
            font-weight: bold;
            color: #007bff;
            border-radius: 4px;
            margin-top: 10px;
          }
      
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            Your OTP Code
          </div>
          <div class="email-body">
            <p>Hello,</p>
            <p>Use the following OTP code to complete your verification:</p>
            <div class="otp-code">${otp}</div>
            <p> If you did not request this, please ignore this email.</p>
          </div>
        
        </div>
      </body>
      </html>`;
}
module.exports = { sendEmail, getOtpEmailTemplate };
