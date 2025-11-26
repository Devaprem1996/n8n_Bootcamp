# How to Grant Admin Access to a User

## Method 1: Using Supabase Dashboard (Recommended)

1. **Go to your Supabase Dashboard**
   - Navigate to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project

2. **Open Table Editor**
   - Click on "Table Editor" in the left sidebar
   - Select the `profiles` table

3. **Find the User**
   - Locate the row with the email address you want to make admin
   - If the user hasn't logged in yet, they won't appear in this table

4. **Update Role**
   - Click on the `role` field for that user
   - Change the value from `intern` to `admin`
   - Press Enter or click outside to save

## Method 2: Using SQL Editor

1. **Go to SQL Editor** in your Supabase Dashboard

2. **Run this query** (replace with actual email):
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-admin-email@example.com';
```

3. **Verify the change**:
```sql
SELECT email, role FROM profiles WHERE role = 'admin';
```

## Method 3: Automatically Set Admin on First Login

If you want a specific email to ALWAYS be admin, add this to your `supabase_setup.sql`:

```sql
-- Auto-promote specific emails to admin
CREATE OR REPLACE FUNCTION auto_promote_admin()
RETURNS TRIGGER AS $$
BEGIN
  -- Add your admin emails here
  IF NEW.email IN ('admin@yourdomain.com', 'boss@yourdomain.com') THEN
    NEW.role := 'admin';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_admin_trigger ON profiles;
CREATE TRIGGER auto_admin_trigger
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_promote_admin();
```

## Testing Admin Access

1. **Login** with the email you just promoted
2. **Refresh** the page if you were already logged in
3. You should see an **"Admin Dashboard"** button in the header
4. Click it to access the admin panel where you can see all interns' progress

## Important Notes

- Users must **login at least once** before they appear in the `profiles` table
- The default role for all new users is `intern`
- Only users with `role = 'admin'` can access the `/admin` route
