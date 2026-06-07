const jwt = require('jsonwebtoken');

// 1. Verify if the user is logged in (Token Check)
exports.verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: "No token provided!" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized! Access Token is invalid or expired." });
    }
    
    // Logic: strictly attach to req.user for consistency with auth.controller
    req.user = {
      id: decoded.id,
      role: decoded.role
    };
    next();
  });
};

// RBAC logic preserved
exports.isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: "Access Denied" });
  next();
};

exports.isDoctor = (req, res, next) => {
  if (req.user?.role !== 'doctor') return res.status(403).json({ message: "Access Denied" });
  next();
};

exports.isPharmacist = (req, res, next) => {
  if (req.user?.role !== 'pharmacist') return res.status(403).json({ message: "Access Denied" });
  next();
};