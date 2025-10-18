import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const initSocket = async () => {
      try {
        // Initialize the Socket.IO API route
        await fetch("/api/socket");

        // Only create socket if it doesn't exist
        if (!socket) {
          socket = io({
            path: "/api/socket",
            addTrailingSlash: false,
            transports: ["polling", "websocket"], // Try polling first, then upgrade
          });

          socket.on("connect", () => {
            console.log("✅ Socket connected:", socket?.id);
            setIsConnected(true);
          });

          socket.on("disconnect", () => {
            console.log("❌ Socket disconnected");
            setIsConnected(false);
          });

          socket.on("connect_error", (err) => {
            console.error("❌ Socket connection error:", err.message);
          });
        } else if (!socket.connected) {
          socket.connect();
        }
      } catch (error) {
        console.error("❌ Failed to initialize socket route:", error);
      }
    };

    initSocket();

    return () => {
      // Keep connection alive across component remounts
    };
  }, []);

  const joinConversation = (conversationId: string) => {
    if (socket?.connected) {
      socket.emit('joinConversation', conversationId);
    }
  };

  const sendMessage = (conversationId: string, senderId: string, content: string) => {
    if (socket?.connected) {
      socket.emit('sendMessage', { conversationId, senderId, content });
    }
  };

  const startConversation = (participantIds: string[]) => {
    if (socket?.connected) {
      socket.emit('startConversation', participantIds);
    }
  };

  const onNewMessage = (callback: (message: any) => void) => {
    if (socket) {
      socket.on('newMessage', callback);
    }
  };

  const onConversationStarted = (callback: (conversation: any) => void) => {
    if (socket) {
      socket.on('conversationStarted', callback);
    }
  };

  const offNewMessage = () => {
    if (socket) {
      socket.off('newMessage');
    }
  };

  const offConversationStarted = () => {
    if (socket) {
      socket.off('conversationStarted');
    }
  };

  return {
    socket,
    isConnected,
    joinConversation,
    sendMessage,
    startConversation,
    onNewMessage,
    onConversationStarted,
    offNewMessage,
    offConversationStarted,
  };
};