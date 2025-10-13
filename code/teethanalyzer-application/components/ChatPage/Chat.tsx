import React, { useState } from 'react';
import { Search, Send, MoreVertical } from 'lucide-react';
import Link from 'next/link';

interface Contact {
  id: string;
  name: string;
  lastMessage: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'other';
  timestamp: string;
}

const ClinicChatCard = ({ className = "" }) => {
  // Placeholder contacts
  const contacts: Contact[] = [
    { id: '1', name: 'Patient Name 1', lastMessage: 'Placeholder message text goes here...' },
    { id: '2', name: 'Patient Name 2', lastMessage: 'Placeholder message text goes here...' },
    { id: '3', name: 'Patient Name 3', lastMessage: 'Placeholder message text goes here...' },
    { id: '4', name: 'Patient Name 4', lastMessage: 'Placeholder message text goes here...' },
    { id: '5', name: 'Patient Name 5', lastMessage: 'Placeholder message text goes here...' },
    { id: '6', name: 'Patient Name 6', lastMessage: 'Placeholder message text goes here...' }
  ];

  const [selectedContact, setSelectedContact] = useState<Contact>(contacts[1]); // Pre-select Patient Name 2
  const [messageText, setMessageText] = useState('');

  // Placeholder messages
  const messages: Message[] = [
    { id: '1', text: 'This is a placeholder message from the patient', sender: 'other', timestamp: '10:30 AM' },
    { id: '2', text: 'This is a placeholder reply from the dentist', sender: 'user', timestamp: '10:32 AM' },
    { id: '3', text: 'Another placeholder message from the patient', sender: 'other', timestamp: '10:35 AM' },
    { id: '4', text: 'Another placeholder message from the patient', sender: 'other', timestamp: '10:36 AM' },
    { id: '5', text: 'Another placeholder reply from the dentist', sender: 'user', timestamp: '10:38 AM' }
  ];

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // Placeholder for send functionality
      setMessageText('');
    }
  };

  return (
    <div className={`bg-gradient-to-br from-blue-400 via-blue-300 to-cyan-200 shadow-lg overflow-hidden ${className}`}>
      <div className="flex h-full">
        {/* Contacts Sidebar */}
        <div className="w-80 bg-white/30 backdrop-blur-sm border-r border-white/20 flex flex-col">
          {/* Search Bar */}
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" size={20} />
              <input
                type="text"
                placeholder="Search"
                className="w-full pl-10 pr-4 py-2 bg-white/40 backdrop-blur-sm text-white placeholder-white/70 rounded-full focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
          </div>

          {/* Contacts List */}
          <div className="overflow-y-auto flex-1">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`flex items-start gap-3 p-4 cursor-pointer transition-colors ${
                  selectedContact?.id === contact.id 
                    ? 'bg-white/50' 
                    : 'hover:bg-white/20'
                }`}
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-white/50 flex items-center justify-center flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-blue-300"></div>
                </div>
                
                {/* Contact Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{contact.name}</h3>
                  <p className="text-sm text-white/80 truncate">{contact.lastMessage}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Requests Button */}
          <div className="p-4 border-t border-white/20">
            <Link href="/clinic/MessageRequestPage">
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-white/40 backdrop-blur-sm rounded-full hover:bg-white/60 transition-colors">
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                  <span className="text-blue-500 text-xs font-bold">!</span>
                </div>
                <span className="text-gray-800 font-medium">Message Requests</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white/20 backdrop-blur-sm">
          {/* Chat Header */}
          <div className="p-4 bg-white/30 backdrop-blur-sm border-b border-white/20 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">{selectedContact.name}</h2>
             {/* This is the 3-dot vertical button */}
            <button className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <MoreVertical className="text-white" size={24} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender === 'other' && (
                  <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center mr-2 flex-shrink-0">
                    <div className="w-6 h-6 rounded-full bg-blue-300"></div>
                  </div>
                )}
                <div
                  className={`max-w-md px-4 py-2 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-white text-gray-800'
                      : 'bg-white/90 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 bg-white/30 backdrop-blur-sm border-t border-white/20">
  <div className="flex gap-2 items-center">
    {/* Appointment Button */}
    <Link
      href={`/clinic/appointment?patientId=${selectedContact.id}&patientName=${selectedContact.name}`}
    >
      <button
        title="Set Appointment"
        className="p-3 bg-white/40 rounded-full hover:bg-white/60 transition-colors"
      >
        <svg
          className="w-6 h-6 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </button>
    </Link>
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
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
    </div>
  );
};

export default ClinicChatCard;