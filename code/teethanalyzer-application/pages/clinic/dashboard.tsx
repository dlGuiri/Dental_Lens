import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { ReactElement } from "react";
import ClinicLayout from "@/components/layout/clinic";

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
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {dentist.name}
        </h1>
        <p className="text-gray-600 mt-2">
          {dentist.clinicName} Dashboard
        </p>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Today's Appointments</h3>
          <p className="text-2xl font-bold text-blue-600 mt-2">12</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Pending Reviews</h3>
          <p className="text-2xl font-bold text-orange-600 mt-2">5</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Total Patients</h3>
          <p className="text-2xl font-bold text-green-600 mt-2">247</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Revenue This Month</h3>
          <p className="text-2xl font-bold text-purple-600 mt-2">$12,450</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div>
                <p className="text-sm text-gray-900">New appointment scheduled with John Doe</p>
                <p className="text-xs text-gray-500">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm text-gray-900">Treatment plan approved for Sarah Wilson</p>
                <p className="text-xs text-gray-500">15 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div>
                <p className="text-sm text-gray-900">Payment received from Mike Johnson</p>
                <p className="text-xs text-gray-500">1 hour ago</p>
              </div>
            </div>
          </div>
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