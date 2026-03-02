import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Plus, Edit2, Trash2, X, Save } from "lucide-react";

export default function MembershipPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { fetchPlans(); }, []);

  const fetchPlans = async () => {
    setLoading(true);
    const { data } = await supabase.from("membership_plans").select("*");
    setPlans(data || []);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this plan?")) {
      await supabase.from("membership_plans").delete().eq("id", id);
      fetchPlans();
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from("membership_plans").update(selectedPlan).eq("id", selectedPlan.id);
    if (!error) {
      alert("Plan Updated!");
      setShowModal(false);
      fetchPlans();
    }
  };

  if (loading) return <div className="p-4 animate-pulse">Loading Plans...</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map(plan => (
          <div key={plan.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-lg text-slate-800">{plan.name}</h4>
                <p className="text-2xl font-black text-blue-600">₹{plan.price}</p>
                <p className="text-sm text-slate-500">{plan.duration_months} Months</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setSelectedPlan(plan); setShowModal(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={18}/></button>
                <button onClick={() => handleDelete(plan.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <form onSubmit={handleUpdate} className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl relative">
            <button type="button" onClick={() => setShowModal(false)} className="absolute right-4 top-4 text-slate-400"><X /></button>
            <h2 className="text-xl font-bold mb-4 italic uppercase">Edit Plan</h2>
            <div className="space-y-4">
              <input className="w-full p-2 border rounded-lg" value={selectedPlan.name} onChange={(e) => setSelectedPlan({...selectedPlan, name: e.target.value})} placeholder="Plan Name" />
              <input type="number" className="w-full p-2 border rounded-lg" value={selectedPlan.price} onChange={(e) => setSelectedPlan({...selectedPlan, price: e.target.value})} placeholder="Price" />
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-xl font-bold">Save Changes</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}