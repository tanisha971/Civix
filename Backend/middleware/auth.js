import jwt from "jsonwebtoken";

// Middleware to protect routes
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token; // Read JWT from cookie
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
