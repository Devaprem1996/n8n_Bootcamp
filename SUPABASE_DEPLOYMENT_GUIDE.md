# Supabase + Vercel/Netlify Setup Guide

Complete guide to deploy the N8N Bootcamp Hub with Supabase backend and Google Auth to Vercel or Netlify.

## 📋 Prerequisites

- Supabase account (free at supabase.com)
- Vercel or Netlify account (free)
- Google OAuth credentials (from Google Cloud Console)

---

## 🚀 Step 1: Set Up Supabase Project

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign in or create account
3. Click "New Project"
4. Name it: `n8n-bootcamp`
5. Create a strong database password
6. Select region closest to your users
7. Wait for project to initialize (2-3 minutes)

### 1.2 Get Your Credentials
Once project is created:
1. Go to **Settings → API**
2. Copy your:
   - **Project URL** (VITE_SUPABASE_URL)
   - **anon public key** (VITE_SUPABASE_ANON_KEY)
3. Save these - you'll need them for deployment

### 1.3 Create Database Tables

Go to **SQL Editor** and run this query:

```sql
-- Create intern_progress table
CREATE TABLE intern_progress (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  intern_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  cohort TEXT DEFAULT 'default',
  completed_tasks BOOLEAN[] DEFAULT ARRAY[FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE],
  task_notes JSONB DEFAULT '{}',
  progress_percent INT DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create RLS policies
ALTER TABLE intern_progress ENABLE ROW LEVEL SECURITY;

-- Users can only see their own progress
CREATE POLICY "Users can view own progress"
  ON intern_progress
  FOR SELECT
  USING (intern_id = auth.uid());

-- Users can only update their own progress
CREATE POLICY "Users can update own progress"
  ON intern_progress
  FOR UPDATE
  USING (intern_id = auth.uid());

-- Users can insert their own progress
CREATE POLICY "Users can insert own progress"
  ON intern_progress
  FOR INSERT
  WITH CHECK (intern_id = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_intern_id ON intern_progress(intern_id);
CREATE INDEX idx_cohort ON intern_progress(cohort);
```

### 1.4 Enable Google OAuth

1. Go to **Authentication → Providers**
2. Find "Google" and click it
3. Enable Google provider
4. You'll need Google OAuth credentials (see Step 2)

---

## 🔐 Step 2: Set Up Google OAuth

### 2.1 Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project: "N8N Bootcamp Hub"
3. Go to **APIs & Services → OAuth Consent Screen**
4. Choose "External" user type
5. Fill in app info:
   - App name: N8N Bootcamp Hub
   - User support email: your-email@gmail.com
   - Developer contact: your-email@gmail.com
6. Click "Save and Continue"
7. Skip scopes, click "Save and Continue"
8. Click "Back to Dashboard"

### 2.2 Create OAuth 2.0 Credentials

1. Go to **APIs & Services → Credentials**
2. Click "Create Credentials → OAuth client ID"
3. Choose "Web application"
4. Name it: "N8N Bootcamp Hub"
5. Add Authorized Redirect URIs:
   ```
   https://[YOUR-SUPABASE-PROJECT].supabase.co/auth/v1/callback
   http://localhost:3000/auth/v1/callback
   https://[your-vercel-domain].vercel.app/auth/v1/callback
   https://[your-netlify-domain].netlify.app/auth/v1/callback
   ```
   (Add these as you deploy)
6. Copy your **Client ID** and **Client Secret**

### 2.3 Add Google OAuth to Supabase

1. Back in Supabase: **Authentication → Providers**
2. Click "Google"
3. Paste your Google OAuth:
   - Client ID
   - Client Secret
4. Click "Save"

---

## 📦 Step 3: Prepare Your Code

### 3.1 Update supabase-config.js

Already configured to use environment variables. No changes needed!

### 3.2 Update .env.example

Already prepared. Copy to `.env` for local testing:

```bash
cp .env.example .env
```

Then fill in your Supabase credentials.

---

## 🌐 Step 4: Deploy to Vercel

### 4.1 Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Supabase + Google Auth"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/n8n-bootcamp.git
git push -u origin main
```

### 4.2 Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your repository
5. **Add Environment Variables:**
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
6. Click "Deploy"
7. Wait for deployment (usually 1-2 minutes)

### 4.3 Update Supabase & Google OAuth

1. Once deployed, copy your Vercel URL (e.g., `https://n8n-bootcamp.vercel.app`)
2. Go to Supabase **Authentication → URL Configuration**
3. Add your Vercel URL to site URL
4. Update Google OAuth redirect URI in [Google Cloud Console](https://console.cloud.google.com)

---

## 🌐 Step 5: Deploy to Netlify (Alternative to Vercel)

### 5.1 Connect to Netlify

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site → Import an existing project"
3. Connect to GitHub and select your repository
4. **Build settings:**
   - Build command: (leave empty - static site)
   - Publish directory: `.` (root)
5. Click "Deploy site"

### 5.2 Add Environment Variables

1. Go to **Site settings → Build & deploy → Environment**
2. Add new variables:
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
3. Trigger redeploy

### 5.3 Update Supabase & Google OAuth

Same as Vercel - update URLs in Supabase and Google Cloud Console.

---

## 📱 Testing Locally

### 1. Install Dependencies
```bash
# No npm install needed - using CDN for Supabase
```

### 2. Create Local .env
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

### 3. Run Local Server
```bash
# Option 1: Python
python -m http.server 8000

# Option 2: Node
npx http-server
```

### 4. Test
- Open http://localhost:8000
- Click "Sign in with Google"
- Complete OAuth flow
- Test creating tasks and checking progress
- Verify data saves to Supabase

---

## 🔍 Troubleshooting

### "Supabase credentials missing" error
- Check `.env` file exists with correct values
- For Vercel/Netlify: verify environment variables are set in dashboard
- Restart development server after adding .env

### "Sign in with Google" button doesn't work
- Check Google OAuth is enabled in Supabase
- Verify redirect URI matches your domain in Google Cloud Console
- Clear browser cookies and try again

### Data not saving to database
- Check Supabase RLS policies are set (see Step 1.3)
- Verify you're logged in (check browser DevTools)
- Check Supabase dashboard for errors

### Email login not working
- Verify email authentication is enabled in Supabase
- Check spam folder for confirmation email
- Disable email confirmation in dev: **Authentication → Email**

---

## 📊 Monitoring

### View Progress Data in Supabase

1. Go to Supabase dashboard
2. Click **Table Editor**
3. Select `intern_progress` table
4. View all intern records
5. Monitor `last_updated` to see activity

### View Logs

1. Supabase: **Logs** tab shows all database queries
2. Vercel: **Deployments → Logs** shows build/runtime errors
3. Netlify: **Deploys → Deploy log** shows build output

---

## 🔐 Security Best Practices

1. ✅ Never commit `.env` to Git (add to `.gitignore`)
2. ✅ Use environment variables for all secrets
3. ✅ Enable Supabase RLS policies (already done)
4. ✅ Use anon key for frontend, service key only on backend
5. ✅ Regularly rotate Google OAuth credentials
6. ✅ Monitor Supabase analytics for unusual activity

---

## 📈 Scaling to Production

### For Multiple Interns/Cohorts:

1. **Database optimization:**
   - Add `CREATE INDEX idx_cohort_progress ON intern_progress(cohort, progress_percent)`
   
2. **Add cohort management endpoints** to supabase-config.js

3. **Enable Supabase Auth emails:**
   - Supabase Dashboard → Authentication → Email Templates
   - Customize confirmation and reset emails

4. **Set up automated backups:**
   - Supabase → Backups (automatic daily)

---

## 🆘 Support

Need help?
- Supabase docs: https://supabase.com/docs
- Vercel docs: https://vercel.com/docs
- Netlify docs: https://docs.netlify.com
- Google OAuth: https://developers.google.com/identity

---

## ✅ Deployment Checklist

- [ ] Supabase project created
- [ ] Database tables and RLS policies set
- [ ] Google OAuth credentials created
- [ ] Google Auth enabled in Supabase
- [ ] `.env` file with credentials (local only)
- [ ] Code pushed to GitHub
- [ ] Deployed to Vercel OR Netlify
- [ ] Environment variables set in deployment platform
- [ ] Verified Google login works
- [ ] Tested progress saving
- [ ] Redirect URIs updated in Google Cloud & Supabase

Once all checked, your app is ready for interns! 🎓
