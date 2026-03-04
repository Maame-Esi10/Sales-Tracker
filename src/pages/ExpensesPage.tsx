import { useState } from "react";
import { Plus, X, Fuel, Zap, ShoppingCart, Users, ChevronDown, ChevronUp } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { useExpenses } from "@/hooks/useStore";
import { setExpenses } from "@/data/store";

const categoryIcons: Record<string, React.ReactNode> = {
  Gas: <Fuel size={16} />,
  Electricity: <Zap size={16} />,
  Ingredients: <ShoppingCart size={16} />,
  "Staff Wages": <Users size={16} />,
};

const ExpensesPage = () => {
  const expenses = useExpenses();
  const [showAdd, setShowAdd] = useState(false);
  const [showTally, setShowTally] = useState(false);
  const [newExpense, setNewExpense] = useState({ category: "Ingredients", amount: "", note: "" });

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  // Category tallies
  const categoryTotals = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const handleAdd = () => {
    if (!newExpense.amount) return;
    setExpenses([
      { id: Date.now(), category: newExpense.category, amount: Number(newExpense.amount), date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }), note: newExpense.note },
      ...expenses,
    ]);
    setNewExpense({ category: "Ingredients", amount: "", note: "" });
    setShowAdd(false);
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

      <div className="px-4 mb-4">
        <div className="glass shadow-soft rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Total Expenses</div>
            <div className="text-2xl font-bold text-display mt-1">₵{totalExpenses.toFixed(2)}</div>
          </div>
          <div className="text-xs text-muted-foreground">This month</div>
        </div>
      </div>

      {/* Category Tally */}
      <div className="px-4 mb-4">
        <button onClick={() => setShowTally(!showTally)} className="w-full glass shadow-soft rounded-xl p-4 flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Category Breakdown</span>
          {showTally ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
        </button>
        {showTally && (
          <div className="mt-2 space-y-2 animate-slide-up">
            {Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).map(([cat, amount]) => (
              <div key={cat} className="glass shadow-soft rounded-xl p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-accent">
                  {categoryIcons[cat] || <ShoppingCart size={16} />}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{cat}</div>
                  <div className="text-xs text-muted-foreground">{expenses.filter((e) => e.category === cat).length} entries</div>
                </div>
                <span className="text-base font-bold text-destructive">₵{amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

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
              <input placeholder="Amount (₵)" type="number" value={newExpense.amount} onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-secondary text-sm outline-none focus:ring-2 focus:ring-accent/30" />
              <input placeholder="Note (optional)" value={newExpense.note} onChange={(e) => setNewExpense({ ...newExpense, note: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-secondary text-sm outline-none focus:ring-2 focus:ring-accent/30" />
              <button onClick={handleAdd} className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">Save Expense</button>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 space-y-2">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">All Expenses</h2>
        {expenses.map((exp, i) => (
          <div key={exp.id} className="glass shadow-soft rounded-xl p-4 flex items-center gap-3 animate-slide-up" style={{ animationDelay: `${i * 40}ms` }}>
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-accent">
              {categoryIcons[exp.category]}
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">{exp.category}</div>
              <div className="text-xs text-muted-foreground">{exp.note} · {exp.date}</div>
            </div>
            <span className="text-base font-bold text-destructive">-₵{exp.amount.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpensesPage;
