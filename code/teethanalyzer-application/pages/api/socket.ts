import { Server as IOServer } from "socket.io";
import type { NextApiRequest, NextApiResponse } from "next";
import type { Server as HTTPServer } from "http";
import type { Socket as NetSocket } from "net";

interface SocketServer extends HTTPServer {
  io?: IOServer | undefined;
}

interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO;
}

async function createMessage(conversationId: string, senderId: string, content: string) {
  return {
    id: Date.now().toString(),
    conversationId,
    senderId,
    content,
    timestamp: new Date().toISOString(),
  };
}

export default function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (res.socket?.server?.io) {
    console.log("⚡ Socket.IO server already running.");
    res.end();
    return;
  }

  console.log("🟢 Initializing new Socket.IO server...");
  
  const io = new IOServer(res.socket.server, {
    path: "/api/socket",
    addTrailingSlash: false,
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    },
  });

  res.socket.server.io = io;

  io.on("connection", (socket) => {
    console.log(`🧩 User connected: ${socket.id}`);

    socket.on("joinConversation", (conversationId) => {
      socket.join(conversationId);
      console.log(`User ${socket.id} joined room ${conversationId}`);
    });

    socket.on("startConversation", (participantIds) => {
      const newConversation = { 
        id: Date.now().toString(), 
        participants: participantIds 
      };
      socket.emit("conversationStarted", newConversation);
    });

    socket.on("sendMessage", async ({ conversationId, senderId, content }) => {
      try {
        const message = await createMessage(conversationId, senderId, content);
        io.to(conversationId).emit("newMessage", message);
      } catch (err) {
        console.error("❌ Error sending message:", err);
        socket.emit("error", "Message failed to send.");
      }
    });

    socket.on("disconnect", () => {
      console.log(`🔴 User disconnected: ${socket.id}`);
    });
  });

  res.end();
}