interface ClinicCard1Props {
  className?: string;
  dentistName: string;
  scheduledAppointments: number;
  appointmentsToday: number;
  pendingReviews: number;
}

const ClinicCard1 = ({ 
  className = "", 
  dentistName = "Dr. Smith",
  scheduledAppointments = 1,
  appointmentsToday = 1,
  pendingReviews = 1
}: ClinicCard1Props) => {
  return (
    <div
      className={`bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-200 
        rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-500 ${className}`}
    >
      <h1 className="text-4xl font-bold text-white mb-8">
        Welcome Back {dentistName}!
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Scheduled Appointments Card */}
        <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-6 text-center">
          <h3 className="text-white text-sm font-medium mb-3">Scheduled Appointments</h3>
          <p className="text-6xl font-bold text-white">{scheduledAppointments}</p>
        </div>
        
        {/* Appointments Today Card */}
        <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-6 text-center">
          <h3 className="text-white text-sm font-medium mb-3">Appointments Today</h3>
          <p className="text-6xl font-bold text-white">{appointmentsToday}</p>
        </div>
        
        {/* Pending Reviews Card */}
        <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-6 text-center">
          <h3 className="text-white text-sm font-medium mb-3">Pending Reviews</h3>
          <p className="text-6xl font-bold text-white">{pendingReviews}</p>
        </div>
      </div>
    </div>
  );
};

export default ClinicCard1;