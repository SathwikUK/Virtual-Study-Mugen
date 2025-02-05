const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser'); // <-- Add this import
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');


dotenv.config();  // Load environment variables from .env file
const app = express();

// Middleware
app.use(bodyParser.json({ limit: '50mb' }));  // Adjust the limit as needed
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));  // For form data
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Database Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => console.error('MongoDB Connection Failed:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));  // Corrected template literal
