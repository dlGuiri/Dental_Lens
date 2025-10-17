import { GetServerSideProps } from "next";
import { ReactElement, useState, useEffect } from "react";
import ClinicLayout from "@/components/layout/clinic";
import Image from "next/image";
import teeth from "/public/assets/Clinic-Teeth.png";
import user from "/public/assets/User Icon.png";
import { gql, useQuery } from "@apollo/client";

const GET_USER_BY_ID = gql`
  query GetUserById($userId: ID!) {
    getUserById(userId: $userId) {
      _id
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

// Query to get all patients
const GET_ALL_PATIENTS = gql`
  query GetAllPatients {
    getAllUsers {
      _id
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

const ClinicPatients = () => {
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
    const [selectedHistoryRecord, setSelectedHistoryRecord] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch all patients
    const { data: patientsData, loading: patientsLoading } = useQuery(GET_ALL_PATIENTS);

    // Fetch selected patient details
    const { data: patientData, loading: patientLoading } = useQuery(GET_USER_BY_ID, {
        variables: { userId: selectedPatientId },
        skip: !selectedPatientId,
    });

    const patients = patientsData?.getAllUsers || [];
    const filteredPatients = patients.filter((patient: any) =>
        patient.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Auto-select first patient on load
    useEffect(() => {
        if (filteredPatients.length > 0 && !selectedPatientId) {
            setSelectedPatientId(filteredPatients[0]._id);
        }
    }, [filteredPatients, selectedPatientId]);

    // Reset history record when patient changes
    useEffect(() => {
        setSelectedHistoryRecord(null);
    }, [selectedPatientId]);

    const selectedPatient = patientData?.getUserById;
    const scanRecords = Array.isArray(selectedPatient?.scanRecords) ? selectedPatient.scanRecords : [];
    
    // Get latest scan for display
    const latestScan = scanRecords.length > 0 ? scanRecords[scanRecords.length - 1] : null;
    
    // Process diseases
    let displayResult = latestScan?.result;
    if (Array.isArray(displayResult)) {
        displayResult = displayResult.join(", ");
    } else {
        displayResult = String(displayResult ?? "No diseases detected");
    }

    return (
        <main className="min-h-screen bg-[linear-gradient(45deg,_#6a8aff,_#b2fbff)]">
            <section className="flex justify-around items-center gap-26 ml-24">
                {/* Patient Info */}
                <div className="mt-8">
                    <p className="text-3xl text-white text-shadow-sm font-bold mb-1">Latest Patient Info:</p>
                    <hr className="border-t-2 border-white w-68 mb-4" />
                    {selectedPatient ? (
                        <div className="flex flex-col gap-2">
                            <p className="text-xl text-white text-shadow-sm">Name: {selectedPatient.name}</p>
                            <p className="text-xl text-white text-shadow-sm">
                                Teeth Status: {latestScan?.notes?.[0]?.toLowerCase().includes("healthy")
                                    ? "Healthy teeth"
                                    : latestScan?.notes?.[0]
                                    ? "1 disease detected"
                                    : "No status available"}
                            </p>
                            <p className="text-xl text-white text-shadow-sm capitalize">
                                Diseases Present: {displayResult}
                            </p>
                            <p className="text-xl text-white text-shadow-sm">
                                Probability: {(() => {
                                    if (!Array.isArray(latestScan.notes) || latestScan.notes.length === 0) return "No data";
                                    
                                    // Check if healthy
                                    if (latestScan.notes[0]?.toLowerCase().includes("healthy")) {
                                    return "N/A";
                                    }
                                    
                                    // Extract probability from notes[1] for disease cases
                                    if (!latestScan.notes[1]) return "No data";
                                    const match = latestScan.notes[1].match(/\(([0-9.]+)% confidence\)/);
                                    return match ? `${match[1]}%` : "No data";
                                })()}
                            </p>
                            <p className="text-xl text-white text-shadow-sm mb-10">
                            Positive Evidence: {
                                (() => {
                                const notes: string[] = latestScan.notes || [];
                                if (notes.length === 0) return "No data";

                                // Check if healthy
                                if (notes[0]?.toLowerCase().includes("healthy")) {
                                    return "N/A";
                                }

                                // Find positive and negative evidence lines
                                const posLine = notes.find((note: string) =>
                                    note.toLowerCase().includes("total positive evidence")
                                );
                                const negLine = notes.find((note: string) =>
                                    note.toLowerCase().includes("total negative evidence")
                                );

                                if (!posLine || !negLine) return "No data";

                                // Extract numbers
                                const posMatch = posLine.match(/Total Positive Evidence:\s*([0-9.]+)/);
                                const negMatch = negLine.match(/Total Negative Evidence:\s*(-?[0-9.]+)/);

                                if (!posMatch || !negMatch) return "No data";

                                const pos = parseFloat(posMatch[1]);
                                const neg = parseFloat(negMatch[1]);

                                // Calculate positive percentage
                                const percentage = (pos / (pos + Math.abs(neg))) * 100;

                                return `${percentage.toFixed(1)}%`;
                                })()
                            }
                            </p>
                        </div>
                    ) : (
                        <p className="text-xl text-white text-shadow-sm">Select a patient to view details</p>
                    )}
                    <button className="px-4 py-2 bg-white/20 text-white rounded-3xl hover:bg-[#608cc4]/40 transition-colors duration-200">
                        See Latest Image Scan
                    </button>
                </div>

                {/* Teeth Image */}
                <div className="mt-8">
                    <Image
                        src={teeth}
                        alt="Tooth Logo"
                        className="w-32 sm:w-40 md:w-52 lg:w-64 xl:w-72 rounded-2xl mx-auto"
                        height={undefined}
                        width={undefined}
                    />
                </div>

                <div className="flex flex-col gap-6 mt-10">
                    {/* Search Bar */}
                    <div className="relative">
                        <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-xl">
                            🔍︎
                        </button>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-74 pl-12 pr-6 py-3 rounded-full bg-white/10 rounded-lg shadow-sm text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:border-opacity-100"
                        />
                    </div>
                    
                    {/* List with Scrollbar */}
                    <div className="w-full max-w-md">
                        <div className="h-57 w-74 overflow-y-auto p-4 bg-white/10 rounded-lg shadow-lg">
                            <div className="flex items-center justify-between">
                                <h5 className="text-xl font-bold leading-none text-white text-shadow-sm">Patients</h5>
                            </div>
                            <div className="flow-root">
                                {patientsLoading ? (
                                    <p className="text-white">Loading patients...</p>
                                ) : (
                                    <ul role="list" className="divide-y divide-white divide-opacity-30">
                                        {filteredPatients.map((patient: any) => (
                                            <li 
                                                key={patient._id}
                                                className="py-3 sm:py-4 cursor-pointer hover:bg-white/10 rounded transition-colors"
                                                onClick={() => setSelectedPatientId(patient._id)}
                                            >
                                                <div className="flex items-center">
                                                    <div>
                                                        <Image 
                                                            className="w-8 h-8 rounded-full" 
                                                            src={user} 
                                                            alt={patient.name} 
                                                            width={32} 
                                                            height={32} 
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0 ms-4">
                                                        <p className="text-lg font-medium text-white text-shadow-xs truncate">
                                                            {patient.name}
                                                        </p>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Horizontal Line - Centered */}
            <div className="my-11">
                <hr className="border-t-2 border-white w-full mx-auto" />
            </div>

            <section className="flex justify-start items-start gap-6 ml-40">
                <div className="h-78 w-[25%] overflow-y-auto p-4 bg-white/10 rounded-lg shadow-lg custom-scrollbar">
                    <p className="text-3xl text-white text-shadow-sm font-bold mb-1">History:</p>
                    {selectedPatient && scanRecords.length > 0 ? (
                        <ul role="list" className="flex flex-col gap-4 list-disc list-inside">
                            {scanRecords.map((record: any, index: number) => (
                                <li 
                                    key={index}
                                    className="text-lg font-medium text-white text-shadow-sm truncate cursor-pointer hover:text-blue-200"
                                    onClick={() => setSelectedHistoryRecord(record)}
                                >
                                    {new Date(Number(record.date)).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-lg text-white">No history available</p>
                    )}
                </div>

                <div className="w-[68%]">
                    <div className="h-78 overflow-y-auto p-4 bg-white/10 rounded-lg shadow-lg">
                        {selectedHistoryRecord ? (
                            <div className="flex flex-col items-start gap-2">
                                <h5 className="text-xl font-bold leading-none text-white text-shadow-sm">
                                    {new Date(Number(selectedHistoryRecord.date)).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </h5>
                                <div className="text-xl text-white mb-2">
                                    <strong>Result:</strong>
                                    <ul className="list-disc list-inside ml-4 mt-2">
                                        {Array.isArray(selectedHistoryRecord.notes) 
                                        ? selectedHistoryRecord.notes.map((note: string, idx: number) => (
                                            <li key={idx} className="text-lg">{note}</li>
                                            ))
                                        : "No notes"}
                                    </ul>
                                </div>
                                <p className="text-xl text-white capitalize">
                                    <strong>Diseases:</strong>{" "}
                                    {Array.isArray(selectedHistoryRecord.result)
                                        ? selectedHistoryRecord.result.join(", ")
                                        : selectedHistoryRecord.result}
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-start gap-2">
                                <h5 className="text-xl font-bold leading-none text-white text-shadow-sm">
                                    Select a history entry
                                </h5>
                                <p className="text-xl text-white">
                                    {selectedPatient ? "Click on a date to view details" : "No patient selected"}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
};

ClinicPatients.getLayout = function getLayout(page: ReactElement) {
    return <ClinicLayout>{page}</ClinicLayout>;
};

export default ClinicPatients;