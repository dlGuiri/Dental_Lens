import { FaGithub, FaUserMd, FaUser } from "react-icons/fa";
import Image from "next/image";
import Logo from "/public/assets/Denty.png";
import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";


type UserRole = "dentist" | "patient" | null;

export default function LoginForm() {
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);

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

    // Remove role from URL

    router.push('/login', undefined, { shallow: true });

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

          

          <RoleButton

            icon={<FaUserMd />}

            text="I'm a Dentist"

            role="dentist"

            onClick={handleRoleSelect}

          />

          

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

  return (
    <div className="max-w-md w-full bg-white rounded-xl p-6 space-y-6 text-center">
      
      <h1 className="text-3xl font-bold text-[#4fa1f2]">Welcome back!</h1>
      <div className="flex items-center justify-between">
        <button
          onClick={handleBackToRoleSelection}
          className="text-[#4fa1f2] hover:text-[#3a8bd9] transition text-sm"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-[#4fa1f2]">
          {selectedRole === "dentist" ? "Dentist Login" : "Patient Login"}
        </h1>
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
      className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#4fa1f2] text-white border border-[#4fa1f2] rounded-full hover:bg-white hover:text-[#4fa1f2] transition"
    >
      {icon}
      <span className="text-sm font-medium border-[#4fa1f2]">{text}</span>
    </button>
  );
}