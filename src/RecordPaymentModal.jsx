import { useState, useEffect } from "react";
import { supabase } from "./supabase";

export default function RecordPaymentModal({ isOpen, onClose, onRefresh, members, userId }) {
  const [formData, setFormData] = useState({ member_id: "", amount: "", method: "Cash" });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Reset form when modal opens/closes
  // ensure the form is cleared each time the modal appears.  the
  // eslint rule about setState-in-effect is overly strict in this case, so
  // disable it around the state update.
  useEffect(() => {
    if (isOpen) {
      setFormData({ member_id: "", amount: "", method: "Cash" });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    // Basic validation
    if (!formData.member_id) {
      setSubmitError("Please select a member");
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      setSubmitError("Please enter a valid amount");
      return;
    }

    setSubmitting(true);
    try {
      console.log("Submitting payment:", formData);
      const { data, error } = await supabase.from("payments").insert([{ 
        member_id: formData.member_id, 
        amount: Number(formData.amount), 
        method: formData.method,
        user_id: userId 
      }]);

      if (error) {
        console.error("Payment insert failed:", error);
        setSubmitError(error.message || "Failed to record payment");
      } else {
        console.log("Payment recorded successfully", data);
        await onRefresh();
        onClose();
        setFormData({ member_id: "", amount: "", method: "Cash" });
      }
    } catch (err) {
      console.error("Exception recording payment:", err);
      setSubmitError(err.message || String(err));
    } finally {
      setSubmitting(false);
    }
  };

  const st = {
    overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, backdropFilter: 'blur(4px)' },
    modal: { background: '#fff', padding: '36px', borderRadius: '18px', width: '90%', maxWidth: '450px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' },
    input: { padding: '12px 14px', borderRadius: '10px', border: '2px solid #e2e8f0', marginTop: '8px', width: '100%', boxSizing: 'border-box', fontSize: '15px', fontFamily: '"Inter", sans-serif', backgroundColor: '#f8fafc', color: '#1e293b', transition: 'all 0.3s' }
  };

  return (
    <div style={st.overlay}>
      <div style={st.modal}>
        <h2 style={{ marginTop: 0, color: '#1e293b', fontSize: '24px', fontWeight: '700', fontFamily: '"Poppins", sans-serif', marginBottom: '28px' }}>Record Payment</h2>
        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'18px' }}>
          
          {/* Member Selection */}
          <div>
            <label style={{ fontSize:'14px', fontWeight:'600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Select Member</label>
            <select
              required
              style={st.input}
              value={formData.member_id}
              onChange={(e) => setFormData({ ...formData, member_id: e.target.value })}
              autoFocus
            >
              <option value="">-- Choose Member --</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          
          {/* Amount Input */}
          <div>
            <label style={{ fontSize:'14px', fontWeight:'600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Amount (₹)</label>
            <input
              required
              type="number"
              style={st.input}
              placeholder="Enter amount"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              min="0"
            />
          </div>
          
          {/* Method Select */}
          <div>
            <label style={{ fontSize:'14px', fontWeight:'600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Payment Method</label>
            <select
              style={st.input}
              value={formData.method}
              onChange={(e) => setFormData({ ...formData, method: e.target.value })}
            >
              <option value="Cash">Cash</option>
              <option value="Online">Online</option>
            </select>
          </div>
          
          {/* Buttons */}
          {submitError && <div style={{ color: '#ef4444', marginBottom: '16px', fontSize: '14px', fontWeight: '500' }}>{submitError}</div>}
          <div style={{ display:'flex', gap:'12px', marginTop:'20px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{ flex:1, padding:'13px', borderRadius:'10px', border:'none', cursor:'pointer', background: '#f1f5f9', color: '#475569', fontWeight: '600', transition: 'all 0.3s', opacity: submitting ? 0.6 : 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{ flex:2, padding:'13px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color:'#fff', borderRadius:'10px', border:'none', fontWeight:'600', cursor:'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)', transition: 'all 0.3s', opacity: submitting ? 0.6 : 1 }}
            >
              {submitting ? "Processing..." : "Confirm Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}