# Purple Rain Coffee POS - Backend Architecture Plan

## 📋 Table of Contents
1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [Authentication & Authorization](#authentication--authorization)
4. [API Endpoints](#api-endpoints)
5. [Implementation Stack](#implementation-stack)
6. [Security Considerations](#security-considerations)
7. [Deployment](#deployment)

---

## Overview

This is a multi-user POS (Point of Sale) system for Purple Rain Coffee with **owner-restricted access**, role-based permissions, and real-time capabilities via Supabase.

### Key Features
- ✅ **Owner-only access**: Only 2 predefined owner emails can register as owners
- ✅ **Role-based access control**: Owner → Manager → Staff → Kitchen
- ✅ **Real-time sales tracking**: Supabase real-time subscriptions
- ✅ **Expense management**: Approval workflow
- ✅ **Menu management**: Owner/Manager control
- ✅ **Activity audit trail**: Track all actions
- ✅ **Inventory tracking**: Stock management
- ✅ **Offline capability**: PWA support with fallback

---

## Database Schema

### Core Tables

#### 1. **allowed_owners** (Owner Verification)
Pre-populated with 2 allowed emails. Non-owner emails cannot become owners during signup.

```sql
id (UUID, PK)
email (TEXT, UNIQUE, LOWERCASE)
full_name (TEXT)
approved (BOOLEAN)
created_at (TIMESTAMPTZ)
```

**Flow**: 
- New signup → Check if email in `allowed_owners` table
- If YES → Assign `owner` role
- If NO → Assign `staff` role (can be promoted by owner later)

---

#### 2. **profiles** (User Information)
Linked to Supabase auth.users

```sql
id (UUID, PK, FK -> auth.users)
email (TEXT)
display_name (TEXT)
phone (TEXT)
is_active (BOOLEAN)
last_login_at (TIMESTAMPTZ)
created_at & updated_at (TIMESTAMPTZ)
```

---

#### 3. **user_roles** (Role Assignment)
Many-to-many relationship for future multi-role support

```sql
id (UUID, PK)
user_id (UUID, FK -> auth.users)
role (app_role: 'owner', 'manager', 'staff', 'kitchen')
assigned_by (UUID, FK -> auth.users)
assigned_at (TIMESTAMPTZ)
```

---

#### 4. **menu_items** (Product Catalog)
```sql
id, name, description, category, price, cost, is_available
is_seasonal, image_url
created_by (UUID, FK)
created_at & updated_at
```

**Permissions**:
- Owner/Manager: CREATE, UPDATE, DELETE
- Staff: READ only
- Kitchen: READ only

---

#### 5. **sales** (Order Records)
```sql
id, order_id (UNIQUE), total, discount_amount, final_total
payment_method ('Cash', 'MoMo', 'Card')
customer_type ('Walk-in', 'Table', 'Online', 'Delivery')
customer_name, customer_phone
waiter_id (FK -> auth.users)
notes
created_at & updated_at
```

---

#### 6. **sale_items** (Line Items)
```sql
id, sale_id (FK), menu_item_id (FK)
name, price, qty, notes
```

---

#### 7. **expenses** (Cost Tracking)
```sql
id, category (enum), amount, description, receipt_url
created_by (FK), approved_by (FK), is_approved
created_at & updated_at
```

**Workflow**:
- Any staff can CREATE
- Manager+ can APPROVE
- Owner can see all

---

#### 8. **inventory** (Stock Management)
```sql
id, item_name, quantity, unit ('kg', 'liters', 'pieces')
reorder_level
last_updated_by (FK)
created_at & updated_at
```

---

#### 9. **activity_logs** (Audit Trail)
```sql
id, user_id (FK), action (TEXT), table_name, record_id
details (JSONB)
created_at
```

---

## Authentication & Authorization

### Owner Registration Flow

```
User attempts signup
    ↓
Email validation
    ↓
Check permitted_owners table
    ↓
   /  \
 YES   NO
/        \
Assign    Assign
'owner'   'staff'
role      role
  ↓          ↓
  ✓       Can be promoted
          later by owner
```

### Security Functions (PostgreSQL)

**1. `is_allowed_owner_email(_email TEXT) → BOOLEAN`**
- Check if email exists in `allowed_owners` table
- Called during user creation

**2. `is_owner(_user_id UUID) → BOOLEAN`**
- Check if user has 'owner' role
- Used in RLS policies

**3. `has_role(_user_id UUID, _role app_role) → BOOLEAN`**
- Generic role checker
- Used in RLS policies for authorization

### Role Hierarchy

```
Owner (Full Access)
  ├─ Manage staff roles
  ├─ View all data
  ├─ Approve expenses
  ├─ Manage menu
  └─ View reports
    ↓
Manager (Administrative)
  ├─ Add/remove staff
  ├─ Manage menu
  ├─ Approve expenses
  └─ View department reports
    ↓
Staff (Operational)
  ├─ Create sales
  ├─ Create expenses (own only)
  ├─ View menu
  └─ View own activity
    ↓
Kitchen (Read-Only)
  ├─ View pending orders
  ├─ Update order status
  └─ View menu items
```

---

## API Endpoints

### **Authentication**

```
POST /auth/signup
  Body: { email, password, displayName, preferredRole }
  Returns: { user, session, error }
  Logic: Validates email against allowed_owners

POST /auth/login
  Body: { email, password }
  Returns: { user, session }

POST /auth/logout
  Returns: { success }

POST /auth/reset-password
  Body: { email }
  Returns: { success }
```

### **Users & Roles** (Owner-only)

```
GET /api/users
  Returns: [ { id, email, displayName, role, lastLogin, isActive } ]
  RLS: Owner only

GET /api/users/:id
  Returns: User profile + roles
  RLS: Owner or own user

POST /api/users/:id/roles
  Body: { role: 'manager' | 'staff' | 'kitchen' }
  Returns: Updated user
  RLS: Owner only (cannot demote another owner)

PATCH /api/users/:id/roles/:role
  Body: { }
  Action: Remove role
  RLS: Owner only

PATCH /api/users/:id
  Body: { displayName, phone, isActive }
  Returns: Updated profile
  RLS: Owner or own user

DELETE /api/users/:id
  Logic: Soft delete (set is_active = false)
  RLS: Owner only
```

### **Menu Items**

```
GET /api/menu
  Query: ?category=Coffee&available=true
  Returns: [ MenuItem ]
  RLS: All authenticated

GET /api/menu/:id
  Returns: MenuItem
  RLS: All authenticated

POST /api/menu
  Body: { name, description, category, price, cost, image_url }
  Returns: MenuItem
  RLS: Owner/Manager

PATCH /api/menu/:id
  Body: { partial MenuItem }
  Returns: Updated MenuItem
  RLS: Owner/Manager

DELETE /api/menu/:id
  Returns: { success }
  RLS: Owner only
```

### **Sales**

```
GET /api/sales
  Query: ?from=2026-03-01&to=2026-03-24&method=Cash
  Returns: [ SaleWithItems ]
  RLS: All authenticated

GET /api/sales/daily-summary
  Query: ?date=2026-03-24
  Returns: { totalSales, transactionCount, paymentBreakdown, topItems }
  RLS: All authenticated

GET /api/sales/:id
  Returns: SaleWithItems
  RLS: All authenticated

POST /api/sales
  Body: { orderItems: [{ menuItemId, qty, notes }], paymentMethod, customerType, ... }
  Returns: SaleWithItems (newly created)
  RLS: Staff+

PATCH /api/sales/:id
  Body: { discount, notes }
  Returns: Updated Sale
  RLS: Owner/Manager
```

### **Sale Items**

```
POST /api/sales/:saleId/items
  [Used internally during sale creation]

GET /api/sales/:saleId/items
  Returns: [ SaleItem ]
  RLS: All authenticated
```

### **Expenses**

```
GET /api/expenses
  Query: ?category=Ingredients&approved=true&from=2026-03-01
  Returns: [ Expense ]
  RLS: All authenticated

POST /api/expenses
  Body: { category, amount, description, receiptUrl }
  Returns: Expense
  RLS: Staff+ (auto-set created_by)

PATCH /api/expenses/:id/approve
  Body: { }
  Returns: Approved Expense
  RLS: Manager+ only

PATCH /api/expenses/:id
  Body: { partial Expense }
  Returns: Updated Expense
  RLS: Owner/created_by

DELETE /api/expenses/:id
  RLS: Owner/created_by (if not approved)
```

### **Inventory**

```
GET /api/inventory
  Query: ?lowStock=true
  Returns: [ InventoryItem ]
  RLS: All authenticated

POST /api/inventory
  Body: { itemName, quantity, unit, reorderLevel }
  Returns: InventoryItem
  RLS: Manager+

PATCH /api/inventory/:id
  Body: { quantity, reorderLevel }
  Returns: Updated InventoryItem
  RLS: Manager+
```

### **Analytics** (Reports)

```
GET /api/analytics/sales-summary
  Query: ?from=2026-03-01&to=2026-03-24&groupBy=daily|hourly
  Returns: [ { date, revenue, transactions, avgOrderValue } ]
  RLS: Manager+

GET /api/analytics/payment-breakdown
  Query: ?from=2026-03-01&to=2026-03-24
  Returns: { Cash: 1000, MoMo: 2500, Card: 1200 }
  RLS: Manager+

GET /api/analytics/top-items
  Query: ?from=2026-03-01&limit=10
  Returns: [ { itemName, qty, revenue } ]
  RLS: Manager+

GET /api/analytics/expense-summary
  Query: ?from=2026-03-01&groupBy=category
  Returns: [ { category, total, count } ]
  RLS: Manager+

GET /api/analytics/profit-margin
  Query: ?from=2026-03-01&to=2026-03-24
  Returns: { totalRevenue, totalCost, grossProfit, margin% }
  RLS: Owner only
```

### **Activity Logs** (Owner-only)

```
GET /api/logs
  Query: ?userId=uuid&action=sale-created&from=2026-03-01
  Returns: [ ActivityLog ]
  RLS: Owner only
```

---

## Implementation Stack

### Frontend (Current)
- **Framework**: React 18 + TypeScript
- **Routing**: React Router v6
- **State**: Supabase hooks + React Query
- **UI**: Shadcn/ui + Tailwind CSS
- **Real-time**: Supabase realtime subscriptions
- **PWA**: vite-plugin-pwa

### Backend (Recommended)

#### **Option 1: Edge Functions (Recommended for PWA + Supabase)**
- **Runtime**: Supabase Edge Functions (Deno)
- **Pros**: 
  - No server management
  - Cold start optimization
  - Direct database access via service role
  - Real-time ready
  
#### **Option 2: Node.js + Express**
- **Runtime**: Node.js 18+
- **Framework**: Express.js or Fastify
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Railway, Render, Fly.io, AWS Lambda

#### **Option 3: Fully PostgreSQL-driven (Recommended)**
- Use **Supabase PostgREST** directly from frontend
- Implement **RLS policies** in PostgreSQL
- Use **Edge Functions** for complex logic only

### Our Recommendation: **Hybrid Approach**

```
Frontend (React)
    ↓
Direct to Supabase REST API (for reads/simple writes)
    ↓
PostgreSQL (RLS-protected)
    
Complex Business Logic
    ↓
Supabase Edge Functions (only when needed)
    ↓
PostgreSQL using service role key
```

---

## Security Considerations

### 1. **Owner Email Validation**
```sql
-- REQUIRED: Populate this before any signups
INSERT INTO allowed_owners (email) 
VALUES ('owner1@example.com'), ('owner2@example.com');

-- This prevents anyone else from becoming an owner
```

### 2. **Row-Level Security (RLS)**
All tables have RLS enabled. Policies enforce:
- Users can only see/modify their own data (unless owner)
- Staff can only see public data (menu, sales, expenses)
- Kitchen staff has minimal permissions
- Owners can see everything

### 3. **Sensitive Data**
```
Never expose in frontend:
  - cost_price (only revenue matters to staff)
  - expense approvals workflow
  - staff salary data
  - audit logs
```

### 4. **API Security**
```
// Always validate these on backend:
- User role before allowing operations
- Request origin (CORS)
- Rate limiting per user
- SQL injection (use parameterized queries)
- CSRF tokens for sensitive operations
```

### 5. **Payment Data**
- ✅ Store payment method, not card details
- ✅ Use PCI-compliant payment gateway (Stripe, Paystack)
- ✅ Never log sensitive payment info

### 6. **Audit Trail**
```
Log actions:
- User login/logout
- Data modifications
- Role changes
- Expense approvals
- Failed auth attempts
```

---

## Deployment

### **Database Setup**

1. **Replace owner emails** in the migration file:
```sql
-- Line ~20
INSERT INTO public.allowed_owners (email, full_name)
VALUES 
  ('your-email@purpleraincoffee.com', 'Your Name'),
  ('other-owner@purpleraincoffee.com', 'Other Owner Name')
```

2. **Deploy migration**:
```bash
# Using Supabase CLI
supabase db push
```

### **Frontend Deployment**

```bash
# Build
npm run build

# Deploy to Vercel
vercel

# Or use Netlify
netlify deploy --prod --dir=dist
```

### **Backend Deployment** (if needed)

**Option A: Supabase Edge Functions**
```bash
supabase functions deploy get-daily-summary
supabase functions deploy approve-expense
```

**Option B: Node.js Server**
```bash
# Railway.app deployment
railway up

# Or Render.com deployment
render deploy
```

---

## Migration Path

### Phase 1: Current State ✅
- Supabase setup
- Basic schema (menu, sales, expenses)
- User auth

### Phase 2: Enhanced Schema (Your Migration File) 🔄
- Add `allowed_owners` table
- Add owner validation logic
- Add `user_roles` table
- Add audit logging
- Add inventory tracking

### Phase 3: Backend API
- Supabase Edge Functions for complex queries
- Analytics endpoints
- Batch operations

### Phase 4: Mobile App
- React Native or Flutter app
- Offline sync
- Camera for receipts

---

## Key Files to Update

1. **Frontend - Auth Hook** (`src/hooks/useAuth.ts`)
   - Add validation: Check if required fields exist before signup
   - Show message: "Only authorized owners can become owners"

2. **Frontend - Role-based Components**
   - Conditionally render based on `selectedRole`
   - Show warning if trying to create non-owner account

3. **Supabase RLS Policies**
   - Run the migration file to create all policies

4. **Environment Variables**
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_xxxxx
   VITE_SUPABASE_SERVICE_KEY=eyJxxx (backend only!)
   ```

---

## Testing Checklist

- [ ] Owner email can register as owner
- [ ] Non-owner email registers as staff
- [ ] Staff cannot access owner-only endpoints
- [ ] Owner can promote staff to manager
- [ ] Sales create correctly with waiter_id
- [ ] Expenses require approval workflow
- [ ] Menu items visible to all authenticated users
- [ ] Activity logs only visible to owner
- [ ] Real-time updates work for sales/menu changes
- [ ] Offline mode caches correctly

---

## Support & Troubleshooting

**Q: User tries to signup as owner but gets "staff" role?**
A: Add their email to `allowed_owners` table first

**Q: How to promote existing user to manager?**
```sql
INSERT INTO user_roles (user_id, role, assigned_by)
VALUES ('user-uuid', 'manager', 'owner-uuid');
```

**Q: Sales not appearing in real-time?**
A: Check Supabase real-time subscription in `src/hooks/useSupabase.ts`

**Q: RLS policies blocking reads?**
A: Ensure user has authenticated session. Check policies are PERMISSIVE, not RESTRICTIVE.

---

**Last Updated**: March 24, 2026
**Created For**: Purple Rain Coffee POS System
