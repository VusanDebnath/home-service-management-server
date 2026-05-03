import jwt from "jsonwebtoken";

// Token তৈরি করো
export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE },
    // 7d মানে 7 দিন পরে token expire হবে
  );
};

// Token verify করো
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
