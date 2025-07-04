# Quick Deploy Guide - Campaign Infrastructure

## 🚀 Ready to Deploy in 10 Minutes

### Step 1: Choose Your Platform

#### Option A: Railway (Fastest - Recommended)
1. Go to [railway.app](https://railway.app) and sign up
2. Click "New Project" → "Deploy from GitHub repo"
3. Connect this repository
4. Railway will auto-detect the `railway.toml` configuration
5. Add these environment variables in Railway dashboard:
   ```
   DATABASE_URL=railway-provided-postgresql-url
   SESSION_SECRET=generate-random-string
   CAMPAIGN_NAME=NY-24 Congressional Campaign 2026
   ```
6. Deploy! 🎉

#### Option B: Render (Also Easy)
1. Go to [render.com](https://render.com) and sign up
2. Connect your GitHub repository
3. The `render.yaml` will configure everything automatically
4. Set environment variables in Render dashboard
5. Deploy! 🎉

### Step 2: Verify Deployment
- Check health: `https://your-app-url.railway.app/api/health`
- Register first user: `https://your-app-url.railway.app/register`
- Access dashboard: `https://your-app-url.railway.app/dashboard`

### Step 3: Add Your Domain (Optional)
- Purchase domain from Namecheap/GoDaddy
- Add custom domain in Railway/Render dashboard
- SSL is automatic! ✅

## 📱 Mobile Access Ready
Once deployed, access via Claude mobile app:
- `GET /api/mobile/status` - Check server status
- `GET /api/mobile/dashboard` - Mobile dashboard
- Campaign agents available on any device

## 🔧 Environment Variables Needed

**Essential:**
```bash
DATABASE_URL=postgresql://... # Auto-provided by platform
SESSION_SECRET=your-secret-here
CAMPAIGN_NAME="NY-24 Congressional Campaign 2026"
NODE_ENV=production
```

**Optional (add later):**
```bash
NEWS_API_KEY=your-newsapi-key  # For daily briefings
SQUARE_ACCESS_TOKEN=your-token # For payments
SLACK_WEBHOOK_URL=your-webhook # For notifications
```

## ✅ What You Get
- ✅ Campaign agent system (Martin, Terri, Eggsy, Ethel)
- ✅ Expense tracking & FEC compliance
- ✅ Donor management
- ✅ Mobile-responsive interface
- ✅ Automatic database backups
- ✅ SSL/HTTPS security
- ✅ GitHub Actions CI/CD

## 🎯 Next Steps After Deploy
1. Register admin account
2. Test each campaign agent
3. Add real expense data
4. Configure daily briefings (optional)
5. Train campaign staff on system

**Deployment time: ~10 minutes**  
**Cost: Free tier available on both platforms**

---

*Need help? The system has built-in help from the AI agents!*