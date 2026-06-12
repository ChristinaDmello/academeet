const jwt = require('jsonwebtoken');

// ─────────────────────────────────────────────────────────────
// protect
// Middleware that checks for a valid JWT token.
// Attach this to any route that requires the user to be logged in.
// After this runs, req.user will contain { id, role } from the token.
// ─────────────────────────────────────────────────────────────
const protect = (req, res, next) => {
  // The frontend sends the token in the Authorization header like:
  //   Authorization: Bearer <token>
  const authHeader = req.headers.authorization;

  // Check the header exists and starts with "Bearer "
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  // Pull out just the token part (remove "Bearer ")
  const token = authHeader.split(' ')[1];

  try {
    // Verify the token using the same secret that was used to sign it
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded payload to req.user so route handlers can use it
    // decoded looks like: { id: '...', role: 'student' | 'faculty' }
    req.user = decoded;

    // Move on to the actual route handler
    next();
  } catch (error) {
    // This runs if the token is expired or has been tampered with
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

// ─────────────────────────────────────────────────────────────
// facultyOnly
// Middleware that blocks anyone who is not a faculty member.
// Always use this AFTER protect, because it relies on req.user.
// ─────────────────────────────────────────────────────────────
const facultyOnly = (req, res, next) => {
  if (req.user.role !== 'faculty') {
    return res.status(403).json({ message: 'Access denied. Faculty only.' });
  }
  next();
};

module.exports = { protect, facultyOnly };
