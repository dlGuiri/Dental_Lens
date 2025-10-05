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
      
      <div className="space-y-4">
        {newsItems.length > 0 ? (
          newsItems.map((news, idx) => (
            <div key={idx} className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <p className="text-white text-sm">{news}</p>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full min-h-[200px]">
            <p className="text-white/70 text-lg">No recent news</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClinicCard3;