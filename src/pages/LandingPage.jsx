import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, CheckCircle2, Star, Zap, 
  Shield, Smartphone, Users, ChevronRight,
  Instagram, Twitter, Facebook,
  ArrowRight, Award, Flame, Bell, Mail, Send, Sparkles, ShieldCheck
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  
  // Defaulting to ₹ INR to ensure it shows first
  const [currency, setCurrency] = useState({ symbol: "₹", code: "INR", locale: "en-IN" });
  const [trialLoading, setTrialLoading] = useState(false);

  // Contact Form State
  const [contactData, setContactData] = useState({ name: '', email: '', message: '' });
  const [contactLoading, setContactLoading] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    if ("Notification" in window) {
      Notification.requestPermission();
    }

    const detectLocation = async () => {
      try {
        const isIndianTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone === 'Asia/Kolkata';
        
        // Agar India hai toh ₹ hi rakho
        if (isIndianTimezone) {
          setCurrency({ symbol: "₹", code: "INR", locale: "en-IN" });
          return;
        }

        // Sirf tab change karo jab confirm ho jaye ki bahar ka user hai
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        if (data.country_code && data.country_code !== 'IN') {
          setCurrency({ symbol: "$", code: "USD", locale: "en-US" });
        }
      } catch (err) {
        console.log("Defaulting to INR");
      }
    };
    
    detectLocation();
  }, []);

  // ✅ Logic: Professional Plan for Free
  const handleStartTrial = async () => {
    setTrialLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }

      const finalPlan = "Professional"; 

      const { error } = await supabase
        .from("user_settings")
        .upsert({
          user_id: user.id,
          subscription_status: 'active', 
          plan_type: finalPlan,
          member_limit: 999999
        });

      if (error) throw error;
      alert(`Congratulations! You have been onboarded to the Professional Plan for Free.`);
      navigate('/dashboard');
    } catch (err) {
      alert("System Error: Unable to process request. Please check your internet connection.");
    } finally {
      setTrialLoading(false);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactLoading(true);
    try {
      const { error } = await supabase.from('contact_messages').insert([contactData]);
      if (error) throw error;
      alert("Thank you! Your message has been sent successfully.");
      setContactData({ name: '', email: '', message: '' });
    } catch (err) {
      alert("Error: Message could not be sent.");
    } finally {
      setContactLoading(false);
    }
  };

  const features = [
    { title: "Member Management", desc: "Digital profiles, attendance tracking, and membership status.", icon: <Users className="text-blue-500" /> },
    { title: "Automated Payments", desc: "No more manual follow-ups. Automated reminders and digital invoicing.", icon: <Zap className="text-yellow-500" /> },
    { title: "Performance Reports", icon: <Shield className="text-green-500" />, desc: "Track your gym's growth with detailed financial and member activity reports." },
    { title: "Mobile Friendly", icon: <Smartphone className="text-purple-500" />, desc: "Manage your gym from anywhere—completely optimized for mobile devices." }
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 scroll-smooth selection:bg-blue-100 selection:text-blue-600 overflow-x-hidden page-transition">
      
      {/* --- Navbar --- */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200 group-hover:rotate-12 transition-transform">
              <Dumbbell size={24} />
            </div>
            <span className="text-xl font-black italic tracking-tighter uppercase text-slate-900">GymPro</span>
          </div>
          
          <div className="hidden md:flex items-center gap-10 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
            <a href="#home" className="hover:text-blue-600 transition-colors">Home</a>
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-blue-600 transition-colors">Offer</a>
            <a href="#contact" className="hover:text-blue-600 transition-colors">Contact</a>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/login" className="text-xs font-black uppercase tracking-widest text-slate-600 hover:text-blue-600 transition-colors">Login</Link>
            <button onClick={handleStartTrial} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all active:scale-95">
              Claim Free Access
            </button>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section id="home" className={`pt-48 pb-24 px-6 relative transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="max-w-7xl mx-auto text-center space-y-10">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
            <Sparkles size={14} /> FOUNDER'S OFFER: FIRST 1,000 GYMS ONLY
          </div>
          <h1 className="text-6xl md:text-9xl font-black italic uppercase tracking-tighter leading-[0.85] text-slate-900">
            Professional <br /> <span className="text-blue-600">For {currency.symbol}0.</span>
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg md:text-xl font-medium leading-relaxed">
            Get 100% of our Professional features for free. No credit card, no subscription fees. We grow when you grow.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-6">
            <button 
              disabled={trialLoading}
              onClick={handleStartTrial} 
              className="w-full md:w-auto bg-blue-600 text-white px-12 py-6 rounded-2xl font-black uppercase italic tracking-widest hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-3">
              Get Started Now <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* --- Exclusive Plan Section --- */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-5xl mx-auto bg-slate-900 rounded-[50px] p-8 md:p-16 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-10">
            <ShieldCheck size={200} />
          </div>
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-black italic uppercase mb-6 tracking-tight leading-none">The <span className="text-blue-400 text-6xl block">Full Access</span> Plan.</h2>
              <ul className="grid grid-cols-1 gap-4">
                {['Unlimited Member Profiles', 'AI Financial Analytics', 'Automated Reminders', 'Expense Management', 'QR Code Payments', 'Priority Technical Support'].map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-4 text-sm font-bold text-slate-300">
                    <CheckCircle2 size={18} className="text-blue-400" /> {feat}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-[40px] p-10 text-center">
              <p className="text-blue-400 font-black uppercase tracking-widest text-[10px] mb-2">Lifetime Price for Early Adopters</p>
              <div className="text-8xl font-black italic mb-4">{currency.symbol}0</div>
              <button onClick={handleStartTrial} className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black uppercase italic tracking-widest hover:bg-blue-400 hover:text-white transition-all">Claim Now</button>
            </div>
          </div>
        </div>
      </section>

      {/* --- Features Grid --- */}
      <section id="features" className="py-32 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <div key={i} className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-700 group transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  {React.cloneElement(f.icon, { size: 32, className: "group-hover:text-white transition-colors" })}
                </div>
                <h4 className="text-2xl font-black italic uppercase mb-4 tracking-tighter">{f.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Contact Section --- */}
      <section id="contact" className="py-32 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-tight">Ready to <br /> <span className="text-blue-500">Transform?</span></h2>
            <div className="flex items-center gap-4 p-6 bg-white/5 rounded-3xl border border-white/10 w-fit">
              <div className="bg-blue-600 p-3 rounded-2xl"><Mail size={24}/></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Support Email</p>
                <p className="font-bold text-xl tracking-tight">sayhello2gmi@gmail.com</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-[40px] p-8 md:p-12 text-slate-900 shadow-2xl">
            <form onSubmit={handleContactSubmit} className="space-y-6">
              <input type="text" required value={contactData.name} onChange={(e) => setContactData({...contactData, name: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 font-bold" placeholder="Full Name" />
              <input type="email" required value={contactData.email} onChange={(e) => setContactData({...contactData, email: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 font-bold" placeholder="Email Address" />
              <textarea rows="4" required value={contactData.message} onChange={(e) => setContactData({...contactData, message: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 font-bold resize-none" placeholder="How can we help you?" />
              <button type="submit" disabled={contactLoading} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase italic tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
                {contactLoading ? "Sending..." : <>Send Message <Send size={18}/></>}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-white border-t border-slate-100 pt-32 pb-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 mb-24">
          <div className="space-y-8">
            <div className="flex items-center gap-2">
              <div className="bg-slate-900 p-2 rounded-lg text-white"><Dumbbell size={20} /></div>
              <span className="text-xl font-black italic uppercase tracking-tighter">GymPro</span>
            </div>
            <p className="text-slate-500 font-medium text-sm leading-relaxed">The only OS your gym needs to grow from 10 to 10,000 members.</p>
          </div>
          <div>
            <h6 className="font-black uppercase italic text-xs tracking-[0.2em] mb-8">Navigation</h6>
            <ul className="space-y-4 text-slate-500 text-sm font-bold uppercase text-[10px] tracking-widest">
              <li><a href="#home" className="hover:text-blue-600 transition-colors">Home</a></li>
              <li><a href="#features" className="hover:text-blue-600 transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-blue-600 transition-colors">Offer</a></li>
              <li><a href="#contact" className="hover:text-blue-600 transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h6 className="font-black uppercase italic text-xs tracking-[0.2em] mb-8">Legal</h6>
            <ul className="space-y-4 text-slate-500 text-sm font-bold uppercase text-[10px] tracking-widest">
              <li><Link to="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-12 border-t border-slate-100 text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">© 2026 GYMPRO MANAGEMENT SYSTEMS. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>

      <style>{`
        .page-transition { animation: fadeIn 0.8s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}