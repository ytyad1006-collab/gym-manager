import { useState, useEffect } from "react";
import { supabase } from "./supabase";

export default function AddMemberModal({ isOpen, onClose, onRefresh, userId }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    plan: "Monthly",
    join_date: "",
    expiry_date: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");


  // helper to compute expiry date based on plan and join_date
  const computeExpiry = (joinDate, plan) => {
    if (!joinDate) return "";
    const d = new Date(joinDate);
    switch (plan) {
      case "Monthly":
        d.setMonth(d.getMonth() + 1);
        break;
      case "Quarterly":
        d.setMonth(d.getMonth() + 3);
        break;
      case "Annually":
        d.setFullYear(d.getFullYear() + 1);
        break;
      default:
        break;
    }
    return d.toISOString().split("T")[0];
  };

  // Reset form when modal opens
  // reset form whenever the modal is opened; the lint rule complains about
  // calling setState inside an effect, but we deliberately want a fresh form on
  // each open.
  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split("T")[0];
      setFormData({ name: "", phone: "", plan: "Monthly", join_date: today, expiry_date: computeExpiry(today, "Monthly") });
    }
  }, [isOpen]);

  // when the plan or join_date changes, update expiry date automatically
  useEffect(() => {
    if (formData.join_date) {
      setFormData((prev) => ({
        ...prev,
        expiry_date: computeExpiry(prev.join_date, prev.plan)
      }));
    }
  }, [formData.plan, formData.join_date]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    // Basic validation
    if (formData.phone.length !== 10 || isNaN(Number(formData.phone))) {
      setSubmitError("Please enter a valid 10-digit phone number");
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.from("members").insert([
        { ...formData, user_id: userId }
      ]);
      if (error) {
        console.error("Add member failed:", error);
        setSubmitError(error.message || "Failed to add member");
      } else {
        console.log("Member added", data);
        onRefresh();
        onClose();
        const today = new Date().toISOString().split("T")[0];
        setFormData({ name: "", phone: "", plan: "Monthly", join_date: today, expiry_date: computeExpiry(today, "Monthly") });
      }
    } catch (err) {
      console.error("Exception while adding member", err);
      setSubmitError(err.message || String(err));
    } finally {
      setSubmitting(false);
    }
  };

  const s = {
    overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, backdropFilter: 'blur(4px)' },
    modal: { background: '#fff', padding: '36px', borderRadius: '18px', width: '100%', maxWidth: '450px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' },
    form: { display: 'flex', flexDirection: 'column', gap: '18px' },
    group: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '14px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.3px' },
    input: { padding: '12px 14px', borderRadius: '10px', border: '2px solid #e2e8f0', fontSize: '15px', color: '#1e293b', backgroundColor: '#f8fafc', fontFamily: '"Inter", sans-serif', transition: 'all 0.3s' },
    btnRow: { display: 'flex', gap: '12px', marginTop: '16px' },
    saveBtn: { flex: 2, padding: '13px', background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)', transition: 'all 0.3s' },
    cancelBtn: { flex: 1, padding: '13px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s' }
  };

  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <div style={s.header}>
          <h2 style={{ margin: 0, color: '#1e293b', fontSize: '24px', fontWeight: '700', fontFamily: '"Poppins", sans-serif' }}>Add New Member</h2>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={s.form}>
          {/* Name */}
          <div style={s.group}>
            <label style={s.label}>Full Name</label>
            <input
              required
              placeholder="Enter name"
              style={s.input}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              autoFocus
            />
          </div>

          {/* Phone */}
          <div style={s.group}>
            <label style={s.label}>Phone Number</label>
            <input
              required
              placeholder="Enter 10-digit number"
              style={s.input}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              maxLength={10}
              minLength={10}
            />
          </div>

          {/* Plan */}
          <div style={s.group}>
            <label style={s.label}>Plan</label>
            <select
              required
              style={s.input}
              value={formData.plan}
              onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
            >
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Annually">Annually</option>
            </select>
          </div>

          {/* Dates */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ ...s.group, flex: 1 }}>
              <label style={s.label}>Joining Date</label>
              <input
                required
                type="date"
                style={s.input}
                value={formData.join_date}
                onChange={(e) => setFormData({ ...formData, join_date: e.target.value })}
              />
            </div>
            <div style={{ ...s.group, flex: 1 }}>
              <label style={s.label}>Expiry Date (auto)</label>
              <input
                required
                type="date"
                style={s.input}
                value={formData.expiry_date}
                readOnly
              />
            </div>
          </div>

          {/* Buttons */}
          {submitError && <div style={{ color: 'red', marginBottom: '10px' }}>{submitError}</div>}
          <div style={s.btnRow}>
            <button type="button" onClick={onClose} disabled={submitting} style={s.cancelBtn}>Back</button>
            <button type="submit" disabled={submitting} style={{ ...s.saveBtn, opacity: submitting ? 0.6 : 1 }}>
              {submitting ? "Saving..." : "Register Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}