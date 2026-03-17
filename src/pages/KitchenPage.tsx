import { useState, useMemo } from "react";
import { ChefHat, Clock, Flame, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import PullToRefresh from "@/components/PullToRefresh";
import { useSales } from "@/hooks/useSupabase";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { startOfDay } from "date-fns";

interface KitchenItem {
  name: string;
  qty: number;
  status: "Pending" | "Preparing" | "Done";
}

const statusConfig: Record<string, { bg: string; icon: typeof Clock; label: string }> = {
  Pending: { bg: "bg-warning/15 text-warning-foreground", icon: Clock, label: "Pending" },
  Preparing: { bg: "bg-accent/15 text-accent", icon: Flame, label: "Preparing" },
  Done: { bg: "bg-success/15 text-success", icon: CheckCircle2, label: "Done" },
};

const filters = ["All", "Pending", "Preparing", "Done"] as const;

const KitchenPage = () => {
  const { sales, loading, refetch } = useSales();
  const [filter, setFilter] = useState<string>("All");
  const [statusOverrides, setStatusOverrides] = useState<Record<string, "Pending" | "Preparing" | "Done">>({});

  const { containerRef, pullDistance, refreshing } = usePullToRefresh({
    onRefresh: async () => { await refetch(); },
  });

  const items = useMemo(() => {
    const todayStart = startOfDay(new Date());
    const todaySales = sales.filter((s) => new Date(s.created_at) >= todayStart);

    const itemMap: Record<string, number> = {};
    todaySales.forEach((sale) => {
      sale.items.forEach((item) => {
        itemMap[item.name] = (itemMap[item.name] || 0) + item.qty;
      });
    });

    return Object.entries(itemMap).map(([name, qty]): KitchenItem => ({
      name,
      qty,
      status: statusOverrides[name] || "Pending",
    }));
  }, [sales, statusOverrides]);

  const cycleStatus = (name: string) => {
    setStatusOverrides((prev) => {
      const current = prev[name] || "Pending";
      const next = current === "Pending" ? "Preparing" : current === "Preparing" ? "Done" : "Pending";
      return { ...prev, [name]: next };
    });
  };

  const filtered = filter === "All" ? items : items.filter((i) => i.status === filter);

  // Group by status for "All" view
  const grouped = filtered.reduce((acc, item) => {
    if (!acc[item.status]) acc[item.status] = [];
    acc[item.status].push(item);
    return acc;
  }, {} as Record<string, KitchenItem[]>);

  const statusOrder = ["Pending", "Preparing", "Done"];
  const counts = { Pending: 0, Preparing: 0, Done: 0 };
  items.forEach((i) => counts[i.status]++);

  return (
    <PullToRefresh containerRef={containerRef} pullDistance={pullDistance} refreshing={refreshing}>
      <div className="pb-24">
        <PageHeader title="Kitchen" action={<ChefHat className="text-accent" size={24} />} />

        {/* Filter pills */}
        <div className="px-4 mb-5 flex gap-2 overflow-x-auto no-scrollbar">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filter === f
                  ? "gradient-purple text-primary-foreground shadow-sm"
                  : "bg-secondary/60 text-secondary-foreground hover:bg-secondary"
              }`}
            >
              {f}
              {f !== "All" && (
                <span className="ml-1.5 text-[10px] opacity-70">{counts[f as keyof typeof counts]}</span>
              )}
            </button>
          ))}
        </div>

        {/* Kitchen items */}
        <div className="px-4 space-y-6">
          {loading ? (
            <div className="text-center text-muted-foreground text-sm py-12">Loading orders...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">No items in this category</p>
            </div>
          ) : filter === "All" ? (
            statusOrder
              .filter((s) => grouped[s]?.length)
              .map((status) => (
                <div key={status}>
                  <div className="flex items-center gap-2 mb-3">
                    {(() => { const Icon = statusConfig[status].icon; return <Icon size={16} className="text-muted-foreground" />; })()}
                    <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{status}</h2>
                    <span className="text-[10px] text-muted-foreground/60 font-medium">{grouped[status].length}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {grouped[status].map((item, i) => (
                      <KitchenItemCard key={item.name} item={item} index={i} onCycle={cycleStatus} />
                    ))}
                  </div>
                </div>
              ))
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((item, i) => (
                <KitchenItemCard key={item.name} item={item} index={i} onCycle={cycleStatus} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PullToRefresh>
  );
};

const KitchenItemCard = ({ item, index, onCycle }: { item: KitchenItem; index: number; onCycle: (name: string) => void }) => {
  const config = statusConfig[item.status];
  const Icon = config.icon;

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={() => onCycle(item.name)}
      className="glass shadow-soft rounded-2xl p-4 flex flex-col justify-between text-left w-full group"
    >
      <div className="mb-3">
        <div className="text-sm font-bold leading-tight mb-1">{item.name}</div>
        <div className="text-xl font-bold text-accent" style={{ fontFamily: "'Playfair Display', serif" }}>
          ×{item.qty}
        </div>
      </div>
      <div className="space-y-2">
        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold w-fit ${config.bg}`}>
          <Icon size={12} />
          {config.label}
        </div>
        <p className="text-[10px] text-muted-foreground/60">Tap to update</p>
      </div>
    </motion.button>
  );
};

export default KitchenPage;
