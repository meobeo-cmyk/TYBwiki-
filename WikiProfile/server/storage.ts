import {
  users,
  wikiEntries,
  userImages,
  contentReports,
  comments,
  likes,
  type User,
  type UpsertUser,
  type WikiEntry,
  type InsertWikiEntry,
  type UpdateWikiEntry,
  type UserWithEntries,
  type UserImage,
  type InsertContentReport,
  type ContentReport,
  type Comment,
  type Like,
  type InsertComment,
  type InsertLike,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // User profile with entries
  getUserProfile(userId: string): Promise<UserWithEntries | undefined>;
  
  // Get all users with entry counts
  getAllUsersWithCounts(): Promise<(User & { entryCount: number })[]>;
  
  // Wiki entry operations
  createEntry(entry: InsertWikiEntry): Promise<WikiEntry>;
  getEntry(id: string): Promise<WikiEntry | undefined>;
  getUserEntries(userId: string): Promise<WikiEntry[]>;
  updateEntry(id: string, entry: UpdateWikiEntry): Promise<WikiEntry | undefined>;
  deleteEntry(id: string): Promise<void>;
  getApprovedEntries(): Promise<(WikiEntry & { user: User })[]>;
  
  // Admin operations
  getAllEntriesWithUsers(): Promise<(WikiEntry & { user: User })[]>;
  moderateEntry(id: string, status: string): Promise<WikiEntry | undefined>;
  deleteEntryAdmin(id: string): Promise<void>;
  updateUserRole(userId: string, role: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getUserByUsername(username: string): Promise<User | undefined>;
  
  // Badge and verification management
  setUserBadge(userId: string, badge: string): Promise<User | undefined>;
  setEntryVerification(entryId: string, verification: string): Promise<WikiEntry | undefined>;
  
  // Gallery and profile customization
  addUserImage(userId: string, imageUrl: string, fileName?: string): Promise<UserImage>;
  getUserImages(userId: string): Promise<UserImage[]>;
  deleteUserImage(imageId: string): Promise<void>;
  updateProfileAvatar(userId: string, imageUrl: string): Promise<User | undefined>;
  updateProfileBackground(userId: string, backgroundUrl: string): Promise<User | undefined>;
  
  // Content reports
  createReport(report: InsertContentReport): Promise<ContentReport>;
  getReports(filters?: { status?: string }): Promise<(ContentReport & { entry: WikiEntry & { user: User }; reporter: User })[]>;
  getReportsByEntry(entryId: string): Promise<ContentReport[]>;
  updateReportStatus(reportId: string, status: string): Promise<ContentReport | undefined>;
  deleteReport(reportId: string): Promise<void>;
  
  // Comments
  createComment(comment: InsertComment): Promise<Comment>;
  getComments(entryId: string): Promise<(Comment & { user: User })[]>;
  deleteComment(commentId: string): Promise<void>;
  
  // Likes
  createLike(like: InsertLike): Promise<Like>;
  removeLike(entryId: string, userId: string): Promise<void>;
  getLikes(entryId: string): Promise<Like[]>;
  userLikesEntry(entryId: string, userId: string): Promise<boolean>;
  
  // Special posts
  getSpecialPost(entryId: string, token?: string): Promise<WikiEntry | undefined>;
  
  // User ban/delete
  banUser(userId: string, banReason: string, bannedUntil?: Date): Promise<User | undefined>;
  unbanUser(userId: string): Promise<User | undefined>;
  deleteUser(userId: string): Promise<void>;
  checkUserBanned(userId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          // Preserve or update isAdmin flag
          isAdmin: userData.isAdmin !== undefined ? userData.isAdmin : users.isAdmin,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserProfile(userId: string): Promise<UserWithEntries | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;

    const entries = await db
      .select()
      .from(wikiEntries)
      .where(eq(wikiEntries.userId, userId))
      .orderBy(desc(wikiEntries.createdAt));

    return {
      ...user,
      wikiEntries: entries,
    };
  }

  async getAllUsersWithCounts(): Promise<(User & { entryCount: number })[]> {
    const result = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        password: users.password,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        bio: users.bio,
        isAdmin: users.isAdmin,
        role: users.role,
        badge: users.badge,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        entryCount: sql<number>`cast(count(${wikiEntries.id}) as int)`,
      })
      .from(users)
      .leftJoin(wikiEntries, eq(users.id, wikiEntries.userId))
      .groupBy(users.id)
      .orderBy(desc(users.createdAt));

    return result as any;
  }

  // Wiki entry operations
  async createEntry(entryData: InsertWikiEntry): Promise<WikiEntry> {
    const [entry] = await db
      .insert(wikiEntries)
      .values(entryData)
      .returning();
    return entry;
  }

  async getApprovedEntries(): Promise<(WikiEntry & { user: User })[]> {
    const result = await db
      .select()
      .from(wikiEntries)
      .innerJoin(users, eq(wikiEntries.userId, users.id))
      .where(eq(wikiEntries.status, "approved"))
      .orderBy(desc(wikiEntries.createdAt));

    return result.map((row) => ({
      ...row.wiki_entries,
      user: row.users,
    }));
  }

  async getEntry(id: string): Promise<WikiEntry | undefined> {
    const [entry] = await db
      .select()
      .from(wikiEntries)
      .where(eq(wikiEntries.id, id));
    return entry;
  }

  async getUserEntries(userId: string): Promise<WikiEntry[]> {
    return await db
      .select()
      .from(wikiEntries)
      .where(eq(wikiEntries.userId, userId))
      .orderBy(desc(wikiEntries.createdAt));
  }

  async updateEntry(id: string, entryData: UpdateWikiEntry): Promise<WikiEntry | undefined> {
    const [entry] = await db
      .update(wikiEntries)
      .set({
        ...entryData,
        updatedAt: new Date(),
      })
      .where(eq(wikiEntries.id, id))
      .returning();
    return entry;
  }

  async deleteEntry(id: string): Promise<void> {
    await db.delete(wikiEntries).where(eq(wikiEntries.id, id));
  }

  // Admin operations
  async getAllEntriesWithUsers(): Promise<(WikiEntry & { user: User })[]> {
    const result = await db
      .select()
      .from(wikiEntries)
      .innerJoin(users, eq(wikiEntries.userId, users.id))
      .orderBy(desc(wikiEntries.createdAt));

    return result.map((row) => ({
      ...row.wiki_entries,
      user: row.users,
    }));
  }

  async moderateEntry(id: string, status: string): Promise<WikiEntry | undefined> {
    const [entry] = await db
      .update(wikiEntries)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(wikiEntries.id, id))
      .returning();
    return entry;
  }

  async deleteEntryAdmin(id: string): Promise<void> {
    await db.delete(wikiEntries).where(eq(wikiEntries.id, id));
  }

  // User role management
  async updateUserRole(userId: string, role: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  // Badge management
  async setUserBadge(userId: string, badge: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ badge, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Entry verification management
  async setEntryVerification(entryId: string, verification: string): Promise<WikiEntry | undefined> {
    const [entry] = await db
      .update(wikiEntries)
      .set({ verification, updatedAt: new Date() })
      .where(eq(wikiEntries.id, entryId))
      .returning();
    return entry;
  }

  // Gallery and profile customization
  async addUserImage(userId: string, imageUrl: string, fileName?: string): Promise<UserImage> {
    const [image] = await db
      .insert(userImages)
      .values({ userId, imageUrl, fileName })
      .returning();
    return image;
  }

  async getUserImages(userId: string): Promise<UserImage[]> {
    return await db
      .select()
      .from(userImages)
      .where(eq(userImages.userId, userId))
      .orderBy(desc(userImages.createdAt));
  }

  async deleteUserImage(imageId: string): Promise<void> {
    await db.delete(userImages).where(eq(userImages.id, imageId));
  }

  async updateProfileAvatar(userId: string, imageUrl: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ profileImageUrl: imageUrl, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateProfileBackground(userId: string, backgroundUrl: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ profileBackgroundUrl: backgroundUrl, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Content reports
  async createReport(reportData: InsertContentReport): Promise<ContentReport> {
    const [report] = await db
      .insert(contentReports)
      .values(reportData)
      .returning();
    return report;
  }

  async getReports(filters?: { status?: string }): Promise<(ContentReport & { entry: WikiEntry & { user: User }; reporter: User })[]> {
    let baseQuery: any = db.select().from(contentReports);

    if (filters?.status) {
      baseQuery = baseQuery.where(eq(contentReports.status, filters.status));
    }

    const reports = await baseQuery.orderBy(desc(contentReports.createdAt)) as ContentReport[];

    // Fetch related data for each report
    const result = await Promise.all(
      reports.map(async (report: ContentReport) => {
        const entry = await this.getEntry(report.entryId);
        const entryUser = entry ? await this.getUser(entry.userId) : null;
        const reporter = await this.getUser(report.reporterId);

        return {
          ...report,
          entry: { ...entry!, user: entryUser! },
          reporter: reporter!,
        };
      })
    );

    return result;
  }

  async getReportsByEntry(entryId: string): Promise<ContentReport[]> {
    return await db
      .select()
      .from(contentReports)
      .where(eq(contentReports.entryId, entryId))
      .orderBy(desc(contentReports.createdAt));
  }

  async updateReportStatus(reportId: string, status: string): Promise<ContentReport | undefined> {
    const [report] = await db
      .update(contentReports)
      .set({ status, updatedAt: new Date() })
      .where(eq(contentReports.id, reportId))
      .returning();
    return report;
  }

  async deleteReport(reportId: string): Promise<void> {
    await db.delete(contentReports).where(eq(contentReports.id, reportId));
  }

  // Comments
  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db
      .insert(comments)
      .values(comment)
      .returning();
    return newComment;
  }

  async getComments(entryId: string): Promise<(Comment & { user: User })[]> {
    const result = await db
      .select()
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.entryId, entryId))
      .orderBy(desc(comments.createdAt));
    
    return result.map(({ comments: c, users: u }) => ({
      ...c,
      user: u!,
    }));
  }

  async deleteComment(commentId: string): Promise<void> {
    await db.delete(comments).where(eq(comments.id, commentId));
  }

  // Likes
  async createLike(like: InsertLike): Promise<Like> {
    const [newLike] = await db
      .insert(likes)
      .values(like)
      .returning();
    return newLike;
  }

  async removeLike(entryId: string, userId: string): Promise<void> {
    await db
      .delete(likes)
      .where(and(eq(likes.entryId, entryId), eq(likes.userId, userId)));
  }

  async getLikes(entryId: string): Promise<Like[]> {
    return await db
      .select()
      .from(likes)
      .where(eq(likes.entryId, entryId))
      .orderBy(desc(likes.createdAt));
  }

  async userLikesEntry(entryId: string, userId: string): Promise<boolean> {
    const [like] = await db
      .select()
      .from(likes)
      .where(and(eq(likes.entryId, entryId), eq(likes.userId, userId)));
    return !!like;
  }

  // Special posts - retrieve with token validation
  async getSpecialPost(entryId: string, token?: string): Promise<WikiEntry | undefined> {
    const entry = await this.getEntry(entryId);
    if (!entry) return undefined;
    
    // If entry is special and no token provided, or token doesn't match, return undefined
    if (entry.isSpecial && (!token || token !== entry.specialAccessToken)) {
      return undefined;
    }
    
    return entry;
  }

  // User ban/delete operations
  async banUser(userId: string, banReason: string, bannedUntil?: Date): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        isBanned: true,
        banReason,
        bannedUntil: bannedUntil || null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async unbanUser(userId: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        isBanned: false,
        banReason: null,
        bannedUntil: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async deleteUser(userId: string): Promise<void> {
    await db.delete(users).where(eq(users.id, userId));
  }

  async checkUserBanned(userId: string): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user || !user.isBanned) return false;
    
    // Check if ban is temporary and has expired
    if (user.bannedUntil && new Date() > user.bannedUntil) {
      // Auto-unban if ban expired
      await this.unbanUser(userId);
      return false;
    }
    
    return user.isBanned;
  }
}

export const storage = new DatabaseStorage();
