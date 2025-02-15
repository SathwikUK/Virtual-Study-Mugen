const express = require('express');
const upload = require("../config/multer"); // This returns a middleware that handles single "image" uploads.
const { 
  register, 
  login, 
  verifyOTP, 
  getNotifications, 
  getUserById, 
  searchUsers, 
  respondToGroupInvite, 
  sendGroupInvite, 
  resendOTP, 
  createGroup, 
  getGroups, 
  profile, 
  updateUser 
} = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');  // Protect middleware
const router = express.Router();

router.get('/groups', getGroups);
router.post('/groups', createGroup);
router.get('/user/:id', protect, getUserById);


// Use the upload middleware (already configured with .single('image'))
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

// Resend OTP
router.post('/resend-otp', resendOTP);

// Protected route (get user profile)
router.get('/profile', protect, profile);

module.exports = router;
