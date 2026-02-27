import { useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag, ChefHat, BarChart3, BookOpen, Receipt } from "lucide-react";

const tabs = [
  { path: "/", label: "Sales", icon: ShoppingBag },
  { path: "/kitchen", label: "Kitchen", icon: ChefHat },
  { path: "/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/menu", label: "Menu", icon: BookOpen },
  { path: "/expenses", label: "Expenses", icon: Receipt },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-border/40 px-2 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-0.5 py-2.5 px-3 rounded-xl transition-all duration-200 ${
                active
                  ? "text-accent"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon size={22} strokeWidth={active ? 2.2 : 1.8} />
              <span className={`text-[10px] font-medium ${active ? "font-semibold" : ""}`}>
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
