import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser"; // Make sure this is installed

// Import routes
import authRoutes from "./routes/auth-route.js";
import userRoutes from "./routes/user-route.js";
import petitionRoutes from "./routes/petition-route.js";
import signatureRoutes from "./routes/signature-route.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// IMPORTANT: Cookie parser must come before routes
app.use(cookieParser());
app.use(express.json());

// CORS setup is crucial for cookies - origin must match frontend exactly
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173", // Must match frontend URL exactly
    credentials: true, // This is essential for cookies
  })
);

// Debug middleware to see incoming requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log("Cookies:", req.cookies);
  console.log(
    "Headers:",
    req.headers.authorization ? "Has auth header" : "No auth header"
  );
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/petitions", petitionRoutes);
app.use("/api/signatures", signatureRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

export default app;
