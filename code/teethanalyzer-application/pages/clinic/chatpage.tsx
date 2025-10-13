import { GetServerSideProps } from "next";
import { ReactElement } from "react";
import ClinicLayout from "@/components/layout/clinic";
import ClinicCard4 from "@/components/ChatPage/Chat";

// This is your default dentist account for MVP
const DEFAULT_DENTIST = {
  id: "dentist-001",
  name: "Dr. Smith",
  email: "dr.smith@clinic.com",
  role: "dentist",
  clinicName: "Dental Care Clinic"
};

interface ChatPageProps {
  dentist: typeof DEFAULT_DENTIST;
}

const ChatPage = ({ dentist }: ChatPageProps) => {
  return (
    <div className="fixed top-0 right-0 bottom-0 left-24 overflow-hidden">
      {/* Chat Card - Full Screen within main content area */}
      <ClinicCard4 className="h-full w-full" />
    </div>
  );
};

// Use custom layout for clinic pages
ChatPage.getLayout = function getLayout(page: ReactElement) {
  return <ClinicLayout>{page}</ClinicLayout>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  // Check if user has dentist session
  const dentistSession = context.req.cookies['dentist-session'];
  
  if (!dentistSession) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  // Return default dentist data for MVP
  return {
    props: {
      dentist: DEFAULT_DENTIST,
    },
  };
};

export default ChatPage;