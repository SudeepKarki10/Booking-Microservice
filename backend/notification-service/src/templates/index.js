const nodemailer = require('nodemailer');
const logger = require('../utils/logger');
const {config} = require('../config');

// Create a transporter using SMTP transport
// You will need to add SMTP_USER and SMTP_PASS to your .env file
const transporter = nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASS
    }
});

/**
 * Sends an OTP email to the specified email address
 * @param {string} email - The recipient's email address
 * @param {string|number} otp - The one-time password
 */
const sendOtpEmail = async (email, otp) => {
    try {
        const mailOptions = {
            from: `"Booking Microservice" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Your One-Time Password (OTP)',
            html: `
                <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                  <div style="margin:50px auto;width:70%;padding:20px 0">
                    <div style="border-bottom:1px solid #eee">
                      <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Booking Microservice</a>
                    </div>
                    <p style="font-size:1.1em">Hi,</p>
                    <p>Thank you for choosing Booking Microservice. Use the following OTP to complete your actions. The OTP is valid for 5 minutes.</p>
                    <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
                    <p style="font-size:0.9em;">Regards,<br />Booking Microservice</p>
                    <hr style="border:none;border-top:1px solid #eee" />
                  </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        logger.info(`OTP Email sent to ${email} successfully. MessageId: ${info.messageId}`);
        return info;
    } catch (error) {
        logger.error(`Error sending OTP email to ${email}:`, error);
        throw error;
    }
};

/**
 * Sends a welcome email to the specified email address
 * @param {string} email - The recipient's email address
 * @param {string} name - The recipient's name (optional)
 */
const sendWelcomeEmail = async (email, name = 'User') => {
    try {
        const mailOptions = {
            from: `"Booking Microservice" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Welcome to Booking Microservice!',
            html: `
                <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                  <div style="margin:50px auto;width:70%;padding:20px 0">
                    <div style="border-bottom:1px solid #eee">
                      <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Booking Microservice</a>
                    </div>
                    <p style="font-size:1.1em">Hi ${name},</p>
                    <p>Welcome to Booking Microservice! We are thrilled to have you on board. Discover and book the best experiences tailored just for you.</p>
                    <p style="font-size:0.9em;">Regards,<br />Booking Microservice</p>
                    <hr style="border:none;border-top:1px solid #eee" />
                  </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        logger.info(`Welcome Email sent to ${email} successfully. MessageId: ${info.messageId}`);
        return info;
    } catch (error) {
        logger.error(`Error sending welcome email to ${email}:`, error);
        throw error;
    }
};

module.exports = {
    sendOtpEmail,
    sendWelcomeEmail
};