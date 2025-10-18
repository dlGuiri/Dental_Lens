import { FaGithub, FaUserMd, FaUser, FaEnvelope } from "react-icons/fa";
import Image from "next/image";
import Logo from "/public/assets/Denty.png";
import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import DentistAuth from '@/components/auth/dentist-auth';

type UserRole = "dentist" | "patient" | null;

export default function LoginForm() {
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if role is already in URL parameters
    const roleParam = router.query.role as string;
    if (roleParam === "dentist" || roleParam === "patient") {
      setSelectedRole(roleParam);
    }
  }, [router.query.role]);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    // Update URL with role parameter
    router.push(`/login?role=${role}`, undefined, { shallow: true });
  };

  const handleBackToRoleSelection = () => {
    setSelectedRole(null);
    setEmailSent(false);
    setEmail("");
    // Remove role from URL
    router.push('/login', undefined, { shallow: true });
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const callbackUrl = `/?role=${selectedRole}`;
      const result = await signIn("email", { 
        email,
        redirect: false,
        callbackUrl 
      });
      
      if (result?.ok) {
        setEmailSent(true);
      }
    } catch (error) {
      console.error("Email sign in error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedRole) {
    return (
      <div className="max-w-md w-full bg-white rounded-xl p-6 space-y-6 text-center">
        <h1 className="text-3xl font-bold text-[#4fa1f2]">Welcome!</h1>
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <hr className="flex-grow border-gray-300" />
          <div className="flex justify-center">
            <Image src={Logo} alt="Denty the Assistant" width={50} style={{ height: "auto" }} />
          </div>
          <hr className="flex-grow border-gray-300" />
        </div>        
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">Please select your role to continue:</p>          
          <DentistAuth />    
          <RoleButton
            icon={<FaUser />}
            text="I'm a Patient"
            role="patient"
            onClick={handleRoleSelect}
          />
        </div>
      </div>
    );
  }

  if (emailSent) {
    return (
      <div className="max-w-md w-full bg-white rounded-xl p-6 space-y-6 text-center">
        <h1 className="text-3xl font-bold text-[#4fa1f2]">Check your email</h1>
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <hr className="flex-grow border-gray-300" />
          <div className="flex justify-center">
            <FaEnvelope className="text-[#4fa1f2] text-4xl" />
          </div>
          <hr className="flex-grow border-gray-300" />
        </div>
        <div className="space-y-4">
          <p className="text-gray-600">
            A sign in link has been sent to <strong>{email}</strong>
          </p>
          <p className="text-sm text-gray-500">
            Click the link in the email to complete your sign in.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full bg-white rounded-xl p-6 space-y-6 text-center">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-[#4fa1f2]">Welcome!</h1>
        <h2 className="text-2xl font-bold text-[#4fa1f2]">
          {selectedRole === "dentist" ? "Dentist Login" : "Patient Login"}
        </h2>
        <div className="w-12"></div>
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
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-2 text-gray-600 text-sm">
          {selectedRole === "dentist" ? <FaUserMd /> : <FaUser />}
          <span>Signing in as {selectedRole}</span>
        </div>

        {/* Email Sign In Form */}
        <form onSubmit={handleEmailSignIn} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-full focus:border-[#4fa1f2] focus:outline-none text-sm"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#4fa1f2] text-white rounded-full hover:bg-[#3a8bd9] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaEnvelope />
            <span className="text-sm font-medium">
              {isSubmitting ? "Sending..." : "Continue with Email"}
            </span>
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-2 text-gray-400 text-xs">
          <hr className="flex-grow border-gray-300" />
          <span>OR</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* GitHub Sign In */}
        <AuthButton 
          icon={<FaGithub />} 
          text="Continue with GitHub" 
          role={selectedRole}
        />
      </div>
    </div>
  );
}

function RoleButton({ 
  icon, 
  text, 
  role, 
  onClick 
}: { 
  icon: React.ReactNode; 
  text: string; 
  role: UserRole;
  onClick: (role: UserRole) => void;
}) {
  return (
    <button
      onClick={() => onClick(role)}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-[#4fa1f2] border-2 border-[#4fa1f2] rounded-full hover:bg-[#4fa1f2] hover:text-white transition"
    >
      {icon}
      <span className="text-sm font-medium">{text}</span>
    </button>
  );
}

function AuthButton({ 
  icon, 
  text, 
  role 
}: { 
  icon: React.ReactNode; 
  text: string; 
  role: UserRole;
}) {
  const handleClick = () => {
    // Include role in the callback URL so it can be processed after authentication
    const callbackUrl = `/?role=${role}`;
    signIn("github", { 
      callbackUrl: callbackUrl
    });
  };

  return (
    <button
      onClick={handleClick}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-[#4fa1f2] border-2 border-[#4fa1f2] rounded-full hover:bg-[#4fa1f2] hover:text-white transition"
    >
      {icon}
      <span className="text-sm font-medium">{text}</span>
    </button>
  );
}