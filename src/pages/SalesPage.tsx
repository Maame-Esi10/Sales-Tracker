import { useState } from "react";
import { Plus, Clock, CreditCard, Smartphone, Banknote, ArrowLeft, Minus, ShoppingBag } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ReceiptView from "@/components/ReceiptView";

interface SaleDetail {
  id: string;
  items: { name: string; price: number; qty: number }[];
  total: number;
  method: "Cash" | "MoMo" | "Card";
  time: string;
  customerType: string;
  date: string;
}

const mockSales: SaleDetail[] = [
  { id: "ORD-0041", items: [{ name: "Latte", price: 25, qty: 2 }, { name: "Jollof Rice", price: 35, qty: 1 }], total: 85.0, method: "MoMo", time: "2 min ago", customerType: "Walk-in", date: "27 Feb 2026, 10:32 AM" },
  { id: "ORD-0040", items: [{ name: "Espresso", price: 18, qty: 1 }, { name: "Meat Pie", price: 15, qty: 1 }], total: 33.0, method: "Cash", time: "18 min ago", customerType: "Table", date: "27 Feb 2026, 10:14 AM" },
  { id: "ORD-0039", items: [{ name: "Cappuccino", price: 28, qty: 2 }, { name: "Fried Rice", price: 38, qty: 1 }, { name: "Chocolate Cake", price: 22, qty: 2 }], total: 138.0, method: "Card", time: "34 min ago", customerType: "Walk-in", date: "27 Feb 2026, 09:58 AM" },
  { id: "ORD-0038", items: [{ name: "Latte", price: 25, qty: 1 }, { name: "Waakye", price: 30, qty: 1 }], total: 55.0, method: "MoMo", time: "1 hr ago", customerType: "Online", date: "27 Feb 2026, 09:30 AM" },
  { id: "ORD-0037", items: [{ name: "Cappuccino", price: 28, qty: 2 }, { name: "Meat Pie", price: 15, qty: 2 }, { name: "Espresso", price: 18, qty: 1 }], total: 104.0, method: "Cash", time: "1 hr ago", customerType: "Walk-in", date: "27 Feb 2026, 09:12 AM" },
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
  const [orderItems, setOrderItems] = useState<{ name: string; price: number; qty: number }[]>([]);
  const [sales, setSales] = useState<SaleDetail[]>(mockSales);
  const [receiptSale, setReceiptSale] = useState<SaleDetail | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "MoMo" | "Card">("Cash");

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

  const handleSaveSale = () => {
    if (orderItems.length === 0) return;
    const newSale: SaleDetail = {
      id: `ORD-${String(sales.length + 41).padStart(4, "0")}`,
      items: [...orderItems],
      total,
      method: paymentMethod,
      time: "Just now",
      customerType,
      date: new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }),
    };
    setSales((prev) => [newSale, ...prev]);
    setReceiptSale(newSale);
    setShowNewSale(false);
    setOrderItems([]);
  };

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
            {(["Walk-in", "Table", "Online"] as const).map((t) => (
              <button key={t} onClick={() => setCustomerType(t)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${customerType === t ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>{t}</button>
            ))}
          </div>
        </div>

        <div className="px-4 mb-4">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Add Items</label>
          <div className="grid grid-cols-2 gap-2">
            {menuItems.map((item) => (
              <button key={item.name} onClick={() => addItem(item.name, item.price)} className="glass shadow-soft rounded-xl p-3 text-left hover:shadow-card transition-shadow">
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
            <div className="mb-3 flex gap-2">
              {(["Cash", "MoMo", "Card"] as const).map((m) => (
                <button key={m} onClick={() => setPaymentMethod(m)} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${paymentMethod === m ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground"}`}>
                  {m}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={handleSaveSale} className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98]">
                Save Sale
              </button>
              <button onClick={() => { setShowNewSale(false); setOrderItems([]); }} className="py-3 px-4 rounded-xl bg-secondary text-secondary-foreground font-medium text-sm">
                Draft
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const todayTotal = sales.reduce((s, sale) => s + sale.total, 0);

  return (
    <div className="min-h-screen pb-24">
      <PageHeader
        title="Sales"
        action={
          <button onClick={() => setShowNewSale(true)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-soft transition-all hover:opacity-90 active:scale-[0.98]">
            <Plus size={16} /> New Sale
          </button>
        }
      />

      <div className="px-4 mb-3">
        <div className="glass shadow-soft rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Today's Sales</div>
            <div className="text-2xl font-bold text-display mt-1">₵{todayTotal.toFixed(2)}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
            <ShoppingBag className="text-accent" size={22} />
          </div>
        </div>
      </div>

      <div className="px-4">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Recent Orders</h2>
        <div className="space-y-2">
          {sales.map((sale, i) => (
            <button
              key={sale.id}
              onClick={() => setReceiptSale(sale)}
              className="w-full glass shadow-soft rounded-xl p-4 flex items-center justify-between animate-slide-up text-left"
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
                  <span>{sale.items.length} items</span>
                  <span>·</span>
                  <span className="flex items-center gap-0.5"><Clock size={10} />{sale.time}</span>
                </div>
              </div>
              <span className="text-base font-bold text-accent">₵{sale.total.toFixed(2)}</span>
            </button>
          ))}
        </div>
      </div>

      {receiptSale && (
        <ReceiptView
          orderId={receiptSale.id}
          items={receiptSale.items}
          total={receiptSale.total}
          method={receiptSale.method}
          customerType={receiptSale.customerType}
          date={receiptSale.date}
          onClose={() => setReceiptSale(null)}
        />
      )}
    </div>
  );
};

export default SalesPage;
