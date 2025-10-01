# Vercel Deployment - Quick Start Guide

## 📋 Changes Made for Vercel Deployment

### ✅ Files Created:
1. **`backend/vercel.json`** - Backend serverless configuration
2. **`vercel.json`** - Frontend Vite configuration  
3. **`.env.example`** - Frontend environment template
4. **`backend/.env.example`** - Backend environment template
5. **`DEPLOYMENT.md`** - Complete deployment guide

### ✅ Code Changes:
1. **`backend/server.js`**:
   - Added CORS configuration for production
   - Modified server listener to work with Vercel serverless
   - Added `export default app` for Vercel

2. **`services/db.ts`**:
   - Updated API_BASE_URL to use environment variable
   - Falls back to localhost for development

---

## 🚀 Quick Deployment Steps

### Backend Deployment:

1. **Push backend to GitHub** (separate repo):
```bash
cd backend
git init
git add .
git commit -m "Backend for Vercel"
git remote add origin https://github.com/YOUR_USERNAME/healthhub-backend.git
git push -u origin main
```

2. **Deploy on Vercel**:
   - Import GitHub repo
   - Add environment variables (see below)
   - Deploy
   - **Copy backend URL**

3. **Backend Environment Variables** (in Vercel dashboard):
```
DATABASE_URI=mongodb+srv://...
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=Healthhub <your-email@gmail.com>
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
```

---

### Frontend Deployment:

1. **Create `.env.production`** in root:
```env
VITE_API_BASE_URL=https://your-backend.vercel.app/api
```

2. **Push frontend to GitHub**:
```bash
git add .
git commit -m "Frontend for Vercel"
git remote add origin https://github.com/YOUR_USERNAME/healthhub-frontend.git
git push -u origin main
```

3. **Deploy on Vercel**:
   - Import GitHub repo
   - Framework: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Add environment variable: `VITE_API_BASE_URL=https://your-backend.vercel.app/api`
   - Deploy

4. **Update Backend CORS**:
   - Add `FRONTEND_URL=https://your-frontend.vercel.app` to backend env variables
   - Redeploy backend

---

## 📝 Important Notes

### MongoDB Atlas Setup:
1. Go to Network Access
2. Add IP Address: `0.0.0.0/0` (Allow from anywhere)
3. This allows Vercel's serverless functions to connect

### Gmail App Password:
1. Enable 2-Factor Authentication on Gmail
2. Go to: https://myaccount.google.com/apppasswords
3. Generate App Password
4. Use this password in `EMAIL_PASS` (not your Gmail password)

### Testing:
- **Admin Login**: `krishna@gmail.com` / `manu098`
- Test all features after deployment

---

## 🔧 Local Development Still Works!

Your local setup remains unchanged:
```bash
# Backend
cd backend
npm start

# Frontend (in another terminal)
npm run dev
```

---

## 📦 What Each File Does

| File | Purpose |
|------|---------|
| `backend/vercel.json` | Tells Vercel how to deploy Node.js backend |
| `vercel.json` | Tells Vercel how to deploy Vite frontend |
| `.env.production` | Production API URL for frontend |
| `backend/.env` | Backend secrets (MongoDB, Email, etc.) |

---

## 🐛 Common Issues

**CORS Error?**
→ Add `FRONTEND_URL` to backend environment variables

**Database Connection Failed?**
→ Check MongoDB Atlas allows 0.0.0.0/0

**Emails Not Sending?**
→ Use Gmail App Password, not regular password

**404 on Routes?**
→ Check `vercel.json` rewrites configuration

---

## 📚 Full Documentation

See `DEPLOYMENT.md` for complete step-by-step guide.

---

**Ready to deploy! 🎉**
