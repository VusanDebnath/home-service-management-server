import { verifyToken } from "../utils/jwt.js";
import User from "../models/user.model.js";

const protect = async (req, res, next) => {
  try {
    // Header থেকে token নাও
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. No token provided.",
      });
    }

    // "Bearer eyJ..." থেকে শুধু token নাও
    const token = authHeader.split(" ")[1];

    // Token decode করো
    const decoded = verifyToken(token);

    // User DB তে আছে কিনা check করো
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    // User blocked কিনা check করো
    if (user.status === "blocked") {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked.",
      });
    }

    // Request এ user বসাও
    // পরবর্তী middleware বা controller এ req.user পাবে
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized. Invalid token.",
    });
  }
};

export default protect;
