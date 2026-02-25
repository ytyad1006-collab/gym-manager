import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import Auth from "./Auth";
import LandingPage from "./LandingPage";
import AddMemberModal from "./AddMemberModal";
import RecordPaymentModal from "./RecordPaymentModal";
import { Search, Trash2, LayoutDashboard, Users, CreditCard, LogOut } from "lucide-react";
import { sendExpiryEmail } from './emailjsHelper';

// Load Google Fonts
if (!document.querySelector('link[href*="fonts.googleapis"]')) {
  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);
}

// Helper functions
function isTrialActive(user) {
  const trialEnd = user?.user_metadata?.trial_end;
  if (!trialEnd) return false;
  return new Date(trialEnd) >= new Date();
}

function isSubscribed(user) {
  return user?.user_metadata?.subscription_status === 'active';
}

function getPlan(user) {
  return user?.user_metadata?.plan || null;
}

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [members, setMembers] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchMembers, setSearchMembers] = useState("");
  const [searchPayments, setSearchPayments] = useState("");
  const [loading, setLoading] = useState(false);
  const [editMember, setEditMember] = useState(null);
const [editForm, setEditForm] = useState({
  name: "",
  phone: "",
  plan: ""
});

  // Fetch data function
  async function fetchData() {
    setLoading(true);
    try {
      const [{ data: mems, error: memError }, { data: pays, error: payError }] = await Promise.all([
        supabase.from("members").select("*"),
        supabase.from("payments").select("*, members(name, phone)")
      ]);
      if (memError) console.error("Member Fetch Error:", memError.message);
      if (payError) console.error("Payment Fetch Error:", payError.message);
      setMembers(mems || []);
      setPaymentHistory(pays || []);
    } catch (err) {
      console.error("Connection Error:", err);
    } finally {
      setLoading(false);
    }
  }

  // Session management
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        // Set trial_end if missing
        const trialEnd = session.user.user_metadata?.trial_end;
        if (!trialEnd) {
          const newTrialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
          await supabase.auth.updateUser({ data: { trial_end: newTrialEnd } });
          const { data: { session: newSession } } = await supabase.auth.getSession();
          setSession(newSession);
          return;
        }
      }
      setSession(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const trialEnd = session.user.user_metadata?.trial_end;
        if (!trialEnd) {
          const newTrialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
          await supabase.auth.updateUser({ data: { trial_end: newTrialEnd } });
          const { data: { session: newSession } } = await supabase.auth.getSession();
          setSession(newSession);
          return;
        }
      }
      setSession(session);
    });
    return () => subscription?.unsubscribe();
  }, []);

  // Fetch data when session or tab changes
  useEffect(() => {
    if (session) fetchData();
  }, [session, activeTab]);

  const user = session?.user;
  const trialActive = isTrialActive(user);
  const subscribed = isSubscribed(user);
  const plan = getPlan(user);

  // Helper: Plan display name
  function getPlanDisplay() {
    if (trialActive) return 'Trial (Pro)';
    if (subscribed && plan) return plan + ' (Pro)';
    return 'Free';
  }

  // Plan selection handler (with Razorpay)
  async function handlePlanSelect(plan, price) {
    const res = await loadRazorpayScript('https://checkout.razorpay.com/v1/checkout.js');
    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      return;
    }

    // Create order on backend and get order_id
    // Example:
    // const orderRes = await fetch('/api/create-order', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ amount: price * 100, plan, userId: user.id })
    // });
    // const { order_id } = await orderRes.json();

    const options = {
      key: 'rzp_test_SJz8d0Qkh1gVR9',
      amount: price * 100,
      currency: 'INR',
      name: 'Gym Manager',
      description: `${plan} Subscription`,
      // order_id: order_id, // Uncomment after backend implementation
      handler: async (response) => {
        await supabase.auth.updateUser({
          data: {
            subscription_status: 'active',
            plan,
            subscribed_at: new Date().toISOString(),
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          },
        });
        window.location.reload();
      },
      prefill: {
        name: user?.user_metadata?.full_name || '',
        email: user?.email || '',
      },
      theme: {
        color: '#8b5cf6',
      },
      modal: {
        ondismiss: () => {
          // handle dismiss if needed
        },
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  // Plan card component
  function PlanCard({ plan, price, duration, onSelect }) {
    return (
      <div style={{ background: '#fff', borderRadius: '14px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', padding: '32px 28px', minWidth: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h3 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px', color: '#6366f1' }}>{plan}</h3>
        <div style={{ fontSize: '32px', fontWeight: '800', color: '#10b981', marginBottom: '8px' }}>₹{price}</div>
        <div style={{ color: '#64748b', marginBottom: '18px', fontSize: '16px' }}>{duration}</div>
        <button onClick={onSelect} style={{ background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 24px', fontWeight: 600, fontSize: '15px', cursor: 'pointer' }}>Subscribe</button>
      </div>
    );
  }

  // Early return logic
  if (!session) {
    if (showLanding) return <LandingPage onGetStarted={() => setShowLanding(false)} />;
    return <Auth onLogin={setSession} />;
  }

  // If trial expired and not subscribed, show subscription options
  if (!trialActive && !subscribed) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f6f8fb' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '12px', color: '#1e293b', fontFamily: '"Poppins", sans-serif' }}>Choose Your Plan</h2>
        <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '18px' }}>Your free trial has ended. Please subscribe to continue using all services.</p>
        <div style={{ display: 'flex', gap: '32px', marginBottom: '32px' }}>
          <PlanCard plan="Monthly" price={499} duration="1 Month" onSelect={() => handlePlanSelect('Monthly', 499)} />
          <PlanCard plan="6 Months" price={2599} duration="6 Months" onSelect={() => handlePlanSelect('6 Months', 2599)} />
          <PlanCard plan="Annual" price={4599} duration="12 Months" onSelect={() => handlePlanSelect('Annual', 4599)} />
        </div>
        <button onClick={() => supabase.auth.signOut()} style={{ color: '#fff', background: '#ef4444', border: 'none', borderRadius: '8px', padding: '12px 32px', fontWeight: 600, fontSize: '16px', cursor: 'pointer' }}>Logout</button>
      </div>
    );
  }

  if (!session || !session.user || !session.user.user_metadata) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#ef4444', fontSize: '20px', fontWeight: 600 }}>
        Error: User profile incomplete. Please log out and log in again.
        <button style={{ marginLeft: 16, padding: '8px 18px', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }} onClick={() => supabase.auth.signOut()}>Logout</button>
      </div>
    );
  }

  const gymName = session.user.user_metadata.gym_name || "Gym Manager";

  // Calculations
  const totalRevenue = paymentHistory.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const activeMembersCount = members.filter(m => new Date(m.expiry_date) >= new Date()).length;
  const newJoinees = members.filter(m => new Date(m.join_date).getMonth() === new Date().getMonth()).length;
  const expiringSoon = members.filter(m => {
    const diff = new Date(m.expiry_date) - new Date();
    return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
  }).length;

  const filteredMembers = members.filter(m => (m.name || "").toLowerCase().includes(searchMembers.toLowerCase()));

  const filteredPayments = paymentHistory.filter(p => {
    const q = searchPayments.trim().toLowerCase();
    if (!q) return true;
    const memberName = (p.members?.name || "").toLowerCase();
    const method = (p.method || "").toLowerCase();
    const amount = String(p.amount || "").toLowerCase();
    const date = p.created_at ? new Date(p.created_at).toLocaleDateString().toLowerCase() : '';
    return memberName.includes(q) || method.includes(q) || amount.includes(q) || date.includes(q);
  });

  // Delete member
  const handleDeleteMember = async (id) => {
    if (confirm("Delete member?")) {
      const { error } = await supabase.from("members").delete().eq("id", id);
      if (error) {
        alert("Error deleting member: " + error.message);
        console.error("Delete Error:", error);
      } else {
        fetchData();
      }
    }
       const [editMember, setEditMember] = useState(null);
const [editForm, setEditForm] = useState({
  name: "",
  phone: "",
  plan: ""
});
  };

  // Paid/Unpaid toggle handler
const handleTogglePaid = async (member) => {
  const newStatus = member.paid ? false : true;
  const { error } = await supabase.from("members").update({ paid: newStatus }).eq("id", member.id);
  if (error) {
    alert("Error updating paid status: " + error.message);
  } else {
    fetchData();
  }
};

// Edit Member handler
const handleEditMember = (member) => {
  const newName = prompt("Enter new name:", member.name);
  if (!newName) return;

  supabase
    .from("members")
    .update({ name: newName })
    .eq("id", member.id)
    .then(({ error }) => {
      if (error) {
        alert("Error updating member: " + error.message);
      } else {
        fetchData();
      }
    });
};

  return (
    <div className="dashboard-root" style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#f6f8fb', color: '#1e293b', fontFamily: '"Inter", sans-serif' }}>
      {/* Sidebar */}
      <div className="sidebar" style={{ width: '260px', background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', padding: '30px 20px', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 30px rgba(139, 92, 246, 0.15)' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '40px', color: '#fff', fontFamily: '"Poppins", sans-serif', letterSpacing: '-0.5px' }}>{gymName.toUpperCase()}</h1>
        {/* Current plan display */}
        <div style={{ color: '#fff', fontWeight: 500, marginBottom: 18, fontSize: 15, background: 'rgba(139,92,246,0.18)', borderRadius: 8, padding: '8px 16px', display: 'inline-block' }}>
          Current Plan: <span style={{ fontWeight: 700 }}>{getPlanDisplay()}</span>
        </div>
        {/* Navigation */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div onClick={() => { setSearchMembers(''); setSearchPayments(''); setActiveTab('Dashboard'); }} style={activeTab === 'Dashboard' ? s.active : s.navItem}>
            <LayoutDashboard size={20} /> Dashboard
          </div>
          <div onClick={() => { setSearchMembers(''); setSearchPayments(''); setActiveTab('Members'); }} style={activeTab === 'Members' ? s.active : s.navItem}>
            <Users size={20} /> Member Page
          </div>
          <div onClick={() => { setSearchMembers(''); setSearchPayments(''); setActiveTab('Payments'); }} style={activeTab === 'Payments' ? s.active : s.navItem}>
            <CreditCard size={20} /> Record Payment
          </div>
        </nav>
        {/* Logout Button */}
        <button onClick={() => supabase.auth.signOut()} style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', border: 'none', background: 'rgba(255,255,255,0.2)', cursor: 'pointer', fontWeight: '600', padding: '12px 15px', borderRadius: '10px', transition: 'all 0.3s', fontSize: '15px' }} onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'} onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}><LogOut size={20} /> Logout</button>
      </div>

      {/* Main Content */}
      <div className="main-content" style={{ flex: 1, padding: '40px 50px', overflowY: 'auto', backgroundColor: '#f6f8fb' }}>
        {loading && <p style={{ textAlign: 'center' }}>Loading data...</p>}

        {activeTab === 'Dashboard' && (
          <div>
            <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '12px', color: '#1e293b', fontFamily: '"Poppins", sans-serif' }}>Welcome, {gymName}</h2>
            <p style={{ color: '#64748b', marginBottom: '40px', fontSize: '16px' }}>Dashboard overview and key metrics.</p>
            {subscribed && (
              <div style={{ background: '#e0e7ff', color: '#3730a3', borderRadius: 10, padding: '18px 24px', marginBottom: 32, fontWeight: 600, fontSize: 17, boxShadow: '0 2px 8px rgba(139,92,246,0.08)' }}>
                <span role="img" aria-label="star">⭐</span> You are a <b>Pro</b> member! Enjoy all premium features.
              </div>
            )}
            {/* Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
              <div style={{...s.card, borderLeft: '4px solid #8b5cf6'}}>
                <h4 style={{margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Total Revenue</h4>
                <p style={{fontSize: '28px', fontWeight: '700', color: '#8b5cf6', margin: 0}}>₹{totalRevenue.toLocaleString()}</p>
              </div>
              <div style={{...s.card, borderLeft: '4px solid #3b82f6'}}>
                <h4 style={{margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Total Members</h4>
                <p style={{fontSize: '28px', fontWeight: '700', color: '#3b82f6', margin: 0}}>{members.length}</p>
              </div>
              <div style={{...s.card, borderLeft: '4px solid #10b981'}}>
                <h4 style={{margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Active Plans</h4>
                <p style={{fontSize: '28px', fontWeight: '700', color: '#10b981', margin: 0}}>{activeMembersCount}</p>
              </div>
              <div style={{...s.card, borderLeft: '4px solid #f59e0b'}}>
                <h4 style={{margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px'}}>New (This Month)</h4>
                <p style={{fontSize: '28px', fontWeight: '700', color: '#f59e0b', margin: 0}}>{newJoinees}</p>
              </div>
              <div style={{...s.card, borderLeft: '4px solid #ef4444'}}>
                <h4 style={{margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Expiring Soon</h4>
                <p style={{fontSize: '28px', fontWeight: '700', color: '#ef4444', margin: 0}}>{expiringSoon}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Members' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
              <div style={s.searchBox}>
                <Search size={18} color="#94a3b8" />
                <input placeholder="Search members..." value={searchMembers} onChange={(e) => setSearchMembers(e.target.value)} style={s.blankInput} />
              </div>
              <button onClick={() => setIsModalOpen(true)} style={s.primaryBtn}>+ Add Member</button>
            </div>
            {/* Members Table */}
            <div style={s.tableContainer}>
              <table style={s.table}>
                <thead>
                  <tr style={s.tableHead}>
                    <th style={s.th}>Name</th>
                    <th style={s.th}>Phone</th>
                    <th style={s.th}>Plan</th>
                    <th style={s.th}>Join Date</th>
                    <th style={s.th}>Expiry</th>
                    <th style={s.th}>Status</th>
                    <th style={s.th}>Paid</th>
                    <th style={s.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((m) => (
                    <tr key={m.id} style={s.tableRow}>
                      <td style={{ fontWeight: '600', padding: '12px 20px' }}>{m.name}</td>
                      <td style={{ padding: '12px 20px', color: '#475569' }}>{m.phone}</td>
                      <td style={{ padding: '12px 20px' }}>{m.plan}</td>
                      <td style={{ padding: '12px 20px' }}>{m.join_date || '-'}</td>
                      <td style={{ padding: '12px 20px' }}>{m.expiry_date || '-'}</td>
                      <td style={{ padding: '12px 20px' }}>
                        {new Date(m.expiry_date) >= new Date() ? (
                          <span style={{ color: '#10b981', fontWeight: 600 }}>Active</span>
                        ) : (
                          <span style={{ color: '#ef4444', fontWeight: 600 }}>Expired</span>
                        )}
                      </td>
                      {/* Paid Toggle Column */}
<td style={{ padding: '12px 20px' }}>
  <button
    onClick={() => handleTogglePaid(m)}
    style={{
      background: m.paid ? '#10b981' : '#f97316',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      padding: '6px 14px',
      cursor: 'pointer',
      fontWeight: 600
    }}
  >
    {m.paid ? 'Paid' : 'Unpaid'}
  </button>
</td>

{/* Action Column */}
<td style={{ padding: '12px 20px', display: 'flex', gap: '10px', alignItems: 'center' }}>

  {/* Edit Button */}
  <button
    onClick={() => handleEditMember(m)}
    style={{
      background: '#3b82f6',
      color: '#fff',
      border: 'none',
      borderRadius: '4px',
      padding: '4px 10px',
      cursor: 'pointer',
      fontWeight: 600
    }}
  >
    Edit
  </button>

  {/* Delete */}
  <Trash2
    size={18}
    color="#ef4444"
    style={{ cursor: 'pointer' }}
    onClick={() => handleDeleteMember(m.id)}
  />

</td>
                    </tr>
                    
                    
                  ))}
                </tbody>
              </table>
            </div>
            {editMember && (
  <div style={{
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.65)",
    backdropFilter: "blur(4px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999
  }}>

    <div style={{
      background: "#ffffff",
      width: "420px",
      borderRadius: "16px",
      padding: "28px",
      boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
      position: "relative",
      animation: "fadeIn 0.2s ease"
    }}>

      {/* Close Button */}
      <button
        onClick={() => setEditMember(null)}
        style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          border: "none",
          background: "transparent",
          fontSize: "18px",
          cursor: "pointer",
          color: "#888"
        }}
      >
        ✕
      </button>

      <h2 style={{
        marginBottom: "20px",
        fontWeight: "600",
        fontSize: "20px"
      }}>
        Edit Member
      </h2>

      {/* Name */}
      <label style={{ fontSize: "13px", color: "#555" }}>Full Name</label>
      <input
        type="text"
        value={editForm.name}
        onChange={(e) =>
          setEditForm({ ...editForm, name: e.target.value })
        }
        style={{
          width: "100%",
          padding: "10px 12px",
          marginTop: "6px",
          marginBottom: "16px",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          outline: "none"
        }}
      />

      {/* Phone */}
      <label style={{ fontSize: "13px", color: "#555" }}>Phone Number</label>
      <input
        type="text"
        value={editForm.phone}
        onChange={(e) =>
          setEditForm({ ...editForm, phone: e.target.value })
        }
        style={{
          width: "100%",
          padding: "10px 12px",
          marginTop: "6px",
          marginBottom: "16px",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          outline: "none"
        }}
      />

      {/* Plan */}
      <label style={{ fontSize: "13px", color: "#555" }}>Plan</label>
      <input
        type="text"
        value={editForm.plan}
        onChange={(e) =>
          setEditForm({ ...editForm, plan: e.target.value })
        }
        style={{
          width: "100%",
          padding: "10px 12px",
          marginTop: "6px",
          marginBottom: "22px",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          outline: "none"
        }}
      />

      {/* Buttons */}
      <div style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: "12px"
      }}>
        <button
          onClick={() => setEditMember(null)}
          style={{
            background: "#f3f4f6",
            border: "none",
            padding: "8px 16px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "500"
          }}
        >
          Cancel
        </button>

        <button
          onClick={handleUpdateMember}
          style={{
            background: "#2563eb",
            color: "#fff",
            border: "none",
            padding: "8px 18px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
            boxShadow: "0 6px 18px rgba(37,99,235,0.35)"
          }}
        >
          Save Changes
        </button>
      </div>

    </div>
  </div>
)}
          </div>
        )}

        {activeTab === 'Payments' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
              <div style={s.searchBox}>
                <Search size={18} color="#94a3b8" />
                <input placeholder="Search payments by member, amount or method..." value={searchPayments} onChange={(e) => setSearchPayments(e.target.value)} style={s.blankInput} />
              </div>
              <button onClick={() => { setIsModalOpen(true); setActiveTab('Payments'); }} style={s.successBtn}>+ Record Payment</button>
            </div>
            {/* Payments Table */}
            <div style={s.tableContainer}>
              <table style={s.table}>
                <thead>
                  <tr style={s.tableHead}>
                    <th style={s.th}>Member</th>
                    <th style={s.th}>Phone</th>
                    <th style={s.th}>Amount</th>
                    <th style={s.th}>Method</th>
                    <th style={s.th}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((p) => (
                    <tr key={p.id} style={s.tableRow}>
                      <td style={{ fontWeight: '600', padding: '12px 20px' }}>{p.members?.name}</td>
                      <td style={{ padding: '12px 20px', color: '#475569' }}>{p.members?.phone || '-'}</td>
                      <td style={{ color: '#10b981', fontWeight: '700', padding: '12px 20px' }}>₹{Number(p.amount).toLocaleString()}</td>
                      <td style={{ padding: '12px 20px' }}>{p.method}</td>
                      <td style={{ padding: '12px 20px' }}>{p.created_at ? new Date(p.created_at).toLocaleString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddMemberModal isOpen={isModalOpen && activeTab === 'Members'} onClose={() => { setIsModalOpen(false); fetchData(); }} onRefresh={fetchData} userId={session.user.id} />
      <RecordPaymentModal isOpen={isModalOpen && activeTab === 'Payments'} onClose={() => { setIsModalOpen(false); fetchData(); }} onRefresh={fetchData} members={members} userId={session.user.id} />
    </div>
  );
}

const s = {
  navItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px', cursor: 'pointer', borderRadius: '10px', color: 'rgba(255,255,255,0.7)', fontWeight: '500', transition: 'all 0.3s', fontSize: '15px' },
  active: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px', cursor: 'pointer', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.25)', color: '#fff', fontWeight: '600', transition: 'all 0.3s', fontSize: '15px' },
  card: { backgroundColor: '#fff', padding: '28px', borderRadius: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', textAlign: 'center', transition: 'all 0.3s' },
  searchBox: { display: 'flex', alignItems: 'center', backgroundColor: '#fff', border: '2px solid #e2e8f0', padding: '12px 18px', borderRadius: '12px', width: '350px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'all 0.3s' },
  blankInput: { border: 'none', outline: 'none', marginLeft: '10px', width: '100%', fontSize: '15px', backgroundColor: 'transparent', color: '#1e293b', fontFamily: '"Inter", sans-serif' },
  primaryBtn: { backgroundColor: '#8b5cf6', color: '#fff', padding: '12px 28px', borderRadius: '10px', border: 'none', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)', transition: 'all 0.3s', fontSize: '15px' },
  successBtn: { backgroundColor: '#10b981', color: '#fff', padding: '12px 28px', borderRadius: '10px', border: 'none', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)', transition: 'all 0.3s', fontSize: '15px' },
  tableContainer: { backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' },
  table: { width: '100%', borderCollapse: 'collapse', fontFamily: '"Inter", sans-serif' },
  tableHead: { textAlign: 'left', backgroundColor: '#f1f5f9', height: '55px', borderBottom: '2px solid #e2e8f0', fontSize: '13px', color: '#475569', paddingLeft: '20px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' },
  tableRow: { borderBottom: '1px solid #f1f5f9', height: '60px', transition: 'all 0.2s' },
};
s.th = { padding: '14px 20px', textAlign: 'left' };