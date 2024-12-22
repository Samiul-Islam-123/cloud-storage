const { hashPassword } = require("./SecurePassword");

const generateNumericOTP =  (length = 6) => {
    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000); 

    return otp.toString().slice(0, length);  // Return OTP of the desired length
};

module.exports = generateNumericOTP