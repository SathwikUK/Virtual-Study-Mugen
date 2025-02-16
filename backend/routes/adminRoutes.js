const express = require('express');
const usersController = require('../controllers/usersController');
const upload = require('../config/multer');  // Import multer upload config
const groupController = require("../controllers/groupController");
const router = express.Router();

// Route to get users
router.get('/users', usersController.getUsers);

// Route to update user, includes image upload handling
router.put('/users/:email', upload, usersController.updateUser);

// Route to delete a user
router.delete('/users/:email', usersController.deleteUserByEmail);

// Get all groups
router.get('/groups', groupController.getAllGroups);

// Route to update group (if image is included in the form data)
router.put('/groups/:id', upload, groupController.updateGroup);

// Route to delete a group
router.delete('/groups/:id', groupController.deleteGroup);




module.exports = router;