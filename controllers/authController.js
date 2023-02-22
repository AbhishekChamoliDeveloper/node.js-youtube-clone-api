const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const emailService = require("../services/emailService");
const uuid = require("uuid");

const authController = {};

authController.signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const username =
      req.body.username ||
      `@${firstName.toLowerCase()}${uuid.v4().substring(0, 8)}`;

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      username,
    });

    await newUser.save();

    const otp = Math.floor(100000 + Math.random() * 900000);
    newUser.otp = otp;
    newUser.otpExpiresAt = Date.now() + 10 * 60 * 1000;
    await newUser.save();

    await emailService.sendVerificationEmail(email, otp);

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET);
    res.cookie("token", token);
    res.status(201).json({
      success: true,
      data: {
        user: {
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          username: newUser.username,
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

authController.verify = async (req, res) => {
  try {
    const { otp } = req.body;
    const { userId } = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.otp !== otp || user.otpExpiresAt < Date.now()) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    res.status(200).json({ message: "You are Successfully Verified" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = authController;
