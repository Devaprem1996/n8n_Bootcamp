# Deploy to Vercel Guide

## Prerequisites
- GitHub account (you already have this ✅)
- Vercel account (free) - sign up at [vercel.com](https://vercel.com)

## Step 1: Create vercel.json Configuration

This file is already created in your project root. It tells Vercel how to serve your app.

## Step 2: Push Your Code to GitHub

Make sure all your changes are committed and pushed:

```bash
git add .
git commit -m "Add Vercel deployment config"
git push origin main
```

## Step 3: Deploy to Vercel

### Option A: Using Vercel Dashboard (Easiest)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Select your repository: `Devaprem1996/n8n_Bootcamp`
4. Click **"Import"**
5. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave as is)
   - **Build Command**: Leave empty (static site)
   - **Output Directory**: `./` (leave as is)
6. Add **Environment Variables**:
   - Click "Environment Variables"
   - Add: `SUPABASE_URL` = `your-supabase-url`
   - Add: `SUPABASE_ANON_KEY` = `your-anon-key`
7. Click **"Deploy"**

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - Project name? n8n-bootcamp
# - Directory? ./
# - Override settings? N

# Add environment variables
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY

# Deploy to production
vercel --prod
```

## Step 4: Configure Environment Variables in Vercel

After deployment:

1. Go to your project in Vercel Dashboard
2. Click **Settings** → **Environment Variables**
3. Add these variables:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anon public key

4. **Redeploy** to apply the changes

## Step 5: Update Supabase Redirect URLs

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Authentication** → **URL Configuration**
4. Add your Vercel URL to **Redirect URLs**:
   - `https://your-app.vercel.app`
   - `https://your-app.vercel.app/**`

## Step 6: Test Your Deployment

1. Visit your Vercel URL (e.g., `https://n8n-bootcamp.vercel.app`)
2. Try logging in
3. Check that all features work

## Troubleshooting

### Environment Variables Not Working
- Make sure you added them in Vercel Dashboard
- Redeploy after adding variables
- Check the deployment logs

### Google OAuth Not Working
- Update redirect URLs in Google Cloud Console
- Add your Vercel domain to authorized domains

### 404 Errors on Routes
- The `vercel.json` file handles this (already configured)
- Make sure it's committed to git

## Automatic Deployments

Once connected to GitHub:
- Every push to `main` branch automatically deploys to production
- Pull requests create preview deployments
- You can see deployment status in GitHub

## Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update Supabase redirect URLs with your custom domain

---

**Need Help?** Check Vercel docs: https://vercel.com/docs
