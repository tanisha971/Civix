import jwt from "jsonwebtoken";

// Middleware to protect routes
const authMiddleware = (req, res, next) => {
  // Prefer httpOnly cookie, but fall back to Authorization header
  let token = req.cookies?.token;
  if (!token) {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Middleware for public officials only
export const publicOfficialMiddleware = (req, res, next) => {
  if (req.user.role !== 'public-official') {
    return res.status(403).json({ 
      message: "Access denied. Public officials only." 
    });
  }
  next();
};

// Export as default
export default authMiddleware;

// Also export as named export for compatibility
export { authMiddleware };

// Optional auth: attaches req.user if a valid token exists; never blocks
export const optionalAuth = (req, res, next) => {
  try {
    let token = req.cookies?.token;
    if (!token) {
      const authHeader = req.headers.authorization || req.headers.Authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // { id, role }
    }
  } catch (_) {
    // ignore invalid token in optional path
  } finally {
    next();
  }
};
