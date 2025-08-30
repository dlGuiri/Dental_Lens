// components/layout/PatientLayout.tsx
import RoleBasedLayout from "./RoleBasedLayout";

interface PatientLayoutProps {
  children: React.ReactNode;
}

export const PatientLayout = ({ children }: PatientLayoutProps) => {
  return (
    <RoleBasedLayout allowedRoles={['patient']}>
      {children}
    </RoleBasedLayout>
  );
};