const multer = require('multer');

const storage = multer.memoryStorage(); // Store files in memory

// Set a file size limit (e.g., 5MB)
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
}).single('image');  // Use 'image' for the input field

module.exports = upload;