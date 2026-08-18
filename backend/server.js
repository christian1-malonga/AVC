const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const cors = require("cors");
const userAuthRoutes = require("./routes/userAuthRoutes");
require("dotenv").config();
require("./config/passport");

const app = express();
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.use("/api/auth", userAuthRoutes);

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("Connected to MongoDB");
}).catch((err) => {
  console.error("Error connecting to MongoDB:", err);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});