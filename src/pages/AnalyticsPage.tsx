import { useState } from "react";
import { TrendingUp, ShoppingBag, Receipt, DollarSign } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import MetricCard from "@/components/MetricCard";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, Tooltip, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { useSales, useExpenses } from "@/hooks/useStore";
import { SHOP_NAME } from "@/data/store";

const COLORS = ["hsl(30 55% 50%)", "hsl(25 40% 22%)", "hsl(145 50% 42%)", "hsl(38 90% 55%)", "hsl(0 65% 52%)"];

const salesData = [
  { day: "Mon", sales: 320 },
  { day: "Tue", sales: 480 },
  { day: "Wed", sales: 390 },
  { day: "Thu", sales: 520 },
  { day: "Fri", sales: 610 },
  { day: "Sat", sales: 750 },
  { day: "Sun", sales: 430 },
];

const AnalyticsPage = () => {
  const [period, setPeriod] = useState("Week");
  const sales = useSales();
  const expenses = useExpenses();

  const totalSales = sales.reduce((s, sale) => s + sale.total, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = totalSales - totalExpenses;
  const orderCount = sales.length;

  // Top selling items
  const itemCounts: Record<string, number> = {};
  const itemRevenue: Record<string, number> = {};
  sales.forEach((sale) => {
    sale.items.forEach((item) => {
      itemCounts[item.name] = (itemCounts[item.name] || 0) + item.qty;
      itemRevenue[item.name] = (itemRevenue[item.name] || 0) + item.price * item.qty;
    });
  });
  const topItems = Object.entries(itemCounts)
    .map(([name, sold]) => ({ name, sold, revenue: itemRevenue[name] || 0 }))
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5);

  // Payment method breakdown
  const methodCounts: Record<string, number> = {};
  sales.forEach((s) => { methodCounts[s.method] = (methodCounts[s.method] || 0) + 1; });
  const paymentData = Object.entries(methodCounts).map(([name, value]) => ({ name, value }));

  // Expense breakdown
  const expCats: Record<string, number> = {};
  expenses.forEach((e) => { expCats[e.category] = (expCats[e.category] || 0) + e.amount; });
  const expenseBreakdown = Object.entries(expCats).sort((a, b) => b[1] - a[1]);

  // Waiter performance
  const waiterSales: Record<string, { count: number; total: number }> = {};
  sales.forEach((s) => {
    if (s.waiter) {
      if (!waiterSales[s.waiter]) waiterSales[s.waiter] = { count: 0, total: 0 };
      waiterSales[s.waiter].count++;
      waiterSales[s.waiter].total += s.total;
    }
  });

  return (
    <div className="min-h-screen pb-24">
      <PageHeader title="Analytics" />

      <div className="px-4 mb-1">
        <p className="text-xs text-muted-foreground">{SHOP_NAME}</p>
      </div>

      <div className="px-4 mb-4 flex gap-2">
        {["Today", "Week", "Month", "All Time"].map((p) => (
          <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${period === p ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
            {p}
          </button>
        ))}
      </div>

      <div className="px-4 grid grid-cols-2 gap-2 mb-6">
        <MetricCard label="Total Sales" value={`₵${totalSales.toFixed(0)}`} icon={<DollarSign size={18} />} trend="+12.5%" trendUp />
        <MetricCard label="Orders" value={String(orderCount)} icon={<ShoppingBag size={18} />} trend="+8%" trendUp />
        <MetricCard label="Expenses" value={`₵${totalExpenses.toFixed(0)}`} icon={<Receipt size={18} />} trend="+3%" trendUp={false} />
        <MetricCard label="Net Profit" value={`₵${netProfit.toFixed(0)}`} icon={<TrendingUp size={18} />} trend={netProfit > 0 ? "+18%" : "-"} trendUp={netProfit > 0} />
      </div>

      {/* Sales Trend */}
      <div className="px-4 mb-6">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Sales Trend</h2>
        <div className="glass shadow-soft rounded-xl p-4">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(30 15% 89%)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(25 10% 48%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(25 10% 48%)" }} axisLine={false} tickLine={false} width={35} />
              <Tooltip contentStyle={{ background: "hsl(30 20% 99%)", border: "1px solid hsl(30 15% 89%)", borderRadius: "12px", fontSize: "12px" }} />
              <Line type="monotone" dataKey="sales" stroke="hsl(30 55% 50%)" strokeWidth={2.5} dot={{ fill: "hsl(30 55% 50%)", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Selling Items */}
      <div className="px-4 mb-6">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Top Selling Items</h2>
        <div className="glass shadow-soft rounded-xl p-4">
          {topItems.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={topItems} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(25 10% 48%)" }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "hsl(25 10% 48%)" }} axisLine={false} tickLine={false} width={70} />
                  <Bar dataKey="sold" fill="hsl(25 40% 22%)" radius={[0, 6, 6, 0]} barSize={16} />
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

      {/* Payment Breakdown */}
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

      {/* Expense Breakdown */}
      <div className="px-4 mb-6">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Expense Breakdown</h2>
        <div className="glass shadow-soft rounded-xl p-4 space-y-2">
          {expenseBreakdown.map(([cat, amount]) => (
            <div key={cat} className="flex justify-between items-center">
              <span className="text-sm">{cat}</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full bg-destructive/70" style={{ width: `${(amount / totalExpenses) * 100}%` }} />
                </div>
                <span className="text-sm font-semibold text-destructive w-20 text-right">₵{amount.toFixed(0)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Waiter Performance */}
      <div className="px-4 mb-6">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Staff Performance</h2>
        <div className="glass shadow-soft rounded-xl divide-y divide-border">
          {Object.entries(waiterSales).sort((a, b) => b[1].total - a[1].total).map(([name, data]) => (
            <div key={name} className="flex items-center justify-between p-3">
              <div>
                <div className="text-sm font-semibold">{name}</div>
                <div className="text-xs text-muted-foreground">{data.count} orders</div>
              </div>
              <span className="text-sm font-bold text-accent">₵{data.total.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="px-4 grid grid-cols-2 gap-2">
        <div className="glass shadow-soft rounded-xl p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Avg Order</div>
          <div className="text-lg font-bold">₵{orderCount > 0 ? (totalSales / orderCount).toFixed(2) : "0.00"}</div>
        </div>
        <div className="glass shadow-soft rounded-xl p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Top Item</div>
          <div className="text-lg font-bold">{topItems[0]?.name || "—"}</div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
