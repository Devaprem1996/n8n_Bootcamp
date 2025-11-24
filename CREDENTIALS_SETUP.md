# 🔐 Supabase Credentials Setup

## Quick Start

Your application needs Supabase credentials to authenticate users and save progress. Follow these steps:

### Step 1: Get Your Credentials

1. Go to [Supabase Dashboard](https://supabase.com)
2. Log in to your account
3. Open your **N8N Bootcamp** project
4. Click **Settings** in the left sidebar
5. Click **API** to view your credentials
6. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **Anon Key** (public API key, safe to share)

### Step 2: Add Credentials Locally

**Option A: Using Setup Script (Windows)**
```powershell
cd "e:\N8N Bootcamp HUB"
.\setup-credentials.ps1
```

**Option B: Manual Update**

Edit `index.html` and replace:
```html
<script>
  window.SUPABASE_URL = 'https://xxxxx.supabase.co'  // Your project URL here
  window.SUPABASE_ANON_KEY = 'eyJxxx...'  // Your anon key here
</script>
```

### Step 3: Deploy to Vercel

1. Push your changes to GitHub
2. Go to [Vercel Dashboard](https://vercel.com)
3. Click your N8N Bootcamp project
4. Go to **Settings** → **Environment Variables**
5. Add these variables:
   - **VITE_SUPABASE_URL** = Your Supabase Project URL
   - **VITE_SUPABASE_ANON_KEY** = Your Anon Key
6. Vercel will automatically redeploy with the new variables

### Step 4: Test

1. Visit your Vercel deployment URL
2. Click "Sign in with Google"
3. Should redirect to Google login
4. After login, should show your bootcamp dashboard

## Security Notes

⚠️ **Important:**
- The Anon Key is **public** - it's safe to commit to Git
- Never share your **Service Role Key** (private)
- Supabase Row Level Security (RLS) policies protect your data
- Use `.env.local` for development and don't commit secrets

## Troubleshooting

**Error: "This site can't be reached"**
- Your Supabase URL is not configured correctly
- Check the URL format: `https://xxxxx.supabase.co`

**Error: "Google login failed"**
- Your Google OAuth credentials might not be set up
- Go to Supabase → Authentication → Providers → Google
- Configure your Google OAuth app

**Error: "Failed to save progress"**
- Check Supabase database connection
- Verify Row Level Security policies allow reads/writes
- Check browser console for detailed errors

## Need Help?

- [Supabase Documentation](https://supabase.com/docs)
- [Google OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
