const express = require("express");
const router = express.Router();
const passport = require("passport");
const userAuthController = require("../controller/userAuthController");


router.get("/test", (req, res) => {
  res.json({ message: "Routes are working!" });
});

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/login" }), userAuthController.googleCallback);

router.post("/register", userAuthController.registerUser);

module.exports = router;
