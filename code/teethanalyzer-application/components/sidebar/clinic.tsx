"use client";
import { JSX } from "react";
import { usePathname } from "next/navigation";
import Logo from "@/components/sidebar/logo";
import Link from "next/link";
import { useRouter } from "next/router";

// Clinic-specific icons (you can create these or use simple divs for now)
const DashboardIcon = ({ isActive }: { isActive: boolean }) => (
  <Link href="/clinic/dashboard">
    <div className={`p-3 rounded-lg transition-colors cursor-pointer ${
      isActive 
        ? 'bg-blue-100 text-blue-400' 
        : 'text-blue-400 hover:bg-blue-300 hover:text-white'
    }`}>
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    </div>
  </Link>
);

const PatientsIcon = ({ isActive }: { isActive: boolean }) => (
  <Link href="/clinic/patients">
    <div className={`p-3 rounded-lg transition-colors cursor-pointer ${
      isActive 
        ? 'bg-blue-100 text-blue-400' 
        : 'text-blue-400 hover:bg-blue-300 hover:text-white'
    }`}>
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    </div>
  </Link>
);

const AppointmentsIcon = ({ isActive }: { isActive: boolean }) => (
  <Link href="/clinic/chatpage">
    <div className={`p-3 rounded-lg transition-colors cursor-pointer ${
      isActive 
        ? 'bg-blue-100 text-blue-400' 
        : 'text-blue-400 hover:bg-blue-300 hover:text-white'
    }`}>
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
  </Link>
);

const SettingsIcon = ({ isActive }: { isActive: boolean }) => (
  <Link href="/clinic/settings">
    <div className={`p-3 rounded-lg transition-colors cursor-pointer ${
      isActive 
        ? 'bg-blue-100 text-blue-600' 
        : 'text-blue-400 hover:bg-blue-300 hover:text-white'
    }`}>
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </div>
  </Link>
);

const LogoutIcon = () => {
  const router = useRouter();
  
  const handleLogout = () => {
    // Clear dentist session
    document.cookie = 'dentist-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/login');
  };

  return (
    <div 
      onClick={handleLogout}
      className="p-3 rounded-lg transition-colors cursor-pointer text-blue-400 hover:bg-blue-300 hover:text-white"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
    </div>
  );
};

const ClinicSidebar = (): JSX.Element => {
    const pathname = usePathname();

    return (
        <aside className="bg-white border-r border-gray-200 p-4 fixed top-0 left-0 h-full w-24 z-10">
            <div className="flex flex-col items-center">
                <Logo />
                <p className="text-blue-400 text-center mt-2 font-sans text-xs">Clinic</p>
            </div>
            <div className="mt-24 flex flex-col items-center space-y-6">
                <DashboardIcon isActive={pathname === "/clinic/dashboard"} />
                <PatientsIcon isActive={pathname === "/clinic/patients"} />
                <AppointmentsIcon isActive={pathname === "/clinic/appointments"} />
                <SettingsIcon isActive={pathname === "/clinic/settings"} />
                
                {/* Spacer */}
                <div className="flex-1"></div>
                
                {/* Logout at bottom */}
                <div className="mt-auto">
                  <LogoutIcon />
                </div>
            </div>
        </aside>
    );
};

export default ClinicSidebar;