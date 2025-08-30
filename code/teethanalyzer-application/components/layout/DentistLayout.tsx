// components/layout/DentistLayout.tsx
import RoleBasedLayout from "./RoleBasedLayout";
interface DentistLayoutProps {
  children: React.ReactNode;
}

export const DentistLayout = ({ children }: DentistLayoutProps) => {
  return (
    <RoleBasedLayout allowedRoles={['dentist']}>
      {children}
    </RoleBasedLayout>
  );
};