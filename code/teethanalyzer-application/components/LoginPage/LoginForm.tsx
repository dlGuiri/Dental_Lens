// pages/LoginPage/LoginForm.tsx (Updated - Simplified)
import { FaGithub, FaGoogle } from "react-icons/fa";
import Image from "next/image";
import Logo from "/public/assets/Denty.png";
import { signIn, getSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (session && status === "authenticated") {
      if (session.user.role) {
        // User has a role, redirect to appropriate dashboard
        const redirectPath = session.user.role === "patient" ? "/" : "/clinic/dashboard";
        router.push(redirectPath);
      } else {
        // User has no role, redirect to role selection
        router.push("/role-selection");
      }
    }
  }, [session, status, router]);

  const handleSignIn = async (provider: string) => {
    setIsLoading(provider);
    
    try {
      const result = await signIn(provider, {
        redirect: false, // Don't redirect immediately
      });
      
      if (result?.ok) {
        // Check session to see if user has a role
        const updatedSession = await getSession();
        
        if (updatedSession?.user?.role) {
          // User has a role, redirect to appropriate dashboard
          const redirectPath = updatedSession.user.role === "patient" ? "/" : "/clinic/dashboard";
          router.push(redirectPath);
        } else {
          // New user or user without role, redirect to role selection
          router.push("/role-selection");
        }
      }
    } catch (error) {
      console.error("Sign-in error:", error);
    } finally {
      setIsLoading(null);
    }
  };

  if (status === "loading" || session) {
    return (
      <div className="max-w-md w-full bg-white rounded-xl p-6 space-y-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4fa1f2] mx-auto"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full bg-white rounded-xl p-6 space-y-6 text-center shadow-lg">
      <h1 className="text-3xl font-bold text-[#4fa1f2]">Welcome to Denty!</h1>
      
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

      <div className="space-y-4">
        <p className="text-gray-600 text-sm">
          Sign in to access your dental care platform
        </p>
        
        <AuthButton 
          icon={<FaGithub />} 
          text="Continue with GitHub" 
          provider="github"
          isLoading={isLoading === "github"}
          onClick={() => handleSignIn("github")}
        />
        
        <AuthButton 
          icon={<FaGoogle />} 
          text="Continue with Google" 
          provider="google"
          isLoading={isLoading === "google"}
          onClick={() => handleSignIn("google")}
        />
      </div>

      <div className="text-xs text-gray-500 pt-4">
        New users will be asked to select their role after signing in
      </div>
    </div>
  );
}

interface AuthButtonProps {
  icon: React.ReactNode;
  text: string;
  provider: string;
  isLoading: boolean;
  onClick: () => void;
}

function AuthButton({ icon, text, provider, isLoading, onClick }: AuthButtonProps) {
  return (
    <button 
      onClick={onClick}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#4fa1f2] text-white border border-[#4fa1f2] rounded-full hover:bg-white hover:text-[#4fa1f2] transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
      ) : (
        icon
      )}
      <span className="text-sm font-medium">
        {isLoading ? "Signing in..." : text}
      </span>
    </button>
  );
}

// Remove the RoleHandler component - we handle this in the LoginForm now