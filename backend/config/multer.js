const multer = require('multer');

const storage = multer.memoryStorage(); // Store files in memory as a Buffer

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
}).single('image'); // This middleware handles single file upload with field name "image"

module.exports = upload;
