# Healthhub Deployment Guide for Vercel

This guide will help you deploy both the frontend and backend of Healthhub to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Account**: Your code should be in a GitHub repository
3. **MongoDB Atlas**: Set up a MongoDB database at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
4. **Email Service**: Gmail account with App Password enabled

---

## Part 1: Deploy Backend to Vercel

### Step 1: Prepare Backend

1. Navigate to the `backend` folder
2. Ensure `vercel.json` exists with this content:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Step 2: Push Backend to GitHub

```bash
cd backend
git init
git add .
git commit -m "Initial backend commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/healthhub-backend.git
git push -u origin main
```

### Step 3: Deploy Backend on Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your `healthhub-backend` repository
4. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (or leave blank if backend is in root)
   - **Build Command**: Leave empty
   - **Output Directory**: Leave empty

5. **Add Environment Variables** (click "Environment Variables"):
   ```
   DATABASE_URI=mongodb+srv://username:password@cluster.mongodb.net/healthhub?retryWrites=true&w=majority
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-gmail-app-password
   EMAIL_FROM=Healthhub <your-email@gmail.com>
   NODE_ENV=production
   ```

6. Click **"Deploy"**
7. **Copy your backend URL** (e.g., `https://healthhub-backend.vercel.app`)

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Update Frontend Configuration

1. Create `.env.production` in the root directory:
```env
VITE_API_BASE_URL=https://your-backend-url.vercel.app/api
```

Replace `your-backend-url.vercel.app` with your actual backend URL from Part 1.

### Step 2: Update CORS in Backend

Add your frontend URL to the CORS configuration in `backend/server.js`:

```javascript
import cors from 'cors';

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://your-frontend-url.vercel.app'  // Add this
  ],
  credentials: true
};

app.use(cors(corsOptions));
```

Redeploy the backend after this change.

### Step 3: Push Frontend to GitHub

```bash
# In the root directory (frontend)
git init
git add .
git commit -m "Initial frontend commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/healthhub-frontend.git
git push -u origin main
```

### Step 4: Deploy Frontend on Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your `healthhub-frontend` repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. **Add Environment Variables**:
   ```
   VITE_API_BASE_URL=https://your-backend-url.vercel.app/api
   ```

6. Click **"Deploy"**

---

## Part 3: Post-Deployment Configuration

### Update Backend CORS (if needed)

After getting your frontend URL, update `backend/server.js`:

```javascript
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://healthhub-frontend.vercel.app'  // Your actual frontend URL
  ],
  credentials: true
};

app.use(cors(corsOptions));
```

Commit and push to trigger a new backend deployment.

### Test Your Deployment

1. Visit your frontend URL
2. Try logging in with the admin credentials:
   - Email: `krishna@gmail.com`
   - Password: `manu098`
3. Test all features:
   - Registration
   - Login
   - Medical records
   - AI Diet Planner
   - Appointments

---

## Environment Variables Summary

### Backend (.env)
```env
DATABASE_URI=mongodb+srv://...
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=Healthhub <your-email@gmail.com>
NODE_ENV=production
```

### Frontend (.env.production)
```env
VITE_API_BASE_URL=https://your-backend-url.vercel.app/api
```

---

## Troubleshooting

### Issue: CORS Errors
**Solution**: Ensure your frontend URL is added to the CORS whitelist in `backend/server.js`

### Issue: Database Connection Fails
**Solution**: 
1. Check MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
2. Verify DATABASE_URI is correct in Vercel environment variables

### Issue: Emails Not Sending
**Solution**:
1. Enable "Less secure app access" or use App Password for Gmail
2. Verify EMAIL_USER and EMAIL_PASS in Vercel environment variables

### Issue: 404 on Routes
**Solution**: Ensure `vercel.json` has the correct rewrites configuration

---

## Continuous Deployment

Once set up, any push to your `main` branch will automatically trigger a new deployment on Vercel.

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Vercel will automatically build and deploy your changes.

---

## Custom Domain (Optional)

1. Go to your project settings on Vercel
2. Click **"Domains"**
3. Add your custom domain
4. Update DNS records as instructed by Vercel

---

## Support

For issues, check:
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Vite Documentation](https://vitejs.dev/)

---

**Deployment Complete! 🎉**

Your Healthhub application is now live on Vercel!
