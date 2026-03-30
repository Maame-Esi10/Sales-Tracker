# 📞 Quick Reference Guide

## First Things First ⚠️

**Before anything else, you MUST:**

1. Open `/supabase/migrations/20260324_000000_owner_setup.sql`
2. Find line 18-24
3. Replace the placeholder emails with YOUR 2 owner emails
4. Save the file

---

## Files You Now Have

```
Your Project Root
├── 📄 DELIVERY_SUMMARY.md          ← What you got (this is gold!)
├── 📄 OWNER_EMAIL_CONFIG.md        ← How to set up owner emails
├── 📄 DATABASE_SETUP.md            ← Step-by-step deployment
├── 📄 BACKEND_PLAN.md              ← API & architecture specs
├── 📄 ARCHITECTURE.md              ← Implementation checklist
│
├── supabase/migrations/
│   └── 📄 20260324_000000_owner_setup.sql  ← Your database schema!
│
├── src/
│   ├── hooks/
│   │   ├── useAuth.ts              ← Update this (auth logic)
│   │   └── useSupabase.ts          ← Already connected to DB
│   ├── pages/
│   │   └── LoginPage.tsx           ← Update this (role selector)
│   └── components/
│       └── BottomNav.tsx           ← Update this (role-based nav)
│
└── [Everything else you already have]
```

---

## The Big Picture (3 Steps)

### 🔧 Step 1: Configure
**Time: 5 minutes**
1. Open `OWNER_EMAIL_CONFIG.md`
2. Follow the instructions
3. Update your owner emails in the migration file

### 🚀 Step 2: Deploy
**Time: 5 minutes**
```bash
supabase db push
# Or use Supabase Dashboard SQL Editor
```

### ✅ Step 3: Test
**Time: 5 minutes**
1. Sign up with first owner email → You get "owner" role
2. Sign up with random email → You get "staff" role
3. Success! 🎉

---

## System Overview

```
┌─────────────────────────────────────────────┐
│ Your Frontend (React)                       │
│ Already connected to Supabase! ✓            │
└───────────┬─────────────────────────────────┘
            │
            │ Real-time via WebSocket
            │ REST via PostgREST
            ↓
┌─────────────────────────────────────────────┐
│ Supabase (PostgreSQL)                      │
├─────────────────────────────────────────────┤
│ • Stores all your data                     │
│ • Protects data with RLS policies          │
│ • 9 optimized tables                       │
│ • Real-time syncing                        │
│ • Authentication built-in                  │
└─────────────────────────────────────────────┘
```

---

## Role System

```
OWNER (You & Co-founder)
  ├─ 100% access
  ├─ Manage staff
  ├─ View all reports
  └─ Only 2 people can have this

MANAGER
  ├─ Approve expenses
  ├─ Edit menu
  ├─ See reports
  └─ Owner assigns this

STAFF
  ├─ Create sales
  ├─ Log expenses
  ├─ See menu
  └─ Assigned by default

KITCHEN
  ├─ See pending orders
  ├─ Mark completed
  └─ Minimal permissions
```

---

## Data Flow

### When Someone Tries to Sign Up

```
User enters email
    ↓
System asks: "Is this in allowed_owners?"
    ↓
   /  \
 YES   NO
/        \
✓        ✓
Owner    Staff
Only 2   Everyone
can do   else
this
```

### When Creating a Sale

```
Staff member creates sale
         ↓
System records sale + items + waiter
         ↓
Database validates using RLS
         ↓
All users see it in real-time
         ↓
Manager can view + approve if needed
         ↓
Owner can see reports & analytics
```

---

## Important Security Features

1. ✅ **Email Whitelist** - Only 2 emails can be owners
2. ✅ **Role Permissions** - Different access levels
3. ✅ **Row-Level Security** - Database enforces rules
4. ✅ **Audit Logs** - Track all actions
5. ✅ **Cost Hiding** - Staff never see profit margins

---

## Implementation Checklist

### Must Do (Blocking)
- [ ] Update owner emails in migration
- [ ] Deploy migration to Supabase
- [ ] Test signup with owner email
- [ ] Verify role assignment

### Should Do (Important)  
- [ ] Update LoginPage.tsx with role selector
- [ ] Update useAuth.ts with validation
- [ ] Update BottomNav to hide owner pages from staff
- [ ] Test both owner and staff login

### Nice to Have (Optional)
- [ ] Create admin dashboard
- [ ] Add staff management page
- [ ] Set up analytics views
- [ ] Add inventory tracking UI

---

## Quick SQL Checks

### Check if owners are configured
```sql
SELECT * FROM public.allowed_owners;
```
Should show your 2 owner emails ✓

### Check current users and roles
```sql
SELECT p.email, ur.role 
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.id = ur.user_id;
```

### Test owner validation
```sql
SELECT public.is_allowed_owner_email('your-email@example.com');
```
Should return `true` for owner emails ✓

---

## Common Tasks

### Add a new manager
```sql
-- After they sign up and get staff role:
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'manager' FROM public.profiles 
WHERE email = 'new-manager@example.com';
```

### View today's sales
```sql
SELECT * FROM public.sales 
WHERE DATE(created_at) = CURRENT_DATE
ORDER BY created_at DESC;
```

### Deactivate a staff member
```sql
UPDATE public.profiles 
SET is_active = false 
WHERE email = 'staff-member@example.com';
```

### See all activity by user
```sql
SELECT * FROM public.activity_logs
WHERE user_id = 'user-id-here'
ORDER BY created_at DESC
LIMIT 50;
```

---

## Document Map

**Start here:**
- 1️⃣ `OWNER_EMAIL_CONFIG.md` - Owner setup guide
- 2️⃣ `DATABASE_SETUP.md` - Deploy instructions
- 3️⃣ Test in Supabase Dashboard

**For reference:**
- `BACKEND_PLAN.md` - API endpoints & architecture
- `ARCHITECTURE.md` - Implementation tasks
- `DELIVERY_SUMMARY.md` - Overview of everything

**The actual database:**
- `supabase/migrations/20260324_000000_owner_setup.sql` - The schema

---

## Timeline

| When | What |
|------|------|
| Today | Configure owner emails + deploy |
| Next | Update frontend code |
| Next week | Test everything |
| Ready | Deploy to production |

**Total time to live: ~8 hours** (mostly from you coding frontend updates)

---

## Support

**Quick answers:**

- **"How do I set up owners?"** → `OWNER_EMAIL_CONFIG.md`
- **"How do I deploy?"** → `DATABASE_SETUP.md`
- **"What are the API endpoints?"** → `BACKEND_PLAN.md`
- **"What files do I edit?"** → `ARCHITECTURE.md`
- **"I got an error..."** → Check DATABASE_SETUP.md Troubleshooting

---

## Key Points to Remember

✅ **Only 2 emails can be owners** - This is enforced at database level (very secure)

✅ **Everyone else is staff** - Can be promoted to manager by owner

✅ **All access is role-based** - PostgreSQL RLS policies enforce this

✅ **All actions are logged** - Owner can see everything in activity_logs

✅ **Real-time updates** - Changes appear instantly for all users

✅ **Zero backend needed initially** - Supabase PostgREST handles all APIs

---

## Helpful Resources

1. **Supabase Docs**: https://supabase.com/docs
2. **PostgreSQL RLS Guide**: https://supabase.com/docs/guides/auth/row-level-security
3. **SQL Cheat Sheet**: https://www.postgresql.org/docs/current/
4. **React Hooks**: https://react.dev/reference/react

---

## Final Checklist Before Going Live

- [ ] Owner emails configured in migration
- [ ] Migration deployed to production
- [ ] Tested owner signup → gets owner role
- [ ] Tested staff signup → gets staff role
- [ ] Frontend role selector updated
- [ ] Auth hook validates permissions
- [ ] Navigation shows different items per role
- [ ] All real-time queries tested
- [ ] Offline caching works
- [ ] Performance tested (sales creation, menu load, etc)

---

**You've got everything you need. Let's build! 🚀**

Next: Open `OWNER_EMAIL_CONFIG.md` and follow the steps!
