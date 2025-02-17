const path = require("path");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const Group = require("../models/groupModel");
const process = require("process");
const mongoose = require("mongoose");
const crypto = require("crypto");

// Update NotificationSchema to include timestamps
const NotificationSchema = new mongoose.Schema(
  {
    type: String,
    to: String,
    from: String,
    groupId: String,
    groupName: String,
    status: String,
  },
  { timestamps: true } // Automatic createdAt and updatedAt fields
);

const Notification = mongoose.model("Notification", NotificationSchema);

// Function to generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Function to send OTP via email
const sendOTPEmail = async (email, otp) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false, // Only for development/testing
    },
  });

  // Mail options including HTML content and an inline image
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "OTP for Your Registration",
    html: `
     <h1 style="font-family:Monotype Corsiva; color:#7600bc">Unlock Your Potential with VSM </h1>
      <img src="cid:unique-logo-id" alt="Logo" style="width:1050px; height:600px;"/>
      <p>Your OTP is: <b>${otp}</b></p>
      <p>Please use this OTP to complete your registration.</p>
      
    `,
    attachments: [
      {
        filename: "vsm1.jpg", // Name of the file as it will appear in the email
        path: path.join(__dirname, "images", "vsm1.jpg"), // Ensure this path is correct based on your folder structure
        cid: "unique-logo-id", // This CID must match the one used in the HTML img src
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("OTP sent successfully");
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error;
  }
};

// Register endpoint
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  // If an image file is uploaded via multer, it is stored in req.file
  const image = req.file ? req.file.buffer : null;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpires = Date.now() + 5 * 60 * 1000; // OTP expires in 5 minutes

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      otp,
      otpExpires,
      image,
    });

    await user.save();
    await sendOTPEmail(email, otp);

    res.status(200).json({
      message: "OTP sent to your email. Please verify to complete registration.",
    });
  } catch (error) {
    console.error("Registration error:", error.message);
    res.status(500).json({ message: "Error registering user. Please try again." });
  }
};

// Verify OTP endpoint
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // Check OTP and expiration
  if (user.otp === otp && user.otpExpires > Date.now()) {
    user.otp = null; // Clear OTP after verification
    user.otpExpires = null;
    await user.save();

    const token = jwt.sign(
      { email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    return res.json({ message: "OTP verified successfully", token });
  } else {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }
};

// Login endpoint
exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    const token = jwt.sign(
      { _id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "6h" }
    );
    return res.json({ token, role: user.role });
  } else {
    return res.status(400).json({ message: "Invalid credentials" });
  }
};

// Resend OTP endpoint (updated to always generate a new OTP)
exports.resendOTP = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });

  const otp = generateOTP();
  user.otp = otp;
  user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes expiry
  await user.save();

  try {
    await sendOTPEmail(email, otp);
    return res.json({ message: "OTP has been resent to your email" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return res.status(500).json({ message: "Error sending OTP" });
  }
};

const generateResetToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Helper to send the reset password email
const sendResetPasswordEmail = async (email, resetLink) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset Request",
    text: `You requested a password reset. Please click on the following link (or paste it into your browser) to reset your password:\n\n${resetLink}\n\nIf you did not request a password reset, please ignore this email.`,
  };

  await transporter.sendMail(mailOptions);
};

// Forgot Password endpoint: generate token and send reset link
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Generate token and set expiry (e.g., 1 hour)
    const resetToken = generateResetToken();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour in ms
    await user.save();

    // Construct reset link (adjust FRONTEND_URL as needed)
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${email}`;

    await sendResetPasswordEmail(email, resetLink);

    return res.json({ message: "Password reset link has been sent to your email." });
  } catch (error) {
    console.error("Forgot Password error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// Reset Password endpoint: verify token and update password
exports.resetPassword = async (req, res) => {
  const { email, token, newPassword } = req.body;
  try {
    // Find the user with matching email, valid token, and token not expired
    const user = await User.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token." });

    // Hash the new password and update the user record
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.json({ message: "Password has been reset successfully." });
  } catch (error) {
    console.error("Reset Password error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// Get user profile endpoint
exports.profile = async (req, res) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ email: decoded.email }).select("-password -otp -otpExpires");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Get all groups endpoint
exports.getGroups = async (req, res) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const groups = await Group.find({
      $or: [{ members: user._id }, { createdBy: user._id }],
    });

    res.status(200).json({ groups });
  } catch (err) {
    console.error("Error fetching groups:", err.message);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

// Create group endpoint
exports.createGroup = async (req, res) => {
  try {
    const { name, image, description, createdBy, members } = req.body;

    if (!name || !image || !description || !createdBy) {
      return res.status(400).json({
        message:
          "All fields ('name', 'image', 'description', and 'createdBy') are required.",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(createdBy) ||
      (members && !members.every((id) => mongoose.Types.ObjectId.isValid(id)))
    ) {
      return res.status(400).json({ message: "Invalid user ID(s) provided." });
    }

    const newGroup = new Group({
      name,
      image,
      description,
      createdBy,
      members: members || [],
    });

    await newGroup.save();

    console.log("New group created:", newGroup);
    res.status(201).json({ message: "Group created successfully", group: newGroup });
  } catch (err) {
    console.error("Error creating group:", err.message);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

// Get user by ID endpoint
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select("-password -otp -otpExpires");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Search users endpoint
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    }).select("name email image");

    res.json({ users });
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update user endpoint
exports.updateUser = async (req, res) => {
  try {
    const { email } = req.params;
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.email !== email) {
      return res.status(403).json({ message: "You are not authorized to update this profile" });
    }

    const { name, password, role } = req.body;
    const image = req.file; // Provided by Multer if an image is uploaded

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    if (role) user.role = role;
    if (image) {
      user.image = image.buffer;
    }

    await user.save();

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Error updating user profile", error: error.message });
  }
};

// Send group invite endpoint
exports.sendGroupInvite = async (req, res) => {
  try {
    const { groupId, userId } = req.body;
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const notification = new Notification({
      type: "group_invite",
      to: userId,
      from: req.user._id,
      groupId,
      groupName: group.name,
      status: "pending",
    });

    await notification.save();
    res.json({ message: "Invitation sent successfully" });
  } catch (error) {
    console.error("Error sending group invite:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Respond to group invite endpoint
exports.respondToGroupInvite = async (req, res) => {
  try {
    const { notificationId, groupId, accept } = req.body;
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Update the notification status based on the response
    notification.status = accept ? "accepted" : "rejected";
    await notification.save();

    if (accept) {
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }

      // Add user to the group if not already a member
      if (!group.members.includes(user._id)) {
        group.members.push(user._id);
        await group.save();
      }
    }

    res.json({
      message: `Invitation ${accept ? "accepted" : "rejected"} successfully`,
      status: notification.status,
      groupId: groupId,
    });
  } catch (error) {
    console.error("Error responding to group invite:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get notifications for the user endpoint
exports.getNotifications = async (req, res) => {
  try {
    const token = req.header("Authorization");
    if (!token) {
      return res.status(401).json({ message: "Authorization header is missing" });
    }

    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);

    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const notifications = await Notification.find({ to: user._id }).sort({ createdAt: -1 });
    res.status(200).json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Error fetching notifications" });
  }
};
