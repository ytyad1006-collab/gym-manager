import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Lightbulb, Send, Clock, CheckCircle2, LayoutGrid, MessageSquare, Loader2, Sparkles } from "lucide-react";

export default function FeatureRequest() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    fetchSuggestions();

    // ✅ GLOBAL PLAN: Real-time listener for community updates
    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "feature_suggestions" },
        () => fetchSuggestions()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fetchSuggestions = async () => {
    try {
      setFetchLoading(true);
      const { data } = await supabase
        .from("feature_suggestions")
        .select("*")
        .order("created_at", { ascending: false });
      setSuggestions(data || []);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ SECURITY: Identify the user posting the idea
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("feature_suggestions")
        .insert([{ 
          title, 
          description: desc,
          user_id: user?.id // Attach user ID for tracking
        }]);
      
      if (!error) {
        setTitle("");
        setDesc("");
        // No need to call fetchSuggestions here because Real-time listener handles it
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-10 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="text-center space-y-2 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 opacity-20 blur-2xl bg-amber-400 w-32 h-32 rounded-full" />
        <div className="bg-amber-100 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto text-amber-600 mb-4 shadow-inner relative z-10 group hover:rotate-12 transition-transform">
          <Lightbulb size={32} />
        </div>
        <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase italic">Roadmap & Suggestions</h1>
        <p className="text-slate-500 font-medium">Help us build the best gym management software together.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: Input Form */}
        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl space-y-4 sticky top-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-extrabold text-sm uppercase tracking-widest flex items-center gap-2 text-slate-700">
                <Sparkles size={16} className="text-amber-500"/> Post an Idea
              </h3>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Feature Title</label>
              <input 
                required 
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl mt-1 outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 font-bold text-slate-700 transition-all"
                placeholder="e.g. Diet Plan Creator" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Detail Description</label>
              <textarea 
                required 
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl mt-1 outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 h-32 font-medium text-slate-600 transition-all resize-none"
                placeholder="How should this work?..." 
                value={desc} 
                onChange={(e) => setDesc(e.target.value)}
              ></textarea>
            </div>
            <button 
              disabled={loading}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95 disabled:bg-slate-300"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <><Send size={18}/> Submit Proposal</>}
            </button>
          </form>
        </div>

        {/* Right: Suggestions List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="font-extrabold text-sm uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <LayoutGrid size={18} className="text-purple-500"/> Community Feedback
            </h3>
            <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-md uppercase">Live Feed</span>
          </div>
          
          {fetchLoading ? (
            <div className="py-20 text-center flex flex-col items-center gap-3">
               <Loader2 className="animate-spin text-slate-300" size={32} />
               <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Syncing Roadmap...</p>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] p-20 text-center text-slate-400 font-black uppercase tracking-[0.3em] text-xs">
              Waiting for the first idea
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {suggestions.map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-amber-200 transition-colors group">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-black text-slate-800 text-lg uppercase italic tracking-tight group-hover:text-amber-600 transition-colors">{item.title}</h4>
                      <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                        item.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        item.status === 'planned' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        {item.status || 'pending'}
                      </div>
                    </div>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed">{item.description}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase pt-3">
                      <Clock size={12} className="text-slate-300"/> 
                      {new Date(item.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  {item.status === 'completed' && (
                    <div className="bg-emerald-50 p-2 rounded-xl">
                      <CheckCircle2 className="text-emerald-500 shrink-0" size={24}/>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}