# 🔓 Owner Email Configuration Guide

## ⚠️ CRITICAL FIRST STEP

Before you do ANYTHING else, you must configure your 2 owner emails in the database migration file.

---

## Quick Setup (5 minutes)

### 1. Open the Migration File

**File**: `/supabase/migrations/20260324_000000_owner_setup.sql`

Scroll to **line 18-24** and find:

```sql
-- Insert your 2 owner emails (CHANGE THESE!)
INSERT INTO public.allowed_owners (email, full_name)
VALUES 
  ('owner1@purpleraincoffee.com', 'Owner One'),
  ('owner2@purpleraincoffee.com', 'Owner Two')
ON CONFLICT (email) DO NOTHING;
```

### 2. Replace with Your Emails

Let's say your owners are:
- `james@purpleraincoffee.com` (James - Co-founder)
- `sarah@purpleraincoffee.com` (Sarah - Manager)

**Replace the section with**:

```sql
-- Insert your 2 owner emails (CHANGE THESE!)
INSERT INTO public.allowed_owners (email, full_name)
VALUES 
  ('james@purpleraincoffee.com', 'James'),
  ('sarah@purpleraincoffee.com', 'Sarah')
ON CONFLICT (email) DO NOTHING;
```

### 3. Save & Deploy

```bash
# Save the file
Ctrl+S (or Cmd+S on Mac)

# Deploy to Supabase
supabase db push
```

### 4. Test

Sign up with:
- ✅ `james@purpleraincoffee.com` → Gets "owner" role
- ✅ `sarah@purpleraincoffee.com` → Gets "owner" role  
- ❌ `anyone-else@email.com` → Gets "staff" role (not owner)

---

## Detailed Explanation

### What This Does

The `allowed_owners` table is a **whitelist** of emails that are allowed to be owners. It's like a VIP list:

```
Email Whitelist (allowed_owners table)
└─ james@purpleraincoffee.com  ← When signup with this → owner role
└─ sarah@purpleraincoffee.com  ← When signup with this → owner role

Anyone else → staff role (can be promoted later)
```

### Why This Matters

Without this whitelist:
- ❌ Anyone could sign up and become owner
- ❌ System would be insecure
- ❌ All data would be visible to random people

With this whitelist:
- ✅ Only your 2 chosen emails become owners
- ✅ Everyone else starts as staff
- ✅ Secure multi-user system

### The Signup Flow

```
New user signs up with email
    ↓
System checks: Is this email in allowed_owners?
    ↓
   /  \
 YES   NO
/        \
owner    staff
role     role
  ↓        ↓
Full      Limited
Access    Access
```

---

## Configuration Examples

### Example 1: Two Different People
```sql
INSERT INTO public.allowed_owners (email, full_name)
VALUES 
  ('alice@company.com', 'Alice CEO'),
  ('bob@company.com', 'Bob CFO')
```

### Example 2: Gmail Addresses
```sql
INSERT INTO public.allowed_owners (email, full_name)
VALUES 
  ('owner1@gmail.com', 'John Doe'),
  ('owner2@gmail.com', 'Jane Smith')
```

### Example 3: Company Domain
```sql
INSERT INTO public.allowed_owners (email, full_name)
VALUES 
  ('james@purplerain.co', 'James Wilson'),
  ('manager@purplerain.co', 'Sarah Johnson')
```

---

## What If You Make a Mistake?

### Scenario: I Already Deployed with Wrong Emails

**Solution 1: Update via SQL** (1 minute)

Go to Supabase → SQL Editor and run:

```sql
-- Delete the wrong entries
DELETE FROM public.allowed_owners;

-- Add the correct ones
INSERT INTO public.allowed_owners (email, full_name)
VALUES 
  ('correct-email1@example.com', 'Owner One'),
  ('correct-email2@example.com', 'Owner Two');
```

**Solution 2: Create New Migration**

Create file: `/supabase/migrations/20260325_000000_fix_owner_emails.sql`

```sql
DELETE FROM public.allowed_owners;

INSERT INTO public.allowed_owners (email, full_name)
VALUES 
  ('correct-email1@example.com', 'Owner One'),
  ('correct-email2@example.com', 'Owner Two');
```

Then run: `supabase db push`

---

## Handling Multiple Owner Scenarios

### Scenario: Need 3+ Owners

**Note**: The requirement is 2 owners. To add a 3rd:

```sql
INSERT INTO public.allowed_owners (email, full_name)
VALUES ('third-owner@example.com', 'Third Owner');
```

Then promote them after signup, OR add them to this table BEFORE they try to sign up.

### Scenario: One Owner Leaves

**Solution**: 
1. Remove from `allowed_owners` table
2. They can still log in with their account (but won't be able to signup again)
3. Optionally: Deactivate their account

```sql
-- Remove from owner list
DELETE FROM public.allowed_owners 
WHERE email = 'departing-owner@example.com';

-- Or deactivate without deleting
UPDATE public.profiles 
SET is_active = false 
WHERE email = 'departing-owner@example.com';
```

### Scenario: Replace One Owner

```sql
-- Remove old owner from whitelist
UPDATE public.allowed_owners 
SET email = 'new-owner@example.com',
    full_name = 'New Owner Name'
WHERE email = 'old-owner@example.com';
```

---

## Email Format Requirements

✅ **Valid Emails**:
- `user@domain.com`
- `first.last@company.co.uk`
- `owner+tag@gmail.com`
- `123@example.com`

❌ **Invalid Emails** (will cause errors):
- `user@domain` (missing .com)
- `user @domain.com` (space in email)
- `user@@domain.com` (double @)
- `null` (must have value)

**Note**: Emails are stored as lowercase:
- `James@Gmail.com` → `james@gmail.com`
- `OWNER@COMPANY.COM` → `owner@company.com`

---

## Re-Configuring Owners Later

### Add New Owner (After Initial Setup)

```sql
INSERT INTO public.allowed_owners (email, full_name)
VALUES ('new-owner@example.com', 'New Owner Name');
```

### Remove Owner from Whitelist

```sql
DELETE FROM public.allowed_owners 
WHERE email = 'owner@example.com';
```

### View Current Owners

```sql
SELECT email, full_name, approved, created_at 
FROM public.allowed_owners;
```

### Deactivate vs Delete

**Deactivate** (safer - preserves data):
```sql
UPDATE public.profiles 
SET is_active = false 
WHERE email = 'owner@example.com';
```

**Delete** (removes everything - NOT recommended):
```sql
DELETE FROM public.profiles 
WHERE email = 'owner@example.com';
```

---

## Testing Your Configuration

### Test 1: Check Allowed Owners

**SQL**:
```sql
SELECT * FROM public.allowed_owners;
```

**Expected Result**:
```
id                                    | email              | full_name  | approved | created_at
--------------------------------------|-------------------|-----------|----------|---------------
550e8400-e29b-41d4-a716-446655440000 | james@company.com | James     | true     | 2026-03-24
660e8400-e29b-41d4-a716-446655440001 | sarah@company.com | Sarah     | true     | 2026-03-24
```

### Test 2: Check Function

**SQL**:
```sql
SELECT public.is_allowed_owner_email('james@company.com');
SELECT public.is_allowed_owner_email('random@gmail.com');
```

**Expected Result**:
```
is_allowed_owner_email
----------------------
t                       (true - james is in whitelist)
f                       (false - random is not)
```

### Test 3: Signup Test

In your app:
1. Sign up with `james@company.com` 
2. Check database for role:
   ```sql
   SELECT p.email, ur.role FROM public.profiles p
   LEFT JOIN public.user_roles ur ON p.id = ur.user_id
   WHERE p.email = 'james@company.com';
   ```
3. Should show role = 'owner' ✅

---

## Troubleshooting

### "Email already exists" error

**Cause**: Email already exists in `allowed_owners`

**Solution**: Remove duplicate or change email

```sql
DELETE FROM public.allowed_owners 
WHERE email = 'duplicate@example.com';

-- Then run insert again
INSERT INTO public.allowed_owners (email, full_name)
VALUES ('duplicate@example.com', 'Name');
```

### "Still getting staff role instead of owner"

**Causes**:
1. Email not in `allowed_owners` table
2. Email has different case (should be lowercase)
3. Migration didn't run
4. Browser cache (try incognito)

**Solution**:
```sql
-- Check if email is in table (try lowercase)
SELECT * FROM public.allowed_owners 
WHERE email = 'your-email@example.com';

-- If not found, insert it
INSERT INTO public.allowed_owners (email, full_name)
VALUES ('your-email@example.com', 'Your Name');
```

### Signup fails with "Email not verified"

**Cause**: Supabase Auth email verification enabled

**Solution**: 
1. Check confirmation email
2. Or disable email verification in Supabase Dashboard

---

## Important Security Notes

⚠️ **DO NOT**:
- Share these owner emails publicly
- Use test emails in production
- Forget to update the migration before deploying
- Delete the `allowed_owners` table
- Give owner access to untrusted people

✅ **DO**:
- Keep owner emails private
- Use company domain emails (trusted)
- Update before each deployment
- Regularly review who has access
- Deactivate unused accounts

---

## Configuration Checklist

Before deploying, verify:

- [ ] I have identified my 2 owner emails
- [ ] Both emails are correctly formatted (lowercase, valid domain)
- [ ] I've updated the migration file with correct emails
- [ ] I've removed the example emails (owner1@, owner2@)
- [ ] The SQL syntax is correct (no typos)
- [ ] I've tested with one of the owner emails
- [ ] New non-owner emails get staff role

---

## Support

**Still confused?** Read these in order:
1. This file (you're here)
2. `/DATABASE_SETUP.md` - Full setup guide
3. `/BACKEND_PLAN.md` - Architecture overview
4. Supabase docs: https://supabase.com/docs

---

**Ready to deploy?** Go to DATABASE_SETUP.md for next steps!
