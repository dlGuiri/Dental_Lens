import { useState, useEffect } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/router";

interface AppointmentCardProps {
  dentist: {
    id: string;
    name: string;
    email: string;
    role: string;
    clinicName: string;
  };
  patientId?: string;
  patientName?: string;
}

const AppointmentCard = ({ dentist, patientId, patientName }: AppointmentCardProps) => {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [timeFrom, setTimeFrom] = useState("");
  const [timeTo, setTimeTo] = useState("");

  // ✅ Auto-select today's date on mount
  useEffect(() => {
    setSelectedDate(new Date());
  }, []);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateClick = (day: number) => {
    const selected = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(selected);
  };

  const handleConfirm = () => {
    if (!selectedDate || !timeFrom || !timeTo) {
      alert("Please select date and time");
      return;
    }

    console.log("Appointment scheduled:", {
      patientId: patientId || "placeholder-patient-id",
      dentistId: dentist.id,
      date: selectedDate.toISOString(),
      timeFrom,
      timeTo
    });

    alert("Appointment scheduled! (Placeholder - Backend not connected)");
    router.back();
  };

  const handleBack = () => {
    router.back();
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelectedDate = (day: number) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="fixed top-0 right-0 bottom-0 left-24 overflow-auto">
      <div className="bg-gradient-to-br from-blue-400 via-blue-300 to-cyan-200 min-h-full w-full flex flex-col items-center justify-center p-6">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="fixed top-6 left-28 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors z-20"
        >
          <ArrowLeft className="text-blue-500" size={20} />
        </button>

        {/* Calendar Card */}
        <div className="bg-white/20 backdrop-blur-md rounded-3xl p-6 shadow-2xl max-w-xl w-full my-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:bg-white/30 rounded-full transition-colors"
            >
              <ChevronLeft className="text-white" size={20} />
            </button>
            <h2 className="text-2xl font-bold text-white">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-white/30 rounded-full transition-colors"
            >
              <ChevronRight className="text-white" size={20} />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 mb-4">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div key={day} className="text-center text-white font-semibold text-xs">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                if (!day) return <div key={index}></div>;

                const isSelected = isSelectedDate(day);
                const today = isToday(day);

                // if today is selected, highlight it; otherwise, only selected date is active
                const isActiveToday = today && (!selectedDate || isSelectedDate(day));

                return (
                  <div
                    key={index}
                    onClick={() => handleDateClick(day)}
                    className={`
                      aspect-square flex items-center justify-center rounded-lg text-sm font-medium
                      transition-all duration-200 cursor-pointer hover:bg-white/40
                      ${
                        isSelected
                          ? 'bg-white text-black ring-2 ring-white font-bold'
                          : isActiveToday
                          ? 'bg-white text-blue-500 font-bold'
                          : 'text-white'
                      }
                    `}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Time Selection */}
          <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-800 font-semibold mb-1 text-sm">From</label>
                <input
                  type="time"
                  value={timeFrom}
                  onChange={(e) => setTimeFrom(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/30 backdrop-blur-sm text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white"
                  style={{ colorScheme: "light" }}
                />
              </div>
              <div>
                <label className="block text-gray-800 font-semibold mb-1 text-sm">To</label>
                <input
                  type="time"
                  value={timeTo}
                  onChange={(e) => setTimeTo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/30 backdrop-blur-sm text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white"
                  style={{ colorScheme: "light" }}
                />
              </div>
            </div>
          </div>

          {/* Selected Date Display */}
          {selectedDate && (
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3 mb-4">
              <p className="text-gray-800 text-center text-sm font-medium">
                <span className="font-semibold">Selected:</span>{" "}
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                {timeFrom && timeTo && ` from ${timeFrom} to ${timeTo}`}
              </p>
            </div>
          )}

          {/* Confirm Button */}
          <button
            onClick={handleConfirm}
            className="w-full py-3 bg-white/30 backdrop-blur-md text-gray-800 text-lg font-semibold rounded-2xl hover:bg-white/40 transition-colors"
          >
            Confirm
          </button>

          {/* Placeholder Note */}
          <p className="text-center text-gray-700 text-xs mt-3">
            Patient: {patientName || "Placeholder Patient Name"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AppointmentCard;
