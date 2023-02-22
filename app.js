const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routers/authRoutes");

require("dotenv").config();

const app = express();

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to database");
  })
  .catch((error) => {
    console.error(error);
  });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/auth", authRoutes);

module.exports = app;
