import React, { useState, useRef, useEffect } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { aiService } from "../../services/apiService";

const AIHelpDesk = () => {
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hello Admin! 👑 I'm your advanced AI assistant with system-wide insights. I can help you analyze provider performance, system health, user trends, and more. What would you like to know?" }
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
      const res = await aiService.adminChat(msg);
      const reply = res.data?.reply || "Sorry, couldn't process that.";
      const context = res.data?.systemContext;
      let fullReply = reply;
      if (context) {
        fullReply += `\n\n📊 System Context:\n• Users: ${context.totalUsers || 0}\n• Providers: ${context.totalProviders || 0}\n• Appointments: ${context.totalAppointments || 0}\n• Reviews: ${context.totalReviews || 0}`;
      }
      setMessages(prev => [...prev, { role: "bot", text: fullReply }]);
    } catch {
      setMessages(prev => [...prev, { role: "bot", text: "Sorry, something went wrong." }]);
    } finally { setLoading(false); }
  };

  const suggestions = [
    "Show system overview",
    "Analyze top providers",
    "What are the cancellation trends?",
    "User growth insights",
  ];

  return (
    <DashboardLayout theme="admin">
      <div className="page-header">
        <h1 style={{ color: 'var(--text-primary)' }}>AI <span className="text-gradient">Help Desk</span> 🤖</h1>
        <p>Advanced AI with system-wide analytics and insights</p>
      </div>

      <div className="max-w-4xl">
        {/* Quick Suggestions */}
        <div className="flex flex-wrap gap-2 mb-4">
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => { setInput(s); }} className="btn btn-sm btn-secondary">
              💡 {s}
            </button>
          ))}
        </div>

        <div className="card" style={{ height: '550px', display: 'flex', flexDirection: 'column' }}>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`ai-msg ${msg.role}`} style={{ maxWidth: '80%', whiteSpace: 'pre-line' }}>
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

          <div className="p-4" style={{ borderTop: '1px solid var(--border-color)' }}>
            <div className="flex gap-3">
              <input
                className="form-input flex-1"
                placeholder="Ask about system analytics, provider performance..."
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

export default AIHelpDesk;
