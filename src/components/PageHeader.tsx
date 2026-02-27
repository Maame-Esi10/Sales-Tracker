import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  action?: ReactNode;
}

const PageHeader = ({ title, action }: PageHeaderProps) => (
  <div className="flex items-center justify-between px-4 pb-2 pt-6">
    <h1 className="text-2xl font-bold text-display">{title}</h1>
    {action}
  </div>
);

export default PageHeader;
