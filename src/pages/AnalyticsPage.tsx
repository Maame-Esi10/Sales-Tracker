import { useState, useMemo } from "react";
import { TrendingUp, ShoppingBag, Receipt, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import MetricCard from "@/components/MetricCard";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, Tooltip, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { useSales } from "@/hooks/useSupabase";
import { startOfDay, startOfWeek, startOfMonth, isAfter, isEqual, format, subDays, eachDayOfInterval } from "date-fns";

const COLORS = ["hsl(270 55% 50%)", "hsl(38 75% 55%)", "hsl(145 50% 42%)", "hsl(0 65% 52%)", "hsl(200 60% 50%)"];

const AnalyticsPage = () => {
  const [period, setPeriod] = useState("All Time");
  const { sales } = useSales();

  const filteredSales = useMemo(() => {
    if (period === "All Time") return sales;
    const now = new Date();
    let cutoff: Date;
    if (period === "Today") {
      cutoff = startOfDay(now);
    } else if (period === "Week") {
      cutoff = startOfWeek(now, { weekStartsOn: 1 });
    } else {
      cutoff = startOfMonth(now);
    }
    return sales.filter((s) => {
      const d = new Date(s.created_at);
      return isAfter(d, cutoff) || isEqual(d, cutoff);
    });
  }, [sales, period]);

  const totalSales = filteredSales.reduce((s, sale) => s + Number(sale.total), 0);
  const orderCount = filteredSales.length;

  const itemCounts: Record<string, number> = {};
  const itemRevenue: Record<string, number> = {};
  filteredSales.forEach((sale) => {
    sale.items.forEach((item) => {
      itemCounts[item.name] = (itemCounts[item.name] || 0) + item.qty;
      itemRevenue[item.name] = (itemRevenue[item.name] || 0) + Number(item.price) * item.qty;
    });
  });
  const topItems = Object.entries(itemCounts)
    .map(([name, sold]) => ({ name, sold, revenue: itemRevenue[name] || 0 }))
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5);

  const methodCounts: Record<string, number> = {};
  filteredSales.forEach((s) => { methodCounts[s.method] = (methodCounts[s.method] || 0) + 1; });
  const paymentData = Object.entries(methodCounts).map(([name, value]) => ({ name, value }));

  const waiterSales: Record<string, { count: number; total: number; items: Record<string, number> }> = {};
  filteredSales.forEach((s) => {
    if (s.waiter) {
      if (!waiterSales[s.waiter]) waiterSales[s.waiter] = { count: 0, total: 0, items: {} };
      waiterSales[s.waiter].count++;
      waiterSales[s.waiter].total += Number(s.total);
      s.items.forEach((item) => {
        waiterSales[s.waiter!].items[item.name] = (waiterSales[s.waiter!].items[item.name] || 0) + item.qty;
      });
    }
  });

  const [expandedWaiter, setExpandedWaiter] = useState<string | null>(null);

  // Build sales trend from filtered data
  const salesData = useMemo(() => {
    const now = new Date();
    let days: Date[];
    if (period === "Today") {
      days = [startOfDay(now)];
    } else if (period === "Week") {
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      days = eachDayOfInterval({ start: weekStart, end: now });
    } else if (period === "Month") {
      const monthStart = startOfMonth(now);
      days = eachDayOfInterval({ start: monthStart, end: now });
    } else {
      // All Time: show last 7 days
      days = eachDayOfInterval({ start: subDays(now, 6), end: now });
    }

    return days.map((day) => {
      const dayStr = format(day, "EEE");
      const dayDate = format(day, "yyyy-MM-dd");
      const total = filteredSales
        .filter((s) => format(new Date(s.created_at), "yyyy-MM-dd") === dayDate)
        .reduce((sum, s) => sum + Number(s.total), 0);
      return { day: dayStr, sales: total };
    });
  }, [filteredSales, period]);

  return (
    <div className="min-h-screen pb-24">
      <PageHeader title="Analytics" />

      <div className="px-4 mb-4 flex gap-2">
        {["Today", "Week", "Month", "All Time"].map((p) => (
          <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${period === p ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
            {p}
          </button>
        ))}
      </div>

      <div className="px-4 grid grid-cols-2 gap-2 mb-6">
        <MetricCard label="Total Sales" value={`₵${totalSales.toFixed(0)}`} icon={<DollarSign size={18} />} gradient />
        <MetricCard label="Orders" value={String(orderCount)} icon={<ShoppingBag size={18} />} />
        <MetricCard label="Avg Order" value={`₵${orderCount > 0 ? (totalSales / orderCount).toFixed(0) : "0"}`} icon={<Receipt size={18} />} />
        <MetricCard label="Top Method" value={paymentData.length > 0 ? paymentData.sort((a, b) => b.value - a.value)[0].name : "—"} icon={<TrendingUp size={18} />} />
      </div>

      <div className="px-4 mb-6">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Sales Trend</h2>
        <div className="glass shadow-soft rounded-xl p-4">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(270 12% 89%)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(270 8% 48%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(270 8% 48%)" }} axisLine={false} tickLine={false} width={35} />
              <Tooltip contentStyle={{ background: "hsl(270 15% 99%)", border: "1px solid hsl(270 12% 89%)", borderRadius: "12px", fontSize: "12px" }} />
              <Line type="monotone" dataKey="sales" stroke="hsl(270 55% 50%)" strokeWidth={2.5} dot={{ fill: "hsl(270 55% 50%)", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="px-4 mb-6">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Top Selling Items</h2>
        <div className="glass shadow-soft rounded-xl p-4">
          {topItems.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={topItems} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(270 8% 48%)" }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "hsl(270 8% 48%)" }} axisLine={false} tickLine={false} width={70} />
                  <Bar dataKey="sold" fill="hsl(270 45% 30%)" radius={[0, 6, 6, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-1.5">
                {topItems.map((item) => (
                  <div key={item.name} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="font-semibold">₵{item.revenue.toFixed(2)} ({item.sold} sold)</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No sales data yet</p>
          )}
        </div>
      </div>

      <div className="px-4 mb-6">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Payment Methods</h2>
        <div className="glass shadow-soft rounded-xl p-4">
          {paymentData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie data={paymentData} dataKey="value" cx="50%" cy="50%" outerRadius={50} innerRadius={25}>
                    {paymentData.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {paymentData.map((p, idx) => (
                  <div key={p.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="flex-1">{p.name}</span>
                    <span className="font-semibold">{p.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>
          )}
        </div>
      </div>

      <div className="px-4 mb-6">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Staff Performance</h2>
        <div className="glass shadow-soft rounded-xl divide-y divide-border">
          {Object.entries(waiterSales).sort((a, b) => b[1].total - a[1].total).map(([name, data], i) => (
            <motion.div key={name} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground" style={{ background: `linear-gradient(135deg, ${COLORS[i % COLORS.length]}, ${COLORS[(i + 1) % COLORS.length]})` }}>
                  {name[0]}
                </div>
                <div>
                  <div className="text-sm font-semibold">{name}</div>
                  <div className="text-xs text-muted-foreground">{data.count} orders</div>
                </div>
              </div>
              <span className="text-sm font-bold text-accent">₵{data.total.toFixed(2)}</span>
            </motion.div>
          ))}
          {Object.keys(waiterSales).length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
