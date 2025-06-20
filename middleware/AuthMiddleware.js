const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Authentication middleware for protecting routes
const authMiddleware = async (req, res, next) => {
  // Step 1: Check for Authorization header (case-insensitive)
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: No Bearer token provided'
    });
  }

  // Step 2: Extract token after 'Bearer'
  const token = authHeader.split(' ')[1];
  if (typeof token !== 'string' || token.length < 10) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid token format'
    });
  }

  try {
    // Step 3: Verify JWT and decode payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],                    // Enforce HS256 algorithm
      maxAge: process.env.JWT_EXPIRES_IN || '1h' // Optional expiry from .env
    });

    // Step 4: Fetch user from DB to verify identity and get full data (e.g. role)
    const user = await User.findById(decoded.userId).select('-password');

    // Step 5: Handle case where user no longer exists
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }

    // Step 6: Attach full user data to request object for next middleware/controllers
    req.user = user;
    next(); // Pass control to the next middleware or route handler
  } catch (err) {
    // Step 7: Handle token errors with specific messages
    let message = 'Invalid token';
    if (err.name === 'TokenExpiredError') message = 'Token expired';
    if (err.name === 'JsonWebTokenError') message = 'Malformed token';

    console.error(`JWT Error [IP: ${req.ip}]:`, err.name);

    res.status(401).json({
      success: false,
      error: err.name,
      message: `Unauthorized: ${message}`
    });
  }
};

module.exports = authMiddleware;
