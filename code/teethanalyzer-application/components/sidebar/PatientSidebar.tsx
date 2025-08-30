// components/sidebar/PatientSidebar.tsx
"use client";
import { JSX } from "react";
import { usePathname } from "next/navigation";
import Logo from "@/components/sidebar/logo";
import HomeIcon from "@/components/sidebar/home-icon";
import ScanIcon from "@/components/sidebar/scan-icon";
import TipsIcon from "@/components/sidebar/tips-icon";
import ChatbotIcon from "@/components/sidebar/chatbot-icon";
import GoalsIcon from "@/components/sidebar/goals-icon";
import SettingsIcon from "@/components/sidebar/settings-icon";

const PatientSidebar = (): JSX.Element => {
  const pathname = usePathname();

  return (
    <aside className="bg-white border-r border-gray-200 p-4 fixed top-0 left-0 h-full w-24 z-10">
      <div className="flex flex-col items-center">
        <Logo />
      </div>
      <div className="mt-24 flex flex-col items-center space-y-16">
        <HomeIcon isActive={pathname === "/"} />
        <br />
        <ScanIcon isActive={pathname === "/scan"} />
        <br />
        <TipsIcon isActive={pathname === "/recommended"} />
        <br />
        <ChatbotIcon isActive={pathname === "/chatbot"} />
        <br />
        <GoalsIcon isActive={pathname === "/calendar"} />
        <br />
        <SettingsIcon />
      </div>
    </aside>
  );
};

export default PatientSidebar;