import { useState } from "react";
import { TrendingUp, ShoppingBag, Receipt, DollarSign, BarChart3 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import MetricCard from "@/components/MetricCard";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, Tooltip, CartesianGrid } from "recharts";

const salesData = [
  { day: "Mon", sales: 320 },
  { day: "Tue", sales: 480 },
  { day: "Wed", sales: 390 },
  { day: "Thu", sales: 520 },
  { day: "Fri", sales: 610 },
  { day: "Sat", sales: 750 },
  { day: "Sun", sales: 430 },
];

const topItems = [
  { name: "Latte", sold: 48 },
  { name: "Jollof", sold: 35 },
  { name: "Cappuccino", sold: 30 },
  { name: "Meat Pie", sold: 22 },
  { name: "Espresso", sold: 18 },
];

const AnalyticsPage = () => {
  const [period, setPeriod] = useState("Week");

  return (
    <div className="min-h-screen pb-24">
      <PageHeader title="Analytics" />

      <div className="px-4 mb-4 flex gap-2">
        {["Today", "Week", "Month", "All Time"].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              period === p ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="px-4 grid grid-cols-2 gap-2 mb-6">
        <MetricCard label="Total Sales" value="₵3,500" icon={<DollarSign size={18} />} trend="+12.5%" trendUp />
        <MetricCard label="Orders" value="142" icon={<ShoppingBag size={18} />} trend="+8%" trendUp />
        <MetricCard label="Expenses" value="₵1,200" icon={<Receipt size={18} />} trend="+3%" trendUp={false} />
        <MetricCard label="Net Profit" value="₵2,300" icon={<TrendingUp size={18} />} trend="+18%" trendUp />
      </div>

      <div className="px-4 mb-6">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Sales Trend</h2>
        <div className="glass shadow-soft rounded-xl p-4">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(30 15% 89%)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(25 10% 48%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(25 10% 48%)" }} axisLine={false} tickLine={false} width={35} />
              <Tooltip
                contentStyle={{
                  background: "hsl(30 20% 99%)",
                  border: "1px solid hsl(30 15% 89%)",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <Line type="monotone" dataKey="sales" stroke="hsl(30 55% 50%)" strokeWidth={2.5} dot={{ fill: "hsl(30 55% 50%)", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="px-4 mb-6">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Top Selling Items</h2>
        <div className="glass shadow-soft rounded-xl p-4">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={topItems} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(25 10% 48%)" }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "hsl(25 10% 48%)" }} axisLine={false} tickLine={false} width={70} />
              <Bar dataKey="sold" fill="hsl(25 40% 22%)" radius={[0, 6, 6, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="px-4 grid grid-cols-2 gap-2">
        <div className="glass shadow-soft rounded-xl p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Avg Order</div>
          <div className="text-lg font-bold">₵24.65</div>
        </div>
        <div className="glass shadow-soft rounded-xl p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Top Profit</div>
          <div className="text-lg font-bold">Latte</div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
