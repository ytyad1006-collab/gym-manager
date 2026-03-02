import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Lightbulb, Send, Clock, CheckCircle2, LayoutGrid, MessageSquare } from "lucide-react";

export default function FeatureRequest() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    const { data } = await supabase
      .from("feature_suggestions")
      .select("*")
      .order("created_at", { ascending: false });
    setSuggestions(data || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("feature_suggestions").insert([{ title, description: desc }]);
    
    if (!error) {
      alert("Idea sent successfully! 🚀");
      setTitle("");
      setDesc("");
      fetchSuggestions();
    }
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-10">
      {/* Header Section */}
      <div className="text-center space-y-2">
        <div className="bg-amber-100 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto text-amber-600 mb-4 shadow-inner">
          <Lightbulb size={32} />
        </div>
        <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase italic">Roadmap & Suggestions</h1>
        <p className="text-slate-500 font-medium">Help us build the best gym management software together.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: Input Form */}
        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl space-y-4 sticky top-6">
            <h3 className="font-bold text-lg flex items-center gap-2 text-slate-700">
              <MessageSquare size={20} className="text-blue-500"/> Post an Idea
            </h3>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Title</label>
              <input 
                required 
                className="w-full p-3 bg-slate-50 border rounded-xl mt-1 outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
                placeholder="What's your idea?" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Description</label>
              <textarea 
                required 
                className="w-full p-3 bg-slate-50 border rounded-xl mt-1 outline-none focus:ring-2 focus:ring-amber-500 h-32 font-medium"
                placeholder="Describe how this feature will work..." 
                value={desc} 
                onChange={(e) => setDesc(e.target.value)}
              ></textarea>
            </div>
            <button 
              disabled={loading}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg"
            >
              {loading ? "Sending..." : <><Send size={18}/> Submit Idea</>}
            </button>
          </form>
        </div>

        {/* Right: Suggestions List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-lg text-slate-700 flex items-center gap-2 px-2">
            <LayoutGrid size={20} className="text-purple-500"/> Community Feedback
          </h3>
          
          {suggestions.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-20 text-center text-slate-400 font-bold uppercase tracking-widest">
              No ideas yet. Be the first!
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {suggestions.map((item) => (
                <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold text-slate-800 text-lg uppercase">{item.title}</h4>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                        item.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                        item.status === 'planned' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">{item.description}</p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase pt-2">
                      <Clock size={12}/> {new Date(item.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  {item.status === 'completed' && <CheckCircle2 className="text-emerald-500 shrink-0" size={24}/>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}