import USER from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

function createToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
}

export async function createUser(req, res) {
  try {
    const { name, email, password, profile } = req.body;

    const existingUser = await USER.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await USER.create({
      name,
      email,
      password: hashedPassword,
      profile,
    });

    res.status(201).json({
      message: "Account created successfully! Please log in.",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
}

export async function verifyUser(req, res) {
  try {
    const { email, password } = req.body;

    const user = await USER.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = createToken(user);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
}
