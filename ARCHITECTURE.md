# Implementation Checklist & Architecture Overview

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                     │
│          (Vite + TypeScript + Shadcn/UI)               │
│          Current: src/pages, src/hooks                 │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ Real-time via WebSocket
                   │ REST via PostgREST
                   ↓
┌─────────────────────────────────────────────────────────┐
│                 Supabase (Edge Layer)                   │
├─────────────────────────────────────────────────────────┤
│  • PostgREST API (Auto-generated REST endpoints)       │
│  • Real-time Subscriptions (postgres_changes)         │
│  • Auth (Email/Password + RLS)                         │
│  • Database (PostgreSQL with RLS policies)             │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────────┐
│         PostgreSQL Database (RLS Protected)             │
├─────────────────────────────────────────────────────────┤
│  Tables with Row-Level Security:                       │
│  ✓ allowed_owners (Email whitelist)                    │
│  ✓ profiles (User info)                                │
│  ✓ user_roles (Role assignments)                       │
│  ✓ menu_items (Product catalog)                        │
│  ✓ sales (Order records)                               │
│  ✓ sale_items (Line items)                             │
│  ✓ expenses (Cost tracking)                            │
│  ✓ inventory (Stock management)                        │
│  ✓ activity_logs (Audit trail)                         │
└─────────────────────────────────────────────────────────┘
```

## 🔐 Security Layers

```
Layer 1: Email Whitelisting
  → allowed_owners table (2 predefined emails)
  → Block non-owners from becoming owners

Layer 2: Role-Based Access Control (RBAC)
  → Owner > Manager > Staff > Kitchen
  → user_roles table

Layer 3: Row-Level Security (RLS)
  → PostgreSQL policies on every table
  → Enforce permissions at database level
  → No SQL injection possible

Layer 4: Audit Trail
  → activity_logs table
  → Track every action
  → Owner-only access
```

## 📋 Implementation Checklist

### Phase 1: Database Setup ⏰ ~30 minutes

- [ ] Edit `/supabase/migrations/20260324_000000_owner_setup.sql`
  - [ ] Replace `owner1@purpleraincoffee.com` with first owner email
  - [ ] Replace `owner2@purpleraincoffee.com` with second owner email
  - [ ] Review all table definitions
  - [ ] Check RLS policies are correct

- [ ] Deploy migration
  - [ ] Option A: Use Supabase CLI (`supabase db push`)
  - [ ] Option B: Use Supabase Dashboard (SQL Editor)

- [ ] Verify migration
  - [ ] Run SQL checks (see DATABASE_SETUP.md)
  - [ ] Test owner email validation: `SELECT public.is_allowed_owner_email('your-email')`
  - [ ] Confirm all tables created

### Phase 2: Frontend Updates ⏰ ~1-2 hours

**Priority 1: Critical**
- [ ] Update `/src/hooks/useAuth.ts`
  - [ ] Add owner email validation on signup
  - [ ] Show error if non-owner tries owner role
  - [ ] Pass display_name to signup

- [ ] Update `/src/pages/LoginPage.tsx`
  - [ ] Add role selector (Owner/Staff)
  - [ ] Show "Owner (Restricted)" for owner option
  - [ ] Show warning for non-authorized emails
  - [ ] Hide owner option for non-whitelisted emails

- [ ] Update role selector state
  - [ ] Store `selectedRole` state
  - [ ] Pass to signup function
  - [ ] Validate against allowed_owners

**Priority 2: Important**
- [ ] Update `src/components/BottomNav.tsx`
  - [ ] Show different nav items per role
  - [ ] Hide owner-only pages for staff

- [ ] Create role-based page access
  - [ ] AnalyticsPage → Owner/Manager only
  - [ ] MenuPage → Owner/Manager only
  - [ ] KitchenPage → Kitchen/Staff only
  - [ ] Create ProfilePage → Own profile only

- [ ] Update hook permissions
  - [ ] `useMenuItems` → Check role before allowing edit
  - [ ] `useExpenses` → Show approval workflow
  - [ ] `useSales` → Separate permissions per role

**Priority 3: Nice-to-Have**
- [ ] Add role indicator in UI
  - [ ] Show current role in profile
  - [ ] Badge in nav showing role
  - [ ] Role description/permissions help

- [ ] Add staff management page (Owner only)
  - [ ] List all staff
  - [ ] Promote/demote roles
  - [ ] Deactivate staff

### Phase 3: Backend Endpoints ⏰ ~2-4 hours

**Using Supabase PostgREST (No backend needed initially)**
- [ ] Test direct REST calls from frontend
  - [ ] `/rest/v1/menu_items` → GET, POST, PATCH
  - [ ] `/rest/v1/sales` → GET, POST
  - [ ] `/rest/v1/expenses` → GET, POST, PATCH
  - [ ] RLS policies should enforce permissions automatically

**Complex queries requiring Edge Functions**
- [ ] Daily sales summary endpoint
  - [ ] Input: date
  - [ ] Output: { totalRevenue, count, breakdown }

- [ ] Expense approval workflow
  - [ ] Only manager+ can approve
  - [ ] Audit trail of who approved

- [ ] Analytics endpoints
  - [ ] Sales trends
  - [ ] Top items
  - [ ] Profit margins
  - [ ] Expense breakdown

### Phase 4: Testing ⏰ ~1-2 hours

- [ ] Authentication tests
  - [ ] Owner can register with owner email ✓
  - [ ] Staff can register with any other email ✓
  - [ ] Login redirects to dashboard ✓
  - [ ] Logout works ✓
  - [ ] Password reset works ✓

- [ ] Authorization tests
  - [ ] Owner can access all pages ✓
  - [ ] Manager can't access some owner pages ✓
  - [ ] Staff can't edit menu ✓
  - [ ] Kitchen can't approve expenses ✓

- [ ] Data integrity tests
  - [ ] Sales create correctly ✓
  - [ ] Menu items visible to all ✓
  - [ ] Expenses require approval ✓
  - [ ] Activity logs only visible to owner ✓

- [ ] Real-time tests
  - [ ] New sale appears instantly ✓
  - [ ] Menu update broadcasts ✓
  - [ ] Multiple users see same data ✓

### Phase 5: Deployment ⏰ ~1 hour

- [ ] Frontend build
  - [ ] `npm run build`
  - [ ] Check for errors
  - [ ] Verify all pages load

- [ ] Deploy frontend
  - [ ] Vercel: `vercel --prod`
  - [ ] Netlify: `netlify deploy --prod`
  - [ ] GitHub Pages: Push to gh-pages branch

- [ ] Monitor in production
  - [ ] Check Supabase logs for errors
  - [ ] Monitor user signups
  - [ ] Check RLS policy violations

## 🎯 Key Files Modified

### New Files Created
- `/supabase/migrations/20260324_000000_owner_setup.sql` - Database schema
- `/BACKEND_PLAN.md` - Comprehensive backend architecture
- `/DATABASE_SETUP.md` - Setup instructions
- `/ARCHITECTURE.md` (this file) - Implementation guide

### Files to Modify
1. **`src/hooks/useAuth.ts`** - Add owner validation
2. **`src/pages/LoginPage.tsx`** - Add role selector
3. **`src/components/BottomNav.tsx`** - Role-based navigation
4. **`src/hooks/useSupabase.ts`** - Add role checks
5. **`src/App.tsx`** - Add role-based routing

### Files to Create (Optional)
- `src/pages/AdminPage.tsx` - Owner dashboard
- `src/pages/StaffManagementPage.tsx` - Manage staff
- `src/components/RoleIndicator.tsx` - Show current role
- `src/lib/permissions.ts` - Permission helpers

## 🚀 Quick Start Commands

```bash
# 1. Deploy database migration
supabase login
supabase link --project-id assmbwwshurzmgetjhil
supabase db push

# 2. Test in browser
npm run dev
# Go to http://localhost:8080
# Try signing up with owner email (should get owner role)

# 3. Check database
supabase db shell
SELECT * FROM public.allowed_owners;
SELECT * FROM public.profiles;
SELECT * FROM public.user_roles;

# 4. Build for production
npm run build

# 5. Deploy
vercel deploy --prod
```

## 📊 Database Growth Estimates

### Sample Data (6 months operation)
```
menu_items:       ~150 items
sales:            ~10,000 transactions (50/day × 200 days)
sale_items:       ~40,000 line items (4 items per sale)
expenses:         ~2,000 transactions
activity_logs:    ~100,000 log entries
profiles:         ~30 users
```

### Storage estimate:
```
Total: ~10MB (easily handles millions of transactions)
```

## 🔍 Monitoring & Maintenance

### Weekly
- [ ] Check failed login attempts in activity logs
- [ ] Review expense approvals
- [ ] Verify inventory levels

### Monthly
- [ ] Run profit analysis query
- [ ] Review staff activity
- [ ] Check for unused menu items
- [ ] Backup database (automatic with Supabase)

### Quarterly
- [ ] Analyze sales trends
- [ ] Identify top products
- [ ] Review staffing costs
- [ ] Update owner email list if needed

## 🎓 Team Onboarding

### For New Owner
1. Provide email
2. Add to `allowed_owners` table
3. User signs up, automatically gets owner role
4. Full dashboard access

### For New Manager
1. Register normally (gets staff role)
2. Owner goes to staff management page
3. Owner promotes user to manager
4. User sees manager features

### For New Staff
1. Register normally
2. Can create sales immediately
3. Can see menu and analytics
4. No access to expenses or staff management

## 📚 Documentation Structure

```
/
├── BACKEND_PLAN.md          ← Architecture & API specs
├── DATABASE_SETUP.md        ← Setup instructions
├── ARCHITECTURE.md (this)   ← Implementation checklist
├── README.md                ← Project overview
├── supabase/
│   ├── migrations/
│   │   └── 20260324_000000_owner_setup.sql  ← Main migration
│   └── config.toml
├── src/
│   ├── hooks/
│   │   ├── useAuth.ts       ← Auth logic (UPDATE)
│   │   └── useSupabase.ts   ← DB queries (UPDATE)
│   ├── pages/
│   │   ├── LoginPage.tsx    ← Login form (UPDATE)
│   │   └── AdminPage.tsx    ← Owner dashboard (NEW)
│   └── components/
│       ├── BottomNav.tsx    ← Navigation (UPDATE)
│       └── RoleIndicator.tsx ← Show role badge (NEW)
└── vite.config.ts
```

## 🆘 Getting Help

1. **Supabase Docs**: https://supabase.com/docs
2. **PostgreSQL Docs**: https://www.postgresql.org/docs/
3. **React Docs**: https://react.dev
4. **Row-Level Security**: https://supabase.com/docs/guides/auth/row-level-security

---

**Total Implementation Time**: ~8 hours (including testing)

Start with Phase 1 (database) → Phase 2 (frontend) → Test → Deploy
