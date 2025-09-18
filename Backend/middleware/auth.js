import jwt from "jsonwebtoken";

// Middleware to protect routes
export const authMiddleware = (req, res, next) => {
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
