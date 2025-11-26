# Configuration Setup

## Quick Start

1. **Copy the example config file:**
   ```bash
   copy config.example.js config.js
   ```

2. **Edit `config.js` with your Supabase credentials:**
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project
   - Click **Settings** → **API**
   - Copy **Project URL** and **anon public** key
   - Paste them into `config.js`

3. **Your `config.js` should look like:**
   ```javascript
   window.SUPABASE_URL = 'https://abcdefgh.supabase.co';
   window.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
   ```

4. **Save and refresh your browser!**

## Important Notes

- ✅ `config.js` is in `.gitignore` - your credentials won't be pushed to GitHub
- ✅ `config.example.js` is tracked in git as a template
- ⚠️ Never commit your actual `config.js` file with real credentials!
