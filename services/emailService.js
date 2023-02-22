const nodemailer = require("nodemailer");
require("dotenv").config();

const emailService = {};

var transporter = nodemailer.createTransport({
  host: process.env.MAILHOST,
  port: process.env.MAILPORT,
  auth: {
    user: process.env.MAILUSER,
    pass: process.env.MAILPASS,
  },
});

emailService.sendVerificationEmail = async (email, otp) => {
  try {
    const info = await transporter.sendMail({
      from: "abhishekchamoli007@gmail.com",
      to: email,
      subject: "Verify your account",
      text: `Your verification code is ${otp}`,
      html: `Your verification code is <b>${otp}</b>`,
    });
  } catch (error) {
    console.error(error);
  }
};

module.exports = emailService;
