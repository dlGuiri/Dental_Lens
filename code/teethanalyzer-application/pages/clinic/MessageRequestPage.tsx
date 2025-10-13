import { GetServerSideProps } from "next";
import { ReactElement } from "react";
import ClinicLayout from "@/components/layout/clinic";
import MessageReqCard from "@/components/MessageRequestPage/MessageReq";

// Default dentist for MVP
const DEFAULT_DENTIST = {
  id: "dentist-001",
  name: "Dr. Smith",
  email: "dr.smith@clinic.com",
  role: "dentist",
  clinicName: "Dental Care Clinic",
};

interface MessageRequestsPageProps {
  dentist: typeof DEFAULT_DENTIST;
}

const MessageRequestsPage = ({ dentist }: MessageRequestsPageProps) => {
  return <MessageReqCard dentist={dentist} />;
};

// Apply the clinic layout
MessageRequestsPage.getLayout = function getLayout(page: ReactElement) {
  return <ClinicLayout>{page}</ClinicLayout>;
};

// Protect route and pass dentist data
export const getServerSideProps: GetServerSideProps = async (context) => {
  const dentistSession = context.req.cookies["dentist-session"];

  if (!dentistSession) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return {
    props: {
      dentist: DEFAULT_DENTIST,
    },
  };
};

export default MessageRequestsPage;