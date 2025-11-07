// utils/emailService.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "furqanadvani8@gmail.com",
    pass: "qply pslp hpax glcp",
  },
});

/**
 * Send Email Utility
 * @param {string} to - Receiver email
 * @param {string} subject - Email subject
 * @param {object} options - { type, otp, password, link }
 */
async function sendEmail(to, subject, options = {}) {
  try {
    let message = "";
    let bodyContent = "";

    if (options.type === "registrationOtp") {
      message = `
        Thank you for registering with <strong>Task Management System</strong>.
        To complete your registration, please use the following One-Time Password (OTP):
      `;
      bodyContent = `<span style="display:inline-block; color:#0059F7; font-size:28px; font-weight:700; letter-spacing:4px;">
        ${options.otp}
      </span>`;
    } else if (options.type === "resetOtp") {
      message = `
        We received a request to reset your password for <strong>Task Management System</strong>.
        Use the following One-Time Password (OTP) to proceed:
      `;
      bodyContent = `<span style="display:inline-block; color:#0059F7; font-size:28px; font-weight:700; letter-spacing:4px;">
        ${options.otp}
      </span>`;
    } else if (options.type === "resendOtp") {
      message = `
        You requested to resend your One-Time Password (OTP) for <strong>Task Management System</strong>.<br/>
        Please use the OTP below to continue:
      `;
      bodyContent = `<span style="display:inline-block; color:#0059F7; font-size:28px; font-weight:700; letter-spacing:4px;">
        ${options.otp}
      </span>`;
    } else if (options.type === "newAccount") {
      message = `
        <h2>Welcome to Task Management System!</h2>
        <p>Your account has been created successfully.</p>
        <p><strong>Your temporary password:</strong> ${options.password}</p>
        <p>For security reasons, we recommend changing your password immediately.</p>
      `;
      bodyContent = `
        <a href="${options.link}" style="display: inline-block; padding: 10px 20px; background-color: #0059F7; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          Change Password For Login
        </a>
        <p>This link will expire in 1 hour.</p>
        <p><strong>If the button doesn't work, copy and paste this URL in your browser:</strong></p>
        <p>${options.link}</p>
      `;
    } else if (options.type === "verifyMicrosoft") {
      message = `
        <h2>Welcome to Task Management System!</h2>
        <p>Your account has been created successfully.</p>
      `;
      bodyContent = `
        <a href="${options.link}" style="display: inline-block; padding: 10px 20px; background-color: #0059F7; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          Verify Your Account
        </a>
        <p>This link will expire in 1 hour.</p>
        <p><strong>If the button doesn't work, copy and paste this URL in your browser:</strong></p>
        <a>${options.link}</a>
      `;
    }

    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Task Management System</title>
      </head>
      <body style="margin:0; padding:0; background:#F4F8FF; font-family: 'Plus Jakarta Sans', Arial, sans-serif;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center">
              <table width="600" border="0" cellspacing="0" cellpadding="0" style="background:#FFFFFF; border:1px solid #DEEAFF; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.05);">
                
                <!-- Header -->
                <tr>
                  <td align="center" bgcolor="#0059F7" style="padding:37px;">
                    <h1 style="margin:0; color:#FFFFFF; font-size: 30px; font-weight:700; font-family:'Plus Jakarta Sans', sans-serif;">
                      Task Management System
                    </h1>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:40px 30px; color:#000D1E; font-size:18px; line-height:1.7; font-family:'Plus Jakarta Sans', Arial, sans-serif;">
                    <p style="margin:0 0 20px;">Hello ,</p>
                    <p style="margin:0 0 17px;">${message}</p>
                    <div style="text-align:start; margin:30px 0;">
                      ${bodyContent}
                    </div>
                    ${options.type?.includes("Otp")
        ? `<p style="margin:0 0 10px;">
                            This OTP is valid for <strong style="color:#FB8500;">10 minutes</strong>.
                          </p>`
        : ""
      }
                    <p style="margin:0; color:#777777;">
                      If you didn’t request this, please ignore this email.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td align="center" bgcolor="#F4F8FF" style="padding:20px; font-size:14px; color:#777777; font-family:'Plus Jakarta Sans', Arial, sans-serif;">
                    © 2025 Task Management System. All rights reserved.
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: '"Task Manager" <furqanadvani8@gmail.com>',
      to,
      subject,
      html: htmlTemplate,
    });

    console.log("Email sent to", to);
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}

module.exports = { sendEmail };
