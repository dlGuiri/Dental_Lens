import ChatTextBox from "./ChatTextBox";
import ChatWindow from "./ChatWindow";
import { useState } from "react";

type Message = {
  sender: "user" | "bot";
  text: string;
};

const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    { sender: "bot", text: "Hello I'm Denty! How can I help?" },
  ]);

  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (text: string) => {
    const userMessage: Message = { sender: "user", text };
    setMessages((prev) => [...prev, userMessage]);

    const botMessage: Message = { sender: "bot", text: "" };
    const botIndex = messages.length + 1;
    setMessages((prev) => [...prev, botMessage]);

    setIsTyping(true);

    try {
      const res = await fetch("http://localhost:8000/chat-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder("utf-8");

      if (reader) {
        let done = false;
        while (!done) {
          const { value, done: streamDone } = await reader.read();
          done = streamDone;

          if (value) {
            const chunk = decoder.decode(value, { stream: true });

            for (let i = 0; i < chunk.length; i += 3) {
              const chars = chunk.slice(i, i + 3);
              await new Promise((resolve) => setTimeout(resolve, 10));
              setMessages((prev) =>
                prev.map((msg, idx) =>
                  idx === botIndex ? { ...msg, text: msg.text + chars } : msg
                )
              );
            }
          }
        }
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Error: Could not stream response." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };



  return (
     <div className="flex flex-col h-full w-full p-4">
      <ChatWindow messages={messages} isTyping={isTyping} />

      <div className="mb-3 w-full max-w-2xl mx-auto">
        <ChatTextBox onSend={handleSend} />
      </div>
    </div>
  );
};

export default Chatbot;
