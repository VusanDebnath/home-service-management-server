import User from "../models/user.model.js";
import { generateToken } from "../utils/jwt.js";

// ── Register ──
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // সব field আছে কিনা check
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email and password.",
      });
    }

    // Email already আছে কিনা check
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered.",
      });
    }

    // User তৈরি করো
    // password এখানে plain text — model এ pre save hook hash করবে
    const user = await User.create({
      name,
      email,
      password,
      role: role || "customer",
    });

    // Token তৈরি করো
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: "Account created successfully!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ── Login ──
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Field check
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password.",
      });
    }

    // User খোঁজো — password সহ
    // select: false ছিল তাই .select('+password') দিতে হবে
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Blocked check
    if (user.status === "blocked") {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked.",
      });
    }

    // Password compare করো
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Token তৈরি করো
    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ── Get Me (নিজের profile) ──
export const getMe = async (req, res) => {
  try {
    // protect middleware থেকে req.user আসে
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
