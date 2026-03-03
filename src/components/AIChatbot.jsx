import React, { useState, useEffect } from 'react';
import { Sparkles, Send, Bot, X, MessageSquare, Zap } from 'lucide-react';

const AIChatbot = ({ currentLang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  // ✅ Multi-language Content
  const content = {
    en: {
      title: "GymAI Assistant",
      welcome: "Hello Admin! How can I help you manage your gym today?",
      options: ["Check Revenue", "Expiring Members", "Attendance Stats"],
      typing: "AI is analyzing...",
      placeholder: "Ask anything..."
    },
    hi: {
      title: "GymAI सहायक",
      welcome: "नमस्ते एडमिन! आज मैं जिम मैनेज करने में आपकी क्या मदद कर सकता हूँ?",
      options: ["आय चेक करें", "समाप्त होने वाले सदस्य", "उपस्थिति आंकड़े"],
      typing: "AI विश्लेषण कर रहा है...",
      placeholder: "कुछ भी पूछें..."
    },
    mr: {
      title: "GymAI सहाय्यक",
      welcome: "नमस्कार ॲडमिन! आज मी तुम्हाला जिम व्यवस्थापित करण्यात कशी मदत करू शकतो?",
      options: ["महसूल तपासा", "मुदत संपणारे सदस्य", "हजेरीची आकडेवारी"],
      typing: "AI विश्लेषण करत आहे...",
      placeholder: "काहीही विचारा..."
    },
    pa: {
      title: "GymAI ਸਹਾਇਕ",
      welcome: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਐਡਮਿਨ! ਅੱਜ ਮੈਂ ਜਿਮ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰਨ ਵਿੱਚ ਤੁਹਾਡੀ ਕੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?",
      options: ["ਆਮਦਨ ਦੀ ਜਾਂਚ ਕਰੋ", "ਮਿਆਦ ਖਤਮ ਹੋਣ ਵਾਲੇ ਮੈਂਬਰ", "ਹਾਜ਼ਰੀ ਦੇ ਅੰਕੜੇ"],
      typing: "AI ਵਿਸ਼ਲੇਸ਼ਣ ਕਰ ਰਿਹਾ ਹੈ...",
      placeholder: "ਕੁਝ ਵੀ ਪੁੱਛੋ..."
    }
  };

  const t = content[currentLang] || content['en'];

  // ✅ Initialize welcome message
  useEffect(() => {
    setChatHistory([{ type: 'bot', text: t.welcome }]);
  }, [currentLang]);

  const handleOptionClick = (option) => {
    // User message add karna
    setChatHistory(prev => [...prev, { type: 'user', text: option }]);
    
    // AI typing start
    setIsTyping(true);

    // Fake AI Response logic (इसे बाद में Supabase data से कनेक्ट कर सकते हैं)
    setTimeout(() => {
      let response = "";
      if (option.includes("Revenue") || option.includes("आय") || option.includes("महसूल")) {
        response = "Your revenue is up by 12% this month! 📈";
      } else if (option.includes("Members") || option.includes("सदस्य")) {
        response = "3 members are expiring in the next 48 hours. Should I notify them?";
      } else {
        response = "Attendance is peak between 6 PM to 8 PM. You might need an extra trainer then.";
      }
      
      setChatHistory(prev => [...prev, { type: 'bot', text: response }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      {isOpen && (
        <div className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.2)] rounded-3xl w-[350px] h-[500px] mb-4 flex flex-col border border-indigo-50 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-4 text-white flex justify-between items-center shadow-lg">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                <Bot size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-black tracking-tight">{t.title}</p>
                <p className="text-[10px] text-indigo-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> Online Analysis
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Chat Body */}
          <div className="flex-1 p-4 overflow-y-auto bg-[#f8fafc] space-y-4">
            {chatHistory.map((msg, index) => (
              <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
                  msg.type === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Suggestions */}
          {!isTyping && (
            <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar bg-[#f8fafc]">
              {t.options.map((opt, i) => (
                <button 
                  key={i}
                  onClick={() => handleOptionClick(opt)}
                  className="whitespace-nowrap bg-white border border-indigo-100 text-indigo-600 px-3 py-1.5 rounded-full text-[11px] font-bold hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
            <input 
              type="text" 
              placeholder={t.placeholder}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-indigo-400 transition-colors"
            />
            <button className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition-all">
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="group bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-[22px] shadow-[0_10px_30px_rgba(79,70,229,0.4)] transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3"
      >
        <div className="relative">
          <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />
          {!isOpen && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>}
        </div>
        <span className="font-black uppercase tracking-widest text-xs pr-1">Ask AI</span>
      </button>
    </div>
  );
};

export default AIChatbot;