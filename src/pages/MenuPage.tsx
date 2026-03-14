import { useState } from "react";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import PullToRefresh from "@/components/PullToRefresh";
import { useMenuItems } from "@/hooks/useSupabase";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";

const categories = ["All", "Coffee", "Drinks", "Food", "Desserts"];

const categoryEmoji: Record<string, string> = {
  Coffee: "☕",
  Drinks: "🧃",
  Food: "🍛",
  Desserts: "🍰",
};

const MenuPage = () => {
  const { items, addItem, updateItem, deleteItem, refetch } = useMenuItems();
  const [filter, setFilter] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", price: "", category: "Coffee", cost: "" });

  const { containerRef, pullDistance, refreshing } = usePullToRefresh({
    onRefresh: async () => { await refetch(); },
  });

  const filtered = filter === "All" ? items : items.filter((i) => i.category === filter);

  // Group items by category for a cleaner display
  const grouped = filtered.reduce((acc, item) => {
    const cat = item.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

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
    <PullToRefresh containerRef={containerRef} pullDistance={pullDistance} refreshing={refreshing}>
      <div className="pb-24">
        <PageHeader
          title="Menu"
          action={
            <button
              onClick={() => { resetForm(); setShowAdd(true); }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98] text-primary-foreground gradient-purple glow-purple"
            >
              <Plus size={16} /> Add Item
            </button>
          }
        />

        {/* Category filter pills */}
        <div className="px-4 mb-5 flex gap-2 overflow-x-auto no-scrollbar">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filter === c
                  ? "gradient-purple text-primary-foreground shadow-sm"
                  : "bg-secondary/60 text-secondary-foreground hover:bg-secondary"
              }`}
            >
              {c !== "All" && <span className="mr-1">{categoryEmoji[c]}</span>}
              {c}
            </button>
          ))}
        </div>

        {/* Add/Edit form */}
        <AnimatePresence>
          {showAdd && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 mb-5 overflow-hidden"
            >
              <div className="glass shadow-card rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-display">{editingId ? "Edit Item" : "New Item"}</span>
                  <button onClick={resetForm} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                    <X size={16} className="text-muted-foreground" />
                  </button>
                </div>
                <div className="space-y-3">
                  <input
                    placeholder="Item name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-secondary/70 text-sm outline-none focus:ring-2 focus:ring-accent/30 placeholder:text-muted-foreground/50"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        placeholder="Price (₵)"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-secondary/70 text-sm outline-none focus:ring-2 focus:ring-accent/30 placeholder:text-muted-foreground/50"
                      />
                      <p className="text-[10px] text-muted-foreground/70 mt-1 px-1">Selling price</p>
                    </div>
                    <div>
                      <input
                        placeholder="Cost (₵)"
                        type="number"
                        value={formData.cost}
                        onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-secondary/70 text-sm outline-none focus:ring-2 focus:ring-accent/30 placeholder:text-muted-foreground/50"
                      />
                      <p className="text-[10px] text-muted-foreground/70 mt-1 px-1">Ingredient cost</p>
                    </div>
                  </div>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-secondary/70 text-sm outline-none"
                  >
                    {categories.filter((c) => c !== "All").map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <button
                    onClick={editingId ? handleSaveEdit : handleAdd}
                    className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 text-primary-foreground gradient-purple glow-purple transition-all hover:opacity-90 active:scale-[0.98]"
                  >
                    {editingId ? <><Check size={16} /> Save Changes</> : <><Plus size={16} /> Add to Menu</>}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Menu items - grouped by category */}
        <div className="px-4 space-y-6">
          {filter === "All" ? (
            Object.entries(grouped).map(([category, catItems]) => (
              <div key={category}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{categoryEmoji[category]}</span>
                  <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{category}</h2>
                  <span className="text-[10px] text-muted-foreground/60 font-medium">{catItems.length}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {catItems.map((item, i) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      index={i}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((item, i) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  index={i}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">No items in this category</p>
            </div>
          )}
        </div>
      </div>
    </PullToRefresh>
  );
};

// Extracted card component for cleaner layout
interface MenuItemCardProps {
  item: { id: string; name: string; price: number; cost: number; category: string };
  index: number;
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
}

const MenuItemCard = ({ item, index, onEdit, onDelete }: MenuItemCardProps) => {
  const profit = Number(item.price) - Number(item.cost);
  const margin = item.price > 0 ? Math.round((profit / Number(item.price)) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="glass shadow-soft rounded-2xl p-4 flex flex-col justify-between group"
    >
      <div className="mb-3">
        <div className="text-sm font-bold leading-tight mb-1">{item.name}</div>
        <div className="text-xl font-bold text-accent" style={{ fontFamily: "'Playfair Display', serif" }}>
          ₵{Number(item.price).toFixed(0)}
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground/70">Profit</span>
          <span className="text-[11px] font-semibold text-foreground/80">
            ₵{profit.toFixed(0)} <span className="text-muted-foreground/50">({margin}%)</span>
          </span>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => onEdit(item)}
            className="flex-1 py-1.5 rounded-lg bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1 text-[11px] font-medium"
          >
            <Pencil size={11} /> Edit
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="py-1.5 px-2.5 rounded-lg hover:bg-destructive/10 text-muted-foreground/50 hover:text-destructive transition-colors"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default MenuPage;
