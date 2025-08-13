import { FaGithub } from "react-icons/fa";
import Image from "next/image";
import Logo from "/public/assets/Denty.png";
import { signIn } from "next-auth/react";

export default function LoginForm() {
  return (
    <div className="max-w-md w-full bg-white rounded-xl p-6 space-y-6 text-center">
      
      <h1 className="text-3xl font-bold text-[#4fa1f2]">Welcome back!</h1>
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
      <AuthButton icon={<FaGithub />} text="Continue with GitHub" />
    </div>
  );
}

function AuthButton({ icon, text }: { icon: React.ReactNode; text: string }) {
  const handleClick = () => {
    signIn("github", { callbackUrl: '/' });
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
