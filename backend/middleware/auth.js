const jwt = require("jsonwebtoken");
const User = require("../models/User");
const mongoose = require('mongoose');

//  Check if user is logged in
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(403).json({ message: " No token provided!" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get full user info - try both string and ObjectId
    let user = await User.findById(decoded.id).select("-password");
    if (!user && mongoose.Types.ObjectId.isValid(decoded.id)) {
      user = await User.findById(mongoose.Types.ObjectId(decoded.id)).select("-password");
    }
    
    if (!user) {
      return res.status(401).json({ message: " User not found!" });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: " Invalid token!" });
  }
};

//  Check if user is Admin
const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: " Admin access only!" });
  }
  next();
};

module.exports = { verifyToken, adminOnly };