# 🔐 Fix: OAuth Redirect URLs in Supabase

## The Problem
When you click "Sign in with Google", it tries to redirect back to Supabase, but it's going to `localhost` instead of your Vercel URL.

## The Solution
You need to add your Vercel URL to Supabase's allowed redirect URLs.

---

## Step 1: Find Your Vercel URL

1. Go to [Vercel Dashboard](https://vercel.com)
2. Click your **n8n_Bootcamp** project
3. Copy the URL (example: `https://n8n-bootcamp-abc123.vercel.app`)

---

## Step 2: Add Redirect URL to Supabase

1. Go to [Supabase Dashboard](https://supabase.com)
2. Open your **n8n_Bootcamp** project
3. Click **Authentication** in the left menu
4. Click **URL Configuration**
5. Add both URLs in the **Redirect URLs** section:
   ```
   https://your-vercel-url.vercel.app
   https://your-vercel-url.vercel.app/
   http://localhost:3000
   http://localhost:3000/
   ```

6. Click **Save**

---

## Step 3: Fix Local Development (Optional)

If you want to test locally with Google OAuth:

1. Add `http://localhost:3000` to Supabase redirect URLs (done above)
2. Start a local server:
   ```powershell
   cd "e:\N8N Bootcamp HUB"
   python -m http.server 3000
   ```
3. Visit `http://localhost:3000`
4. Test Google login

---

## Step 4: For Email/Password (No Setup Needed)

Email/Password authentication **works immediately** - no redirect URL configuration needed!

1. Visit your Vercel URL
2. Click **"Use Email/Password Instead"**
3. Create an account or sign in

---

## Common Issues

**Still redirecting to localhost?**
- Clear your browser cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+Shift+R)
- Try in incognito mode

**"Redirect URL mismatch" error?**
- Make sure you added the exact Vercel URL to Supabase
- Include both with and without trailing slash

**Google auth still failing?**
- Use Email/Password instead (doesn't require OAuth setup)
- Or configure Google OAuth in Supabase Settings

---

## Your Vercel URLs to Add to Supabase

Replace `your-vercel-url` with your actual project name:

```
https://your-vercel-url.vercel.app
https://your-vercel-url.vercel.app/
```

Then save and test!
