import React, { useEffect } from 'react';
import { ShieldCheck, Scale, ArrowLeft, Dumbbell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LegalPages = ({ type }) => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const content = {
    privacy: {
      title: "Privacy Policy",
      icon: <ShieldCheck className="text-emerald-500" size={40} />,
      text: "Hum GymPro mein aapke data ki suraksha ka pura dhyan rakhte hain. Aapka naam, phone number aur payment details sirf gym records ke liye use hote hain."
    },
    terms: {
      title: "Terms of Service",
      icon: <Scale className="text-blue-500" size={40} />,
      text: "GymPro software ka upyog gym management ke liye kiya jata hai. Software ke misuse par account suspend kiya ja sakta hai."
    }
  };

  const page = content[type];

  return (
    <div className="min-h-screen bg-white page-transition">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-slate-400 mb-10 hover:text-blue-600 transition-colors font-black uppercase text-[10px] tracking-[0.2em]">
          <ArrowLeft size={16} /> Back to Home
        </button>
        
        <div className="bg-slate-50 rounded-[40px] p-10 md:p-16 border border-slate-100 shadow-sm">
          <div className="mb-8">{page.icon}</div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-6 text-slate-900">{page.title}</h1>
          <p className="text-lg text-slate-600 font-medium leading-relaxed mb-8">{page.text}</p>
          <div className="h-px bg-slate-200 w-full mb-8" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Last Updated: March 2026</p>
        </div>
      </div>
      
      <style>{`
        .page-transition { animation: fadeIn 0.6s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default LegalPages;