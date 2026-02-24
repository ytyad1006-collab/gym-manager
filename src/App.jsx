// Helper to check if trial is active
function isTrialActive(user) {
  const trialEnd = user?.user_metadata?.trial_end;
  if (!trialEnd) return false;
  return new Date(trialEnd) >= new Date();
}

// Helper to check if user is subscribed
function isSubscribed(user) {
  return user?.user_metadata?.subscription_status === 'active';
}

// Helper to get plan name
function getPlan(user) {
  return user?.user_metadata?.plan || null;
}
import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import Auth from "./Auth";
import LandingPage from "./LandingPage";
import AddMemberModal from "./AddMemberModal";
import RecordPaymentModal from "./RecordPaymentModal";
import { Search, Trash2, LayoutDashboard, Users, CreditCard, LogOut } from "lucide-react";
import { sendExpiryEmail } from './emailjsHelper';

// Add Google Fonts
if (!document.querySelector('link[href*="fonts.googleapis"]')) {
  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);
}

export default function App() {
      const [showLanding, setShowLanding] = useState(true);
    // Fetch data function (must be defined before any usage)
    async function fetchData() {
      setLoading(true);
      try {
        const [{ data: mems, error: memError }, { data: pays, error: payError }] = await Promise.all([
          supabase.from("members").select("*"),
          // request payments with the related member row (requires FK + relationship in DB)
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
  // All hooks must be at the top, before any return or conditional logic
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [members, setMembers] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchMembers, setSearchMembers] = useState("");
  const [searchPayments, setSearchPayments] = useState("");
  const [loading, setLoading] = useState(false);



  // All hooks must be at the top, before any return or conditional logic
  useEffect(() => {
    // Get session initially
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription?.unsubscribe(); // clean up
  }, []);

  useEffect(() => {
    if (session) fetchData();
  }, [session, activeTab]);

  // Subscription/Trial logic (must be after session is defined)
  const user = session?.user;
  const trialActive = isTrialActive(user);
  const subscribed = isSubscribed(user);
  const plan = getPlan(user);

  // Expiry Reminder handler (top-level, not inside JSX)
  // (removed duplicate declaration)

  // Plan selection handler (placeholder, payment integration needed)
  async function handlePlanSelect(plan, price) {
    // TODO: Integrate payment gateway here
    // For now, just update user metadata to simulate subscription
    await supabase.auth.updateUser({
      data: {
        subscription_status: 'active',
        plan,
        subscribed_at: new Date().toISOString(),
      }
    });
    window.location.reload();
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

  // Early returns only after all hooks
  if (!session) {
    if (showLanding) {
      return <LandingPage onGetStarted={() => setShowLanding(false)} />;
    }
    return <Auth onLogin={setSession} />;
  }
  if (session && !trialActive && !subscribed) {
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

  // (removed duplicate useEffect, fetchData, and handler declarations)


  if (!session) return <Auth onLogin={setSession} />;
  // Defensive: check for user and user_metadata
  if (!session.user || !session.user.user_metadata) {
    return (
      <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh',color:'#ef4444',fontSize:'20px',fontWeight:600}}>
        Error: User profile incomplete. Please log out and log in again.
        <button style={{marginLeft:16,padding:'8px 18px',background:'#8b5cf6',color:'#fff',border:'none',borderRadius:8,cursor:'pointer'}} onClick={()=>supabase.auth.signOut()}>Logout</button>
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
    return diff > 0 && diff < (7 * 24 * 60 * 60 * 1000);
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

  // Delete member function
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
  };

  return (
    <div className="dashboard-root" style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#f6f8fb', color: '#1e293b', fontFamily: '"Inter", sans-serif' }}>
      
      {/* Sidebar Navigation */}
      <div className="sidebar" style={{ width: '260px', background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', padding: '30px 20px', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 30px rgba(139, 92, 246, 0.15)' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '40px', color: '#fff', fontFamily: '"Poppins", sans-serif', letterSpacing: '-0.5px' }}>{gymName.toUpperCase()}</h1>
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div
            onClick={() => {
              setSearchMembers("");
              setSearchPayments("");
              setActiveTab("Dashboard");
            }}
            style={activeTab === "Dashboard" ? s.active : s.navItem}
          >
            <LayoutDashboard size={20}/> Dashboard
          </div>
          <div
            onClick={() => {
              setSearchMembers("");
              setSearchPayments("");
              setActiveTab("Members");
            }}
            style={activeTab === "Members" ? s.active : s.navItem}
          >
            <Users size={20}/> Member Page
          </div>
          <div
            onClick={() => {
              setSearchMembers("");
              setSearchPayments("");
              setActiveTab("Payments");
            }}
            style={activeTab === "Payments" ? s.active : s.navItem}
          >
            <CreditCard size={20}/> Record Payment
          </div>
        </nav>
        <button onClick={() => supabase.auth.signOut()} style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', border: 'none', background: 'rgba(255,255,255,0.2)', cursor: 'pointer', fontWeight: '600', padding: '12px 15px', borderRadius: '10px', transition: 'all 0.3s', fontSize: '15px' }} onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'} onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}><LogOut size={20}/> Logout</button>
      </div>

      {/* Main Content Area */}
      <div className="main-content" style={{ flex: 1, minWidth: 0, padding: '40px 50px', overflowY: 'auto', backgroundColor: '#f6f8fb' }}>
        {loading && <p style={{ textAlign: 'center' }}>Loading data...</p>}

        {activeTab === "Dashboard" && (
          <div>
            <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '12px', color: '#1e293b', fontFamily: '"Poppins", sans-serif' }}>Welcome, {gymName}</h2>
            <p style={{ color: '#64748b', marginBottom: '40px', fontSize: '16px' }}>Dashboard overview and key metrics.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
              <div style={{...s.card, borderLeft: '4px solid #8b5cf6'}}><h4 style={{margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Total Revenue</h4><p style={{fontSize: '28px', fontWeight: '700', color: '#8b5cf6', margin: 0}}>₹{totalRevenue.toLocaleString()}</p></div>
              <div style={{...s.card, borderLeft: '4px solid #3b82f6'}}><h4 style={{margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Total Members</h4><p style={{fontSize: '28px', fontWeight: '700', color: '#3b82f6', margin: 0}}>{members.length}</p></div>
              <div style={{...s.card, borderLeft: '4px solid #10b981'}}><h4 style={{margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Active Plans</h4><p style={{fontSize: '28px', fontWeight: '700', color: '#10b981', margin: 0}}>{activeMembersCount}</p></div>
              <div style={{...s.card, borderLeft: '4px solid #f59e0b'}}><h4 style={{margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px'}}>New (This Month)</h4><p style={{fontSize: '28px', fontWeight: '700', color: '#f59e0b', margin: 0}}>{newJoinees}</p></div>
              <div style={{...s.card, borderLeft: '4px solid #ef4444'}}><h4 style={{margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Expiring Soon</h4><p style={{fontSize: '28px', fontWeight: '700', color: '#ef4444', margin: 0}}>{expiringSoon}</p></div>
            </div>
          </div>
        )}

        {activeTab === "Members" && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
              <div style={s.searchBox}>
                <Search size={18} color="#94a3b8"/>
                <input placeholder="Search members..." value={searchMembers} onChange={(e)=>setSearchMembers(e.target.value)} style={s.blankInput}/>
              </div>
              <button onClick={() => setIsModalOpen(true)} style={s.primaryBtn}>+ Add Member</button>
            </div>
            {/* Members Table */}
            <div className="tableContainer" style={s.tableContainer}>
              <table style={s.table}>
                <thead><tr style={s.tableHead}><th style={s.th}>Name</th><th style={s.th}>Phone</th><th style={s.th}>Plan</th><th style={s.th}>Join Date</th><th style={s.th}>Expiry</th><th style={s.th}>Status</th><th style={s.th}>Action</th></tr></thead>
                <tbody>
                  {filteredMembers.map(m => (
                    <tr key={m.id} style={s.tableRow}>
                      <td style={{fontWeight: '600', padding: '12px 20px'}}>{m.name}</td>
                      <td style={{padding: '12px 20px', color: '#475569'}}>{m.phone}</td>
                      <td style={{padding: '12px 20px'}}>{m.plan}</td>
                      <td style={{padding: '12px 20px'}}>{m.join_date || '-'}</td>
                      <td style={{padding: '12px 20px'}}>{m.expiry_date || '-'}</td>
                      <td style={{padding: '12px 20px'}}>{new Date(m.expiry_date) >= new Date() ? <span style={{color: '#10b981', fontWeight:600}}>Active</span> : <span style={{color: '#ef4444', fontWeight:600}}>Expired</span>}</td>
                      <td style={{padding: '12px 20px', display: 'flex', gap: '10px', alignItems: 'center'}}>
                        <Trash2 size={18} color="#ef4444" style={{cursor: 'pointer'}} onClick={() => handleDeleteMember(m.id)} />
                        <button style={{background: '#fbbf24', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 10px', cursor: 'pointer', fontWeight: 600}} onClick={() => handleExpiryReminder(m)}>
                          Expiry Reminder
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "Payments" && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
              <div style={s.searchBox}>
                <Search size={18} color="#94a3b8"/>
                <input placeholder="Search payments by member, amount or method..." value={searchPayments} onChange={(e)=>setSearchPayments(e.target.value)} style={s.blankInput}/>
              </div>
              <button onClick={() => { setIsModalOpen(true); setActiveTab("Payments"); }} style={s.successBtn}>+ Record Payment</button>
            </div>
            {/* Payments Table */}
            <div className="tableContainer" style={s.tableContainer}>
              <table className="table" style={s.table}>
                <thead><tr style={s.tableHead}><th style={s.th}>Member</th><th style={s.th}>Phone</th><th style={s.th}>Amount</th><th style={s.th}>Method</th><th style={s.th}>Date</th></tr></thead>
                <tbody>
                  {filteredPayments.map(p => (
                    <tr key={p.id} style={s.tableRow}>
                      <td style={{fontWeight: '600', padding: '12px 20px'}}>{p.members?.name}</td>
                      <td style={{padding: '12px 20px', color: '#475569'}}>{p.members?.phone || '-'}</td>
                      <td style={{color: '#10b981', fontWeight: '700', padding: '12px 20px'}}>₹{Number(p.amount).toLocaleString()}</td>
                      <td style={{padding: '12px 20px'}}>{p.method}</td>
                      <td style={{padding: '12px 20px'}}>{p.created_at ? new Date(p.created_at).toLocaleString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddMemberModal
        isOpen={isModalOpen && activeTab === "Members"}
        onClose={() => { setIsModalOpen(false); fetchData(); }}
        onRefresh={fetchData}
        userId={session.user.id}
      />
      <RecordPaymentModal
        isOpen={isModalOpen && activeTab === "Payments"}
        onClose={() => { setIsModalOpen(false); fetchData(); }}
        onRefresh={fetchData}
        members={members}
        userId={session.user.id}
      />
    </div>
  );
}

const s = {
  navItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px', cursor: 'pointer', borderRadius: '10px', color: 'rgba(255,255,255,0.7)', fontWeight: '500', transition: 'all 0.3s', fontSize: '15px' },
  active: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px', cursor: 'pointer', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.25)', color: '#fff', fontWeight: '600', transition: 'all 0.3s', fontSize: '15px' },
  card: { backgroundColor: '#fff', padding: '28px', borderRadius: '14px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', textAlign: 'center', transition: 'all 0.3s' },
  searchBox: { display: 'flex', alignItems: 'center', backgroundColor: '#fff', border: '2px solid #e2e8f0', padding: '12px 18px', borderRadius: '12px', width: '350px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'all 0.3s' },
  blankInput: { border: 'none', outline: 'none', marginLeft: '10px', width: '100%', fontSize: '15px', backgroundColor: 'transparent', color: '#1e293b', fontFamily: '"Inter", sans-serif' },
  primaryBtn: { backgroundColor: '#8b5cf6', color: '#fff', padding: '12px 28px', borderRadius: '10px', border: 'none', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)', transition: 'all 0.3s', fontSize: '15px' },
  successBtn: { backgroundColor: '#10b981', color: '#fff', padding: '12px 28px', borderRadius: '10px', border: 'none', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)', transition: 'all 0.3s', fontSize: '15px' },
  tableContainer: { backgroundColor: '#fff', borderRadius: '16px', border: 'none', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' },
  table: { width: '100%', borderCollapse: 'collapse', fontFamily: '"Inter", sans-serif' },
  tableHead: { textAlign: 'left', backgroundColor: '#f1f5f9', height: '55px', borderBottom: '2px solid #e2e8f0', fontSize: '13px', color: '#475569', paddingLeft: '20px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' },
  tableRow: { borderBottom: '1px solid #f1f5f9', height: '60px', transition: 'all 0.2s' }
};

// small reusable th style
 s.th = { padding: '14px 20px', textAlign: 'left' };