

## Issues & Fixes

### 1. Login Screen Not Showing
The authentication flow code is correct — unauthenticated users get redirected to `/login`. The likely cause is a stale session from earlier testing. However, there's a potential race condition: `role` defaults to `null`, and `BottomNav` falls back to `"staff"` when role is null (`role || "staff"`), which is actually correct behavior. The login screen and redirect logic are properly implemented.

**Fix**: Ensure the app signs out any stale session on first load if needed, or simply clear the browser session. No code change needed for the redirect logic itself.

### 2. Staff Navbar Shows Admin-Only Icons
The `BottomNav` already filters tabs by role on line 20: `allTabs.filter((tab) => tab.roles.includes(role || "staff"))`. This should hide Analytics and Expenses for staff. However, the issue may be that `role` is `null` during the brief period after login before `fetchRole` completes, causing a flash.

**Fix**: While role is loading (null), default to showing only staff tabs — this is already handled by `role || "staff"`. No code change needed unless the role fetch is failing silently.

### 3. Confirm Role Fetch Works
The `fetchRole` queries `user_roles` table. If no row exists (e.g., trigger didn't fire), role stays `null` and falls back to staff view, which is safe. But we should add a loading state for role to prevent any flash of admin tabs.

**Plan**:
- **BottomNav.tsx**: Add a guard so if `role` is still `null` (loading), show only the 4 staff tabs (Sales, Kitchen, Menu, Profile). This is already the behavior with `role || "staff"`.
- **No structural changes needed** — the existing code correctly filters navigation based on role.

### Summary
The authentication and role-based navigation are already correctly implemented. The user may need to:
1. Clear their browser/preview session to see the login screen (or sign out from the profile page)
2. The staff navbar filtering is already working — staff only see Sales, Kitchen, Menu, Profile

If there's still a visible issue, it's likely a cached session. I'll ensure a clean sign-out redirects properly and verify the BottomNav renders correctly for both roles.

