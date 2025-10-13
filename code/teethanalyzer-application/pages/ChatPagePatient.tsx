import dynamic from "next/dynamic";
import Head from "next/head";

const PatientChatCard = dynamic(() => import("@/components/PatientChatCard"), { ssr: false });

export default function PatientChat() {
  return (
    <>
      <Head>
        <title>Patient Chat - Dental Lens</title>
      </Head>

      {/* Full screen minus sidebar */}
      <div className="fixed top-0 left-24 right-0 bottom-0 flex items-stretch justify-center bg-gradient-to-br from-blue-400 via-blue-300 to-cyan-200">
        {/* Card fills the remaining screen */}
        <div className="w-full h-full">
          <PatientChatCard className="h-full w-full" />
        </div>
      </div>
    </>
  );
}
