import { useState } from "react";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { useMenuItems } from "@/hooks/useSupabase";

const categories = ["All", "Coffee", "Drinks", "Food", "Desserts"];

const categoryColor: Record<string, string> = {
  Coffee: "bg-accent/15 text-accent",
  Drinks: "bg-success/15 text-success",
  Food: "bg-warning/15 text-warning-foreground",
  Desserts: "bg-destructive/10 text-destructive",
};

const MenuPage = () => {
  const { items, addItem, updateItem, deleteItem } = useMenuItems();
  const [filter, setFilter] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", price: "", category: "Coffee", cost: "" });

  const filtered = filter === "All" ? items : items.filter((i) => i.category === filter);

  const resetForm = () => {
    setFormData({ name: "", price: "", category: "Coffee", cost: "" });
    setShowAdd(false);
    setEditingId(null);
  };

  const handleAdd = async () => {
    if (!formData.name || !formData.price) return;
    await addItem({ name: formData.name, price: Number(formData.price), category: formData.category, cost: Number(formData.cost) || 0 });
    resetForm();
  };

  const handleEdit = (item: typeof items[0]) => {
    setEditingId(item.id);
    setFormData({ name: item.name, price: String(item.price), category: item.category, cost: String(item.cost) });
    setShowAdd(true);
  };

  const handleSaveEdit = async () => {
    if (!formData.name || !formData.price || !editingId) return;
    await updateItem(editingId, { name: formData.name, price: Number(formData.price), category: formData.category, cost: Number(formData.cost) || 0 });
    resetForm();
  };

  const handleDelete = async (id: string) => {
    await deleteItem(id);
  };

  return (
    <div className="min-h-screen pb-24">
      <PageHeader
        title="Menu"
        action={
          <button onClick={() => { resetForm(); setShowAdd(true); }} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-soft">
            <Plus size={16} /> Add Item
          </button>
        }
      />

      <div className="px-4 mb-4 flex gap-2 overflow-x-auto no-scrollbar">
        {categories.map((c) => (
          <button key={c} onClick={() => setFilter(c)} className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${filter === c ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
            {c}
          </button>
        ))}
      </div>

      {showAdd && (
        <div className="px-4 mb-4 animate-slide-up">
          <div className="glass shadow-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold">{editingId ? "Edit Menu Item" : "New Menu Item"}</span>
              <button onClick={resetForm}><X size={18} className="text-muted-foreground" /></button>
            </div>
            <div className="space-y-2">
              <input placeholder="Item name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-secondary text-sm outline-none focus:ring-2 focus:ring-accent/30" />
              <div>
                <input placeholder="Selling Price (₵)" type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-secondary text-sm outline-none focus:ring-2 focus:ring-accent/30" />
                <p className="text-[10px] text-muted-foreground mt-1 px-1">What the customer pays</p>
              </div>
              <div>
                <input placeholder="Ingredient Cost (₵)" type="number" value={formData.cost} onChange={(e) => setFormData({ ...formData, cost: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-secondary text-sm outline-none focus:ring-2 focus:ring-accent/30" />
                <p className="text-[10px] text-muted-foreground mt-1 px-1">What it costs you to make (for profit tracking)</p>
              </div>
              <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-secondary text-sm outline-none">
                {categories.filter((c) => c !== "All").map((c) => <option key={c}>{c}</option>)}
              </select>
              <button onClick={editingId ? handleSaveEdit : handleAdd} className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2">
                {editingId ? <><Check size={16} /> Save Changes</> : <>Add to Menu</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 space-y-2">
        {filtered.map((item, i) => (
          <div key={item.id} className="glass shadow-soft rounded-xl p-4 flex items-center justify-between animate-slide-up" style={{ animationDelay: `${i * 40}ms` }}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold">{item.name}</span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${categoryColor[item.category]}`}>{item.category}</span>
              </div>
              <div className="text-xs text-muted-foreground">Ingredient cost: ₵{Number(item.cost).toFixed(2)} · Profit: ₵{(Number(item.price) - Number(item.cost)).toFixed(2)}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-accent">₵{Number(item.price).toFixed(2)}</span>
              <button onClick={() => handleEdit(item)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors"><Pencil size={14} className="text-muted-foreground" /></button>
              <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"><Trash2 size={14} className="text-destructive" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuPage;
