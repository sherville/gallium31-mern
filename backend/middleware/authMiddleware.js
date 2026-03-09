const jwt = require("jsonwebtoken");

module.exports = function authMiddleware(req, res, next) {
  try {
    // Expect: Authorization: Bearer <token>
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided." });
    }

    const token = authHeader.split(" ")[1]; // after "Bearer"

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info so routes can use it (optional but useful)
    req.user = decoded;

    next();
} catch (error) {
  console.log("JWT VERIFY ERROR:", error.message);
  return res.status(401).json({ message: "Invalid or expired token." });
}
};