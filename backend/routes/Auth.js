const UserModel = require('../models/UserModel');

const AuthRouter = require('express').Router();
const { hashPassword } = require('../utils/SecurePassword')
const jwt = require('jsonwebtoken')
const sendEmail = require('../utils/EmailSender');
const generateNumericOTP = require('../utils/OTP');
const bcrypt = require('bcrypt')

AuthRouter.post('/signup', async (req, res) => {
    //validate inputs
    const { username, email, password } = req.body;
    try {
        if (username && email && password) {

            //for personal use
            const UserThreshold =await UserModel.find();
            if(UserThreshold.length > 1)
                return res.json({ message: "No more users an be created", success : false });

            //for multiple users
            // //check for duplicate email
            // const existingUser = await UserModel.findOne({ email });
            // if (existingUser)
            //     return res.json({
            //         success: false,
            //         message: "Email exists"
            //     })

            

            //secure password
            const securedPassword = await hashPassword(password);
            const otp = generateNumericOTP();
            const securedOTP = await hashPassword(otp);

            const user = new UserModel({
                username,
                email,
                password: securedPassword,
                otp: securedOTP
            })
            //save user to database
            await user.save();

            // //creating a jwt token for access to the app

            //generate OTP


            // HTML content with nice UI
            const htmlContent = `
        <div style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <h2 style="color: #007bff;">Welcome to Our App, ${username}!</h2>
            <p style="font-size: 16px; color: #333;">Thank you for signing up! We're excited to have you onboard.</p>
            
            <h3 style="color: #343a40;">Your OTP for verification is:</h3>
            <div style="font-size: 24px; font-weight: bold; color: #28a745; padding: 10px; border-radius: 5px; background-color: #eaf4e2; display: inline-block;">
                ${otp}
            </div>
            
            <p style="font-size: 16px; color: #333;">Please use this OTP to complete your registration. If you didn't request this, please ignore this email.</p>
    
            <footer style="font-size: 14px; color: #6c757d; text-align: center; margin-top: 20px;">
                <p>&copy; 2024 Our App. All Rights Reserved.</p>
            </footer>
        </div>
        `;

            // Send email with HTML content
            await sendEmail(email, "Verification OTP", null, htmlContent);
            return res.json({
                success: true,
                message: "Verification Code has been sent on " + email,
            })
        }
        else
            return res.json({
                success: false,
                message: "Please enter all fields"
            })
    }
    catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: "Server error",
            error: error.message
        })
    }
})

AuthRouter.post('/verify-otp', async (req, res) => {
    const { otp, email } = req.body;
    try {
        if (otp && email) {
            const user = await UserModel.findOne({
                email: email
            });

            if (user.verified != true) {
                if (await bcrypt.compare(otp, user.otp) === true) {
                    //verified
                    user.otp = ""//reset otp for future user
                    user.verified = true;
                    await user.save();

                    //generate a JWT token and allow user to access app
                    const token = await jwt.sign({
                        id : user._id,
                        username: user.username,
                        email: user.email,
                        verified: user.verified
                    }, process.env.SECRET_KEY, { expiresIn: "1hr" });

                    const htmlContent = `
                    <div style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 20px; border-radius: 8px; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #28a745;">Congratulations, ${user.username}!</h2>
                        <p style="font-size: 16px; color: #333;">Your account has been successfully verified. You are now ready to start using all the amazing features of our app.</p>
                        
                        <h3 style="color: #343a40;">What to do next?</h3>
                        <p style="font-size: 16px; color: #333;">You can now log in to your account and start exploring. If you need any assistance, feel free to reach out to our support team.</p>
                    
                        <div style="font-size: 18px; font-weight: bold; color: #007bff; padding: 10px; border-radius: 5px; background-color: #eaf4e2; display: inline-block; margin-top: 20px;">
                            Welcome aboard, ${user.username}!
                        </div>
                        
                        <p style="font-size: 16px; color: #333; margin-top: 20px;">Thank you for choosing us. We're excited to have you on board!</p>
                    
                        <footer style="font-size: 14px; color: #6c757d; text-align: center; margin-top: 30px;">
                            <p>&copy; 2024 Our App. All Rights Reserved.</p>
                        </footer>
                    </div>
                    `;

                    await sendEmail(user.email, "User Verified Successfully", null, htmlContent);


                    res.json({
                        success: true,
                        message: "Your account has been verified successfully",
                        token: token
                    })
                }
            }

            else
                return res.json({
                    success: false,
                    message: "User is already verified"
                })
        }

        else
            return res.json({
                success: false,
                message: "Please enter all fields"
            })
    }
    catch (error) {
        console.log(error)
        res.json({
            success: false,
            message: "Server error",
            error: error.message
        })
    }
})

AuthRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        if (email && password) {
            const user = await UserModel.findOne({
                email: email
            })

            if (user) {
                const isValidPassword = await bcrypt.compare(password, user.password);
                if (isValidPassword) {
                    //generate a JWT token
                    const token = await jwt.sign({
                        id: user._id,
                        email: email,
                        username: user.username,
                        verified: user.verified
                    }, process.env.SECRET_KEY, { expiresIn: "1hr" })

                    res.json({
                        success: true,
                        message: "Logged in successfully",
                        token: token
                    })
                }
            }
        }

        else
            return res.json({
                success: false,
                message: "Please enter all fields"
            })
    }
    catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: "Server error",
            error: error.message
        })
    }
})

module.exports = AuthRouter;