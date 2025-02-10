const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  description: { type: String, required: true }, // Added description field
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'studentUser', required: true }, // Reference to User model
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'studentUser' }], // Array of User references
  createdAt: { type: Date, default: Date.now },
  isLive: { type: Boolean, default: false },
});

const Group = mongoose.model("studentGroups", groupSchema);

module.exports = Group;
