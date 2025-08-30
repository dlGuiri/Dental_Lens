// components/sidebar/appointments-icon.tsx
import { SidebarIconBase } from "./sidebar-icon-base";

interface AppointmentsIconProps {
  isActive?: boolean;
  href: string;
}

const AppointmentsIcon = ({ isActive, href }: AppointmentsIconProps) => (
  <SidebarIconBase isActive={isActive} href={href} title="Appointments">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19,3H18V1H16V3H8V1H6V3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V8H19V19Z" />
      <path d="M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10Z" />
    </svg>
  </SidebarIconBase>
);

export default AppointmentsIcon;