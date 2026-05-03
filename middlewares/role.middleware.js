// নির্দিষ্ট role check করো
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized.`,
      });
    }
    next();
  };
};

export default authorize;

// Use করার সময়:
// authorize('admin')           → শুধু admin
// authorize('admin', 'provider') → admin বা provider
