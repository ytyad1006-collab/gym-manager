import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, CheckCircle2, Star, Zap, 
  Shield, Smartphone, Users, ChevronRight,
  Instagram, Twitter, Facebook,
  ArrowRight, Award, Flame
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    { title: "Member Management", desc: "Digital profiles, attendance tracking, and membership status at your fingertips.", icon: <Users className="text-blue-500" /> },
    { title: "Automated Payments", desc: "No more manual follow-ups. Automated reminders and digital invoicing.", icon: <Zap className="text-yellow-500" /> },
    { title: "Performance Reports", icon: <Shield className="text-green-500" />, desc: "Track your gym's growth with detailed financial and member activity reports." },
    { title: "Mobile Friendly", icon: <Smartphone className="text-purple-500" />, desc: "Manage your gym from anywhere—completely optimized for mobile devices." }
  ];

  const testimonials = [
    { name: "Amit Sharma", role: "Owner, PowerHouse Gym", text: "Is software ne mera manual kaam khatam kar diya. Ab main sirf growth par focus karta hoon." },
    { name: "Vikram Singh", role: "Fitness Trainer", text: "Best UI! Mere members ko attendance aur payment reminders WhatsApp par milte hain." }
  ];

  const pricing = [
    { name: "Starter", price: "999", features: ["Up to 100 Members", "Attendance Tracking", "Basic Reports", "WhatsApp Support"] },
    { name: "Professional", price: "1999", popular: true, features: ["Unlimited Members", "Payment Automation", "Advanced Analytics", "Priority Support", "Expense Management"] },
    { name: "Enterprise", price: "Custom", features: ["Multi-branch Support", "Custom Branding", "API Access", "Dedicated Account Manager"] }
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 scroll-smooth selection:bg-blue-100 selection:text-blue-600 overflow-x-hidden page-transition">
      {/* --- Navbar --- */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 transition-all duration-500">
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
            <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
            <a href="#testimonials" className="hover:text-blue-600 transition-colors">Reviews</a>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="hidden md:block text-xs font-black uppercase tracking-widest text-slate-600 hover:text-blue-600 transition-colors">Login</Link>
            <Link to="/login" className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 active:scale-95">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section id="home" className={`pt-48 pb-24 px-6 relative transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-50/50 via-transparent to-transparent -z-10" />
        <div className="max-w-7xl mx-auto text-center space-y-10">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] animate-bounce">
            <Flame size={14} /> Powering 500+ Gyms across India
          </div>
          <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.9] text-slate-900">
            The Ultimate <br /> <span className="text-blue-600">Gym OS.</span>
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg md:text-xl font-medium leading-relaxed">
            Manage members, track attendance, and automate payments with the most professional gym management dashboard ever built.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-6">
            <button className="w-full md:w-auto bg-blue-600 text-white px-12 py-6 rounded-2xl font-black uppercase italic tracking-widest hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-3">
              Start Free Trial <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* --- Features Grid --- */}
      <section id="features" className="py-32 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-center">
            <div className="space-y-6">
               <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none">Built for <br/> Performance.</h2>
               <p className="text-slate-500 font-medium">Everything you need to run a successful fitness business in one place.</p>
            </div>
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </div>
      </section>

      {/* --- Pricing --- */}
      <section id="pricing" className="py-32">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-20">Choose Your Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricing.map((p, i) => (
              <div key={i} className={`p-12 rounded-[50px] border-2 transition-all duration-500 hover:scale-105 ${p.popular ? 'border-blue-600 bg-white shadow-2xl shadow-blue-100 md:scale-105 z-10' : 'border-slate-100 bg-white'}`}>
                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-blue-600 mb-4">{p.name}</h4>
                <div className="flex justify-center items-baseline gap-1 mb-10">
                  <span className="text-6xl font-black italic tracking-tighter">₹{p.price}</span>
                  {p.price !== "Custom" && <span className="text-slate-400 font-black uppercase text-xs">/mo</span>}
                </div>
                <ul className="space-y-6 mb-12 text-left">
                  {p.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-4 text-sm font-bold text-slate-600">
                      <CheckCircle2 size={18} className="text-blue-600" /> {feat}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-5 rounded-2xl font-black uppercase italic tracking-widest transition-all ${p.popular ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-900'}`}>
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-white border-t border-slate-100 pt-32 pb-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
          <div className="space-y-8">
            <div className="flex items-center gap-2">
              <div className="bg-slate-900 p-2 rounded-lg text-white"><Dumbbell size={20} /></div>
              <span className="text-xl font-black italic uppercase tracking-tighter">GymPro</span>
            </div>
            <p className="text-slate-500 font-medium text-sm leading-relaxed">The only OS your gym needs to grow from 10 to 10,000 members.</p>
            <div className="flex gap-4">
               {[Instagram, Twitter, Facebook].map((Icon, i) => (
                  <div key={i} className="p-3 border border-slate-100 rounded-xl text-slate-400 hover:text-blue-600 transition-all cursor-pointer"><Icon size={18} /></div>
               ))}
            </div>
          </div>
          <div>
            <h6 className="font-black uppercase italic text-xs tracking-[0.2em] mb-8">Navigation</h6>
            <ul className="space-y-4 text-slate-500 text-sm font-bold">
              <li><a href="#features" className="hover:text-blue-600 transition-colors uppercase text-[10px] tracking-widest">Features</a></li>
              <li><a href="#pricing" className="hover:text-blue-600 transition-colors uppercase text-[10px] tracking-widest">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h6 className="font-black uppercase italic text-xs tracking-[0.2em] mb-8">Legal</h6>
            <ul className="space-y-4 text-slate-500 text-sm font-bold">
              <li><Link to="/privacy" className="hover:text-blue-600 transition-colors uppercase text-[10px] tracking-widest">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-blue-600 transition-colors uppercase text-[10px] tracking-widest">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-12 border-t border-slate-100 text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">© 2026 GYMMANAGERINDIA SOFTWARE. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>

      <style>{`
        .page-transition {
          animation: fadeIn 0.8s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}