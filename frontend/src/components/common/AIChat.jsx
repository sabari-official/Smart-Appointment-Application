import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { aiService } from "../../services/apiService";

const AIChat = () => {
  const { user, token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = getGreeting();
      setMessages([{ role: "bot", text: greeting }]);
    }
  }, [isOpen]);

  const getGreeting = () => {
    const role = user?.role || "customer";
    const name = user?.name?.split(" ")[0] || "there";
    const greetings = {
      customer: `Hello ${name}! 👋 I'm your AI assistant. I can help you find providers, book appointments, or answer any questions. What would you like to do?`,
      provider: `Hello ${name}! 👋 I can help you manage your schedule, check bookings, or improve your profile. How can I assist you?`,
      admin: `Hello Admin ${name}! 👋 I can help with system analytics, user management, and performance insights. What do you need?`,
    };
    return greetings[role] || greetings.customer;
  };

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: msg }]);
    setLoading(true);

    try {
      let response;
      if (user?.role === "admin") {
        response = await aiService.adminChat(msg);
      } else {
        response = await aiService.chat(msg);
      }
      const reply = response?.data?.reply || "I'm sorry, I couldn't process your request. Please try again.";
      setMessages((prev) => [...prev, { role: "bot", text: reply }]);
    } catch (err) {
      const errMsg = err.response?.data?.message || "Sorry, something went wrong. Please try again.";
      setMessages((prev) => [...prev, { role: "bot", text: errMsg }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!token || !user) return null;

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="ai-chat-window animate-scale-in">
          <div className="ai-chat-header">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg">
              🤖
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">AI Assistant</h3>
              <p className="text-xs opacity-80">Always ready to help</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors text-sm"
            >
              ✕
            </button>
          </div>

          <div className="ai-chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`ai-msg ${msg.role}`}>
                {msg.text}
              </div>
            ))}
            {loading && (
              <div className="ai-msg bot">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="ai-chat-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={loading}
            />
            <button onClick={handleSend} disabled={loading || !input.trim()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="ai-chat-trigger"
        title="AI Assistant"
        id="ai-chat-trigger"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /><path d="M8 10h.01M12 10h.01M16 10h.01" /></svg>
        )}
      </button>
    </>
  );
};

export default AIChat;
