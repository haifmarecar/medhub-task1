const jwt = require('jsonwebtoken');


const authMiddleware = (req, res, next) => {
  // 1. Check Authorization Header (case-insensitive)
  const authHeader = req.headers.authorization || req.headers.Authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false,
      message: 'Unauthorized: No Bearer token provided' 
    });
  }

  // 2. Extract and Validate Token Structure
  const token = authHeader.split(' ')[1];
  if (typeof token !== 'string' || token.length < 50) {
    return res.status(401).json({ 
      success: false,
      message: 'Unauthorized: Invalid token format' 
    });
  }

  // 3. Verify Token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'], // Security: Restrict to HS256
      maxAge: process.env.JWT_EXPIRES_IN
    });

    // 4. Attach User Data to Request
    req.user = {
      id: decoded.userId,
      ...(decoded.role && { role: decoded.role }),
      ...(decoded.sessionId && { sessionId: decoded.sessionId }) // Session tracking
    };

    next();
  } catch (err) {
    // 5. Detailed Error Responses
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