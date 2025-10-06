interface Activity {
  id: string;
  text: string;
  timestamp?: string;
}

interface ClinicCard2Props {
  className?: string;
  activities?: Activity[];
}

const ClinicCard2 = ({ 
  className = "",
  activities = [
    { id: '1', text: 'Scheduled Appointments sdcdcdscd sddsdwdfdsc edc' },
    { id: '2', text: 'Scheduled Appointments dwdwd dweewd dwqd' },
    { id: '3', text: 'Scheduled Appointments wqdwd d wq q' },
    { id: '4', text: 'Scheduled Appointments dwqdwqd dwqdwqd dwq' },
    { id: '5', text: 'Scheduled Appointments dwqdwqd d wqdw' }
  ]
}: ClinicCard2Props) => {
  return (
    <div
      className={`bg-gradient-to-br from-blue-400 via-blue-300 to-blue-200
        rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-500 ${className}`}
    >
      <h2 className="text-3xl font-bold text-white mb-6">Recent Activity</h2>
      
      <div className="bg-white rounded-2xl p-6 min-h-[300px]">
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-800 text-base leading-relaxed">{activity.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClinicCard2;
