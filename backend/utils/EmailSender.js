const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text, html) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // Use true for port 465
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text, // Plain text version
        html, // HTML version
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
};

module.exports = sendEmail;
