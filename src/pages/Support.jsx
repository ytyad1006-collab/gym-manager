import React, { useState } from 'react';
import { MessageCircle, Mail, Phone, ChevronDown, ChevronUp, HelpCircle, Copy, Check, Sparkles, LifeBuoy } from 'lucide-react';

export default function Support() {
  const [openFaq, setOpenFaq] = useState(null);
  const [copied, setCopied] = useState(false);

  const emailId = "sayhello2satishyadav@gmail.com";

  const handleCopyEmail = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(emailId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const faqs = [
    {
      q: "How to renew a membership?",
      a: "Go to the 'Members' list, find the specific member, and click the 'Renew' button. The system will automatically update the new expiry dates and payment records."
    },
    {
      q: "Where can I see the payment history?",
      a: "You can find complete financial history inside each 'Member Profile' or by visiting the 'Reports' section for a consolidated view of all transactions."
    },
    {
      q: "Can I add custom membership plans?",
      a: "Yes! Navigate to 'Setup' > 'Membership Plans'. Here you can create new plans with custom durations (Monthly, Quarterly, etc.) and set your own pricing."
    },
    {
      q: "Is my gym data secure?",
      a: "Absolutely. We use Supabase with Row Level Security (RLS) and encrypted database protocols, ensuring that only you can access your gym's sensitive information."
    },
    {
      q: "How does the attendance system work?",
      a: "You can mark attendance daily in the 'Attendance' section. It tracks member check-ins and helps the AI generate health scores based on member consistency."
    },
    {
      q: "Can I send WhatsApp alerts for dues?",
      a: "Yes, once integrated, you can send automated or manual payment reminders directly to members' WhatsApp numbers from the 'Dues' or 'Members' section."
    }
  ];

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-2">
          <Sparkles size={14} /> 24/7 Support Available
        </div>
        <h2 className="text-4xl font-black text-slate-900 italic uppercase tracking-tighter">
          Customer <span className="text-blue-600">Support</span>
        </h2>
        <p className="text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
          We are here to make your gym management effortless. Choose an option below to get in touch with our technical team.
        </p>
      </div>

      {/* Support Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* WhatsApp Support */}
        <a 
          href="https://wa.me/918097481065" 
          target="_blank" 
          rel="noreferrer"
          className="bg-white p-8 rounded-[32px] border border-slate-100 flex items-center gap-6 hover:shadow-2xl hover:shadow-green-100 transition-all group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150" />
          <div className="bg-green-500 p-4 rounded-2xl text-white shadow-lg shadow-green-200 group-hover:rotate-12 transition-transform relative z-10">
            <MessageCircle size={32} />
          </div>
          <div className="relative z-10">
            <h4 className="font-black text-slate-800 text-xl italic uppercase tracking-tight">WhatsApp Chat</h4>
            <p className="text-slate-500 text-sm font-medium mt-1">Instant reply & technical help</p>
          </div>
        </a>

        {/* Email Support */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 flex items-center justify-between hover:shadow-2xl hover:shadow-blue-100 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150" />
          <a href={`mailto:${emailId}`} className="flex items-center gap-6 relative z-10">
            <div className="bg-blue-600 p-4 rounded-2xl text-white shadow-lg shadow-blue-200 group-hover:-rotate-12 transition-transform">
              <Mail size={32} />
            </div>
            <div>
              <h4 className="font-black text-slate-800 text-xl italic uppercase tracking-tight">Email Us</h4>
              <p className="text-blue-600 font-bold text-xs mt-1 truncate max-w-[180px]">{emailId}</p>
            </div>
          </a>
          
          <button 
            onClick={handleCopyEmail}
            className={`relative z-10 p-3 rounded-xl transition-all active:scale-90 ${
              copied ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white'
            }`}
            title="Copy Email"
          >
            {copied ? <Check size={20} /> : <Copy size={20} />}
          </button>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-slate-50/50 p-8 md:p-12 rounded-[40px] border border-slate-100">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
            <LifeBuoy className="text-blue-600" size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-800 italic uppercase tracking-tight">Common Questions</h3>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Quick Solutions for you</p>
          </div>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`transition-all duration-300 rounded-[24px] ${
                openFaq === index ? 'bg-white shadow-xl shadow-slate-200/50 border-transparent' : 'bg-transparent border border-slate-200/60'
              }`}
            >
              <button 
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full flex justify-between items-center text-left p-6 transition-all"
              >
                <span className={`font-black uppercase italic text-sm tracking-tight transition-colors ${openFaq === index ? 'text-blue-600' : 'text-slate-700'}`}>
                  {faq.q}
                </span>
                <div className={`p-1.5 rounded-full transition-all ${openFaq === index ? 'bg-blue-600 text-white rotate-180' : 'bg-slate-200 text-slate-500'}`}>
                  <ChevronDown size={18} />
                </div>
              </button>
              
              <div className={`overflow-hidden transition-all duration-300 ${openFaq === index ? 'max-h-48' : 'max-h-0'}`}>
                <p className="px-6 pb-6 text-slate-500 font-medium text-sm leading-relaxed italic">
                  — {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <p className="text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
        Powered by GYM Manager India &bull; Version 2.0
      </p>
    </div>
  );
}