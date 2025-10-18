import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { ReactElement } from "react";
import PatientChatCard from "@/components/PatientChatCard";

interface ChatPageProps {
  // No props needed as we'll use session in the component
}

const PatientChatPage = ({}: ChatPageProps) => {
  return (
    <div className="fixed top-0 right-0 bottom-0 left-24 overflow-hidden">
      {/* Chat Card - Full Screen within main content area */}
      <PatientChatCard className="h-full w-full" />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  // Get the user session
  const session = await getSession(context);
  
  // If no session, redirect to login
  if (!session || !session.user) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  // Return empty props since we're using session in the component
  return {
    props: {},
  };
};

export default PatientChatPage;