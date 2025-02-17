const express = require('express');
const upload = require("../config/multer");
const { register, login, verifyOTP,getNotifications,forgotPassword,resetPassword,getUserById,searchUsers,updateUser,respondToGroupInvite, sendGroupInvite,resendOTP ,createGroup,getGroups,profile} = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');  // Import the protect middleware
const router = express.Router();

router.get('/groups',getGroups)
router.post('/groups', createGroup);
router.get('/user/:id', protect, getUserById);
router.put("/users/:email", upload, updateUser);

router.get('/search-users', protect, searchUsers);
router.post('/send-group-invite', protect, sendGroupInvite);
router.post('/respond-group-invite', protect, respondToGroupInvite);
router.get('/notifications', protect, getNotifications);



// Register user (no authentication required)
router.post("/register", upload, register);

// Login user (no authentication required)
router.post('/login', login);

// OTP verification (no authentication required)
router.post('/verify-otp', verifyOTP);

// Resend OTP (optional, could be a protected route or not)
router.post('/resendOtp', resendOTP);

// Protected route (example: get user profile)
router.get('/profile', protect, profile);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;