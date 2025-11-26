# pixelsWIKI - Project Documentation

## Overview
Vietnamese wiki profile platform (pixelsWIKI) where users can create accounts, post wiki entries with images and descriptions, search for approved wiki entries, and admins can moderate content.

## Project Status
✅ **FINAL VERSION COMPLETE** - Ready for production deployment
- All features implemented
- Database schema updated
- UI complete with verification badges
- Deployment options documented
- longid98s@gmail.com has black CEO badge

### Completed Features
- ✅ User authentication (Replit Auth + Password signup)
- ✅ Wiki entry creation/editing/deletion
- ✅ Search functionality for approved entries
- ✅ User profiles with entry history
- ✅ Admin moderation dashboard (card-based UI)
- ✅ Developer panel for role management
- ✅ PostgreSQL database persistence
- ✅ SEO optimization
- ✅ Password validation (8 chars, 1 uppercase, 1 number, 1 special)
- ✅ Unique username enforcement
- ✅ Session-based authentication

## Architecture

### Database (PostgreSQL + Drizzle ORM)
- **users** - User accounts with roles (user, moderator, admin)
- **wiki_entries** - Wiki entries with status (pending, approved, rejected)
- **sessions** - Express session storage

### Frontend (React + Wouter + TanStack Query)
- `/` - Landing/Home page
- `/auth` - Authentication (signup + OAuth)
- `/profile/:userId` - User wiki profile
- `/admin` - Admin moderation dashboard
- Components: Header, DeveloperPanel, EntryDetailDialog, etc.

### Backend (Express.js)
- OAuth routes via Replit Auth
- Password signup/login routes
- Entry CRUD endpoints
- Admin moderation endpoints
- User role management endpoints

## Admin Setup
Set `ADMIN_EMAILS` environment variable with comma-separated email addresses:
```
ADMIN_EMAILS=pixeljstudio@gmail.com,admin@example.com
```

Admin users automatically get role="admin" and isAdmin=true on first login.

## Key Implementation Details

### Security
- Entry status resets to "pending" when edited (prevents self-approval)
- Password hashing with bcryptjs
- Session tokens with HTTP-only cookies
- ADMIN_EMAILS whitelist for admin role assignment

### Database Fields (Users Table)
- `id` - UUID primary key
- `email` - Unique (from OAuth or signup)
- `username` - Unique (for password auth only)
- `password` - Hashed with bcryptjs (password auth only)
- `role` - user | moderator | admin
- `isAdmin` - Boolean (for quick checks)
- `firstName`, `lastName` - Display names

### Entry Status Flow
1. User creates entry → status="pending"
2. Admin approves/rejects → status="approved"/"rejected"
3. User edits approved entry → status resets to "pending"
4. Only "approved" entries show in public search

## Recent Changes (Final Release)

### 2025-11-24 - FINAL RELEASE
- ✅ **NEW:** Entry verification badges (✓ verified, X fake, / unknown)
- ✅ **NEW:** User verification badges (✓ green=trusted, ✓ red=mod/admin, ✓ black=CEO/senior)
- ✅ **NEW:** Developer panel badge management UI
- ✅ **NEW:** longid98s@gmail.com assigned black badge (CEO/Senior Admin)
- ✅ Added Developer Panel to avatar menu
- ✅ Implemented password-based signup with validation
- ✅ Created card-based moderation UI for admin dashboard
- ✅ Added rejection reason field for rejections
- ✅ Implemented user role management (user/moderator/admin)
- ✅ Added username uniqueness constraint
- ✅ Updated authentication to support both OAuth and password
- ✅ PostgreSQL schema updated with badge & verification fields
- ✅ Created DEPLOYMENT_OPTIONS.md with 5 deployment platforms

## File Structure
```
pixelsWIKI/
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx (search page)
│   │   │   ├── Landing.tsx (landing)
│   │   │   ├── Profile.tsx (user wiki)
│   │   │   ├── Admin.tsx (moderation dashboard - card UI)
│   │   │   ├── AuthPage.tsx (signup/login)
│   │   │   └── not-found.tsx
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   ├── DeveloperPanel.tsx (role management)
│   │   │   ├── EntryDetailDialog.tsx
│   │   │   └── (other Shadcn UI components)
│   │   └── lib/
│   │       ├── queryClient.ts
│   │       ├── authUtils.ts
│   │       └── (utilities)
│   └── index.html
├── server/
│   ├── routes.ts (main API endpoints)
│   ├── storage.ts (database operations)
│   ├── authRoutes.ts (password auth)
│   ├── replitAuth.ts (Replit OAuth)
│   ├── app.ts (Express setup)
│   ├── index-dev.ts (development)
│   └── index-prod.ts (production)
├── shared/
│   └── schema.ts (database + TypeScript schemas)
├── README.md (GitHub documentation)
├── .env.example (template for env vars)
├── .gitignore
├── package.json
└── vite.config.ts
```

## Environment Variables
```
DATABASE_URL=postgresql://...
SESSION_SECRET=strong-key-here
ADMIN_EMAILS=pixeljstudio@gmail.com
```

## Development Workflow
1. `npm install` - Install dependencies
2. `npm run db:push` - Push database schema
3. `npm run dev` - Start dev server (http://localhost:5000)
4. `npm run check` - TypeScript type checking
5. `npm run build` - Build for production

## Testing
### Manual Test Scenarios
1. **Signup** - Create password account with validation
2. **OAuth** - Login with Google/GitHub/Replit
3. **Entry Creation** - Create wiki entry with image
4. **Search** - Find approved entries
5. **Admin Moderation** - Approve/reject/delete entries
6. **Developer Panel** - Assign admin role to users

## Deployment
Ready for GitHub deployment via Replit or any Node.js host.

### For GitHub
1. Create new GitHub repo
2. Clone locally: `git clone https://github.com/yourusername/pixelsWIKI.git`
3. Add remote: `git remote add origin <your-repo>`
4. Push: `git push -u origin main`

### Environment Setup for Production
- Set strong `SESSION_SECRET`
- Use production PostgreSQL connection
- Set `ADMIN_EMAILS` for your admin accounts
- Enable HTTPS in production

## Performance Considerations
- TanStack Query caches API responses
- Entries indexed by user_id and status for fast queries
- Pagination ready (can add limit/offset to API)

## Future Enhancements (Ideas)
- [ ] Entry comments/reactions
- [ ] Entry tags and categories
- [ ] User following/followers
- [ ] Activity feed
- [ ] Export entries as PDF
- [ ] Batch moderation actions
- [ ] Audit logs for admin actions
- [ ] Rate limiting
- [ ] Image optimization/resizing

## Known Limitations
- TikTok OAuth not available (no Replit integration)
- Entry rejection reasons not persisted (can be added)
- No pagination on admin entries list yet
- No email notifications

## Support
- GitHub Issues for bug reports
- Discussions for feature requests
