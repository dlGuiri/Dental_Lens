import React, { useState } from "react";
import { Send, MoreVertical } from "lucide-react";
import Link from "next/link";

interface Message {
  id: string;
  text: string;
  sender: "user" | "other";
  timestamp: string;
}

interface PatientChatCardProps {
  className?: string;
}

const PatientChatCard = ({ className = "" }: PatientChatCardProps) => {
  const dentist = {
    id: "d1",
    name: "Dr. Santos (Placeholder Dentist)",
  };

  const [messageText, setMessageText] = useState("");
  
  // Placeholder messages
  const messages: Message[] = [
    { id: "1", text: "This is a placeholder message from the dentist", sender: "other", timestamp: "10:00 AM" },
    { id: "2", text: "This is a placeholder reply from the patient", sender: "user", timestamp: "10:02 AM" },
    { id: "3", text: "Another placeholder message from the dentist", sender: "other", timestamp: "10:05 AM" },
    { id: "4", text: "Another placeholder reply from the patient", sender: "user", timestamp: "10:07 AM" },
  ];

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // Placeholder - Backend will handle this
      console.log("Message sent:", messageText);
      setMessageText("");
    }
  };

  return (
    <div className={`bg-gradient-to-br from-blue-400 via-blue-300 to-cyan-200 shadow-lg overflow-hidden h-full w-full ${className}`}>
      <div className="flex flex-col h-full">
        {/* Chat Header */}
        <div className="p-4 bg-white/30 backdrop-blur-sm border-b border-white/20 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">{dentist.name}</h2>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.sender === "other" && (
                <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center mr-2 flex-shrink-0">
                  <div className="w-6 h-6 rounded-full bg-blue-300"></div>
                </div>
              )}
              <div
                className={`max-w-md px-4 py-2 rounded-2xl ${
                  message.sender === "user"
                    ? "bg-white text-gray-800"
                    : "bg-white/90 text-gray-800"
                }`}
              >
                <p className="text-sm">{message.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 bg-white/30 backdrop-blur-sm border-t border-white/20">
          <div className="flex gap-2">
            <Link href={``}>
              <button className="p-3 bg-white/40 rounded-full hover:bg-white/60 transition-colors">
                 <svg
                    className="w-6 h-6 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
                />
                <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 2v6h6"
                />
                </svg>
            </button>

            </Link>
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Your Message"
              className="flex-1 px-4 py-3 bg-white/40 backdrop-blur-sm text-gray-800 placeholder-gray-500 rounded-full focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button
              onClick={handleSendMessage}
              className="p-3 bg-white/40 rounded-full hover:bg-white/60 transition-colors"
            >
              <Send className="text-blue-500" size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientChatCard;