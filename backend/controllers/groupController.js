// controllers/groupController.js
const Group = require('../models/groupModel');
const mongoose = require('mongoose');
const User = require('../models/user');

// Retrieve groups with pagination and batched user lookups
const getAllGroups = async (req, res) => {
  try {
    // Allow pagination via query parameters (defaults: page=1, limit=20)
    const { page = 1, limit = 20 } = req.query;

    // Fetch only a subset of groups (and use lean() for faster read-only queries)
    const groups = await Group.find()
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean()
      .exec();

    if (!groups || groups.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    // Helper: Check if an ID is a valid ObjectId
    const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

    // Collect all unique IDs (for createdBy and members) and usernames from groups
    const idSet = new Set();
    const usernameSet = new Set();

    groups.forEach((group) => {
      if (group.createdBy) {
        if (isValidObjectId(group.createdBy)) {
          idSet.add(group.createdBy.toString());
        } else if (typeof group.createdBy === 'string') {
          usernameSet.add(group.createdBy);
        }
      }
      if (Array.isArray(group.members)) {
        group.members.forEach((memberId) => {
          if (isValidObjectId(memberId)) {
            idSet.add(memberId.toString());
          }
        });
      }
    });

    const idArray = Array.from(idSet);
    const usernameArray = Array.from(usernameSet);

    // Run both queries concurrently
    const [usersById, usersByUsername] = await Promise.all([
      User.find({ _id: { $in: idArray } }).select('name email').lean(),
      usernameArray.length > 0
        ? User.find({ username: { $in: usernameArray } })
            .select('name email username')
            .lean()
        : Promise.resolve([]),
    ]);

    // Create lookup maps for quick access
    const userMap = {};
    usersById.forEach((user) => {
      userMap[user._id.toString()] = user;
    });
    const usernameMap = {};
    usersByUsername.forEach((user) => {
      usernameMap[user.username] = user;
    });

    // Process each group: substitute createdBy and members with user details
    const processedGroups = groups.map((group) => {
      let creator = null;
      if (group.createdBy) {
        if (isValidObjectId(group.createdBy)) {
          creator = userMap[group.createdBy.toString()];
        } else {
          creator = usernameMap[group.createdBy];
        }
      }
      if (!creator) {
        creator = { name: group.createdBy || "Unknown", email: 'legacy@user.com' };
      }

      let members = [];
      if (Array.isArray(group.members)) {
        members = group.members
          .map((memberId) => {
            if (isValidObjectId(memberId)) {
              return userMap[memberId.toString()] || null;
            }
            return null;
          })
          .filter((member) => member !== null);
      }

      return {
        ...group,
        createdBy: creator,
        members,
      };
    });

    res.status(200).json({
      success: true,
      count: processedGroups.length,
      data: processedGroups,
    });
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching groups',
      error: error.message,
    });
  }
};

// Delete and update endpoints remain largely the same
const deleteGroup = async (req, res) => {
  const { id } = req.params;
  try {
    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }
    await Group.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: 'Group deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting group',
      error: error.message,
    });
  }
};

const updateGroup = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  // If an image file is provided, convert its buffer to base64
  const image = req.file ? req.file.buffer.toString('base64') : null;
  try {
    const updateFields = {};
    if (name) updateFields.name = name;
    if (description) updateFields.description = description;
    if (image) updateFields.image = image;
    const group = await Group.findByIdAndUpdate(id, updateFields, { new: true });
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    res.status(200).json({ message: 'Group updated successfully', group });
  } catch (error) {
    console.error('Error updating group:', error);
    res.status(500).json({ message: 'Error updating group', error: error.message });
  }
};


module.exports = {
  getAllGroups,
  deleteGroup, // your old deleteGroup (if still needed) // new function
  updateGroup,
};