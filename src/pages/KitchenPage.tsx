import { useState, useMemo } from "react";
import PageHeader from "@/components/PageHeader";
import { ChefHat } from "lucide-react";
import { useSales } from "@/hooks/useSupabase";
import { startOfDay } from "date-fns";

interface KitchenItem {
  name: string;
  qty: number;
  status: "Pending" | "Preparing" | "Done";
}

const statusColor: Record<string, string> = {
  Pending: "bg-warning/15 text-warning-foreground",
  Preparing: "bg-accent/15 text-accent",
  Done: "bg-success/15 text-success",
};

const KitchenPage = () => {
  const { sales, loading } = useSales();
  const [filter, setFilter] = useState<string>("All");
  const [statusOverrides, setStatusOverrides] = useState<Record<string, "Pending" | "Preparing" | "Done">>({});

  // Aggregate today's sale items into kitchen items
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

  return (
    <div className="min-h-screen pb-24">
      <PageHeader title="Kitchen" action={<ChefHat className="text-accent" size={24} />} />

      <div className="px-4 mb-4 flex gap-2">
        {["All", "Pending", "Preparing", "Done"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="px-4 space-y-2">
        {loading ? (
          <div className="text-center text-muted-foreground text-sm py-12">Loading orders...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-12">No items in this category</div>
        ) : (
          filtered.map((item, i) => (
            <button
              key={item.name}
              onClick={() => cycleStatus(item.name)}
              className="w-full glass shadow-soft rounded-xl p-4 flex items-center justify-between animate-slide-up text-left"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-lg font-bold text-accent">
                  {item.qty}
                </div>
                <div>
                  <div className="text-sm font-semibold">{item.name}</div>
                  <div className="text-xs text-muted-foreground">Tap to update status</div>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${statusColor[item.status]}`}>
                {item.status}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default KitchenPage;
