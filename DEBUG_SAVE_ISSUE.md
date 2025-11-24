# 🔍 Debugging Save Issue - Step by Step

## Problem
Data is not being saved to the database despite code appearing correct.

## Step 1: Check Browser Console for Errors ⚠️ **CRITICAL**

1. Open the application in your browser
2. Press **F12** to open Developer Tools
3. Click the **Console** tab
4. Login with your account
5. Click **💾 Save to Database**
6. **Copy the entire console output and share it**

Expected output should show:
```
📝 Saving progress to database...
   User ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   User Email: your@email.com
   ...
   Action: INSERT (or UPDATE)
✅ Save successful!
```

If you see **❌ Database error**, note:
- Error code
- Error message
- Details

---

## Step 2: Check Supabase RLS Policies

The most common cause is that the INSERT policy is disabled.

1. Go to **Supabase Dashboard** → https://supabase.com/dashboard
2. Select your project
3. Left menu → **SQL Editor**
4. Run this query to check RLS status:

```sql
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE tablename = 'intern_progress';
```

**Expected result:** `rowsecurity = true`

---

## Step 3: Check RLS Policies

1. Go to **Tables** (in left menu)
2. Click **intern_progress** table
3. Click **RLS** tab at the top
4. You should see 3 policies:
   - ✅ `Enable SELECT for users based on user_id`
   - ✅ `Enable INSERT for users based on user_id`
   - ✅ `Enable UPDATE for users based on user_id`

If **INSERT policy is disabled**, click it and enable it.

### Check Policy SQL

Click the **INSERT policy** and verify the SQL shows:
```sql
(auth.uid() = intern_id)
```

If you see different SQL, that's the problem.

---

## Step 4: Test Database Directly

Run this in **Supabase SQL Editor** to test if direct insert works:

```sql
-- First, get your user ID from auth
SELECT id, email FROM auth.users LIMIT 1;
```

Copy that user ID, then run:

```sql
INSERT INTO intern_progress (
  intern_id, 
  user_email, 
  completed_tasks, 
  task_notes, 
  progress_percent, 
  cohort
) VALUES (
  'YOUR-USER-ID-HERE',
  'test@example.com',
  '[]'::jsonb,
  '{}'::jsonb,
  0,
  'default'
);
```

- **If this succeeds**: The table and RLS work. Problem is in the app code.
- **If this fails with permission error**: RLS policy is blocking inserts.
- **If table doesn't exist**: Run commands from DATABASE_SETUP.md

---

## Step 5: Check Authentication Context

Sometimes the user ID changes between sessions:

1. Open Developer Tools (F12)
2. Go to **Console** tab
3. Paste this code:

```javascript
const { getCurrentUser } = await import('./supabase-config.js');
const user = await getCurrentUser();
console.log('Current user:', user);
```

This will show:
- ✅ If user is logged in and their ID
- ❌ If user is NOT logged in (null)

---

## Step 6: Check Database Record Creation

After attempting to save, run this in **Supabase SQL Editor**:

```sql
SELECT * FROM intern_progress 
ORDER BY created_at DESC 
LIMIT 5;
```

- **If your record appears**: Save IS working (something else might be wrong)
- **If no record appears**: Save is definitely not working

Check the `last_updated` timestamp to confirm it's recent.

---

## What to Provide for Support

Please share:
1. **Console output** (screenshot or copy-paste from F12 → Console)
2. **RLS policy status** (are INSERT policies enabled?)
3. **Result of direct database insert test** (worked or failed?)
4. **Your user ID** (from `SELECT id FROM auth.users`)
5. **Database query result** (any records in intern_progress?)

---

## Common Causes & Solutions

| Issue | Symptom | Solution |
|-------|---------|----------|
| INSERT policy disabled | Error: "new row violates row-level security policy" | Enable INSERT policy in RLS tab |
| Wrong user ID | Data exists but not for your user | Check if user ID changes on login |
| JSONB type mismatch | Error about invalid data type | Ensure arrays are `[]` and objects are `{}` |
| No table | Error: "relation \"intern_progress\" does not exist" | Run DATABASE_SETUP.md commands |
| Auth not set up | "Not logged in" message before save | Login first with email/password |
| CORS issues | Network request fails | Check browser Network tab for 403/401 errors |

---

## Still Not Working?

Try this comprehensive test:

```javascript
// In browser console (F12 → Console)
async function testSave() {
  const { getCurrentUser, saveProgress } = await import('./supabase-config.js');
  
  console.log('1️⃣  Getting user...');
  const user = await getCurrentUser();
  console.log('   User:', user);
  
  if (!user) {
    console.error('   ❌ Not logged in!');
    return;
  }
  
  console.log('2️⃣  Attempting save...');
  const result = await saveProgress(user.id, {
    completedTasks: [false, true, false],
    taskNotes: { 'Day 1': 'Test note' },
    progressPercent: 33,
    email: user.email,
    cohort: 'test'
  });
  
  console.log('3️⃣  Result:', result);
}

testSave();
```

Run this and share **all the console output**.

