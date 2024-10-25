const oAuth2Client = require("../config/googleConfig");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
require("dotenv").config();

// Initialize the Google strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: process.env.REDIRECT_URL, 
    },
    (accessToken, refreshToken, profile, done) => {
      oAuth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      return done(null, profile); // save the profile to your database here, mby in future 
    }
  )
);

//session handling
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// endpoint for /auth/google/
const googleAuth = passport.authenticate("google", {
  scope: [
    "profile",
    "email",
    process.env.SCOPE,
  ],
  accessType: "offline",
});

//! needed?
// Ensure tokens are refreshed if necessary
const ensureValidTokens = async (req) => {
  if (req.session.tokens) {
    oAuth2Client.setCredentials(req.session.tokens);
    if (!oAuth2Client.credentials || !oAuth2Client.credentials.expiry_date) {
      throw new Error("OAuth2 credentials are not set or expired");
    }
    if (oAuth2Client.credentials.expiry_date <= Date.now()) {
      const { credentials } = await oAuth2Client.refreshAccessToken();
      oAuth2Client.setCredentials(credentials);
      req.session.tokens = credentials; // Update session tokens
    }
  } else {
    throw new Error("No tokens found in session");
  }
};

// endpoint for /auth/google/callback
const googleAuthCallback = passport.authenticate("google", {
  successRedirect: process.env.SUCCESS_REDIRECT,
  failureRedirect: process.env.FAILURE_REDIRECT,
});

//! needed? 
// Middleware to ensure user is authenticated
const ensureAuthenticated = async (req, res, next) => {
  try {
    await ensureValidTokens(req);
    next();
  } catch (error) {
    res.redirect("/auth/google"); // Redirect to login if not authenticated
  }
};

//! needed?
// endpoint for /auth/checkauth
const checkAuth = async (req, res) => {
  if (req.isAuthenticated) {
    console.log("authenticated");
    res.status(200).json({ authenticated: true });
  } else {
    res.status(401).json({ authenticated: false });
    console.log("not authenticated");
  }
};

//! not implemented yet
// endpoint for /auth/logout
const logout = (req, res) => {
  req.logout();
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Failed to log out" });
    }
    res.redirect("/"); // Redirect after logout
  });
};

module.exports = {
  ensureAuthenticated,
  googleAuthCallback,
  googleAuth,
  checkAuth,
  logout,
};
