import { useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import PageHeader from "@/components/PageHeader";

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  cost: number;
}

const initialMenu: MenuItem[] = [
  { id: 1, name: "Latte", price: 25, category: "Coffee", cost: 8 },
  { id: 2, name: "Cappuccino", price: 28, category: "Coffee", cost: 9 },
  { id: 3, name: "Espresso", price: 18, category: "Coffee", cost: 5 },
  { id: 4, name: "Jollof Rice", price: 35, category: "Food", cost: 15 },
  { id: 5, name: "Fried Rice", price: 38, category: "Food", cost: 16 },
  { id: 6, name: "Meat Pie", price: 15, category: "Food", cost: 7 },
  { id: 7, name: "Chocolate Cake", price: 22, category: "Desserts", cost: 10 },
  { id: 8, name: "Fresh Juice", price: 20, category: "Drinks", cost: 8 },
];

const categories = ["All", "Coffee", "Drinks", "Food", "Desserts"];

const categoryColor: Record<string, string> = {
  Coffee: "bg-accent/15 text-accent",
  Drinks: "bg-success/15 text-success",
  Food: "bg-warning/15 text-warning-foreground",
  Desserts: "bg-destructive/10 text-destructive",
};

const MenuPage = () => {
  const [items, setItems] = useState(initialMenu);
  const [filter, setFilter] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", price: "", category: "Coffee", cost: "" });

  const filtered = filter === "All" ? items : items.filter((i) => i.category === filter);

  const handleAdd = () => {
    if (!newItem.name || !newItem.price) return;
    setItems((prev) => [
      ...prev,
      { id: Date.now(), name: newItem.name, price: Number(newItem.price), category: newItem.category, cost: Number(newItem.cost) || 0 },
    ]);
    setNewItem({ name: "", price: "", category: "Coffee", cost: "" });
    setShowAdd(false);
  };

  const handleDelete = (id: number) => setItems((prev) => prev.filter((i) => i.id !== id));

  return (
    <div className="min-h-screen pb-24">
      <PageHeader
        title="Menu"
        action={
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-soft"
          >
            <Plus size={16} /> Add Item
          </button>
        }
      />

      <div className="px-4 mb-4 flex gap-2 overflow-x-auto no-scrollbar">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              filter === c ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {showAdd && (
        <div className="px-4 mb-4 animate-slide-up">
          <div className="glass shadow-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold">New Menu Item</span>
              <button onClick={() => setShowAdd(false)}><X size={18} className="text-muted-foreground" /></button>
            </div>
            <div className="space-y-2">
              <input
                placeholder="Item name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg bg-secondary text-sm outline-none focus:ring-2 focus:ring-accent/30"
              />
              <div className="flex gap-2">
                <input
                  placeholder="Price (₵)"
                  type="number"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  className="flex-1 px-3 py-2.5 rounded-lg bg-secondary text-sm outline-none focus:ring-2 focus:ring-accent/30"
                />
                <input
                  placeholder="Cost (₵)"
                  type="number"
                  value={newItem.cost}
                  onChange={(e) => setNewItem({ ...newItem, cost: e.target.value })}
                  className="flex-1 px-3 py-2.5 rounded-lg bg-secondary text-sm outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg bg-secondary text-sm outline-none"
              >
                {categories.filter((c) => c !== "All").map((c) => <option key={c}>{c}</option>)}
              </select>
              <button onClick={handleAdd} className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">
                Add to Menu
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 space-y-2">
        {filtered.map((item, i) => (
          <div
            key={item.id}
            className="glass shadow-soft rounded-xl p-4 flex items-center justify-between animate-slide-up"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold">{item.name}</span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${categoryColor[item.category]}`}>
                  {item.category}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">Cost: ₵{item.cost.toFixed(2)}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-base font-bold text-accent">₵{item.price.toFixed(2)}</span>
              <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                <Trash2 size={14} className="text-destructive" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuPage;
