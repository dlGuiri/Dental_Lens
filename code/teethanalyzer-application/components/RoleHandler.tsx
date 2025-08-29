// components/RoleHandler.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

export default function RoleHandler() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  useEffect(() => {
    const handleRoleAssignment = async () => {
      // Check if user is authenticated and role is in URL params
      const roleParam = router.query.role as string;
      
      if (session?.user && roleParam && (roleParam === 'dentist' || roleParam === 'patient')) {
        // Check if user already has a role assigned
        if (!session.user.role) {
          try {
            // Save role to database
            const response = await fetch('/api/user/update-role', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: session.user.id,
                role: roleParam
              }),
            });

            if (response.ok) {
              // Update the session with the new role
              await update({
                ...session,
                user: {
                  ...session.user,
                  role: roleParam
                }
              });
              
              // Remove role from URL after successful assignment
              router.replace('/', undefined, { shallow: true });
            }
          } catch (error) {
            console.error('Error updating user role:', error);
          }
        } else {
          // User already has a role, just remove the parameter from URL
          router.replace('/', undefined, { shallow: true });
        }
      }
    };

    if (status === 'authenticated') {
      handleRoleAssignment();
    }
  }, [session, status, router, update]);

  return null; // This component doesn't render anything
}