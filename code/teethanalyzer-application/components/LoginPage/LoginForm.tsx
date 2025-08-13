// components/LoginForm.tsx
import { FaGoogle, FaApple, FaPhone } from "react-icons/fa";


export default function LoginForm() {
  return (
    <div className="max-w-md w-full bg-white rounded-xl p-6 space-y-6 text-center">
      <h1 className="text-3xl font-bold">Welcome back</h1>

      <div className="text-left">
        <label className="block text-sm text-gray-700 mb-1" htmlFor="email">Email address</label>
        <input
          type="email"
          id="email"
          placeholder="you@example.com"
          className="w-full px-4 py-2 border border-blue-400 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <button className="w-full py-3 bg-black text-white rounded-full font-medium hover:bg-gray-900 transition">
        Continue
      </button>

      <div className="text-sm text-gray-500">
        Don’t have an account? <a className="text-blue-600 font-medium" href="/signup">Sign up</a>
      </div>

      <div className="flex items-center gap-2 text-gray-400 text-sm">
        <hr className="flex-grow border-gray-300" /> OR <hr className="flex-grow border-gray-300" />
      </div>

      <div className="space-y-3">
        <AuthButton icon={<FaGoogle />} text="Continue with Google" />
        <AuthButton icon={<FaApple />} text="Continue with Apple" />
        <AuthButton icon={<FaPhone />} text="Continue with phone" />
      </div>
    </div>
  );
}

function AuthButton({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <button className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-full hover:bg-gray-100 transition">
      {icon}
      <span className="text-sm font-medium">{text}</span>
    </button>
  );
}
