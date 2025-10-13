"use client";
import Image from "next/image";
import { signOut } from "next-auth/react";
import logo from "/public/assets/Settings Icon.png";
import { JSX } from "react";

const SettingsIcon = ({ isActive = false }: { isActive?: boolean }): JSX.Element => {
  return (
    <div
      onClick={() => signOut({ callbackUrl: "/login" })}
      className={`group relative w-12 h-12 mx-auto mt-10 rounded-xl cursor-pointer transition-colors overflow-hidden ${
        isActive ? "bg-blue-50" : "hover:bg-blue-50"
      }`}
    >
      <div className="absolute inset-0 z-0 rounded-xl transition-colors" />
      <Image
        src={logo}
        alt="Settings Icon"
        className="object-contain z-10 relative"
        priority
      />
    </div>
  );
};

export default SettingsIcon;
