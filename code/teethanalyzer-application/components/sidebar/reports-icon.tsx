// components/sidebar/reports-icon.tsx
import { SidebarIconBase } from "./sidebar-icon-base";

interface ReportsIconProps {
  isActive?: boolean;
  href: string;
}

const ReportsIcon = ({ isActive, href }: ReportsIconProps) => (
  <SidebarIconBase isActive={isActive} href={href} title="Reports">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M5,4H7V10H5V4M9,4H11V12H9V4M13,4H15V8H13V4M17,4H19V16H17V4M2,20V18H22V20H2Z" />
    </svg>
  </SidebarIconBase>
);

export default ReportsIcon;