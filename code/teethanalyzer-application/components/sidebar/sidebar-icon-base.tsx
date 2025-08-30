// components/sidebar/sidebar-icon-base.tsx (Base component for consistency)
import Link from "next/link";
import { ReactNode } from "react";

interface SidebarIconProps {
  children: ReactNode;
  isActive?: boolean;
  href: string;
  title?: string;
}

export const SidebarIconBase = ({ children, isActive, href, title }: SidebarIconProps) => {
  return (
    <Link href={href} title={title}>
      <div className={`p-3 rounded-xl cursor-pointer transition-all duration-200 ${
        isActive 
          ? "bg-[#4fa1f2] text-white shadow-lg" 
          : "text-gray-400 hover:text-[#4fa1f2] hover:bg-blue-50"
      }`}>
        {children}
      </div>
    </Link>
  );
};