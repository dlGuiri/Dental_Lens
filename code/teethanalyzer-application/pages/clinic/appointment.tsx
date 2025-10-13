import { GetServerSideProps } from "next";
import { ReactElement } from "react";
import ClinicLayout from "@/components/layout/clinic";
import AppointmentCard from "@/components/AppointmentPage/AppointmentCard";

// Default dentist for MVP
const DEFAULT_DENTIST = {
  id: "dentist-001",
  name: "Dr. Smith",
  email: "dr.smith@clinic.com",
  role: "dentist",
  clinicName: "Dental Care Clinic",
};

interface AppointmentPageProps {
  dentist: typeof DEFAULT_DENTIST;
  patientId?: string;
  patientName?: string;
}

const AppointmentPage = ({ dentist, patientId, patientName }: AppointmentPageProps) => {
  return (
    <AppointmentCard 
      dentist={dentist}
      patientId={patientId}
      patientName={patientName}
    />
  );
};

// Apply the clinic layout
AppointmentPage.getLayout = function getLayout(page: ReactElement) {
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

  // Get patient info from query params (will come from chat page)
  const { patientId, patientName } = context.query;

  return {
    props: {
      dentist: DEFAULT_DENTIST,
      patientId: patientId || null,
      patientName: patientName || null,
    },
  };
};

export default AppointmentPage;