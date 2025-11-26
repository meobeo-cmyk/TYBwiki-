# pixelsWIKI - Deployment Options

**⚠️ GitHub Pages không được hỗ trợ** vì ứng dụng cần backend (Express.js + PostgreSQL)

## ✅ Recommended Deployment Platforms

### 1. **Replit (Easiest - Recommended)**
- ✨ **Pros:** Tích hợp sẵn PostgreSQL, không cần config
- ✨ **Automatic HTTPS/TLS certificates**
- ✨ **One-click publish**
- 💰 **Free tier available**

**Setup:**
1. Import từ GitHub → Replit tự động setup
2. Go to Secrets tab → Add: `DATABASE_URL`, `SESSION_SECRET`, `ADMIN_EMAILS`
3. Click "Publish" button
4. Get public URL (e.g., `projectname.replit.dev`)

---

### 2. **Railway (Simple & Fast)**
- ✨ **Fast deployment with GitHub**
- ✨ **Built-in PostgreSQL support**
- ✨ **Simple environment setup**
- 💰 **$5/month starter plan**

**Setup:**
1. Go to railway.app
2. Create new project → "Deploy from GitHub"
3. Select pixelsWIKI repository
4. Railway auto-detects Node.js app
5. Add PostgreSQL plugin
6. Set environment variables (DATABASE_URL, SESSION_SECRET, ADMIN_EMAILS)
7. Deploy automatically

---

### 3. **Render (Free Tier Available)**
- ✨ **Free tier with PostgreSQL**
- ✨ **Auto-deploys from GitHub**
- ✨ **Easy database setup**
- 💰 **Free → $7/month paid**

**Setup:**
1. Go to render.com
2. "Create new" → "Web Service"
3. Connect GitHub repository
4. Select Runtime: Node
5. Build command: `npm install && npm run build`
6. Start command: `npm start`
7. Add PostgreSQL database
8. Set environment variables
9. Deploy

---

### 4. **Heroku (Legacy but Reliable)**
- ✨ **Very easy one-click deploy**
- ✨ **Good documentation**
- ⚠️ **No free tier anymore ($7/month minimum)**

**Setup:**
```bash
# Install Heroku CLI
heroku login
heroku create pixelswiki
heroku addons:create heroku-postgresql:standard-0
git push heroku main
```

---

### 5. **VPS (Full Control - Advanced)**
- ✨ **Full control over server**
- ✨ **Cheapest long-term option**
- ⚠️ **Requires Linux/DevOps knowledge**
- 💰 **$5-20/month (DigitalOcean, Linode, AWS)**

**Recommended VPS Providers:**
- **DigitalOcean Droplet** ($5/month) + Managed PostgreSQL
- **Linode** ($5/month) + PostgreSQL
- **AWS EC2** (free tier + managed RDS)

---

## Environment Variables Setup

All platforms need these environment variables:

```bash
# Database connection
DATABASE_URL=postgresql://user:password@host:5432/pixelswiki

# Session security (generate strong key!)
SESSION_SECRET=your-random-32-character-secret-here

# Admin emails (comma-separated)
ADMIN_EMAILS=pixeljstudio@gmail.com,longid98s@gmail.com

# Auto-set by Replit Auth integration
REPLIT_AUTH_ENABLED=true
```

**Generate secure SESSION_SECRET:**
```bash
# On Linux/Mac
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Database Setup

### Replit
- Automatic PostgreSQL database
- No manual setup needed

### Railway
- Click "PostgreSQL" plugin
- Auto-creates database
- Copy `DATABASE_URL` from Railway dashboard

### Render
- Click "Add Database" → PostgreSQL
- Auto-creates database
- Copy connection string

### VPS
```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres createdb pixelswiki
sudo -u postgres createuser pixelswiki_user
sudo -u postgres psql -c "ALTER USER pixelswiki_user WITH PASSWORD 'strong_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE pixelswiki TO pixelswiki_user;"

# DATABASE_URL:
postgresql://pixelswiki_user:strong_password@localhost:5432/pixelswiki
```

---

## OAuth Setup

### Google OAuth
1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials
3. Set redirect URI to your deployed URL: `https://yourdomain.com/api/callback`

### GitHub OAuth
1. Go to GitHub Settings → Developer Settings
2. Create OAuth App
3. Set Authorization callback URL: `https://yourdomain.com/api/callback`

### Replit Auth
- Automatically configured if using Replit
- Works with Google, GitHub, Replit account

---

## SSL/HTTPS Setup

| Platform | HTTPS |
|----------|--------|
| **Replit** | ✅ Automatic |
| **Railway** | ✅ Automatic |
| **Render** | ✅ Automatic |
| **Heroku** | ✅ Automatic |
| **VPS** | Use Let's Encrypt (free) |

For VPS with Let's Encrypt:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot certonly --standalone -d yourdomain.com
```

---

## Database Migrations

After first deployment, run:
```bash
npm run db:push
```

This creates all tables in your PostgreSQL database.

---

## Quick Comparison

| Platform | Setup Time | Cost | HTTPS | Ease | Notes |
|----------|-----------|------|-------|------|-------|
| **Replit** | 2 min | Free | ✅ | ⭐⭐⭐⭐⭐ | **Best for beginners** |
| **Railway** | 5 min | $5/mo | ✅ | ⭐⭐⭐⭐ | Fast deployment |
| **Render** | 5 min | Free/7mo | ✅ | ⭐⭐⭐⭐ | Good free tier |
| **Heroku** | 5 min | $7/mo | ✅ | ⭐⭐⭐⭐ | Popular but pricey |
| **VPS** | 30 min | $5/mo | ✅ | ⭐⭐⭐ | Maximum control |

---

## My Recommendation 🎯

### For Testing/Development
→ **Use Replit** - Free, no config, one-click publish

### For Production
→ **Railway or Render** - Good balance of cost, ease, reliability

### For Maximum Control
→ **VPS + Docker** - Full control but requires DevOps knowledge

---

## Support & Troubleshooting

### Database Connection Failed
- Check DATABASE_URL format
- Verify credentials
- Test connection: `psql $DATABASE_URL`

### OAuth Not Working
- Verify callback URL matches your domain
- Check OAuth credentials in provider dashboard

### App Not Starting
- Check logs in platform dashboard
- Verify Node version (need 18+)
- Run locally first: `npm run dev`

### Static Files Not Loading
- Check build output
- Verify Vite build completes successfully

---

**Ready to deploy? Choose your platform above and follow the setup steps! 🚀**
