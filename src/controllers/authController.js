const User = require('../model/user.model')
const OTP = require('../model/otp.model')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const dbConnect = require('../db/dbConnect')

async function register(req, res) {
    const { name, email, password, otp } = req.body

    try {
        await dbConnect(); // Ensuring DB is connected
        const user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({ message: "User already exists" })

        }
        const hashedpassword = await bcryptjs.hash(password, 10)
        const opt = await OTP.findOne({ email, otp })
        if (!opt) {
            return res.status(400).json({ message: "Invalid OTP" })
        }

        const newUser = await User.create({ name, email, password: hashedpassword })
        const token = jwt.sign({
            id: newUser._id,
            email: newUser.email

        }, process.env.JWT_SECRET)

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            partitioned: true
        })

        newUser.password = undefined
        res.status(201).json({
            message: "User registered successfully",
            user: newUser
        })


    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error", error: error })
    }
}

async function login(req, res) {
    const { email, password } = req.body
    try {
        await dbConnect(); // Ensure DB is connected
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "User Not Found!!" })
        }
        const isPasswordValid = await bcryptjs.compare(password, user.password)
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid Password!!" })
        }
        const token = jwt.sign({
            id: user._id,
            email: user.email

        }, process.env.JWT_SECRET)

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            partitioned: true
        })

        user.password = undefined
        res.status(200).json({
            message: "User logged in successfully",
            user: user
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error", error: error })
    }
}

async function getMe(req, res) {
    try {
        res.status(200).json({
            success: true,
            user: req.user
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

async function logout(req, res) {
    try {
        res.cookie('token', '', {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            partitioned: true,
            expires: new Date(0)
        });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = { register, login, getMe, logout }