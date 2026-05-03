import User from "../models/user.model.js";

// ── Get My Profile ──
// Customer/Provider নিজের profile দেখবে
export const getMyProfile = async (req, res) => {
  try {
    // protect middleware থেকে req.user আসে
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ── Update My Profile ──
// Customer/Provider নিজের profile update করবে
export const updateMyProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    // শুধু এই ৩টা update করা যাবে
    // email, role, password এখানে update হবে না

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address },
      {
        new: true,
        // new: true → updated document return করবে
        // না দিলে পুরনো document return করবে
        runValidators: true,
        // runValidators: true → Schema validation চলবে
      },
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ── Change Password ──
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Field check
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current and new password.",
      });
    }

    // Password সহ user খোঁজো
    const user = await User.findById(req.user._id).select("+password");

    // Current password সঠিক কিনা check
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    // নতুন password set করো
    // pre save hook automatically hash করবে
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ══════════════════════════════
// Admin Only Functions
// ══════════════════════════════

// ── Get All Users ──
// Admin সব users দেখবে
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    // sort → নতুন user আগে দেখাবে

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ── Get Single User ──
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    // req.params.id → URL থেকে id নাও
    // GET /api/users/123 → req.params.id = "123"

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ── Toggle Block/Unblock ──
export const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Admin নিজেকে block করতে পারবে না
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot block yourself.",
      });
    }

    // Status toggle করো
    user.status = user.status === "active" ? "blocked" : "active";
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.status === "active" ? "unblocked" : "blocked"} successfully!`,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ── Make Admin ──
export const makeAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.role === "admin") {
      return res.status(400).json({
        success: false,
        message: "User is already an admin.",
      });
    }

    user.role = "admin";
    await user.save();

    res.status(200).json({
      success: true,
      message: "User promoted to admin successfully!",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ── Delete User ──
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Admin নিজেকে delete করতে পারবে না
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete yourself.",
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
