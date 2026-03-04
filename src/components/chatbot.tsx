"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, Sparkles, ChevronDown, ChevronUp } from "lucide-react";

export const ChatBotDashboard = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([
    {
      role: "bot",
      text: "Hello! I am the AI Assistant of Kopi Kita. Is there anything I can help you analyze today?",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isExpanded]);

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;
    if (!isExpanded) setIsExpanded(true);

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      const aiReply =
        data.choices?.[0]?.message?.content ||
        "Sorry, I did not get the answer for your question.";
      setMessages((prev) => [...prev, { role: "bot", text: aiReply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "bot", text: "Disconnected." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`transition-all duration-500 ease-in-out bg-white rounded-[2.5rem] border border-[#EBE3D5] shadow-sm overflow-hidden ${isExpanded ? "h-125" : "h-25"}`}
    >
      {/* Mini Header / Input Row */}
      <div className="p-6 flex items-center gap-4 h-25">
        <div className="bg-[#2D2424] p-3 rounded-2xl shrink-0">
          <Bot size={20} className="text-[#D2691E]" />
        </div>

        <div className="flex-1 relative">
          <input
            value={input}
            onFocus={() => setIsExpanded(true)}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Ask something to AI Assistant."
            className="w-full bg-[#FDFCF8] border border-[#EBE3D5] rounded-2xl px-5 py-3 text-sm outline-none focus:border-[#D2691E] transition-all"
          />
          <button
            onClick={handleSendMessage}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#2D2424] text-white rounded-xl hover:bg-[#D2691E] transition-all"
          >
            <Send size={16} />
          </button>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-3 hover:bg-[#FDFCF8] rounded-xl text-[#7E6363] transition-all"
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {isExpanded && (
        <div className="flex flex-col h-100 border-t border-[#EBE3D5] bg-[#FDFCF8]/30">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-3xl text-xs font-medium leading-relaxed shadow-sm whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-[#D2691E] text-white rounded-tr-none ml-auto"
                      : "bg-white border border-[#EBE3D5] text-[#2D2424] rounded-tl-none"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-[10px] font-bold text-[#D2691E] animate-pulse">
                AI is thinking...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
