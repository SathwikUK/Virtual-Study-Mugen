const User = require('../models/user');

// Controller to fetch users from the database
const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    // console.log(b-u:${users});
    // Convert the image buffer to a base64 string
    const usersWithImages = users.map((user) => ({
      ...user._doc,
      image: user.image ? user.image.toString('base64') : null, // Convert buffer to base64 string
    }));

    res.json(usersWithImages);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
};

// Controller to update user profile based on email
const updateUser = async (req, res) => {
  const { email } = req.params;
  const { name, password, role } = req.body;
  const image = req.file; // Single image file from multer

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user's details
    if (name) user.name = name;
    if (password) user.password = password;
    if (role) user.role = role;
    if (image) user.image = image.buffer; // Save image buffer

    // Save the updated user
    await user.save();

    res.status(200).json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating user profile', error: error.message });
  }
};

///del
const deleteUserByEmail = async (req, res) => {
  const { email } = req.params; // Extract email from the URL parameter

  try {
    // Find and delete the user by email
    const user = await User.findOneAndDelete({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send a success response
    res.status(200).json(`{ message: User with email ${email} deleted successfully }`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error, please try again later' });
  }
};

module.exports = {
  getUsers,
  updateUser,
  deleteUserByEmail
};