import { useLocation, useNavigate } from "react-router-dom";
import { Store, Flame, PieChart, UtensilsCrossed, Wallet, CircleUserRound } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

const allTabs = [
  { path: "/", label: "Sales", icon: ShoppingBag, roles: ["admin", "staff"] },
  { path: "/kitchen", label: "Kitchen", icon: ChefHat, roles: ["admin", "staff"] },
  { path: "/analytics", label: "Analytics", icon: BarChart3, roles: ["admin"] },
  { path: "/menu", label: "Menu", icon: BookOpen, roles: ["admin", "staff"] },
  { path: "/expenses", label: "Expenses", icon: Receipt, roles: ["admin"] },
  { path: "/profile", label: "Profile", icon: UserCircle, roles: ["admin", "staff"] },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { role } = useAuth();

  const tabs = allTabs.filter((tab) => tab.roles.includes(role || "staff"));

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/30 px-2 pb-[env(safe-area-inset-bottom)]" style={{ background: "hsl(var(--card) / 0.92)", backdropFilter: "blur(20px) saturate(1.5)" }}>
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="relative flex flex-col items-center gap-0.5 py-2.5 px-3 transition-all duration-200"
            >
              {active && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-px left-2 right-2 h-[2px] rounded-full"
                  style={{ background: "linear-gradient(90deg, hsl(var(--accent)), hsl(270 60% 60%))" }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <tab.icon
                size={22}
                strokeWidth={active ? 2.2 : 1.8}
                className={active ? "text-accent" : "text-muted-foreground"}
              />
              <span className={`text-[10px] font-medium ${active ? "text-accent font-semibold" : "text-muted-foreground"}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
