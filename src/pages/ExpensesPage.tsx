import { useState } from "react";
import { Plus, X, Fuel, Zap, ShoppingCart, Users, Trash2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { useExpenses } from "@/hooks/useSupabase";
import type { ExpenseRow } from "@/hooks/useSupabase";
import { startOfDay, startOfWeek as dateFnsStartOfWeek, startOfMonth, endOfDay, isAfter, isEqual, isBefore } from "date-fns";
import PeriodFilter from "@/components/PeriodFilter";

const categoryIcons: Record<string, React.ReactNode> = {
  Gas: <Fuel size={16} />,
  Electricity: <Zap size={16} />,
  Ingredients: <ShoppingCart size={16} />,
  "Staff Wages": <Users size={16} />,
};

const filterByPeriod = (items: ExpenseRow[], period: string, customDate?: Date): ExpenseRow[] => {
  if (period === "Custom" && customDate) {
    const dayStart = startOfDay(customDate);
    const dayEnd = endOfDay(customDate);
    return items.filter((item) => {
      const d = new Date(item.created_at);
      return (isAfter(d, dayStart) || isEqual(d, dayStart)) && (isBefore(d, dayEnd) || isEqual(d, dayEnd));
    });
  }
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

interface ExpenseLineItem {
  id: string;
  item: string;
  qty: string;
  unitPrice: string;
}

const parseNoteItems = (note: string | null): { name: string; detail: string }[] => {
  if (!note) return [];
  // Try to parse "Item (qty × ₵price), Item2 (qty × ₵price) | optional note"
  const mainPart = note.split(" | ")[0];
  const matches = mainPart.match(/([^,]+?\s*\([^)]+\))/g);
  if (!matches) return [{ name: note, detail: "" }];
  return matches.map((m) => {
    const trimmed = m.trim();
    const parenIdx = trimmed.indexOf("(");
    if (parenIdx > 0) {
      return { name: trimmed.slice(0, parenIdx).trim(), detail: trimmed.slice(parenIdx) };
    }
    return { name: trimmed, detail: "" };
  });
};

const ExpensesPage = () => {
  const { expenses, addExpense } = useExpenses();
  const [showAdd, setShowAdd] = useState(false);
  const [period, setPeriod] = useState<string>("Today");
  const [customDate, setCustomDate] = useState<Date | undefined>();
  const [expandedExpense, setExpandedExpense] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [category, setCategory] = useState("Ingredients");
  const [lineItems, setLineItems] = useState<ExpenseLineItem[]>([{ id: crypto.randomUUID(), item: "", qty: "", unitPrice: "" }]);
  const [note, setNote] = useState("");

  const filtered = filterByPeriod(expenses, period, customDate);
  const totalExpenses = filtered.reduce((s, e) => s + Number(e.amount), 0);

  const categoryTotals = filtered.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
    return acc;
  }, {});

  const addLineItem = () => {
    setLineItems([...lineItems, { id: crypto.randomUUID(), item: "", qty: "", unitPrice: "" }]);
  };

  const updateLineItem = (id: string, field: keyof ExpenseLineItem, value: string) => {
    setLineItems(lineItems.map(li => li.id === id ? { ...li, [field]: value } : li));
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(li => li.id !== id));
    }
  };

  const grandTotal = lineItems.reduce((sum, li) => sum + (Number(li.unitPrice) || 0), 0);

  const handleAdd = async () => {
    const validItems = lineItems.filter(li => li.unitPrice && Number(li.unitPrice) > 0);
    if (validItems.length === 0) return;

    const itemsDescription = validItems
      .map(li => `${li.item || "Item"} (${li.qty || 1} × ₵${li.unitPrice})`)
      .join(", ");
    const finalNote = note ? `${itemsDescription} | ${note}` : itemsDescription;

    await addExpense({ category, amount: grandTotal, note: finalNote });
    setLineItems([{ id: crypto.randomUUID(), item: "", qty: "", unitPrice: "" }]);
    setNote("");
    setShowAdd(false);
  };

  const resetForm = () => {
    setShowAdd(false);
    setLineItems([{ id: crypto.randomUUID(), item: "", qty: "", unitPrice: "" }]);
    setNote("");
  };

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
              <button onClick={resetForm}><X size={18} className="text-muted-foreground" /></button>
            </div>
            <div className="space-y-3">
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2.5 rounded-lg bg-secondary text-sm outline-none">
                {Object.keys(categoryIcons).map((c) => <option key={c}>{c}</option>)}
              </select>

              <div className="space-y-2">
                <span className="text-xs font-medium text-muted-foreground uppercase">Items</span>
                {lineItems.map((li, idx) => (
                  <div key={li.id} className="bg-secondary/50 rounded-lg p-2.5 space-y-2">
                    <div className="flex gap-2 items-center">
                      <input 
                        placeholder={`Item ${idx + 1} (e.g. Rice)`} 
                        value={li.item} 
                        onChange={(e) => updateLineItem(li.id, "item", e.target.value)} 
                        className="flex-1 px-3 py-2 rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-accent/30" 
                      />
                      {lineItems.length > 1 && (
                        <button onClick={() => removeLineItem(li.id)} className="p-2 text-muted-foreground hover:text-destructive">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2 items-center">
                      <input 
                        placeholder="Qty (e.g. 2kg)" 
                        value={li.qty} 
                        onChange={(e) => updateLineItem(li.id, "qty", e.target.value)} 
                        className="flex-1 px-3 py-2 rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-accent/30" 
                      />
                      <input 
                        placeholder="Price ₵" 
                        type="number" 
                        value={li.unitPrice} 
                        onChange={(e) => updateLineItem(li.id, "unitPrice", e.target.value)} 
                        className="flex-1 px-3 py-2 rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-accent/30" 
                      />
                      {Number(li.unitPrice) > 0 && (
                        <span className="text-xs font-semibold text-foreground whitespace-nowrap">₵{Number(li.unitPrice).toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                ))}
                <button 
                  onClick={addLineItem} 
                  className="w-full py-2.5 rounded-lg border-2 border-dashed border-accent/40 text-accent text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-accent/5 transition-colors"
                >
                  <Plus size={16} /> Add Another Item
                </button>
              </div>

              <input 
                placeholder="Note (optional)" 
                value={note} 
                onChange={(e) => setNote(e.target.value)} 
                className="w-full px-3 py-2.5 rounded-lg bg-secondary text-sm outline-none focus:ring-2 focus:ring-accent/30" 
              />

              {grandTotal > 0 && (
                <div className="flex justify-between items-center px-1 py-2 text-sm border-t border-border pt-3">
                  <span className="text-muted-foreground">Total ({lineItems.filter(li => Number(li.unitPrice) > 0).length} items):</span>
                  <span className="font-bold text-destructive text-lg">₵{grandTotal.toFixed(2)}</span>
                </div>
              )}
              <button onClick={handleAdd} className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">Save Expense</button>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 mb-3">
        <PeriodFilter period={period} onPeriodChange={setPeriod} customDate={customDate} onCustomDateChange={setCustomDate} />
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
        {filtered.map((exp, i) => {
          const items = parseNoteItems(exp.note);
          const isExpanded = expandedExpense === exp.id;
          return (
            <button 
              key={exp.id} 
              onClick={() => setExpandedExpense(isExpanded ? null : exp.id)}
              className="w-full text-left glass shadow-soft rounded-xl p-4 animate-slide-up" 
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-accent">
                  {categoryIcons[exp.category]}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{exp.category}</div>
                  <div className="text-xs text-muted-foreground">{items.length > 1 ? `${items.length} items` : (exp.note || "")} · {formatDate(exp.created_at)}</div>
                </div>
                <span className="text-base font-bold text-destructive">-₵{Number(exp.amount).toFixed(2)}</span>
              </div>
              {isExpanded && items.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border space-y-1.5 pl-[52px]">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs">
                      <span className="text-foreground font-medium">{item.name}</span>
                      <span className="text-muted-foreground">{item.detail}</span>
                    </div>
                  ))}
                  {exp.note?.includes(" | ") && (
                    <div className="text-xs text-muted-foreground italic mt-1">
                      Note: {exp.note.split(" | ").slice(1).join(" | ")}
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No expenses for this period</p>
        )}
      </div>
    </div>
  );
};

export default ExpensesPage;
