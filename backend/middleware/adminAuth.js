module.exports = (req, res, next) => {
  try {
    // Get token from headers
    const token = req.headers.authorization;

    // Check if token exists
    if (!token) {
      return res.status(401).json({ error: "Access denied. No token provided" });
    }

    // Simple check for admin token
    if (token !== "admintoken") {
      return res.status(403).json({ error: "Not authorized as admin" });
    }

    // Allow access
    next();

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};