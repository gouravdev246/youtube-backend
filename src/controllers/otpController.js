const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer');
const OTP = require('../model/otp.model');

// Generate OTP and send email
async function otpGenerat(req, res) {
    const { email } = req.body;

    const otp = Math.floor(100000 + Math.random() * 900000);


    try {
        await OTP.create({ email, otp });

        // Send OTP via email (replace with your email sending logic)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'OTP Verification',
            text: `Your OTP for verification is: ${otp}`
        });

        res.status(200).send('OTP sent successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error sending OTP');
    }
}

// async function otpVerify(req, res) {
//     const { email, otp } = req.body;

//     try {
//         const otpRecord = await OTP.findOne({ email, otp }).exec();

//         if (otpRecord) {
//             res.status(200).send('OTP verified successfully');
//         } else {
//             res.status(400).send('Invalid OTP');
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Error verifying OTP');
//     }
// }

module.exports = { otpGenerat };