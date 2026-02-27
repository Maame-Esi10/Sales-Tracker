import { useState } from "react";
import { Plus, Clock, CreditCard, Smartphone, Banknote, ArrowLeft, Minus, ShoppingBag } from "lucide-react";
import PageHeader from "@/components/PageHeader";

interface Sale {
  id: string;
  items: number;
  total: number;
  method: "Cash" | "MoMo" | "Card";
  time: string;
}

interface OrderItem {
  name: string;
  price: number;
  qty: number;
}

const mockSales: Sale[] = [
  { id: "ORD-0041", items: 3, total: 85.0, method: "MoMo", time: "2 min ago" },
  { id: "ORD-0040", items: 1, total: 25.0, method: "Cash", time: "18 min ago" },
  { id: "ORD-0039", items: 5, total: 142.5, method: "Card", time: "34 min ago" },
  { id: "ORD-0038", items: 2, total: 55.0, method: "MoMo", time: "1 hr ago" },
  { id: "ORD-0037", items: 4, total: 98.0, method: "Cash", time: "1 hr ago" },
];

const menuItems = [
  { name: "Latte", price: 25 },
  { name: "Cappuccino", price: 28 },
  { name: "Espresso", price: 18 },
  { name: "Jollof Rice", price: 35 },
  { name: "Fried Rice", price: 38 },
  { name: "Waakye", price: 30 },
  { name: "Meat Pie", price: 15 },
  { name: "Chocolate Cake", price: 22 },
];

const paymentIcon = (method: string) => {
  switch (method) {
    case "MoMo": return <Smartphone size={14} />;
    case "Card": return <CreditCard size={14} />;
    default: return <Banknote size={14} />;
  }
};

const SalesPage = () => {
  const [showNewSale, setShowNewSale] = useState(false);
  const [customerType, setCustomerType] = useState("Walk-in");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  const addItem = (name: string, price: number) => {
    setOrderItems((prev) => {
      const existing = prev.find((i) => i.name === name);
      if (existing) return prev.map((i) => i.name === name ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { name, price, qty: 1 }];
    });
  };

  const updateQty = (name: string, delta: number) => {
    setOrderItems((prev) =>
      prev.map((i) => i.name === name ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter((i) => i.qty > 0)
    );
  };

  const total = orderItems.reduce((sum, i) => sum + i.price * i.qty, 0);

  if (showNewSale) {
    return (
      <div className="min-h-screen pb-32">
        <div className="flex items-center gap-3 px-4 pt-4 pb-2">
          <button onClick={() => { setShowNewSale(false); setOrderItems([]); }} className="p-2 -ml-2 rounded-xl hover:bg-secondary transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-display">New Sale</h1>
        </div>

        <div className="px-4 mb-4">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Customer Type</label>
          <div className="flex gap-2">
            {["Walk-in", "Table", "Online"].map((t) => (
              <button
                key={t}
                onClick={() => setCustomerType(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  customerType === t ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 mb-4">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Add Items</label>
          <div className="grid grid-cols-2 gap-2">
            {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => addItem(item.name, item.price)}
                className="glass shadow-soft rounded-xl p-3 text-left hover:shadow-card transition-shadow"
              >
                <div className="text-sm font-semibold">{item.name}</div>
                <div className="text-xs text-accent font-medium">₵{item.price.toFixed(2)}</div>
              </button>
            ))}
          </div>
        </div>

        {orderItems.length > 0 && (
          <div className="px-4 mb-4">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Order</label>
            <div className="glass shadow-soft rounded-xl divide-y divide-border">
              {orderItems.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-3">
                  <div>
                    <div className="text-sm font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">₵{item.price.toFixed(2)} each</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => updateQty(item.name, -1)} className="p-1 rounded-lg bg-secondary"><Minus size={14} /></button>
                    <span className="text-sm font-semibold w-4 text-center">{item.qty}</span>
                    <button onClick={() => updateQty(item.name, 1)} className="p-1 rounded-lg bg-secondary"><Plus size={14} /></button>
                    <span className="text-sm font-semibold text-accent w-16 text-right">₵{(item.price * item.qty).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="fixed bottom-20 left-0 right-0 px-4">
          <div className="glass-strong shadow-card rounded-2xl p-4 max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-2xl font-bold text-display">₵{total.toFixed(2)}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setShowNewSale(false); setOrderItems([]); }}
                className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
              >
                Save Sale
              </button>
              <button
                onClick={() => { setShowNewSale(false); setOrderItems([]); }}
                className="py-3 px-4 rounded-xl bg-secondary text-secondary-foreground font-medium text-sm"
              >
                Draft
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <PageHeader
        title="Sales"
        action={
          <button
            onClick={() => setShowNewSale(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-soft transition-all hover:opacity-90 active:scale-[0.98]"
          >
            <Plus size={16} />
            New Sale
          </button>
        }
      />

      <div className="px-4 mb-3">
        <div className="glass shadow-soft rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Today's Sales</div>
            <div className="text-2xl font-bold text-display mt-1">₵405.50</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
            <ShoppingBag className="text-accent" size={22} />
          </div>
        </div>
      </div>

      <div className="px-4">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Recent Orders</h2>
        <div className="space-y-2">
          {mockSales.map((sale, i) => (
            <div
              key={sale.id}
              className="glass shadow-soft rounded-xl p-4 flex items-center justify-between animate-slide-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold">{sale.id}</span>
                  <span className="px-2 py-0.5 rounded-md bg-secondary text-[10px] font-medium text-secondary-foreground flex items-center gap-1">
                    {paymentIcon(sale.method)} {sale.method}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{sale.items} items</span>
                  <span>·</span>
                  <span className="flex items-center gap-0.5"><Clock size={10} />{sale.time}</span>
                </div>
              </div>
              <span className="text-base font-bold text-accent">₵{sale.total.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SalesPage;
