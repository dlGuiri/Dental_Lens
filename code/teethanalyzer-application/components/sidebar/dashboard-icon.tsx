// components/sidebar/dashboard-icon.tsx
import { SidebarIconBase } from "./sidebar-icon-base";

interface DashboardIconProps {
  isActive?: boolean;
  href: string;
}

const DashboardIcon = ({ isActive, href }: DashboardIconProps) => (
  <SidebarIconBase isActive={isActive} href={href} title="Dashboard">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13,3V9H21V3M13,21H21V11H13M3,21H11V15H3M3,13H11V3H3V13Z" />
    </svg>
  </SidebarIconBase>
);

export default DashboardIcon;