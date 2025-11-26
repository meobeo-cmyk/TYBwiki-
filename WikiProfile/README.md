# pixelsWIKI

Vietnamese wiki profile platform where users can create accounts, post wiki entries with images and descriptions, search for approved wiki entries, and admins can moderate content with a modern UI. SEO-friendly for Google indexing.

## Features

✨ **User Features:**
- 🔐 **Multiple Authentication Methods:**
  - Replit Auth (Google, GitHub, Apple, Email/Password)
  - Password-based signup with strong validation (8 chars, 1 uppercase, 1 number, 1 special char)
  - Unique username support
  
- 📝 Create and edit wiki entries with images and descriptions
- 🔍 Search approved wiki entries by title, content, or author
- 👥 View other users' complete wiki profiles
- 📊 Profile page showing your published entries

✅ **Admin Features:**
- 🎨 **Modern Card-Based Moderation Dashboard:**
  - Entry image on left, username & content summary on top
  - Quick approve/reject buttons on right
  - Reason field for rejections
  
- 📋 Filter entries by status (pending, approved, rejected)
- 🔧 **Developer Panel** in avatar menu:
  - View all users
  - Assign roles (user, moderator, admin)
  - Manage permissions for content moderation

🔒 **Security:**
- Auto-assigned admin role via ADMIN_EMAILS environment variable
- Entry status resets to "pending" when edited to prevent self-approval
- User authentication required for entry creation
- Approved entries only appear in public search
- Password hashing with bcryptjs
- Session-based authentication

🌐 **SEO Optimization:**
- Unique meta descriptions for each page
- Open Graph tags for social sharing
- Structured data for better indexing
- Clean URLs for wiki entries

## Tech Stack

**Frontend:**
- React 18 with TypeScript
- Wouter for routing
- TanStack Query for data fetching
- Shadcn UI components + Tailwind CSS

**Backend:**
- Express.js
- PostgreSQL with Drizzle ORM
- Replit Auth for OAuth
- bcryptjs for password hashing
- Session-based authentication

**Deployment:**
- Deployed on Replit (can be deployed to any Node.js host)

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (Replit includes built-in Postgres)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/pixelsWIKI.git
cd pixelsWIKI
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- Set your PostgreSQL connection string
- Set a strong SESSION_SECRET
- Set ADMIN_EMAILS to your email address (e.g., pixeljstudio@gmail.com)

4. Push database schema:
```bash
npm run db:push
```

5. Start development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

### Building for Production

```bash
npm run build
npm start
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost/db` |
| `SESSION_SECRET` | Secret key for sessions (change in production!) | `your-secret-key` |
| `ADMIN_EMAILS` | Admin user emails (comma-separated) | `pixeljstudio@gmail.com,admin@example.com` |

## Project Structure

```
.
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── pages/         # Page components (Home, Profile, Admin, AuthPage, etc.)
│   │   ├── components/    # Reusable UI components (Header, DeveloperPanel, etc.)
│   │   └── lib/           # Utilities and hooks
│   └── index.html         # HTML template
├── server/                # Backend Express app
│   ├── routes.ts          # API endpoints
│   ├── storage.ts         # Database operations
│   ├── authRoutes.ts      # Password auth routes
│   └── replitAuth.ts      # Replit OAuth setup
├── shared/                # Shared code
│   └── schema.ts          # Database schemas & types
└── package.json           # Dependencies
```

## API Endpoints

### Public Endpoints
- `GET /api/entries/approved` - Get approved wiki entries
- `GET /api/entries/:id` - Get entry details
- `GET /api/users/:id` - Get user profile

### Authenticated Endpoints
- `POST /api/entries` - Create new wiki entry
- `PATCH /api/entries/:id` - Update wiki entry
- `DELETE /api/entries/:id` - Delete wiki entry
- `GET /api/profile/:userId` - Get user profile with entries
- `POST /api/auth/signup` - Sign up with password
- `POST /api/auth/login` - Login with password

### Admin Endpoints
- `GET /api/admin/entries` - List all entries
- `PATCH /api/admin/entries/:id/moderate` - Approve/reject/delete entry
- `GET /api/admin/users` - List all users
- `PATCH /api/admin/users/:id/role` - Assign user role

## Features in Detail

### Developer Panel
Admin users can access the Developer Panel from their avatar menu:
1. View all registered users
2. Assign roles: User, Moderator, or Admin
3. Moderators can approve/reject entries
4. Admins have full access

### Password-Based Authentication
- Username must be unique (3-20 characters, alphanumeric + underscore)
- Password requirements:
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 number
  - At least 1 special character (!@#$%^&*)
  - Confirmation field to prevent typos

### Card-Based Moderation
Admins see a clean card-based interface with:
- Entry image preview on the left
- Author name and profile picture
- Entry title and truncated content
- Status badge
- Quick action buttons (Approve/Reject) on the right
- Optional rejection reason field

## Development

### TypeScript Checking
```bash
npm run check
```

### Database Management
```bash
# Push schema changes
npm run db:push

# Force push (if needed)
npm run db:push -- --force
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Support

For issues and questions, please open a GitHub issue.

---

**Created with ❤️ for the Vietnamese community**

**Demo Admin Email:** pixeljstudio@gmail.com
