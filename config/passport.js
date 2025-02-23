const User = require('../model/user');
const passport=require('passport')
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');
require("dotenv").config();

passport.use(
  new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) return done(null, false, { message: 'Invalid email or password' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return done(null, false, { message: 'Invalid email or password' });

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/v1/user/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;   // email from Google
        let user = await User.findOne({ email }); // Check if email already exists

        if (user) {
          // If user exists but does not have a Google ID, link the Google account
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }
        } else {
          // If no user exists, create a new one
          user = new User({
            googleId: profile.id,
            name: profile.displayName,
            email: email,
            role: "user", // Default role
          });
          await user.save();
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Serialize user (store these details in session)
passport.serializeUser((user, done) => {
  console.log(user);
  
  done(null, { id: user._id, email: user.email, role: user.role ,name:user.name});
});

// Deserialize user (fetch these details from session)
passport.deserializeUser(async (data, done) => {
  try {
    const user = await User.findById(data.id);
    if (!user) return done(null, false);

    done(null, { id: user._id, email: user.email, role: user.role,name:user.name });
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
