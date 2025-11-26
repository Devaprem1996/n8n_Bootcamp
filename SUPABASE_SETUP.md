# Supabase Setup Guide

## Step 1: Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (or create a new one)
3. Click on **Settings** (gear icon) in the left sidebar
4. Click on **API**
5. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

## Step 2: Update index.html

Open `index.html` and find these lines (around line 355):

```javascript
window.SUPABASE_URL = 'https://your-project.supabase.co';
window.SUPABASE_ANON_KEY = 'your-anon-key-here';
```

Replace with your actual values:

```javascript
window.SUPABASE_URL = 'https://YOUR_ACTUAL_PROJECT_ID.supabase.co';
window.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Your actual key
```

## Step 3: Enable Google OAuth (Optional)

If you want Google login to work:

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Find **Google** and click **Enable**
3. You'll need to:
   - Create a Google Cloud Project
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
4. Copy the **Client ID** and **Client Secret** into Supabase

## Step 4: Run the Database Setup

1. Go to Supabase Dashboard → **SQL Editor**
2. Open `supabase_setup.sql` from your project
3. Copy all the SQL and paste it into the editor
4. Click **Run**

## Step 5: Test the Application

1. Refresh your browser at `http://localhost:8000`
2. Try logging in with **Email/Password** (this works without Google OAuth)
3. Create a test account
4. Check that you can see the dashboard

## Troubleshooting

### "Invalid API key" error
- Double-check you copied the **anon public** key (not the service_role key)

### Google login not working
- Use **Email/Password** login instead (it works without extra setup)
- Or complete Step 3 to enable Google OAuth

### Can't see data
- Make sure you ran `supabase_setup.sql` in Step 4
- Check the browser console for errors
