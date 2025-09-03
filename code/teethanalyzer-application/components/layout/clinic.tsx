import ClinicSidebar from "@/components/sidebar/clinic";
import { JSX } from "react";

interface PropsInterface {
    children: React.ReactNode;
}

const ClinicLayout = (props: PropsInterface): JSX.Element => {
    return (
        <div className="flex">
            <ClinicSidebar />
            <main className="flex-1 ml-24 p-4 bg-gray-50 min-h-screen">
                {props.children}
            </main>
        </div>
    );
};

export default ClinicLayout;