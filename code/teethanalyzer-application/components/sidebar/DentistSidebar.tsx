// components/sidebar/DentistSidebar.tsx
"use client";
import { JSX } from "react";
import { usePathname } from "next/navigation";
import Logo from "@/components/sidebar/logo";
import { signOut } from "next-auth/react";

// You'll need to create these icons or import them
import DashboardIcon from "@/components/sidebar/dashboard-icon";
import PatientsIcon from "@/components/sidebar/patients-icon";
import AppointmentsIcon from "@/components/sidebar/appointments-icon";
import TreatmentsIcon from "@/components/sidebar/treatments-icon";
import ReportsIcon from "@/components/sidebar/reports-icon";
import SettingsIcon from "@/components/sidebar/settings-icon";

const DentistSidebar = (): JSX.Element => {
  const pathname = usePathname();

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <aside className="bg-white border-r border-gray-200 p-4 fixed top-0 left-0 h-full w-24 z-10">
      <div className="flex flex-col items-center">
        <Logo />
      </div>
      <div className="mt-24 flex flex-col items-center space-y-16">
        <DashboardIcon isActive={pathname === "/clinic/dashboard"} href="/clinic/dashboard" />
        <br />
        <PatientsIcon isActive={pathname === "/clinic/patients"} href="/clinic/patients" />
        <br />
        <AppointmentsIcon isActive={pathname === "/clinic/appointments"} href="/clinic/appointments" />
        <br />
        <TreatmentsIcon isActive={pathname === "/clinic/treatments"} href="/clinic/treatments" />
        <br />
        <ReportsIcon isActive={pathname === "/clinic/reports"} href="/clinic/reports" />
        <br />
        <SettingsIcon />
      </div>
      
      {/* Sign out button at bottom */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <button 
          onClick={handleSignOut}
          className="text-gray-400 hover:text-red-500 transition-colors p-2"
          title="Sign Out"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 17v-3H9v-4h7V7l5 5-5 5M14 2a2 2 0 012 2v2h-2V4H5v16h9v-2h2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V4a2 2 0 012-2h9z"/>
          </svg>
        </button>
      </div>
    </aside>
  );
};

export default DentistSidebar;