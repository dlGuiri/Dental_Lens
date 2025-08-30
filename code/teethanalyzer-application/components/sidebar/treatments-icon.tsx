// components/sidebar/treatments-icon.tsx
import { SidebarIconBase } from "./sidebar-icon-base";

interface TreatmentsIconProps {
  isActive?: boolean;
  href: string;
}

const TreatmentsIcon = ({ isActive, href }: TreatmentsIconProps) => (
  <SidebarIconBase isActive={isActive} href={href} title="Treatments">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.89,3L14.85,0.92L15.92,2.15L13.96,4.24L12.89,3M8.24,5.68L6.66,4.1L7.73,3.03L9.31,4.61L8.24,5.68M19.5,6H22.5V8H19.5V6M3,6V8H6V6H3M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10M7,18H17V20H7V18Z" />
    </svg>
  </SidebarIconBase>
);

export default TreatmentsIcon;