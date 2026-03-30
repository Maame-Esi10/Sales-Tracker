# Purple Rain Coffee POS - Database Setup Guide

## ⚠️ CRITICAL: Configure Owner Emails FIRST

Before running the migration, you MUST edit the migration file and replace the example emails with your actual owner emails.

### Step 1: Update Owner Emails

**File**: `supabase/migrations/20260324_000000_owner_setup.sql`

**Find this section (around line 18-24)**:
```sql
-- Insert your 2 owner emails (CHANGE THESE!)
INSERT INTO public.allowed_owners (email, full_name)
VALUES 
  ('owner1@purpleraincoffee.com', 'Owner One'),
  ('owner2@purpleraincoffee.com', 'Owner Two')
ON CONFLICT (email) DO NOTHING;
```

**Replace with your actual owner emails**:
```sql
INSERT INTO public.allowed_owners (email, full_name)
VALUES 
  ('your-real-email@example.com', 'Your Name'),
  ('other-owner@example.com', 'Other Owner Name')
ON CONFLICT (email) DO NOTHING;
```

---

## Step 2: Deploy to Supabase

### Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-id assmbwwshurzmgetjhil

# Deploy migrations
supabase db push
```

### Using Supabase Dashboard (Manual)

1. Go to [supabase.co/dashboard](https://supabase.co/dashboard)
2. Select your project
3. Navigate to **SQL Editor**
4. Create a new query
5. Copy the entire content of `supabase/migrations/20260324_000000_owner_setup.sql`
6. Paste into the SQL editor
7. Click **Run**

---

## Step 3: Verify Migration

Run these checks in Supabase SQL Editor:

```sql
-- Check 1: allowed_owners table created
SELECT COUNT(*) FROM public.allowed_owners;
-- Should return: 2 (your configured emails)

-- Check 2: Tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
-- Should show all tables: allowed_owners, profiles, user_roles, menu_items, sales, etc.

-- Check 3: RLS is enabled
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename NOT LIKE 'pg_%';
-- All should have RLS enabled

-- Check 4: Test owner email validation
SELECT public.is_allowed_owner_email('your-real-email@example.com');
-- Should return: true

-- Check 5: Non-owner email
SELECT public.is_allowed_owner_email('random@example.com');
-- Should return: false
```

---

## Step 4: Test the Flow

### Test Owner Registration

```bash
# In browser console or Postman

# 1. Try registering with owner email
curl -X POST https://[your-project].supabase.co/auth/v1/signup \
  -H "apikey: [VITE_SUPABASE_PUBLISHABLE_KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-real-email@example.com",
    "password": "TestPassword123!",
    "data": {
      "display_name": "Your Name"
    }
  }'

# Should create user and assign "owner" role

# 2. Try registering with non-owner email
curl -X POST https://[your-project].supabase.co/auth/v1/signup \
  -H "apikey: [VITE_SUPABASE_PUBLISHABLE_KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "random-staff@example.com",
    "password": "TestPassword123!",
    "data": {
      "display_name": "Staff Member"
    }
  }'

# Should create user and assign "staff" role
```

### Verify Roles in Database

```sql
-- After testing, run this to see assigned roles
SELECT p.email, p.display_name, ur.role 
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.id = ur.user_id
ORDER BY p.created_at DESC;
```

---

## Step 5: Update Frontend Auth Hook

**File**: `src/hooks/useAuth.ts`

Update the signup function to handle owner email validation:

```typescript
// Inside useAuth.ts signUp function

const { error: signUpError } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      display_name: displayName,
      selected_role: selectedRole, // Add this
    },
    emailRedirectTo: `${window.location.origin}/`,
  },
});

// Check owner validation
if (selectedRole === 'owner') {
  const { data: isAllowedOwner } = await supabase
    .rpc('is_allowed_owner_email', { _email: email });
  
  if (!isAllowedOwner) {
    throw new Error('You are not authorized to create an owner account');
  }
}
```

---

## Step 6: Update Frontend UI

**File**: `src/pages/LoginPage.tsx`

Modify the role selector to show owner restriction:

```tsx
<div>
  <label>Role:</label>
  <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value as AppRole)}>
    <option value="staff">Staff</option>
    <option value="owner" disabled={!isOwnerEmailAllowed}>
      Owner (Restricted)
    </option>
  </select>
  {selectedRole === 'owner' && !isOwnerEmailAllowed && (
    <p className="text-sm text-warning">
      Only authorized emails can create owner accounts
    </p>
  )}
</div>
```

---

## Database Schema Summary

```
┌─────────────────────────────────────────────┐
│                 Auth (Supabase)             │
└─────────────────────────────────────────────┘
                        │
                        ├─→ auth.users
                        │
┌─────────────────────────────────────────────┐
│         Public Database (PostgreSQL)        │
├─────────────────────────────────────────────┤
│                                             │
│  allowed_owners (Owner Email Whitelist)    │
│              │                             │
│              └─→ Trigger on signup         │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │ profiles ─┐                          │  │
│  │           ├─→ user_roles             │  │
│  │           └──→ (Determines Access)   │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │ Operations Tables (RLS Protected)    │  │
│  ├──────────────────────────────────────┤  │
│  │ menu_items (Owner/Manager control)  │  │
│  │ sales (Permanent record)             │  │
│  │ sale_items (Line items)              │  │
│  │ expenses (Approval workflow)         │  │
│  │ inventory (Stock tracking)           │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  activity_logs (Audit trail, Owner-only)  │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Troubleshooting

### Issue: "Email is not allowed to be owner"

**Solution**: 
1. Check you replaced the owner emails in the migration file
2. Verify the migration ran successfully
3. Run this SQL to confirm:
   ```sql
   SELECT * FROM public.allowed_owners;
   ```

### Issue: Trigger not firing after user signup

**Solution**:
1. Check Supabase Auth → Providers → Email is enabled
2. Verify webhook URL is configured (if using custom domain)
3. Run this to test the function:
   ```sql
   SELECT public.is_allowed_owner_email('your-email@example.com');
   ```

### Issue: Role not assigned correctly

**Solution**:
```sql
-- Manual role assignment
INSERT INTO public.user_roles (user_id, role)
VALUES ('user-uuid-here', 'manager');

-- Check if assignments exist
SELECT * FROM public.user_roles 
WHERE user_id = 'user-uuid-here';
```

### Issue: RLS policies blocking access

**Solution**:
```sql
-- Check policies are PERMISSIVE (not RESTRICTIVE)
SELECT policyname, permissive, qual 
FROM pg_policies 
WHERE tablename = 'sales';

-- If policies exist but not working, rebuild them:
-- 1. Drop problematic policies
-- 2. Recreate them
-- 3. Ensure you're authenticated before test
```

---

## Next Steps

1. ✅ Configure owner emails in migration
2. ✅ Deploy migration to Supabase
3. ✅ Test owner registration
4. ✅ Update frontend auth logic
5. ⬜ Create API endpoints (Edge Functions or backend)
6. ⬜ Add analytics/reporting views
7. ⬜ Add admin dashboard

---

## Quick Reference

### Add new owner (after first owner login)

```sql
INSERT INTO public.allowed_owners (email, full_name)
VALUES ('newoowner@example.com', 'New Owner')
ON CONFLICT (email) DO NOTHING;
```

### Promote staff to manager

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('staff-user-id', 'manager')
ON CONFLICT (user_id, role) DO NOTHING;
```

### View all staff members

```sql
SELECT p.id, p.email, p.display_name, ur.role
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.id = ur.user_id
WHERE ur.role != 'owner'
ORDER BY p.created_at DESC;
```

### View all activity for specific user

```sql
SELECT action, table_name, record_id, created_at
FROM public.activity_logs
WHERE user_id = 'user-id'
ORDER BY created_at DESC
LIMIT 50;
```

---

## Security Checklist

- [ ] Owner emails are set correctly in migration
- [ ] RLS is enabled on all tables
- [ ] Policies are PERMISSIVE (safe) not RESTRICTIVE
- [ ] `allowed_owners` table pre-populated BEFORE any signups
- [ ] Edge functions use service role key only
- [ ] Frontend never exposes `cost_price` to staff
- [ ] Activity logs hidden from non-owners
- [ ] Email verification enabled in Auth settings

---

**Need Help?** Check the Supabase docs: https://supabase.com/docs
