import { ArrowLeft, Printer, Share2, X } from "lucide-react";

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
  date: string;
  onClose: () => void;
}

const ReceiptView = ({ orderId, items, total, method, customerType, date, onClose }: ReceiptViewProps) => {
  const handlePrint = () => window.print();

  const handleShare = async () => {
    const text = [
      "☕ CaféManager Receipt",
      `Order: ${orderId}`,
      `Date: ${date}`,
      `Customer: ${customerType}`,
      "",
      ...items.map((i) => `${i.qty}x ${i.name} — ₵${(i.price * i.qty).toFixed(2)}`),
      "",
      `Total: ₵${total.toFixed(2)}`,
      `Paid via: ${method}`,
      "",
      "Thank you for your patronage! 🙏",
    ].join("\n");

    if (navigator.share) {
      try {
        await navigator.share({ title: `Receipt ${orderId}`, text });
      } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      alert("Receipt copied to clipboard!");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-sm bg-card rounded-2xl shadow-card overflow-hidden print:shadow-none print:rounded-none">
        {/* Header - hidden on print */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border print:hidden">
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <X size={18} />
          </button>
          <span className="text-sm font-semibold">Receipt</span>
          <div className="flex gap-1">
            <button onClick={handleShare} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <Share2 size={16} />
            </button>
            <button onClick={handlePrint} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <Printer size={16} />
            </button>
          </div>
        </div>

        {/* Receipt body */}
        <div className="px-6 py-6">
          {/* Shop name */}
          <div className="text-center mb-5">
            <h2 className="text-xl font-bold text-display">CaféManager</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Accra, Ghana</p>
          </div>

          {/* Dashed divider */}
          <div className="border-t border-dashed border-border mb-4" />

          {/* Order info */}
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Order</span>
            <span className="font-medium text-foreground">{orderId}</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Date</span>
            <span>{date}</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Customer</span>
            <span>{customerType}</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mb-4">
            <span>Payment</span>
            <span>{method}</span>
          </div>

          <div className="border-t border-dashed border-border mb-4" />

          {/* Items */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              <span>Item</span>
              <span>Amount</span>
            </div>
            {items.map((item) => (
              <div key={item.name} className="flex justify-between text-sm">
                <span>
                  <span className="text-muted-foreground">{item.qty}×</span>{" "}
                  <span className="font-medium">{item.name}</span>
                </span>
                <span className="font-medium">₵{(item.price * item.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-border mb-3" />

          {/* Total */}
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm font-semibold uppercase tracking-wide">Total</span>
            <span className="text-2xl font-bold text-display">₵{total.toFixed(2)}</span>
          </div>

          <div className="border-t border-dashed border-border mb-4" />

          {/* Footer */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Thank you for your patronage! 🙏</p>
            <p className="text-[10px] text-muted-foreground mt-1">Powered by CaféManager</p>
          </div>
        </div>

        {/* Action buttons - hidden on print */}
        <div className="px-4 pb-4 flex gap-2 print:hidden">
          <button
            onClick={handleShare}
            className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2"
          >
            <Share2 size={16} /> Share
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm flex items-center justify-center gap-2"
          >
            <Printer size={16} /> Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptView;
