import Sidebar from "@/components/sidebar";
import { JSX } from "react";
import { useRouter } from "next/router";

interface PropsInterface {
    children: React.ReactNode;
}

const Layout = (props: PropsInterface): JSX.Element => {
    const router = useRouter();
    const isChatbotPage = router.pathname === "/chatbot";

    return (
        <div className="flex">
            <Sidebar />
            <main className={`flex-1 ml-24 ${isChatbotPage ? "" : "p-4"}`}>
                {props.children}
            </main>
        </div>
    );
};

export default Layout;
