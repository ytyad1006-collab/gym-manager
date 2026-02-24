import { useState } from "react";
import { supabase } from "./supabase";

// Add Google Fonts
if (!document.querySelector('link[href*="fonts.googleapis"]')) {
  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);
}

export default function Auth({ onLogin }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(""); // Optional: for showing error messages
  const [isReset, setIsReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMsg, setResetMsg] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    gymName: "",
    email: "",
    password: ""
  });

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      if (isReset) {
        // shouldn't happen here; reset is handled separately
        setErrorMsg("Invalid action");
        return;
      }

      if (isSignUp) {
        // Set trial_end to 14 days from now
        const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
        const { error: signError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              gym_name: formData.gymName,
              trial_end: trialEnd,
              subscription_status: 'trial',
              plan: null
            }
          }
        });
        if (signError) throw signError;

        // Try to sign the user in immediately. This will fail if email confirmation
        // is required by your Supabase project's auth settings; in that case inform user.
        try {
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password
          });
          if (loginError) {
            // likely requires email confirmation
            setErrorMsg("Registration successful. Please check your email to confirm your account before logging in.");
            setIsSignUp(false);
            setFormData({ fullName: "", gymName: "", email: "", password: "" });
          } else {
            // logged in - pass session to parent
            onLogin(loginData.session);
          }
        } catch (innerErr) {
          console.warn("Auto-login after signup failed:", innerErr);
          setErrorMsg("Registration successful. Please login to continue.");
          setIsSignUp(false);
          setFormData({ fullName: "", gymName: "", email: "", password: "" });
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        onLogin(data.session);
      }
    } catch (error) {
      setErrorMsg(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setResetMsg("");
    setErrorMsg("");
    if (!resetEmail) return setResetMsg("Please enter your email");
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: window.location.origin
      });
      if (error) throw error;
      setResetMsg("If that email exists, a password reset link has been sent.");
    } catch (err) {
      setResetMsg(err.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  const s = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
      zIndex: 2000
    },
    card: {
      background: '#fff',
      padding: '48px',
      borderRadius: '20px',
      boxShadow: '0 20px 60px rgba(139, 92, 246, 0.25)',
      width: '100%',
      maxWidth: '420px'
    },
    input: {
      padding: '14px 16px',
      borderRadius: '10px',
      border: '2px solid #e2e8f0',
      width: '100%',
      marginBottom: '16px',
      fontSize: '15px',
      color: '#1e293b',
      backgroundColor: '#f8fafc',
      boxSizing: 'border-box',
      fontFamily: '"Inter", sans-serif',
      transition: 'all 0.3s'
    },
    btn: {
      padding: '14px',
      background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
      color: '#fff',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontWeight: '600',
      width: '100%',
      fontSize: '15px',
      boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
      transition: 'all 0.3s'
    },
    errorMsg: {
      color: '#ef4444',
      marginBottom: '16px',
      fontSize: '14px',
      fontWeight: '500'
    }
  };

  return (
    <div style={s.overlay}>
      <div style={s.card}>
        <h2 style={{ textAlign: 'center', color: '#1e293b', marginBottom: '24px', fontSize: '26px', fontWeight: '700', fontFamily: '"Poppins", sans-serif' }}>
          {isReset ? "Reset Password" : isSignUp ? "Create Account" : "Welcome Back"}
        </h2>
        {errorMsg && <div style={s.errorMsg}>{errorMsg}</div>}

        {isReset ? (
          <form onSubmit={handleReset}>
            <input
              type="email"
              placeholder="Your email"
              required
              style={s.input}
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
            />
            {resetMsg && <div style={{ color: '#0ea5a4', marginBottom: '12px' }}>{resetMsg}</div>}
            <button type="submit" disabled={loading} style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}>Send reset link</button>
            <p style={{ textAlign: 'center', marginTop: '16px' }}>
              <span style={{ color: '#64748b' }}>Remembered your password?</span>
              <span onClick={() => { setIsReset(false); setResetMsg(""); }} style={{ color: '#1e293b', fontWeight: '700', cursor: 'pointer', marginLeft: '8px' }}>Login</span>
            </p>
          </form>
        ) : (
          <>
            <form onSubmit={handleAuth}>
              {isSignUp && (
                <>
                  <input
                    placeholder="Full Name"
                    required
                    style={s.input}
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                  <input
                    placeholder="Gym Name"
                    required
                    style={s.input}
                    value={formData.gymName}
                    onChange={(e) => setFormData({ ...formData, gymName: e.target.value })}
                  />
                </>
              )}
              <input
                type="email"
                placeholder="Email ID"
                required
                style={s.input}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <input
                type="password"
                placeholder="Password"
                required
                style={s.input}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="submit"
                disabled={loading}
                style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}
              >
                {loading ? "Please wait..." : isSignUp ? "Create Account" : "Login Now"}
              </button>
            </form>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '18px', alignItems: 'center' }}>
              <p style={{ color: '#64748b' }}>
                {isSignUp ? "Already have an account?" : "New Gym Owner?"}
                <span
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setErrorMsg("");
                  }}
                  style={{ color: '#1e293b', fontWeight: '700', cursor: 'pointer', marginLeft: '8px', textDecoration: 'underline' }}
                >
                  {isSignUp ? "Login" : "Register Now"}
                </span>
              </p>

              <span onClick={() => { setIsReset(true); setResetMsg(""); }} style={{ color: '#1e293b', fontWeight: '700', cursor: 'pointer' }}>Forgot password?</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}