import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  action?: ReactNode;
}

const PageHeader = ({ title, action }: PageHeaderProps) => (
  <div className="flex items-center justify-between px-4 pt-[env(safe-area-inset-top)] pb-2 pt-4">
    <h1 className="text-2xl font-bold text-display">{title}</h1>
    {action}
  </div>
);

export default PageHeader;
