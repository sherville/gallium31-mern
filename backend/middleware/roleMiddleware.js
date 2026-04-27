function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(403).json({
        status: false,
        message: "Access denied.",
        error: "User role not found.",
      });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        status: false,
        message: "Access denied.",
        error: "Insufficient permissions.",
      });
    }

    next();
  };
}

module.exports = requireRole;