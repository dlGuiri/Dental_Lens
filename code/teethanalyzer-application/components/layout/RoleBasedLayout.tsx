// components/layout/RoleBasedLayout.tsx
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import PatientSidebar from "@/components/sidebar/PatientSidebar";
import DentistSidebar from "@/components/sidebar/DentistSidebar";
import LoadingSpinner from "@/components/LoadingSpinner";

interface RoleBasedLayoutProps {
  children: React.ReactNode;
  allowedRoles?: ('patient' | 'dentist')[];
  redirectTo?: string;
}

const RoleBasedLayout = ({ 
  children, 
  allowedRoles,
  redirectTo = "/role-selection" 
}: RoleBasedLayoutProps) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading

    // If not authenticated, redirect to login
    if (!session) {
      router.push("/login");
      return;
    }

    // If user has no role, redirect to role selection
    if (!session.user.role) {
      router.push(redirectTo);
      return;
    }

    // If allowedRoles is specified and user doesn't have permission
    if (allowedRoles && !allowedRoles.includes(session.user.role as any)) {
      // Redirect based on their actual role
      if (session.user.role === 'patient') {
        router.push("/");
      } else if (session.user.role === 'dentist') {
        router.push("/clinic/dashboard");
      }
      return;
    }
  }, [session, status, router, allowedRoles, redirectTo]);

  if (status === "loading" || !session) {
    return <LoadingSpinner />;
  }

  if (!session.user.role) {
    return <LoadingSpinner />;
  }

  if (allowedRoles && !allowedRoles.includes(session.user.role as any)) {
    return <LoadingSpinner />;
  }

  const isChatbotPage = router.pathname === "/chatbot";
  const isDentistRoute = router.pathname.startsWith("/clinic");

  return (
    <div className="flex">
      {session.user.role === 'patient' ? (
        <PatientSidebar />
      ) : (
        <DentistSidebar />
      )}
      <main className={`flex-1 ml-24 ${isChatbotPage ? "" : "p-4"}`}>
        {children}
      </main>
    </div>
  );
};

// PatientLayout component
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

// DentistLayout component
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

export default RoleBasedLayout;