import { useState } from "react";
import { Plus, X, Fuel, Zap, ShoppingCart, Users, Trash2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { useExpenses } from "@/hooks/useSupabase";
import type { ExpenseRow } from "@/hooks/useSupabase";
import { startOfDay, startOfWeek as dateFnsStartOfWeek, startOfMonth, isAfter, isEqual } from "date-fns";

const categoryIcons: Record<string, React.ReactNode> = {
  Gas: <Fuel size={16} />,
  Electricity: <Zap size={16} />,
  Ingredients: <ShoppingCart size={16} />,
  "Staff Wages": <Users size={16} />,
};

const filterByPeriod = (items: ExpenseRow[], period: string): ExpenseRow[] => {
  if (period === "All Time") return items;
  const now = new Date();
  let cutoff: Date;
  if (period === "Today") {
    cutoff = startOfDay(now);
  } else if (period === "Week") {
    cutoff = dateFnsStartOfWeek(now, { weekStartsOn: 1 });
  } else {
    cutoff = startOfMonth(now);
  }
  return items.filter((item) => {
    const d = new Date(item.created_at);
    return isAfter(d, cutoff) || isEqual(d, cutoff);
  });
};

const ExpensesPage = () => {
  const { expenses, addExpense } = useExpenses();
  const [showAdd, setShowAdd] = useState(false);
  const [period, setPeriod] = useState("All Time");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [newExpense, setNewExpense] = useState({ category: "Ingredients", item: "", qty: "", unitPrice: "", note: "" });

  const filtered = filterByPeriod(expenses, period);
  const totalExpenses = filtered.reduce((s, e) => s + Number(e.amount), 0);

  const categoryTotals = filtered.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
    return acc;
  }, {});

  const handleAdd = async () => {
    const qty = Number(newExpense.qty) || 1;
    const unitPrice = Number(newExpense.unitPrice);
    if (!unitPrice) return;
    const totalAmount = qty * unitPrice;
    const note = newExpense.item ? `${newExpense.item} (${qty} × ₵${unitPrice})` : newExpense.note;
    await addExpense({ category: newExpense.category, amount: totalAmount, note });
    setNewExpense({ category: "Ingredients", item: "", qty: "", unitPrice: "", note: "" });
    setShowAdd(false);
  };

  const calculatedTotal = (Number(newExpense.qty) || 1) * (Number(newExpense.unitPrice) || 0);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div className="min-h-screen pb-24">
      <PageHeader
        title="Expenses"
        action={
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-soft">
            <Plus size={16} /> Add Expense
          </button>
        }
      />

      {showAdd && (
        <div className="px-4 mb-4 animate-slide-up">
          <div className="glass shadow-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold">New Expense</span>
              <button onClick={() => setShowAdd(false)}><X size={18} className="text-muted-foreground" /></button>
            </div>
            <div className="space-y-2">
              <select value={newExpense.category} onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-secondary text-sm outline-none">
                {Object.keys(categoryIcons).map((c) => <option key={c}>{c}</option>)}
              </select>
              <input placeholder="Item name (e.g. Rice)" value={newExpense.item} onChange={(e) => setNewExpense({ ...newExpense, item: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-secondary text-sm outline-none focus:ring-2 focus:ring-accent/30" />
              <div className="flex gap-2">
                <input placeholder="Qty (e.g. 1kg)" value={newExpense.qty} onChange={(e) => setNewExpense({ ...newExpense, qty: e.target.value })} className="flex-1 px-3 py-2.5 rounded-lg bg-secondary text-sm outline-none focus:ring-2 focus:ring-accent/30" />
                <input placeholder="Unit Price (₵)" type="number" value={newExpense.unitPrice} onChange={(e) => setNewExpense({ ...newExpense, unitPrice: e.target.value })} className="flex-1 px-3 py-2.5 rounded-lg bg-secondary text-sm outline-none focus:ring-2 focus:ring-accent/30" />
              </div>
              <input placeholder="Note (optional)" value={newExpense.note} onChange={(e) => setNewExpense({ ...newExpense, note: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-secondary text-sm outline-none focus:ring-2 focus:ring-accent/30" />
              {calculatedTotal > 0 && (
                <div className="flex justify-between items-center px-1 py-2 text-sm">
                  <span className="text-muted-foreground">Total Amount:</span>
                  <span className="font-bold text-destructive">₵{calculatedTotal.toFixed(2)}</span>
                </div>
              )}
              <button onClick={handleAdd} className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">Save Expense</button>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 mb-3 flex gap-2">
        {["Today", "Week", "Month", "All Time"].map((p) => (
          <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${period === p ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
            {p}
          </button>
        ))}
      </div>

      <div className="px-4 mb-4">
        <div className="glass shadow-soft rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{period} Expenses</div>
            <div className="text-2xl font-bold text-display mt-1">₵{totalExpenses.toFixed(2)}</div>
          </div>
          <div className="text-xs text-muted-foreground">{filtered.length} entries</div>
        </div>
      </div>

      <div className="px-4 mb-4">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Expense Breakdown</h2>
        <div className="glass shadow-soft rounded-xl p-4 space-y-3">
          {Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).map(([cat, amount]) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              className={`w-full flex items-center justify-between p-2 rounded-lg transition-all ${selectedCategory === cat ? "bg-secondary" : "hover:bg-secondary/50"}`}
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-accent">
                  {categoryIcons[cat] || <ShoppingCart size={14} />}
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-semibold">{cat}</div>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden mt-1">
                    <div className="h-full rounded-full bg-destructive/70" style={{ width: `${totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>
              <div className="text-right ml-3">
                <span className="text-sm font-bold text-destructive">₵{amount.toFixed(2)}</span>
                <div className="text-[10px] text-muted-foreground">{totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(0) : 0}%</div>
              </div>
            </button>
          ))}
          {Object.keys(categoryTotals).length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-2">No expenses for this period</p>
          )}
        </div>
      </div>

      {selectedCategory && (
        <div className="px-4 mb-4 animate-slide-up">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{selectedCategory} — {period}</h2>
            <button onClick={() => setSelectedCategory(null)} className="text-xs text-accent font-medium">Hide</button>
          </div>
          <div className="space-y-2">
            {filtered.filter((e) => e.category === selectedCategory).map((exp) => (
              <div key={exp.id} className="glass shadow-soft rounded-xl p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-accent">
                  {categoryIcons[exp.category] || <ShoppingCart size={14} />}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{exp.note || exp.category}</div>
                  <div className="text-xs text-muted-foreground">{formatDate(exp.created_at)}</div>
                </div>
                <span className="text-sm font-bold text-destructive">-₵{Number(exp.amount).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}


      <div className="px-4 space-y-2">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">All Expenses</h2>
        {filtered.map((exp, i) => (
          <div key={exp.id} className="glass shadow-soft rounded-xl p-4 flex items-center gap-3 animate-slide-up" style={{ animationDelay: `${i * 40}ms` }}>
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-accent">
              {categoryIcons[exp.category]}
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">{exp.category}</div>
              <div className="text-xs text-muted-foreground">{exp.note} · {formatDate(exp.created_at)}</div>
            </div>
            <span className="text-base font-bold text-destructive">-₵{Number(exp.amount).toFixed(2)}</span>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No expenses for this period</p>
        )}
      </div>
    </div>
  );
};

export default ExpensesPage;
