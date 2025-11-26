import type { Express } from "express";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import { z } from "zod";
import session from "express-session";

const signupSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[0-9]/)
    .regex(/[!@#$%^&*(),.?":{}|<>]/),
});

export async function registerAuthRoutes(app: Express) {
  // Password signup endpoint
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const data = signupSchema.parse(req.body);

      // Check if username already exists
      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10);

      // Create user
      const user = await storage.upsertUser({
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        password: hashedPassword,
        email: `${data.username}@local.pixelswiki`,
        isAdmin: false,
        role: "user",
      });

      // Session setup for local users
      (req as any).user = { claims: { sub: user.id }, ...user };
      (req as any).isAuthenticated = () => true;
      
      res.json(user);
    } catch (error: any) {
      console.error("Signup error:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid signup data", errors: error.errors });
      }
      res.status(500).json({ message: "Signup failed" });
    }
  });

  // Password login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password, rememberMe } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user || !user.password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Session setup for local users
      (req as any).user = { claims: { sub: user.id }, ...user };
      (req as any).isAuthenticated = () => true;
      
      // If rememberMe is true, extend session cookie expiry (30 days)
      if (rememberMe) {
        (req as any).session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in ms
      }
      
      res.json(user);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
}
