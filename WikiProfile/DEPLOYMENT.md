# Deployment Guide - pixelsWIKI

## Quick Start on Replit

1. **Create Repository**
   - Click "Connect to GitHub" in Replit
   - OR manually push to GitHub

2. **First Time Setup**
   ```bash
   npm install
   npm run db:push
   ```

3. **Environment Variables**
   - Go to Secrets tab in Replit
   - Add: `DATABASE_URL`, `SESSION_SECRET`, `ADMIN_EMAILS`
   - Or create `.env` file from `.env.example`

4. **Run**
   ```bash
   npm run dev
   ```

## Deploy to GitHub

### Method 1: From Replit
1. Go to Replit project settings
2. Connect to GitHub
3. Follow Replit's GitHub integration steps
4. Replit will auto-push commits

### Method 2: Manual Git Push
```bash
# Initialize if not already
git init
git add .
git commit -m "Initial commit: pixelsWIKI platform"
git branch -M main
git remote add origin https://github.com/yourusername/pixelsWIKI.git
git push -u origin main
```

### Method 3: From GitHub CLI
```bash
gh repo create pixelsWIKI --source=. --public --push
```

## Production Deployment

### On Replit (Recommended)
1. Click "Publish" button
2. Custom domain setup (optional)
3. Automatic HTTPS/TLS certificates

### On Other Platforms (Heroku, Railway, Render, etc.)
```bash
# Build
npm run build

# Start
npm start

# Environment variables
DATABASE_URL=production_connection_string
SESSION_SECRET=strong_random_key_32_chars
ADMIN_EMAILS=admin@example.com
```

## Configuration Checklist

Before deploying to production:

- [ ] Set strong `SESSION_SECRET` (min 32 characters)
- [ ] Configure `DATABASE_URL` (use production database)
- [ ] Set `ADMIN_EMAILS` (your admin accounts)
- [ ] Enable HTTPS (automatic on Replit)
- [ ] Test OAuth providers (Google, GitHub, Replit)
- [ ] Test password signup validation
- [ ] Test admin dashboard
- [ ] Test entry moderation
- [ ] Verify search functionality

## GitHub Settings

Recommended .gitignore already includes:
- `node_modules/`
- `.env` (sensitive)
- `.env.*.local`
- `dist/`
- `build/`
- Logs and IDE files

## CI/CD Setup (Optional)

### GitHub Actions for Testing
Create `.github/workflows/test.yml`:
```yaml
name: Tests
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run check
```

## Database Backups

Replit PostgreSQL:
- Automatic backups included
- Access via Replit Database tab
- Export SQL from dashboard

## Troubleshooting

### Build Fails
```bash
rm -rf node_modules package-lock.json
npm install
npm run check
```

### Database Connection Error
- Verify `DATABASE_URL` format
- Check PostgreSQL is running
- Test connection: `psql $DATABASE_URL`

### OAuth Not Working
- Verify domain/callback URL matches Replit settings
- Check Replit Auth integration is enabled
- Verify `REPL_ID` environment variable is set

### Port Already in Use
Default port is 5000. Change with:
```bash
PORT=3000 npm run dev
```

## Performance Tips

1. **Database Queries**
   - Entries indexed by user_id and status
   - Use pagination for large result sets

2. **Frontend**
   - TanStack Query caches responses
   - Images optimized by Replit

3. **Session Storage**
   - Uses PostgreSQL (scalable)
   - TTL: 7 days

## Monitoring

### Logs
- Check Replit Console
- Check browser DevTools Network tab

### Performance
- TanStack Query DevTools (dev only)
- PostgreSQL query logs

## Support

- GitHub Issues: Feature requests, bug reports
- Discussions: Questions, ideas
- Email: [your contact]

---

**Happy deploying! 🚀**
