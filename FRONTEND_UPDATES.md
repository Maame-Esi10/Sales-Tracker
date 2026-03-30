# 🛠️ Frontend Updates Required After Migration

After running the corrected migration, you need to make **3 small changes** to your frontend code.

---

## Change 1: Update AppRole Type in `useAuth.ts`

**File**: `src/hooks/useAuth.ts`

Find this section:
```typescript
export type AppRole = "admin" | "staff";
```

Replace with:
```typescript
export type AppRole = "owner" | "manager" | "staff" | "kitchen";
```

---

Also in the same file, find every instance of:
```typescript
const isAdmin = role === "admin";
```

Replace with:
```typescript
const isOwner = role === "owner";
```

**Why?** Your new roles are `owner/manager/staff/kitchen`, not `admin/staff`.

---

## Change 2: Replace types.ts

**File**: `src/integrations/supabase/types.ts`

**Option A: Quick Replace**
```bash
# Copy the corrected version
cp src/integrations/supabase/types_corrected.ts src/integrations/supabase/types.ts
```

**Option B: Manual Update**
1. Delete the entire content of `src/integrations/supabase/types.ts`
2. Copy the entire content from `src/integrations/supabase/types_corrected.ts`
3. Paste into `types.ts`
4. Save

**Why?** The types now match your corrected migration schema.

---

## Change 3: Update isAdmin Checks Throughout App

Search for all instances of `isAdmin` and change to `isOwner`:

### ProfilePage.tsx
Find:
```typescript
if (!isAdmin) return <div>Access Denied</div>;
```

Replace with:
```typescript
if (!isOwner) return <div>Access Denied</div>;
```

### MenuPage.tsx
Find:
```typescript
const canDelete = isAdmin;
```

Replace with:
```typescript
const canDelete = isOwner;
```

**Search Command** (to find all instances):
```bash
# In VS Code terminal or command line
grep -r "isAdmin" src/
```

Then replace each occurrence with `isOwner`.

---

## Verification Checklist

After making all changes, verify:

- [ ] `useAuth.ts` has `AppRole = "owner" | "manager" | "staff" | "kitchen"`
- [ ] `types.ts` is updated with new schema
- [ ] No `isAdmin` references remain in the code
- [ ] Migration deployed to Supabase
- [ ] App compiles without TypeScript errors
- [ ] Can sign up and get correct role ✅
- [ ] Can create sales ✅
- [ ] Can add menu items ✅
- [ ] Can add expenses ✅

---

## Common Errors After Migration

### Error: "Cannot read property 'admin' of undefined"
**Cause**: `isAdmin` variable doesn't exist
**Solution**: Rename to `isOwner` everywhere

### Error: "Column method does not exist"
**Cause**: Using old `payment_method` in code
**Solution**: Migration changed it to `method` — no frontend code changes needed (already correct)

### Error: "Type 'AppRole' does not assign to type 'admin' | 'staff'"
**Cause**: Old types.ts still loaded in TypeScript cache
**Solution**: 
```bash
# Clear TypeScript cache
rm -rf node_modules/.vite
npm run dev
```

### Staff dropdown shows nothing
**Cause**: `staff` table is new and empty
**Solution**: Add staff via the menu (call `addStaff()` with a name)

---

## Test After Updates

Run the app after making changes:

```bash
npm run dev
```

**Test Signup Flow:**
1. Sign up with owner email (e.g., `owner@purpleraincoffee.com`)
   - Should get `owner` role ✅
   - Should see admin features ✅

2. Sign up with regular email (e.g., `staff@example.com`)
   - Should get `staff` role ✅
   - Should NOT see admin features ✅

---

Done! 🎉 Your app is now ready with the corrected migration.
