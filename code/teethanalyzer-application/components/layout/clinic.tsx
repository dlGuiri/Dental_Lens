import ClinicSidebar from "@/components/sidebar/clinic";
import { JSX } from "react";
import { useRouter } from "next/router";

interface PropsInterface {
    children: React.ReactNode;
}

const ClinicLayout = (props: PropsInterface): JSX.Element => {
    // Check if the current page is /clinic/patients
    const router = useRouter();
    const isPatientsPage = router.pathname === "/clinic/patients";
    return (
        <div className="flex">
            <ClinicSidebar />
            <main className={`flex-1 bg-gray-50 min-h-screen ${isPatientsPage ? "ml-0 p-0" : "ml-24 p-4"}`}>
                {props.children}
            </main>
        </div>
    );
};

export default ClinicLayout;