// pages/role-selection.tsx (Fixed)
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { FaUserMd, FaUser } from "react-icons/fa";
import Image from "next/image";
import Logo from "/public/assets/Denty.png";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]";

type UserRole = "dentist" | "patient";

interface RoleSelectionProps {}

const RoleSelectionPage = ({}: RoleSelectionProps) => {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleSelect = async (role: UserRole) => {
    if (!session?.user) {
      setError("No session found. Please try logging in again.");
      return;
    }
    
    setIsLoading(true);
    setSelectedRole(role);
    setError(null);

    try {
      console.log('Updating role for user:', session.user.id, 'to role:', role);
      
      // Update role in database
      const response = await fetch('/api/user/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          role: role
        }),
      });

      const responseData = await response.json();
      console.log('API Response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to update role');
      }

      // Update the session with the new role
      console.log('Updating session with new role...');
      await update({
        user: {
          ...session.user,
          role: role
        }
      });

      // Wait a bit for session to update
      setTimeout(() => {
        // Redirect based on role
        if (role === 'patient') {
          router.push('/');
        } else if (role === 'dentist') {
          router.push('/clinic/dashboard');
        }
      }, 1000);

    } catch (error) {
      console.error('Error updating user role:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      setIsLoading(false);
      setSelectedRole(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl p-6 space-y-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4fa1f2] mx-auto"></div>
          <h2 className="text-xl font-semibold text-gray-700">
            Setting up your account...
          </h2>
          <p className="text-gray-500">
            You selected: <span className="font-medium text-[#4fa1f2]">
              {selectedRole === 'dentist' ? 'Dentist' : 'Patient'}
            </span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl p-8 space-y-8 text-center shadow-lg">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-[#4fa1f2]">Welcome to Denty!</h1>
          <p className="text-gray-600">
            Hi {session?.user?.name?.split(' ')[0] || 'there'}! 👋
          </p>
          <p className="text-gray-600 text-sm">
            To get started, please let us know your role:
          </p>
        </div>

        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <hr className="flex-grow border-gray-300" />
          <div className="flex justify-center">
            <Image 
              src={Logo} 
              alt="Denty the Assistant" 
              width={50} 
              style={{ height: "auto" }} 
            />
          </div>
          <hr className="flex-grow border-gray-300" />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <RoleButton
            icon={<FaUser className="text-xl" />}
            title="I'm a Patient"
            description="Track my dental health and appointments"
            role="patient"
            onClick={handleRoleSelect}
          />
          
          <RoleButton
            icon={<FaUserMd className="text-xl" />}
            title="I'm a Dentist"
            description="Manage my clinic and patients"
            role="dentist"
            onClick={handleRoleSelect}
          />
        </div>

        <div className="text-xs text-gray-400 pt-4">
          You can change this later in your settings
        </div>
      </div>
    </div>
  );
};

function RoleButton({ 
  icon, 
  title, 
  description, 
  role, 
  onClick 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  role: UserRole; 
  onClick: (role: UserRole) => void; 
}) {
  return (
    <button
      onClick={() => onClick(role)}
      className="w-full flex items-start gap-4 p-4 bg-white text-left border-2 border-gray-200 rounded-xl hover:border-[#4fa1f2] hover:bg-blue-50 transition-all duration-200 group"
    >
      <div className="text-[#4fa1f2] group-hover:text-[#3a8bd9] transition-colors">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-800 group-hover:text-[#4fa1f2] transition-colors">
          {title}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          {description}
        </p>
      </div>
      <div className="text-gray-300 group-hover:text-[#4fa1f2] transition-colors">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9.29 15.88L13.17 12 9.29 8.12a.996.996 0 1 1 1.41-1.41l4.59 4.59c.39.39.39 1.02 0 1.41L10.7 17.3a.996.996 0 0 1-1.41-1.42z"/>
        </svg>
      </div>
    </button>
  );
}

// This page should not have any layout
RoleSelectionPage.getLayout = function getLayout(page: React.ReactElement) {
  return page;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  // If not logged in, redirect to login
  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  // If user already has a role, redirect them to appropriate dashboard
  if (session.user.role) {
    const redirectPath = session.user.role === 'patient' ? '/' : '/clinic/dashboard';
    return {
      redirect: {
        destination: redirectPath,
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

export default RoleSelectionPage;