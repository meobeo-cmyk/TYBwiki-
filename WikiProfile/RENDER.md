# 🚀 Deploy pixelsWIKI lên Render

## 📋 Environment Variables Cần Thiết

| Variable | Type | Value | Ghi chú |
|----------|------|-------|--------|
| `DATABASE_URL` | Secret | `postgresql://user:password@host:port/database` | PostgreSQL connection string |
| `SESSION_SECRET` | Secret | Chuỗi random 32+ ký tự | Bảo mật session người dùng |
| `ADMIN_EMAILS` | Variable | Email cách nhau bằng dấu phẩy | Quyền truy cập admin dashboard |
| `NODE_ENV` | Variable | `production` | Tự động set bởi Render |

---

## 🔑 Chi Tiết Từng Biến

### 1. DATABASE_URL (Bắt buộc)
```
postgresql://pixelwiki_user:your_secure_password@db.render.com:5432/pixelwiki_db
```

**Cách lấy:**
1. Vào https://dashboard.render.com
2. Tạo PostgreSQL Database mới (free tier 0.5GB)
3. Copy "Internal Database URL" hoặc "External Database URL"
4. Paste vào Render Web Service Environment Variables

---

### 2. SESSION_SECRET (Bắt buộc)
```
a7f3k9m2x5n8b1c4d6e9h2j5k8l1m4p7q0r3s6t9u2v5w8x1y4z7a0b3c6d9
```

**Cách tạo:**
- Dùng online generator: https://generate-random.org/
- Hoặc dùng terminal: `openssl rand -hex 32`
- Tối thiểu 32 ký tự, càng random càng tốt

---

### 3. ADMIN_EMAILS (Tùy chọn)
```
pixeljstudio@gmail.com,longid98s@gmail.com
```

**Cách sử dụng:**
- Email được liệt kê sẽ có quyền truy cập `/admin` dashboard
- Cách nhau bằng dấu phẩy (không có khoảng trắng)
- Có thể thêm nhiều admin

---

## 🎯 Hướng Dẫn Deploy Từng Bước

### Bước 1: Chuẩn Bị GitHub Repository
1. Push tất cả code lên GitHub
2. Đảm bảo có file `package.json`, `server/` và `client/` trong repo

### Bước 2: Tạo PostgreSQL Database trên Render
1. Vào https://dashboard.render.com
2. Click **"New +"** → **"PostgreSQL"**
3. Điền thông tin:
   - Name: `pixelswiki-db`
   - Database: `pixelwiki_db`
   - User: `pixelwiki_user`
   - Region: Singapore (gần Việt Nam nhất)
   - Pricing Plan: **Free** ($0/month)
4. Click **"Create Database"**
5. **Copy "Internal Database URL"** (hoặc External nếu cần)

### Bước 3: Tạo Web Service trên Render
1. Click **"New +"** → **"Web Service"**
2. Chọn GitHub repository `pixelsWIKI`
3. Điền cấu hình:
   - **Name:** `pixelswiki`
   - **Environment:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free

### Bước 4: Thêm Environment Variables
1. Trong Render Web Service → Tab **"Environment"**
2. Click **"Add Environment Variable"** và thêm các biến:

```
DATABASE_URL = postgresql://pixelwiki_user:your_password@dpg-xxx.render.com/pixelwiki_db
SESSION_SECRET = a7f3k9m2x5n8b1c4d6e9h2j5k8l1m4p7q0r3s6t9u2v5w8x1y4z7a0b3c6
ADMIN_EMAILS = pixeljstudio@gmail.com,longid98s@gmail.com
NODE_ENV = production
```

**Lưu ý:** 
- `DATABASE_URL` phải là Secret (chọn tùy chọn "secret")
- `SESSION_SECRET` phải là Secret
- Các biến khác có thể là regular variables

### Bước 5: Deploy
1. Click **"Deploy"** button
2. Chờ build process hoàn thành (~3-5 phút)
3. Khi thấy ✅ "Live", ứng dụng đã sẵn sàng
4. Truy cập tại: `https://pixelswiki.onrender.com`

---

## ✅ Kiểm Tra Sau Deploy

### Các URL quan trọng:
- **Web app:** `https://pixelswiki.onrender.com`
- **Admin Dashboard:** `https://pixelswiki.onrender.com/admin`
- **API Health:** `https://pixelswiki.onrender.com/api/health` (nếu có)

### Troubleshooting:
1. **Error "DATABASE_URL not set"**
   - Kiểm tra Environment Variables có đầy đủ không
   - Restart Web Service (Deploy lại)

2. **Build failed**
   - Kiểm tra `npm run build` chạy locally OK không
   - Check Build logs trong Render dashboard

3. **App crashes sau deploy**
   - Kiểm tra logs: Render dashboard → Logs tab
   - Đảm bảo DATABASE_URL connection string chính xác

---

## 🔄 Update/Redeploy

Mỗi khi push code mới lên GitHub:
1. Render sẽ tự động detect thay đổi
2. Tự động rebuild và deploy
3. Hoặc click **"Manual Deploy"** → **"Deploy latest commit"**

---

## 💰 Chi Phí (Free Tier)
- **PostgreSQL Database:** Free (0.5GB, ngừng sau 90 ngày không dùng)
- **Web Service:** Free (ngừng sau 15 phút không request)
- **Total:** $0/tháng khi dùng free tier

---

## 📞 Support & Docs
- Render Docs: https://render.com/docs
- PostgreSQL Docs: https://www.postgresql.org/docs/
- Express.js: https://expressjs.com/

---

## 🎉 Bạn Đã Hoàn Thành!
Sau khi hoàn thành các bước trên, pixelsWIKI sẽ live trên internet và có thể truy cập từ bất kỳ đâu! 🚀
