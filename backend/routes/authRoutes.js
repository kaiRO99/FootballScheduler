const express = require("express");
const router = express.Router();
const googleAuthController = require("../controllers/authController");

//* routes for /auth

// Google OAuth callback
router.get("/redirect", googleAuthController.googleAuthCallback);

//! remove?
router.get("/checkauth", googleAuthController.checkAuth);

//google auth consent page
router.get('/google', googleAuthController.googleAuth);

//! remove?
//callback function,
router.get('/google/callback', googleAuthController.googleAuthCallback);

//logout function 
router.get('/logout', googleAuthController.logout);

module.exports = router;
