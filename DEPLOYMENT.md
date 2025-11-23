# 🚀 Deployment Guide - Netlify

## ⚠️ Critical: App Architecture

**This is a Vite + React SPA, NOT Next.js**

- Framework: React 18 + Vite 5
- Routing: React Router (client-side)
- Backend: Supabase
- Build Output: Static SPA
- CI/CD: GitHub Actions (Automated)

---

## 🤖 Automated Deployment with GitHub Actions

This project includes a complete CI/CD pipeline for Netlify. See **[docs/CI_CD.md](./docs/CI_CD.md)** for full documentation.

### Quick Setup
1. Push code to GitHub
2. Create a Netlify site (can be empty initially)
3. Add required secrets to GitHub repository (see below)
4. Push to `main` branch triggers production deployment
5. Pull requests trigger preview deployments + tests

### Required GitHub Secrets
Set these in **Repository Settings → Secrets and variables → Actions**:
```
NETLIFY_AUTH_TOKEN       # Netlify personal access token
NETLIFY_SITE_ID          # Netlify site ID
VITE_SUPABASE_URL        # Supabase project URL
VITE_SUPABASE_ANON_KEY   # Supabase anonymous key
VITE_SENTRY_DSN          # Optional: Sentry DSN
VITE_HUGGINGFACE_API_KEY # Optional: HuggingFace API key
```

### Getting Netlify Credentials

**Netlify Auth Token:**
1. Go to https://app.netlify.com/user/applications
2. Click "New access token"
3. Give it a name and copy the token
4. Add as `NETLIFY_AUTH_TOKEN` in GitHub

**Netlify Site ID:**
1. Go to your site in Netlify dashboard
2. Go to Site settings → General
3. Copy the "Site ID"
4. Add as `NETLIFY_SITE_ID` in GitHub

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

## ⚙️ Netlify Configuration

### **Build Settings**
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Publish Directory:** `dist`
- **Node Version:** 20

### **Required Files in Repository**

✅ `netlify.toml` - Already configured for SPA routing and caching:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
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
**Fix:** Ensure `netlify.toml` has SPA redirects (already configured)

**Issue:** Blank white screen
**Fix:** Check browser console → likely missing env vars in Netlify

**Issue:** "Supabase URL undefined" error
**Fix:** Ensure env vars are set in Netlify dashboard (Site settings → Environment variables)

**Issue:** Build fails with module errors
**Fix:** Clear cache and retry: Deploys → Trigger deploy → Clear cache and deploy

**Issue:** Environment variables not working
**Fix:** Ensure they're prefixed with `VITE_` and set in Netlify dashboard

---

## 🛠️ How to Deploy

### **Method 1: GitHub Actions CI/CD (Recommended)**
Fully automated deployment pipeline:
- **Pull Requests**: Runs tests + creates preview deployment
- **Main Branch**: Runs tests + deploys to production
- **Manual**: Trigger via GitHub Actions UI

See [docs/CI_CD.md](./docs/CI_CD.md) for setup instructions.

### **Method 2: Netlify CLI (Manual)**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

### **Method 3: Netlify GitHub Integration**
1. Go to Netlify dashboard → Add new site → Import from Git
2. Connect your GitHub repository
3. Set build settings and environment variables
4. Netlify will automatically deploy on every push

### **Method 4: Drag & Drop (Quick Test)**
1. Run `npm run build` locally
2. Go to Netlify dashboard
3. Drag the `dist` folder to the deploy area

---

## 📊 Build Diagnostics

The app includes automatic diagnostics:

- ✅ Missing env vars are logged to console
- ✅ Supabase connection failures are caught
- ✅ API errors show user-friendly messages
- ✅ Console warnings for missing configuration

---

## 🔧 Environment Variables in Netlify

Set these in **Netlify Dashboard → Site settings → Environment variables**:

### **Required:**
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

### **Optional:**
```
VITE_SENTRY_DSN
VITE_HUGGINGFACE_API_KEY
```

**Important:** All frontend variables must be prefixed with `VITE_`

## 🔧 Differences Between Environments

### **Lovable Preview:**
- Auto-injects environment variables
- Uses development build
- Hot module replacement enabled

### **Netlify Production:**
- Environment variables must be manually set in dashboard
- Optimized production build
- No HMR, fully static assets
- CDN distribution for fast global access

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
