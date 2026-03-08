import { Printer, Share2, X } from "lucide-react";
import { SHOP_NAME } from "@/hooks/useSupabase";

interface ReceiptItem {
  name: string;
  price: number;
  qty: number;
}

interface ReceiptViewProps {
  orderId: string;
  items: ReceiptItem[];
  total: number;
  method: string;
  customerType: string;
  waiter?: string;
  date: string;
  onClose: () => void;
}

const ReceiptView = ({ orderId, items, total, method, customerType, waiter, date, onClose }: ReceiptViewProps) => {
  const handlePrint = () => window.print();

  const handleShare = async () => {
    const text = [
      `☕ ${SHOP_NAME} Receipt`,
      `Order: ${orderId}`,
      `Date: ${date}`,
      `Customer: ${customerType}`,
      "",
      ...items.map((i) => `${i.qty}x ${i.name} — ₵${(Number(i.price) * i.qty).toFixed(2)}`),
      "",
      `Total: ₵${Number(total).toFixed(2)}`,
      `Paid via: ${method}`,
      "",
      "Thank you for your patronage! 🙏",
    ].join("\n");

    if (navigator.share) {
      try { await navigator.share({ title: `Receipt ${orderId}`, text }); } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      alert("Receipt copied to clipboard!");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-card overflow-hidden print:shadow-none print:rounded-none">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border print:hidden">
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors"><X size={20} /></button>
          <span className="text-base font-semibold">Receipt</span>
          <div className="flex gap-1">
            <button onClick={handleShare} className="p-2 rounded-lg hover:bg-secondary transition-colors"><Share2 size={18} /></button>
            <button onClick={handlePrint} className="p-2 rounded-lg hover:bg-secondary transition-colors"><Printer size={18} /></button>
          </div>
        </div>

        <div className="px-6 py-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-display">{SHOP_NAME}</h2>
            <p className="text-sm text-muted-foreground mt-1">Accra, Ghana</p>
          </div>

          <div className="border-t border-dashed border-border mb-5" />

          <div className="space-y-2 mb-5">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Order</span><span className="font-semibold">{orderId}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Date</span><span>{date}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Customer</span><span>{customerType}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Payment</span><span>{method}</span></div>
            {waiter && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Served by</span><span>{waiter}</span></div>}
          </div>

          <div className="border-t border-dashed border-border mb-5" />

          <div className="space-y-3 mb-5">
            <div className="flex justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <span>Item</span><span>Amount</span>
            </div>
            {items.map((item) => (
              <div key={item.name} className="flex justify-between text-base">
                <span><span className="text-muted-foreground">{item.qty}×</span> <span className="font-medium">{item.name}</span></span>
                <span className="font-semibold">₵{(Number(item.price) * item.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-border mb-4" />

          <div className="flex justify-between items-center mb-6">
            <span className="text-base font-semibold uppercase tracking-wide">Total</span>
            <span className="text-3xl font-bold text-display">₵{Number(total).toFixed(2)}</span>
          </div>

          <div className="border-t border-dashed border-border mb-5" />

          <div className="text-center">
            <p className="text-sm text-muted-foreground">Thank you for your patronage! 🙏</p>
            <p className="text-xs text-muted-foreground mt-1">Powered by {SHOP_NAME}</p>
          </div>
        </div>

        <div className="px-5 pb-5 flex gap-2 print:hidden">
          <button onClick={handleShare} className="flex-1 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2">
            <Share2 size={16} /> Share
          </button>
          <button onClick={handlePrint} className="flex-1 py-3.5 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm flex items-center justify-center gap-2">
            <Printer size={16} /> Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptView;
