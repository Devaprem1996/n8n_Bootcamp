# ✅ Testing Database Functionality

## Quick Test: Check if Data is Saving

### Step 1: Log In
1. Go to your Vercel URL
2. Create account or sign in with email/password

### Step 2: Create Some Progress
1. Check boxes for 2-3 completed days
2. Add notes to at least one day
3. You should see progress % increase

### Step 3: Save to Database
1. Go to **⬇ Exports** tab
2. Click **"💾 Save to Database"**
3. You should see: **✓ Progress saved successfully!**

If you see error:
- Open DevTools (F12) → Console
- Look for error messages
- Check DATABASE_SETUP.md and create the table

### Step 4: Verify Data in Supabase

1. Go to [Supabase Dashboard](https://supabase.com)
2. Open your project
3. Click **Tables** → **intern_progress**
4. Click **Data** tab
5. You should see your record with:
   - Your email
   - Your completed tasks array
   - Your notes object
   - Today's timestamp

### Step 5: Test Persistence

1. In your app, click **Logout**
2. Log back in with the same email
3. Your progress should still be there! ✅

---

## If Data Isn't Saving

**Check 1: Does the table exist?**
```
Supabase Dashboard → Tables → Should see "intern_progress"
```
If not, run the SQL in DATABASE_SETUP.md

**Check 2: Are RLS policies set?**
```
Tables → intern_progress → RLS
Should see 3 policies:
- Users can read their own progress
- Users can insert their own progress  
- Users can update their own progress
```

**Check 3: Check browser errors**
```
F12 → Console
Look for any red error messages
Share them for debugging
```

**Check 4: Verify column names**
```
Tables → intern_progress → Schema
Should have:
- completed_tasks (JSONB)
- task_notes (JSONB)
- progress_percent (INTEGER)
- cohort (VARCHAR)
```

---

## Auto-Save Feature (Future Enhancement)

Currently, you click "💾 Save to Database" manually. 

To add auto-save, modify app.js:
```javascript
// After updateProgress(), uncomment auto-save:
// setTimeout(() => saveToDB(), 2000);
```

This will auto-save every 2 seconds instead of requiring manual save.

---

## Debugging Console Logs

When you click save, check the console for logs like:

```
💾 Saving progress to database...
📊 Data to save: {userId: "...", email: "..."}
✅ Save successful: {data: {...}}
```

If you see errors instead, share them for help!
