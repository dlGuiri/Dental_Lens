import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/router";

interface MessageRequest {
  id: string;
  name: string;
  lastMessage: string;
  messages: Array<{
    id: string;
    text: string;
    sender: 'user' | 'other';
  }>;
}

interface MessageReqCardProps {
  dentist: {
    id: string;
    name: string;
    email: string;
    role: string;
    clinicName: string;
  };
}

const MessageReqCard = ({ dentist }: MessageReqCardProps) => {
  const router = useRouter();
  const [selectedRequest, setSelectedRequest] = useState<MessageRequest | null>(null);

  // Sample message requests (PLACEHOLDER DATA)
  const requests: MessageRequest[] = [
    {
      id: '1',
      name: 'Request Patient 1',
      lastMessage: 'Placeholder message request text...',
      messages: [
        { id: '1', text: 'This is a placeholder message from a patient requesting to connect', sender: 'other' },
        { id: '2', text: 'Another placeholder message text here', sender: 'other' },
        { id: '3', text: 'More placeholder message content', sender: 'other' }
      ]
    },
    {
      id: '2',
      name: 'Request Patient 2',
      lastMessage: 'Placeholder message request text...',
      messages: [
        { id: '1', text: 'This is a placeholder message from a patient requesting to connect', sender: 'other' }
      ]
    },
    {
      id: '3',
      name: 'Request Patient 3',
      lastMessage: 'Placeholder message request text...',
      messages: [
        { id: '1', text: 'This is a placeholder message from a patient requesting to connect', sender: 'other' }
      ]
    },
    {
      id: '4',
      name: 'Request Patient 4',
      lastMessage: 'Placeholder message request text...',
      messages: [
        { id: '1', text: 'This is a placeholder message from a patient requesting to connect', sender: 'other' }
      ]
    },
    {
      id: '5',
      name: 'Request Patient 5',
      lastMessage: 'Placeholder message request text...',
      messages: [
        { id: '1', text: 'This is a placeholder message from a patient requesting to connect', sender: 'other' }
      ]
    }
  ];

  const handleAccept = () => {
    console.log('Accepted request from:', selectedRequest?.name);
    // Placeholder - Backend will handle this
    // Backend: POST /api/message-requests/:id/accept
    router.push('/clinic/chatpage');
  };

  const handleDecline = () => {
    console.log('Declined request from:', selectedRequest?.name);
    // Placeholder - Backend will handle this
    // Backend: POST /api/message-requests/:id/decline
    setSelectedRequest(null);
  };

  const handleBack = () => {
    if (selectedRequest) {
      setSelectedRequest(null);
    } else {
      router.push('/clinic/chatpage');
    }
  };

  return (
    <div className="fixed top-0 right-0 bottom-0 left-24 overflow-hidden">
      <div className="bg-gradient-to-br from-blue-400 via-blue-300 to-cyan-200 h-full w-full">
        {!selectedRequest ? (
          // List View
          <div className="relative p-8 h-full overflow-y-auto flex flex-col items-center">
            {/* Back Button - Far Left */}
            <button
              onClick={handleBack}
              className="fixed top-8 left-28 p-3 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors z-20"
            >
              <ArrowLeft className="text-blue-500" size={24} />
            </button>

            <div className="w-full max-w-4xl">
              <h1 className="text-3xl font-bold text-white mb-8">Message Requests</h1>

              <div className="space-y-4">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    onClick={() => setSelectedRequest(request)}
                    className="flex items-start gap-4 p-6 bg-white/20 backdrop-blur-md rounded-2xl hover:bg-white/30 transition-colors cursor-pointer"
                  >
                    <div className="w-14 h-14 rounded-full bg-white/50 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-blue-300"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-xl mb-1">{request.name}</h3>
                      <p className="text-sm text-white/90 truncate">{request.lastMessage}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Conversation View
          <div className="relative flex flex-col h-full items-center">
            {/* Back Button - Far Left */}
            <button
              onClick={handleBack}
              className="fixed top-8 left-28 p-3 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors z-20"
            >
              <ArrowLeft className="text-blue-500" size={24} />
            </button>

            <div className="p-8 pb-4 w-full max-w-4xl">
              <h1 className="text-3xl font-bold text-white">{selectedRequest.name}</h1>
            </div>

            {/* Messages and Buttons Container with Background */}
            <div className="flex-1 w-full max-w-4xl px-8 pb-8 flex flex-col">
              <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-6 border border-white/30 flex-1 flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto mb-6">
                  <div className="space-y-4">
                    {selectedRequest.messages.map((message) => (
                      <div key={message.id} className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-white/50 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-blue-300"></div>
                        </div>
                        <div className="max-w-lg px-5 py-3 bg-white/30 backdrop-blur-md rounded-2xl">
                          <p className="text-base text-gray-800">{message.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons inside container */}
                <div className="grid grid-cols-2 gap-6">
                  <button
                    onClick={handleAccept}
                    className="py-5 px-8 bg-white/30 backdrop-blur-md text-black text-xl font-semibold rounded-2xl hover:bg-white/40 transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={handleDecline}
                    className="py-5 px-8 bg-white/30 backdrop-blur-md text-black text-xl font-semibold rounded-2xl hover:bg-white/40 transition-colors"
                  >
                    Decline
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageReqCard;