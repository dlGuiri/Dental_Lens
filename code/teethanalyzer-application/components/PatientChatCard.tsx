import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, MoreVertical } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useSocket } from '@/hooks/useSocket';
import { useQuery, useMutation, gql } from '@apollo/client';

// Add query to fetch current user from database
const GET_CURRENT_USER = gql`
  query GetUserById($userId: ID!) {
    getUserById(userId: $userId) {
      _id
      name
      email
    }
  }
`;

const GET_USER_CONVERSATIONS = gql`
  query GetUserConversations($userId: ID!) {
    getUserConversations(userId: $userId) {
      _id
      participants {
        _id
        name
        email
      }
      lastMessage {
        _id
        content
        createdAt
        sender {
          _id
          name
        }
      }
      updatedAt
    }
  }
`;

const GET_MESSAGES = gql`
  query GetMessages($conversationId: ID!) {
    getMessages(conversationId: $conversationId) {
      _id
      content
      sender {
        _id
        name
      }
      createdAt
      isRead
    }
  }
`;

const CREATE_CONVERSATION = gql`
  mutation CreateConversation($participantIds: [ID!]!) {
    createConversation(participantIds: $participantIds) {
      _id
      participants {
        _id
        name
        email
      }
      lastMessage {
        _id
        content
        createdAt
      }
      updatedAt
    }
  }
`;

const GET_DENTISTS = gql`
  query GetDentists {
    getDentists {
      _id
      name
      email
    }
  }
`;

interface PatientChatCardProps {
  className?: string;
}

const PatientChatCard = ({ className = "" }: PatientChatCardProps) => {
  const { data: session } = useSession();
  const patientId = session?.user?.id;

  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    isConnected,
    joinConversation,
    sendMessage,
    onNewMessage,
    offNewMessage,
  } = useSocket();

  // Fetch current user data from database
  const { data: currentUserData, loading: currentUserLoading, error: currentUserError } = useQuery(
    GET_CURRENT_USER,
    {
      variables: { userId: patientId },
      skip: !patientId,
    }
  );

  // Fetch user conversations
  const { data: conversationsData, loading: conversationsLoading, refetch: refetchConversations } = useQuery(
    GET_USER_CONVERSATIONS,
    {
      variables: { userId: patientId },
      skip: !patientId,
    }
  );

  // Fetch messages for selected conversation
  const { data: messagesData, loading: messagesLoading, refetch: refetchMessages } = useQuery(
    GET_MESSAGES,
    {
      variables: { conversationId: selectedConversation?._id },
      skip: !selectedConversation,
    }
  );

  // Create conversation mutation
  const [createConversation, { loading: creatingConversation }] = useMutation(
    CREATE_CONVERSATION,
    {
      onCompleted: (data) => {
        if (data?.createConversation) {
          setSelectedConversation(data.createConversation);
          refetchConversations();
        }
      },
      onError: (error) => {
        console.error('Error creating conversation:', error);
        alert('Failed to start conversation. Please try again.');
      }
    }
  );

  // Update messages when data changes
  useEffect(() => {
    if (messagesData?.getMessages) {
      setMessages(messagesData.getMessages);
    }
  }, [messagesData]);

  // Join conversation room when selected
  useEffect(() => {
    if (selectedConversation?._id && isConnected) {
      joinConversation(selectedConversation._id);
    }
  }, [selectedConversation, isConnected]);

  // Listen for new messages
  useEffect(() => {
    onNewMessage((newMessage: any) => {
      if (newMessage.conversationId === selectedConversation?._id) {
        setMessages((prev) => [...prev, newMessage]);
        refetchConversations();
      } else {
        refetchConversations();
      }
    });

    return () => {
      offNewMessage();
    };
  }, [selectedConversation]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (messageText.trim() && selectedConversation && isConnected && patientId) {
      sendMessage(selectedConversation._id, patientId, messageText.trim());
      setMessageText('');
    }
  };

  const handleStartConversation = async () => {
    if (!patientId) return;
    
    try {
      // Replace with actual dentist ID from your system
      const dentistId = "68f2224468c03c6e5533fed6"; 
      await createConversation({
        variables: {
          participantIds: [patientId, dentistId]
        }
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  // Filter conversations based on search
  const filteredConversations = conversationsData?.getUserConversations?.filter((conv: any) => {
    const otherParticipant = conv.participants.find((p: any) => p._id !== patientId);
    return otherParticipant?.name?.toLowerCase().includes(searchQuery.toLowerCase());
  }) || [];

  // Get other participant for a conversation
  const getOtherParticipant = (conversation: any) => {
    return conversation.participants.find((p: any) => p._id !== patientId);
  };

  // Show loading state if no session or still loading user data
  if (!session || !patientId) {
    return (
      <div className={`bg-gradient-to-br from-blue-400 via-blue-300 to-cyan-200 shadow-lg overflow-hidden ${className} flex items-center justify-center`}>
        <div className="text-white text-xl">Please log in to access chat</div>
      </div>
    );
  }

  if (currentUserLoading) {
    return (
      <div className={`bg-gradient-to-br from-blue-400 via-blue-300 to-cyan-200 shadow-lg overflow-hidden ${className} flex items-center justify-center`}>
        <div className="text-white text-xl">Loading user data...</div>
      </div>
    );
  }

  if (currentUserError) {
    return (
      <div className={`bg-gradient-to-br from-blue-400 via-blue-300 to-cyan-200 shadow-lg overflow-hidden ${className} flex items-center justify-center`}>
        <div className="text-white text-xl">Error loading user data. Please refresh.</div>
      </div>
    );
  }

  // Get user data from database instead of session
  const currentUser = currentUserData?.getUserById;

  if (!currentUser) {
    return (
      <div className={`bg-gradient-to-br from-blue-400 via-blue-300 to-cyan-200 shadow-lg overflow-hidden ${className} flex items-center justify-center`}>
        <div className="text-white text-xl">User data not found in database</div>
      </div>
    );
  }

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
                placeholder="Search dentists"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/40 backdrop-blur-sm text-white placeholder-white/70 rounded-full focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
          </div>

          {/* Connection Status */}
          <div className="px-4 pb-2">
            <div className={`text-xs ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {isConnected ? '● Connected' : '● Disconnected'}
            </div>
          </div>

          {/* Contacts List */}
          <div className="overflow-y-auto flex-1">
            {conversationsLoading ? (
              <div className="p-4 text-white text-center">Loading conversations...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-4 text-white text-center">
                <p className="mb-2">No conversations yet</p>
                <button
                  onClick={handleStartConversation}
                  disabled={creatingConversation}
                  className="px-4 py-2 bg-white/40 rounded-full hover:bg-white/60 transition-colors disabled:opacity-50"
                >
                  {creatingConversation ? 'Starting...' : 'Start Chat with Dentist'}
                </button>
              </div>
            ) : (
              filteredConversations.map((conversation: any) => {
                const otherParticipant = getOtherParticipant(conversation);
                return (
                  <div
                    key={conversation._id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`flex items-start gap-3 p-4 cursor-pointer transition-colors ${
                      selectedConversation?._id === conversation._id
                        ? 'bg-white/50'
                        : 'hover:bg-white/20'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-white/50 flex items-center justify-center flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-blue-300 flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {otherParticipant?.name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">
                        {otherParticipant?.name || 'Unknown'}
                      </h3>
                      <p className="text-sm text-white/80 truncate">
                        {conversation.lastMessage?.content || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white/20 backdrop-blur-sm">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-white/30 backdrop-blur-sm border-b border-white/20 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {getOtherParticipant(selectedConversation)?.name || 'Unknown'}
                  </h2>
                  <p className="text-sm text-white/80">
                    {getOtherParticipant(selectedConversation)?.email}
                  </p>
                </div>
                <button className="p-2 hover:bg-white/20 rounded-full transition-colors">
                  <MoreVertical className="text-white" size={24} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messagesLoading ? (
                  <div className="text-white text-center">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="text-white text-center">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  messages.map((message: any) => {
                    const isOwnMessage = message.sender._id === patientId;
                    return (
                      <div
                        key={message._id}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isOwnMessage && (
                          <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center mr-2 flex-shrink-0">
                            <div className="w-6 h-6 rounded-full bg-blue-300 flex items-center justify-center">
                              <span className="text-white text-xs font-semibold">
                                {message.sender.name?.charAt(0)?.toUpperCase() || '?'}
                              </span>
                            </div>
                          </div>
                        )}
                        <div
                          className={`max-w-md px-4 py-2 rounded-2xl ${
                            isOwnMessage
                              ? 'bg-white text-gray-800'
                              : 'bg-white/90 text-gray-800'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 bg-white/30 backdrop-blur-sm border-t border-white/20">
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your message..."
                    disabled={!isConnected}
                    className="flex-1 px-4 py-3 bg-white/40 backdrop-blur-sm text-gray-800 placeholder-gray-500 rounded-full focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!isConnected || !messageText.trim()}
                    className="p-3 bg-white/40 rounded-full hover:bg-white/60 transition-colors disabled:opacity-50"
                  >
                    <Send className="text-blue-500" size={24} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-white text-xl">
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientChatCard;