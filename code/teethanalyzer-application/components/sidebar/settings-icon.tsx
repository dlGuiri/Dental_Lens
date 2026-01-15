"use client";
import Image from "next/image";
import { signOut } from "next-auth/react";
import logo from "/public/assets/Settings Icon.png";
import { JSX } from "react";

const SettingsIcon = ({ isActive = false }: { isActive?: boolean }): JSX.Element => {
  return (
    <div
      onClick={() => signOut({ callbackUrl: "/login" })}
      className={`group relative w-12 h-12 mx-auto mt-10 rounded-xl text-blue-400 cursor-pointer transition-colors overflow-hidden flex items-center justify-center ${
        isActive ? "bg-blue-50" : "hover:bg-blue-50"
      }`}
    >
      <svg
        className="w-6 h-6 text-blue-400 group-hover:text-blue-600 transition-colors"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
        />
      </svg>
    </div>
  );
};

export default SettingsIcon;
