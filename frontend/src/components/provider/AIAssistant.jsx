import React, { useState, useRef, useEffect } from "react";
import { Send, MessageCircle, X, Minimize2, Maximize2, Loader } from "lucide-react";
import toast from "react-hot-toast";

const AIAssistant = ({ providerDomain = "general" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: `Hello! 👋 I'm your AI Assistant for ${providerDomain}. How can I help you today? I can help you with booking management, profile optimization, and service recommendations.`,
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputValue("");
    setLoading(true);

    try {
      // Call backend AI service for real responses
      // This will be implemented when backend endpoint is ready
      // For now, show placeholder
      const botMessage = {
        id: messages.length + 2,
        text: "AI Response feature will be available soon. Please connect to the backend AI service.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('AI error:', error);
      const errorMessage = {
        id: messages.length + 2,
        text: "Sorry, I encountered an error. Please try again.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Simulate AI response delay
  /*
  setTimeout(() => {
    const domainType = providerDomain.toLowerCase();
    const responses = aiResponses[domainType] || aiResponses.general || aiResponses.doctor;
  };
  };
  */

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition transform hover:scale-110 z-40"
        title="Open AI Assistant"
      >
        <MessageCircle size={24} />
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 bg-white rounded-lg shadow-2xl border border-gray-200 transition transform z-40 ${
        isMinimized ? "w-80 h-16" : "w-80 h-96 md:w-96 md:h-[500px]"
      }`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle size={20} />
          <div>
            <h3 className="font-semibold">🤖 AI Assistant</h3>
            <p className="text-xs opacity-90">Always here to help</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="hover:bg-blue-500 p-2 rounded transition"
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-blue-500 p-2 rounded transition"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 max-h-[calc(100%-140px)]">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    message.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white border border-gray-200 text-gray-900 rounded-bl-none"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  <p className={`text-xs mt-1 ${message.sender === "user" ? "opacity-75" : "text-gray-500"}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 text-gray-900 p-3 rounded-lg rounded-bl-none flex items-center gap-2">
                  <Loader size={16} className="animate-spin" />
                  <span className="text-sm">AI is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
            <div className="flex gap-2">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm resize-none"
                rows="2"
              />
              <button
                onClick={handleSendMessage}
                disabled={loading || !inputValue.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-2 rounded-lg transition"
              >
                <Send size={18} />
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-2">💡 Try asking about booking tips or profile optimization</div>
          </div>
        </>
      )}
    </div>
  );
};

export default AIAssistant;
