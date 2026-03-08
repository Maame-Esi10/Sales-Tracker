import { ReactNode } from "react";
import { SHOP_NAME } from "@/hooks/useSupabase";

interface PageHeaderProps {
  title: string;
  action?: ReactNode;
  showBrand?: boolean;
}

const PageHeader = ({ title, action, showBrand = true }: PageHeaderProps) => (
  <div className="px-4 pb-2 pt-6">
    {showBrand && (
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium mb-1">{SHOP_NAME}</p>
    )}
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold text-display">{title}</h1>
      {action}
    </div>
  </div>
);

export default PageHeader;
