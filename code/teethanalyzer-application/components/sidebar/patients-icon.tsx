// components/sidebar/patients-icon.tsx
import { SidebarIconBase } from "./sidebar-icon-base";

interface PatientsIconProps {
  isActive?: boolean;
  href: string;
}

const PatientsIcon = ({ isActive, href }: PatientsIconProps) => (
  <SidebarIconBase isActive={isActive} href={href} title="Patients">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 4C18.2 4 20 5.8 20 8S18.2 12 16 12 12 10.2 12 8 13.8 4 16 4M16 14C20.4 14 24 15.8 24 18V20H8V18C8 15.8 11.6 14 16 14M8.5 11C10.4 11 12 9.4 12 7.5S10.4 4 8.5 4 5 5.6 5 7.5 6.6 11 8.5 11M8.5 13C5.3 13 0 14.6 0 17.8V20H6V18C6 16.2 6.7 14.6 8.5 13Z" />
    </svg>
  </SidebarIconBase>
);

export default PatientsIcon;