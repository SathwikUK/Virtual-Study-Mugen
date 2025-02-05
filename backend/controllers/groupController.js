const Group = require('../models/groupModel');
const mongoose = require('mongoose');
const User=require('../models/user')

// Retrieve all groups
const getAllGroups = async (req, res) => {
  try {
    
    
    // Fetch groups without population first
    const groups = await Group.find()
      .lean()
      .exec();


    // Function to check if string is valid ObjectId
    const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

    // Process and populate groups safely
    const processedGroups = await Promise.all(groups.map(async (group) => {
      try {
        // Handle createdBy field
        let creator = null;
        if (isValidObjectId(group.createdBy)) {
          creator = await User.findById(group.createdBy)
            .select('name email')
            .lean();
        } else {
          // If createdBy is a string, try to find user by alternative field (like username)
          creator = await User.findOne({ username: group.createdBy })
            .select('name email')
            .lean();
        }

        // Handle members array
        let validMembers = [];
        if (Array.isArray(group.members)) {
          validMembers = await Promise.all(
            group.members
              .filter(memberId => isValidObjectId(memberId))
              .map(async (memberId) => {
                try {
                  return await User.findById(memberId)
                    .select('name email')
                    .lean();
                } catch (err) {
                  return null;
                }
              })
          );
          // Remove null values from failed lookups
          validMembers = validMembers.filter(member => member !== null);
        }

        return {
          ...group,
          createdBy: creator || { name: group.createdBy, email: 'legacy@user.com' },
          members: validMembers,
          _id: group._id
        };
      } catch (err) {
        console.error('Error processing group:', err);
        return group; // Return original group if processing fails
      }
    }));

    res.status(200).json({
      success: true,
      count: processedGroups.length,
      data: processedGroups
    });

  } catch (error) {
    console.error('Error details:', {
      name: error.name,
      message: error.message
    });

    res.status(500).json({
      success: false,
      message: 'Error fetching groups',
      error: error.message
    });
  }
};
// Delete a group by ID
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
    res.status(500).json({
      success: false,
      message: 'Error deleting group',
      error: error.message,
    });
  }
};

// Update group with image and other details
const updateGroup = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const image = req.file ? req.file.buffer.toString('base64') : null;  // Convert image buffer to base64

  try {
    const group = await Group.findById(id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Update group details
    if (name) group.name = name;
    if (description) group.description = description;
    if (image) group.image = image; // Store image as base64

    await group.save();

    res.status(200).json({ message: 'Group updated successfully', group });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating group', error: error.message });
  }
};

// Export controller methods
module.exports = {
  getAllGroups,
  deleteGroup,
  updateGroup
};