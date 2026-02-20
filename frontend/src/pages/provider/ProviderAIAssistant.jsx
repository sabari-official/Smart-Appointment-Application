import React, { useState, useRef, useEffect } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { aiService } from "../../services/apiService";

const ProviderAIAssistant = () => {
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hello! 👋 I'm your AI assistant. I can help you manage your schedule, optimize your profile, and provide insights about your practice. How can I help?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: msg }]);
    setLoading(true);
    try {
      const res = await aiService.chat(msg);
      setMessages(prev => [...prev, { role: "bot", text: res.data?.reply || "Sorry, I couldn't process that." }]);
    } catch {
      setMessages(prev => [...prev, { role: "bot", text: "Sorry, something went wrong. Please try again." }]);
    } finally { setLoading(false); }
  };

  return (
    <DashboardLayout theme="provider">
      <div className="page-header">
        <h1 style={{ color: 'var(--text-primary)' }}>AI <span className="text-gradient">Assistant</span> 🤖</h1>
        <p>Your intelligent practice management companion</p>
      </div>

      <div className="max-w-3xl">
        <div className="card" style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`ai-msg ${msg.role}`} style={{ maxWidth: '80%' }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="ai-msg bot">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="p-4" style={{ borderTop: '1px solid var(--border-color)' }}>
            <div className="flex gap-3">
              <input
                className="form-input flex-1"
                placeholder="Ask me anything about your practice..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
                disabled={loading}
              />
              <button onClick={handleSend} className="btn btn-primary" disabled={loading || !input.trim()}>
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProviderAIAssistant;
