interface ClinicCard3Props {
  className?: string;
  newsItems?: string[];
}

const ClinicCard3 = ({ 
  className = "",
  newsItems = []
}: ClinicCard3Props) => {
  return (
    <div
      className={`bg-gradient-to-br from-blue-400 via-blue-300 to-blue-200
        rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-500 ${className}`}
    >
      <h2 className="text-3xl font-bold text-white mb-6">Dental News</h2>
      
      <div className="bg-white rounded-2xl p-6 min-h-[300px]">
        {newsItems.length > 0 ? (
          <div className="space-y-4">
            {newsItems.map((news, idx) => (
              <div key={idx} className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-800 text-sm">{news}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full min-h-[250px]">
            <p className="text-gray-400 text-lg">No recent news</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClinicCard3;