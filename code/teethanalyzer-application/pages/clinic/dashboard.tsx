import ClinicCard1 from "@/components/ClinicDashboardCards/ClinicCard1";
import ClinicCard2 from "@/components/ClinicDashboardCards/ClinicCard2";
import ClinicCard3 from "@/components/ClinicDashboardCards/ClinicCard3";
import ClinicLayout from "@/components/layout/clinic";
import { getServerSession } from "next-auth";
import { useQuery } from "@apollo/client";
import { GetServerSideProps } from "next";
import { ReactElement } from "react";
import gql from "graphql-tag";

const GET_USER_COUNT = gql`
  query GetUserCount {
    getUserCount
  }
`

// This is your default dentist account for MVP
const DEFAULT_DENTIST = {
  id: "dentist-001",
  name: "Dr. Smith",
  email: "dr.smith@clinic.com",
  role: "dentist",
  clinicName: "Dental Care Clinic"
};

interface DashboardProps {
  dentist: typeof DEFAULT_DENTIST;
}

const ClinicDashboard = ({ dentist }: DashboardProps) => {
  const { data, loading, error } = useQuery(GET_USER_COUNT);
  const userCount = data?.getUserCount ?? 0;

  // Sample activity data
  const recentActivities = [
    { id: '1', text: 'New appointment scheduled with John Doe' },
    { id: '2', text: 'Treatment plan approved for Sarah Wilson' },
    { id: '3', text: 'Payment received from Mike Johnson' },
    { id: '4', text: 'Follow-up reminder sent to Emma Davis' },
    { id: '5', text: 'X-ray results uploaded for Tom Brown' }
  ];

  return (
    <div className="p-2">
      <div className="grid grid-cols-1 gap-4">
        {/* Welcome Header with Quick Stats */}
        <ClinicCard1 
          dentistName={dentist.name}
          scheduledAppointments={12}
          appointmentsToday={5}
          patientsNumber={userCount}
        />
        
        {/* Recent Activity and Dental News */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ClinicCard2 activities={recentActivities} />
          <ClinicCard3 />
        </div>
      </div>
    </div>
  );
};

// Use custom layout for clinic pages
ClinicDashboard.getLayout = function getLayout(page: ReactElement) {
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

export default ClinicDashboard;