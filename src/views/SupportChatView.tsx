import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronLeft, 
  Phone, 
  MessageCircle, 
  Send, 
  Paperclip, 
  ShieldCheck, 
  Headphones, 
  CheckCheck
} from 'lucide-react';

interface SupportChatViewProps {
  onBack: () => void;
}

interface Message {
  id: string;
  sender: 'agent' | 'user';
  text: string;
  time: string;
}

export const SupportChatView: React.FC<SupportChatViewProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'agent',
      text: 'Good day! 👋 Welcome to RIDINGO 24/7 VIP Concierge Support. How can we assist you with your chauffeur service today?',
      time: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const quickTopics = [
    '📍 Where is my driver?',
    '🎒 Left an item in vehicle',
    '💳 Billing & Receipt query',
    '🔄 Change trip destination',
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');

    // Simulate Agent Reply
    setIsTyping(true);
    setTimeout(() => {
      let replyText = "Thank you for reaching out! Our VIP concierge team is reviewing your request and will update your active booking shortly.";
      
      if (text.includes('Where is my driver') || text.includes('driver')) {
        replyText = "Your assigned master chauffeur Marcus Vance is en-route and expected to arrive in 11 minutes at your pickup address.";
      } else if (text.includes('Left an item') || text.includes('item')) {
        replyText = "We have logged a priority lost item report. Your driver has been notified to check the rear seat immediately.";
      } else if (text.includes('Billing') || text.includes('Receipt')) {
        replyText = "Your detailed tax invoice PDF has been sent to your email. You can also view it anytime in the Bookings tab.";
      }

      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, agentMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#FAFAFA] animate-fade-in overflow-hidden">
      {/* Sticky Header Bar */}
      <div className="bg-white border-b border-slate-200 pt-[max(env(safe-area-inset-top,54px),54px)] pb-3 px-3.5 flex items-center justify-between shadow-xs z-10 flex-shrink-0 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer flex-shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 rounded-xl bg-[#121212] text-[#fcd502] flex items-center justify-center font-black">
                <Headphones className="w-4 h-4 text-[#fcd502]" />
              </div>
              <span className="w-2 h-2 rounded-full bg-[#fcd502] border border-white absolute -bottom-0.5 -right-0.5 animate-pulse" />
            </div>

            <div className="min-w-0">
              <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 leading-none truncate whitespace-nowrap">
                24/7 Support Desk
              </h3>
              <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-1 leading-none mt-0.5 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Online • &lt;1m reply
              </span>
            </div>
          </div>
        </div>

        {/* Quick Call & WhatsApp Action Buttons in Single Line */}
        <div className="flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap">
          {/* Direct Call Button */}
          <a
            href="tel:+18007434646"
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 text-[#fcd502] hover:bg-black font-extrabold text-[11px] flex items-center gap-1 shadow-xs transition-all cursor-pointer whitespace-nowrap"
            title="Call Support Desk"
          >
            <Phone className="w-3 h-3 text-[#fcd502] fill-[#fcd502]/25 stroke-[2] flex-shrink-0" />
            <span>Call</span>
          </a>

          {/* WhatsApp Chat Button */}
          <a
            href="https://wa.me/15550192834?text=Hello%20RIDINGO%20Support%2C%20I%20need%20assistance"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-extrabold text-[11px] flex items-center gap-1 shadow-xs transition-all cursor-pointer whitespace-nowrap"
            title="Chat on WhatsApp"
          >
            <MessageCircle className="w-3 h-3 fill-current flex-shrink-0" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-none relative">
        {/* Encrypted Notice Banner */}
        <div className="mx-auto w-fit px-3 py-1 rounded-full bg-slate-200/80 text-slate-600 text-[10px] font-bold flex items-center gap-1 border border-slate-300/60 shadow-2xs">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          <span>Encrypted 24/7 Concierge Support Channel</span>
        </div>

        {messages.map((msg) => {
          const isAgent = msg.sender === 'agent';
          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${isAgent ? 'justify-start' : 'justify-end'}`}
            >
              {isAgent && (
                <div className="w-7 h-7 rounded-xl bg-slate-900 text-[#fcd502] flex items-center justify-center font-bold text-xs flex-shrink-0">
                  R
                </div>
              )}

              <div
                className={`max-w-[80%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs space-y-1 shadow-sm ${
                  isAgent
                    ? 'bg-white text-slate-900 rounded-bl-none border border-slate-200/90 font-medium'
                    : 'bg-slate-900 text-white rounded-br-none font-medium'
                }`}
              >
                <p className="leading-relaxed">{msg.text}</p>
                <div
                  className={`flex items-center gap-1 text-[9px] ${
                    isAgent ? 'text-slate-400 justify-start' : 'text-slate-300 justify-end'
                  }`}
                >
                  <span>{msg.time}</span>
                  {!isAgent && <CheckCheck className="w-3 h-3 text-[#fcd502]" />}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-slate-900 text-[#fcd502] flex items-center justify-center font-bold text-xs">
              R
            </div>
            <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-slate-200 shadow-sm flex items-center gap-1 text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="px-3 pt-2 pb-1 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none flex-shrink-0">
        {quickTopics.map((topic, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSendMessage(topic)}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-[#fcd502] hover:text-[#121212] text-slate-700 text-[10px] font-extrabold whitespace-nowrap transition-colors border border-slate-200/80 cursor-pointer flex-shrink-0"
          >
            {topic}
          </button>
        ))}
      </div>

      {/* Bottom Message Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 px-4 pb-[max(env(safe-area-inset-bottom,0px)+0.85rem,1.25rem)] bg-white border-t border-slate-200 flex items-center gap-2 flex-shrink-0 z-30"
      >
        <button
          type="button"
          onClick={() => alert("Photo / File attachment feature ready.")}
          className="p-2.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Attach photo or document"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type your question here..."
          className="flex-1 px-3.5 py-2.5 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-[#fcd502]"
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2.5 rounded-2xl bg-[#121212] hover:bg-black text-[#fcd502] disabled:opacity-40 transition-all cursor-pointer flex-shrink-0 shadow-md"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
