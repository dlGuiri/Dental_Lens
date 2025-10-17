import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import logo from "/public/assets/Tooth Image V3.png";
import arrow from "/public/assets/scan arrow V2.png";
import { gql, useQuery } from "@apollo/client";
import { usePrediction } from "context/PredictionContext";

const GET_USER_BY_ID = gql`
  query GetUserById($userId: ID!) {
    getUserById(userId: $userId) {
      name
      teeth_status
      scanRecords {
        date
        result
        notes
      }
    }
  }
`;

const HomeCard1 = ({ className = "", metric = 100 }: { className?: string; metric?: number }) => {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const { predictionResult } = usePrediction();
  const { data, loading, error, refetch } = useQuery(GET_USER_BY_ID, {
    variables: { userId },
    skip: !userId,
  });


  useEffect(() => {
    if (predictionResult && userId) {
      refetch();
    }
  }, [predictionResult, userId]);

  type ScanRecord = {
    date: string;
    result: string[] | string;
    notes: string[];
  }; 
  
  const name = session?.user?.name || "User";
  const teethStatus = data?.getUserById?.teeth_status || "No Teeth Status Yet";
  const scanRecords = Array.isArray(data?.getUserById?.scanRecords) ? data?.getUserById?.scanRecords : [];

  let displayResultRaw = predictionResult && predictionResult !== "" && predictionResult !== "Invalid image: Please upload a clear image of an actual teeth." ? predictionResult : scanRecords[scanRecords.length - 1]?.result;
  let displayResult = Array.isArray(displayResultRaw) ? displayResultRaw.join(", ") : String(displayResultRaw ?? "");
  let recommendedAction = "Go to a dentist";
  const [showHistory, setShowHistory] = useState(false);

  if (displayResult?.toLowerCase() === "no diseases detected") {
    displayResult = "None";
    recommendedAction = "Continue current oral hygiene!";
  }

  // Filter classes to change the color of the tooth image based on the metric
  let filterClass = "";

  if (metric < 50) {
    // Severe discoloration: brown to black
    filterClass = "filter sepia brightness-[30%] contrast-125 hue-rotate-30";

  } else if (metric < 80) {
    // Moderate discoloration: yellow-brown
    filterClass = "filter sepia brightness-75 hue-rotate-15";
  } else if (metric < 90) {
    // Mild discoloration: yellow
    filterClass = "filter sepia brightness-90";
  } else {
    // Healthy: white
    filterClass = "";
  }

  const [selectedRecord, setSelectedRecord] = useState<ScanRecord | null>(null);

  return (
    <div className={`bg-gradient-to-br from-[#4fa1f2] via-[#74b0f0] to-[#d3eaff] 
      backdrop-blur-md bg-opacity-30 rounded-3xl p-6 shadow-md hover:shadow-blue-300 
      transition-shadow duration-500 ${className}`}
      >
      {!showHistory ? (
        <>
          <h2 className="text-2xl font-semibold text-white mb-2">Welcome {name}!</h2>
          <h2 className="text-lg font-semibold text-white mb-2">Teeth Health Overview</h2>

          {/* Step 3: Wrap Image in filtered div */}
          <div className="flex justify-center mb-4 -mt-8">
            <div className={`relative w-[420px]`}>
              <div className={filterClass}>
                <Image src={logo} alt="Tooth Logo" width={220} height={220} className="mx-auto"/>
              </div>

              {/* Arrow */}
              <div className="absolute top-11 left-[260px]">
                <Image src={arrow} alt="Scan Arrow" width={140} height={140} />
              </div>

              {/* Semi-transparent card at the arrow tip */}
              <div className="absolute top-[40px] left-[389px] w-80 h-55 bg-white/20 backdrop-blur-md rounded-3xl p-4 shadow-inner text-white">
                <p className="text-sm font-medium mb-2">Latest Teeth Status:</p>
                {scanRecords.length > 0 ? (
                  <>
                    <p className="text-sm mb-1">Date: {new Date(Number(scanRecords[scanRecords.length - 1]?.date)).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-sm mb-1">
                      Result:{" "}
                      {scanRecords.length > 0
                        ? scanRecords[scanRecords.length - 1].notes[0] === "Healthy teeth"
                          ? "Healthy teeth"
                          : "Has 1 disease"
                        : "No results yet"}
                    </p>

                    <p className="text-sm mb-1">Diseases Present:</p>
                    <p className="text-sm mb-5 capitalize">{displayResult}</p>
                    <p className="text-sm font-medium mb-2">Actions to be taken:</p>
                    <p className="text-sm mb-1">{recommendedAction}</p>
                  </>
                ) : (
                  <p>No scans found.</p>
                )}
              </div>
            </div>
          </div> 
          <div className="w-80 h-55 bg-white/20 backdrop-blur-md rounded-3xl p-4 shadow-inner text-white mb-4 -mt-63">
            <p className="text-base font-medium mb-2">Teeth Scan History</p>
            
            {scanRecords.length > 0 ? (
              <>
                <p className="text-sm mb-1">Date: {new Date(Number(scanRecords[0]?.date)).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-sm mb-1">
                  Result: {scanRecords[0].notes[0]?.toLowerCase().includes("healthy") 
                    ? "Healthy teeth" 
                    : "1 disease detected"}
                </p>
                <p className="text-sm mb-1">Diseases Present:</p>
                <p className="text-sm mb-1 capitalize">{Array.isArray(scanRecords[0]?.result) ? scanRecords[0].result.join(", ") : scanRecords[0]?.result}</p>
                <div className="flex flex-col items-center">
                  <button 
                  className="mt-6 px-4 py-2 bg-white/30 text-white rounded-3xl hover:bg-[#608cc4]/40 transition-colors duration-200"
                  onClick={() => setShowHistory(true)}
                  >
                    See History
                  </button>
                </div> 
              </>
            ) : (
              <p>No scans found.</p>
            )}
          </div>
        </>
      ) : (
        // HISTORY VIEW
        <>
          <h2 className="text-2xl font-semibold text-white mb-4">
            Scan History
          </h2>
          <div className="bg-white/20 backdrop-blur-md rounded-3xl p-4 shadow-inner text-white mb-4 max-h-[308px] min-h-[308px]">
            <p className="text-md font-medium mb-2">Past Scan Results:</p>
            <div className="max-h-64 overflow-y-auto pr-2">
              <ul className="text-md text-white/80 list-disc list-inside z-[20] ml-4">
                {scanRecords.map((record: ScanRecord, index: number) => (
                  <li
                    key={index}
                    className="cursor-pointer hover:text-white mb-4"
                    onClick={() => setSelectedRecord(record)}
                  >
                    {new Date(Number(record.date)).toLocaleString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </li>
                ))}
              </ul>
            </div>
            {selectedRecord && (
              <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"  onClick={() => setSelectedRecord(null)}>
                <div className="bg-gradient-to-br from-[#4fa1f2] via-[#74b0f0] to-[#66acf4] backdrop-blur-md rounded-3xl p-6 shadow-lg text-white w-11/12 max-w-md relative" onClick={(e) => e.stopPropagation()}>
                  {/* Close Button */}
                  <button
                    className="absolute top-2 right-4 text-white text-xl hover:text-red-300"
                    onClick={() => setSelectedRecord(null)}
                  >
                    &times;
                  </button>

                  <p className="text-base font-semibold mb-2">Teeth Scan History</p>
                  <p className="text-sm mb-1">
                    Date: {new Date(Number(selectedRecord.date)).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-sm mb-1">
                    Result: {selectedRecord?.notes?.[0] 
                      ? (selectedRecord.notes[0].toLowerCase().includes("healthy") 
                          ? "Healthy teeth" 
                          : "1 disease detected")
                      : "No Notes"}
                  </p>
                  <p className="text-sm mb-1">Diseases Present:</p>
                  <p className="text-sm mb-1">
                    {Array.isArray(selectedRecord.result)
                      ? selectedRecord.result.join(", ")
                      : selectedRecord.result}
                  </p>
                </div>
              </div>
            )}
          <div className="absolute bottom-4 w-full flex justify-center">
            <button
              className="-mt-9 px-4 py-2 bg-white/30 text-white rounded-3xl hover:bg-[#608cc4]/40 transition-colors duration-200"
              onClick={() => setShowHistory(false)}
            >
              Back
            </button>
          </div>
        </div>
        </>
      )}
    </div>
  );
};

export default HomeCard1;
