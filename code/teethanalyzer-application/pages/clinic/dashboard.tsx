// pages/clinic/dashboard.tsx (Dentist Dashboard - New)
import { DentistLayout } from "@/components/layout/RoleBasedLayout";
import { ReactElement } from "react";
import { useSession } from "next-auth/react";

const DentistDashboard = () => {
  const { data: session } = useSession();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, Dr. {session?.user?.name}!
        </h1>
        <p className="text-gray-600">
          Here's your clinic overview for today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Today's Appointments"
          value="8"
          icon="📅"
          color="bg-blue-500"
        />
        <DashboardCard
          title="Waiting Patients"
          value="3"
          icon="⏰"
          color="bg-orange-500"
        />
        <DashboardCard
          title="Completed Today"
          value="5"
          icon="✅"
          color="bg-green-500"
        />
        <DashboardCard
          title="Revenue Today"
          value="$1,250"
          icon="💰"
          color="bg-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Patients
          </h2>
          <div className="space-y-3">
            {[
              { name: "John Doe", time: "10:30 AM", treatment: "Cleaning" },
              { name: "Jane Smith", time: "11:15 AM", treatment: "Filling" },
              { name: "Mike Johnson", time: "2:00 PM", treatment: "Checkup" },
            ].map((patient, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b">
                <div>
                  <p className="font-medium text-gray-900">{patient.name}</p>
                  <p className="text-sm text-gray-500">{patient.treatment}</p>
                </div>
                <span className="text-sm text-gray-600">{patient.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <QuickActionButton
              icon="👤"
              label="Add Patient"
              onClick={() => {}}
            />
            <QuickActionButton
              icon="📅"
              label="Schedule Appointment"
              onClick={() => {}}
            />
            <QuickActionButton
              icon="🔍"
              label="Patient Records"
              onClick={() => {}}
            />
            <QuickActionButton
              icon="📊"
              label="View Reports"
              onClick={() => {}}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

interface DashboardCardProps {
  title: string;
  value: string;
  icon: string;
  color: string;
}

const DashboardCard = ({ title, value, icon, color }: DashboardCardProps) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center text-white text-xl`}>
        {icon}
      </div>
    </div>
  </div>
);

interface QuickActionButtonProps {
  icon: string;
  label: string;
  onClick: () => void;
}

const QuickActionButton = ({ icon, label, onClick }: QuickActionButtonProps) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#4fa1f2] hover:bg-blue-50 transition-colors"
  >
    <span className="text-2xl mb-2">{icon}</span>
    <span className="text-sm font-medium text-gray-700">{label}</span>
  </button>
);

// Use dentist-specific layout
DentistDashboard.getLayout = function getLayout(page: ReactElement) {
  return <DentistLayout>{page}</DentistLayout>;
};

export default DentistDashboard;