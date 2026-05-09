module.exports = function authorize(...allowedRoles) {
  return (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }

      // Check if user's role is allowed
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          message: "Forbidden",
        });
      }

      next();
    } catch (err) {
      console.error("Authorization error:", err);

      return res.status(500).json({
        message: "Server error",
      });
    }
  };
};