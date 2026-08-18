const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../model/User");

passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (user) {
      return done(null, user);
    }

      user= await User.create({
      first_name: profile.name.givenName,
      last_name: profile.name.familyName,
      googleId: profile.id
    });
   return done(null, user);
  } catch (error) {
   return done(error, null);
  }
}));