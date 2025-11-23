# 🚀 Deployment Guide - Lovable to Vercel

## ⚠️ Critical: App Architecture

**This is a Vite + React SPA, NOT Next.js**

- Framework: React 18 + Vite 5
- Routing: React Router (client-side)
- Backend: Supabase
- Build Output: Static SPA
- CI/CD: GitHub Actions (Automated)

---

## 🤖 Automated Deployment with GitHub Actions

This project includes a complete CI/CD pipeline. See **[docs/CI_CD.md](./docs/CI_CD.md)** for full documentation.

### Quick Setup
1. Push code to GitHub
2. Add required secrets to repository (see below)
3. Push to `main` branch triggers production deployment
4. Pull requests trigger preview deployments + tests

### Required GitHub Secrets
Set these in **Repository Settings → Secrets and variables → Actions**:
```
VERCEL_TOKEN              # Vercel authentication token
VERCEL_ORG_ID            # From .vercel/project.json
VERCEL_PROJECT_ID        # From .vercel/project.json
VITE_SUPABASE_URL        # Supabase project URL
VITE_SUPABASE_ANON_KEY   # Supabase anonymous key
VITE_SENTRY_DSN          # Optional: Sentry DSN
VITE_HUGGINGFACE_API_KEY # Optional: HuggingFace API key
```

---

## 📋 Required Environment Variables

Set these in **Vercel Dashboard → Project Settings → Environment Variables**:

### **Required (App will fail without these)**
```env
VITE_SUPABASE_URL=https://uegujjkjkoohucpbdjwj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlZ3Vqamtqa29vaHVjcGJkandqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MzkxNzIsImV4cCI6MjA2ODAxNTE3Mn0.tIR1Pldwu-Ncp0W43vIwsjf3RvrDF3PNKOJ4r0x5Nf8
```

### **Optional (for AI features)**
```env
VITE_HUGGINGFACE_API_KEY=your_huggingface_api_key_here
```

⚠️ **CRITICAL:** All frontend env vars MUST be prefixed with `VITE_` for Vite to expose them to the browser.

---

## ⚙️ Vercel Configuration

### **Build Settings**
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`
- **Node Version:** 18.x or higher

### **Required Files in Repository**

✅ `vercel.json` - Already configured for SPA routing:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

✅ `package.json` - Build script configured
✅ `vite.config.ts` - Build configuration

---

## 🔍 Deployment Checklist

### **Before Deploying:**
- [ ] Verify all env vars are set in Vercel
- [ ] Ensure `vercel.json` exists with SPA rewrites
- [ ] Confirm build command is `npm run build`
- [ ] Check Node.js version is 18+

### **After Deploying:**
- [ ] Test all routes work (no 404s on refresh)
- [ ] Check browser console for errors
- [ ] Verify Supabase connection works
- [ ] Test authentication flows
- [ ] Confirm images/assets load correctly

### **Common Issues:**

**Issue:** Routes return 404 on refresh
**Fix:** Ensure `vercel.json` has SPA rewrites (already configured)

**Issue:** Blank white screen
**Fix:** Check browser console → likely missing env vars

**Issue:** "Supabase URL undefined" error
**Fix:** Ensure env vars are prefixed with `VITE_` in Vercel

**Issue:** Different styling in production
**Fix:** Check Tailwind config purge settings (already correct)

---

## 🛠️ How to Deploy

### **Method 1: GitHub Actions CI/CD (Recommended)**
Fully automated deployment pipeline:
- **Pull Requests**: Runs tests + creates preview deployment
- **Main Branch**: Runs tests + deploys to production
- **Manual**: Trigger via GitHub Actions UI

See [docs/CI_CD.md](./docs/CI_CD.md) for setup instructions.

### **Method 2: Vercel CLI (Manual)**
```bash
npm install -g vercel
vercel --prod
```

### **Method 3: Vercel GitHub Integration**
1. Connect your GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

---

## 📊 Build Diagnostics

The app includes automatic diagnostics:

- ✅ Missing env vars are logged to console
- ✅ Supabase connection failures are caught
- ✅ API errors show user-friendly messages
- ✅ Console warnings for missing configuration

---

## 🔧 Differences Between Preview & Production

### **Lovable Preview:**
- Auto-injects environment variables
- Uses development build
- Hot module replacement enabled

### **Vercel Production:**
- Environment variables must be manually set
- Optimized production build
- No HMR, fully static assets

---

## 🎯 Performance Optimizations Already Implemented

✅ Route prefetching on hover
✅ Aggressive query caching (5min stale time)
✅ Lazy loading for non-critical routes
✅ Image optimization with WebP + lazy load
✅ PWA with offline support
✅ Asset caching via Workbox

---

## 📞 Support

If issues persist:
1. Check browser DevTools console
2. Verify Network tab for failed requests
3. Check Vercel deployment logs
4. Ensure Supabase project is active

---

**Last Updated:** 2025
**App Version:** 1.0.0
