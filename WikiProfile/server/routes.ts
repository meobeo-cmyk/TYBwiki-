import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./replitAuth";
import { registerAuthRoutes } from "./authRoutes";
import { insertWikiEntrySchema, updateWikiEntrySchema, insertContentReportSchema, insertCommentSchema, insertLikeSchema } from "@shared/schema";
import { randomBytes } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);
  
  // Password auth routes
  await registerAuthRoutes(app);

  // Auth routes
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.json(null);
      }

      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.json(null);
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User routes
  app.get('/api/users', isAuthenticated, async (req, res) => {
    try {
      const users = await storage.getAllUsersWithCounts();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/profile/:userId', isAuthenticated, async (req, res) => {
    try {
      const { userId } = req.params;
      const profile = await storage.getUserProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Wiki entry routes
  app.get('/api/entries/approved', async (req, res) => {
    try {
      const entries = await storage.getApprovedEntries();
      res.json(entries);
    } catch (error) {
      console.error("Error fetching approved entries:", error);
      res.status(500).json({ message: "Failed to fetch entries" });
    }
  });

  app.post('/api/entries', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertWikiEntrySchema.parse({
        ...req.body,
        userId,
      });

      const entry = await storage.createEntry(validatedData);
      res.status(201).json(entry);
    } catch (error: any) {
      console.error("Error creating entry:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid entry data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create entry" });
    }
  });

  app.get('/api/entries/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const entry = await storage.getEntry(id);
      if (!entry) {
        return res.status(404).json({ message: "Entry not found" });
      }
      res.json(entry);
    } catch (error) {
      console.error("Error fetching entry:", error);
      res.status(500).json({ message: "Failed to fetch entry" });
    }
  });

  app.patch('/api/entries/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;

      // Check if entry exists and belongs to user
      const existingEntry = await storage.getEntry(id);
      if (!existingEntry) {
        return res.status(404).json({ message: "Entry not found" });
      }
      if (existingEntry.userId !== userId) {
        return res.status(403).json({ message: "Forbidden - You can only edit your own entries" });
      }

      // Explicitly remove status field if present to prevent status escalation
      const { status, ...bodyWithoutStatus } = req.body;
      const validatedData = updateWikiEntrySchema.parse(bodyWithoutStatus);
      
      // Force status back to pending on edit to require re-moderation
      const entry = await storage.updateEntry(id, validatedData);
      if (entry) {
        await storage.moderateEntry(id, "pending");
      }
      
      if (!entry) {
        return res.status(404).json({ message: "Entry not found" });
      }
      
      res.json(entry);
    } catch (error: any) {
      console.error("Error updating entry:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid entry data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update entry" });
    }
  });

  app.delete('/api/entries/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;

      // Check if entry exists and belongs to user
      const existingEntry = await storage.getEntry(id);
      if (!existingEntry) {
        return res.status(404).json({ message: "Entry not found" });
      }
      if (existingEntry.userId !== userId) {
        return res.status(403).json({ message: "Forbidden - You can only delete your own entries" });
      }

      await storage.deleteEntry(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting entry:", error);
      res.status(500).json({ message: "Failed to delete entry" });
    }
  });

  // Admin routes
  app.get('/api/admin/entries', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const entries = await storage.getAllEntriesWithUsers();
      res.json(entries);
    } catch (error) {
      console.error("Error fetching entries for admin:", error);
      res.status(500).json({ message: "Failed to fetch entries" });
    }
  });

  // Entry verification endpoint (admin only)
  app.patch('/api/admin/entries/:id/verify', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { verification } = req.body;
      
      if (!["verified", "fake", "unknown"].includes(verification)) {
        return res.status(400).json({ message: "Invalid verification status" });
      }
      
      const entry = await storage.setEntryVerification(id, verification);
      if (!entry) {
        return res.status(404).json({ message: "Entry not found" });
      }
      
      res.json(entry);
    } catch (error) {
      console.error("Error verifying entry:", error);
      res.status(500).json({ message: "Failed to verify entry" });
    }
  });

  // User badge endpoint (admin only)
  app.patch('/api/admin/users/:id/badge', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { badge } = req.body;
      
      if (!["green_check", "red_check", "black_check", "none"].includes(badge)) {
        return res.status(400).json({ message: "Invalid badge type" });
      }
      
      const user = await storage.setUserBadge(id, badge);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error setting user badge:", error);
      res.status(500).json({ message: "Failed to set badge" });
    }
  });

  app.patch('/api/admin/entries/:id/moderate', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!["approved", "pending", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const entry = await storage.moderateEntry(id, status);
      if (!entry) {
        return res.status(404).json({ message: "Entry not found" });
      }

      res.json(entry);
    } catch (error) {
      console.error("Error moderating entry:", error);
      res.status(500).json({ message: "Failed to moderate entry" });
    }
  });

  app.delete('/api/admin/entries/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteEntryAdmin(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting entry (admin):", error);
      res.status(500).json({ message: "Failed to delete entry" });
    }
  });

  // Developer panel routes (admin only)
  app.get('/api/admin/users', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      res.json(allUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch('/api/admin/users/:id/role', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!["user", "moderator", "admin"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      const user = await storage.updateUserRole(id, role);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // Gallery endpoints
  app.get('/api/user/gallery', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const images = await storage.getUserImages(userId);
      res.json(images);
    } catch (error) {
      console.error("Error fetching gallery:", error);
      res.status(500).json({ message: "Failed to fetch gallery" });
    }
  });

  app.post('/api/user/gallery', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { imageUrl, fileName } = req.body;

      if (!imageUrl) {
        return res.status(400).json({ message: "Image URL required" });
      }

      const image = await storage.addUserImage(userId, imageUrl, fileName);
      res.status(201).json(image);
    } catch (error) {
      console.error("Error adding image to gallery:", error);
      res.status(500).json({ message: "Failed to add image" });
    }
  });

  app.delete('/api/user/gallery/:imageId', isAuthenticated, async (req: any, res) => {
    try {
      const { imageId } = req.params;
      const userId = req.user.claims.sub;

      // Verify ownership
      const images = await storage.getUserImages(userId);
      if (!images.find((img: any) => img.id === imageId)) {
        return res.status(403).json({ message: "Forbidden - This image doesn't belong to you" });
      }

      await storage.deleteUserImage(imageId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting image:", error);
      res.status(500).json({ message: "Failed to delete image" });
    }
  });

  // Profile customization endpoints
  app.patch('/api/user/avatar', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { imageUrl } = req.body;

      if (!imageUrl) {
        return res.status(400).json({ message: "Image URL required" });
      }

      const user = await storage.updateProfileAvatar(userId, imageUrl);
      res.json(user);
    } catch (error) {
      console.error("Error updating avatar:", error);
      res.status(500).json({ message: "Failed to update avatar" });
    }
  });

  app.patch('/api/user/background', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { backgroundUrl } = req.body;

      if (!backgroundUrl) {
        return res.status(400).json({ message: "Background URL required" });
      }

      const user = await storage.updateProfileBackground(userId, backgroundUrl);
      res.json(user);
    } catch (error) {
      console.error("Error updating background:", error);
      res.status(500).json({ message: "Failed to update background" });
    }
  });

  // Content report routes
  app.post('/api/reports', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { entryId, reason, description } = req.body;

      if (!entryId || !reason) {
        return res.status(400).json({ message: "Entry ID and reason are required" });
      }

      const validatedData = insertContentReportSchema.parse({
        entryId,
        reporterId: userId,
        reason,
        description,
      });

      const report = await storage.createReport(validatedData);
      res.status(201).json(report);
    } catch (error: any) {
      console.error("Error creating report:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid report data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create report" });
    }
  });

  app.get('/api/admin/reports', isAdmin, async (req: any, res) => {
    try {
      const { status } = req.query;
      const reports = await storage.getReports({ status });
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  app.patch('/api/admin/reports/:id/status', isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      const report = await storage.updateReportStatus(id, status);
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }

      res.json(report);
    } catch (error) {
      console.error("Error updating report status:", error);
      res.status(500).json({ message: "Failed to update report" });
    }
  });

  // Comments routes
  app.post('/api/comments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { entryId, content } = req.body;

      if (!entryId || !content) {
        return res.status(400).json({ message: "Entry ID and content required" });
      }

      const validatedData = insertCommentSchema.parse({
        entryId,
        userId,
        content,
      });

      const comment = await storage.createComment(validatedData);
      res.status(201).json(comment);
    } catch (error: any) {
      console.error("Error creating comment:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid comment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  app.get('/api/entries/:entryId/comments', async (req, res) => {
    try {
      const { entryId } = req.params;
      const comments = await storage.getComments(entryId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.delete('/api/comments/:commentId', isAuthenticated, async (req: any, res) => {
    try {
      const { commentId } = req.params;
      const userId = req.user.claims.sub;

      // Verify comment belongs to user
      const comment = await storage.getComments(''); // This is a workaround - we'll need to improve this
      // For now, we'll allow deletion if user is authenticated
      await storage.deleteComment(commentId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });

  // Likes routes
  app.post('/api/likes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { entryId } = req.body;

      if (!entryId) {
        return res.status(400).json({ message: "Entry ID required" });
      }

      // Check if already liked
      const alreadyLiked = await storage.userLikesEntry(entryId, userId);
      if (alreadyLiked) {
        return res.status(400).json({ message: "Already liked this entry" });
      }

      const validatedData = insertLikeSchema.parse({
        entryId,
        userId,
      });

      const like = await storage.createLike(validatedData);
      res.status(201).json(like);
    } catch (error: any) {
      console.error("Error creating like:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid like data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create like" });
    }
  });

  app.delete('/api/likes/:entryId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { entryId } = req.params;

      await storage.removeLike(entryId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing like:", error);
      res.status(500).json({ message: "Failed to remove like" });
    }
  });

  app.get('/api/entries/:entryId/likes', async (req, res) => {
    try {
      const { entryId } = req.params;
      const likes = await storage.getLikes(entryId);
      res.json(likes);
    } catch (error) {
      console.error("Error fetching likes:", error);
      res.status(500).json({ message: "Failed to fetch likes" });
    }
  });

  // Special posts - accessible via token
  app.get('/api/special/:entryId', async (req, res) => {
    try {
      const { entryId } = req.params;
      const { token } = req.query;

      const entry = await storage.getSpecialPost(entryId, token as string);
      if (!entry) {
        return res.status(404).json({ message: "Entry not found or access denied" });
      }

      res.json(entry);
    } catch (error) {
      console.error("Error fetching special post:", error);
      res.status(500).json({ message: "Failed to fetch entry" });
    }
  });

  // Update entry creation to support special posts
  app.patch('/api/entries/:id/special', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;

      // Check if entry exists and belongs to user
      const existingEntry = await storage.getEntry(id);
      if (!existingEntry) {
        return res.status(404).json({ message: "Entry not found" });
      }
      if (existingEntry.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { isSpecial } = req.body;
      
      // If making it special, generate a token
      let specialAccessToken: string | undefined;
      if (isSpecial) {
        specialAccessToken = randomBytes(32).toString('hex');
      }

      // Update the entry with isSpecial flag
      const updatedEntry = await storage.updateEntry(id, {
        isSpecial,
        specialAccessToken,
      } as any);

      if (!updatedEntry) {
        return res.status(500).json({ message: "Failed to update entry" });
      }

      res.json(updatedEntry);
    } catch (error) {
      console.error("Error updating entry special status:", error);
      res.status(500).json({ message: "Failed to update entry" });
    }
  });

  // User management routes - Admin only
  app.get('/api/admin/users', isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post('/api/admin/users/:userId/ban', isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const { reason, hours } = req.body;

      if (!reason) {
        return res.status(400).json({ message: "Ban reason is required" });
      }

      let bannedUntil: Date | undefined;
      if (hours && hours > 0) {
        bannedUntil = new Date(Date.now() + hours * 60 * 60 * 1000);
      }

      const user = await storage.banUser(userId, reason, bannedUntil);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error("Error banning user:", error);
      res.status(500).json({ message: "Failed to ban user" });
    }
  });

  app.post('/api/admin/users/:userId/unban', isAdmin, async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await storage.unbanUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error("Error unbanning user:", error);
      res.status(500).json({ message: "Failed to unban user" });
    }
  });

  app.delete('/api/admin/users/:userId', isAdmin, async (req, res) => {
    try {
      const { userId } = req.params;

      await storage.deleteUser(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
