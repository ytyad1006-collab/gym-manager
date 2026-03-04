/**
 * ✅ GLOBAL PLAN: Dynamic Currency Formatter
 * Ab ye automatically localStorage se preferred currency uthayega.
 */
export const formatCurrency = (amount) => {
  // Settings.jsx se save ki gayi preferences nikalna
  const savedCountry = localStorage.getItem("gym_country") || "IN";
  
  // Country mapping logic
  const countries = [
    { code: "IN", currency: "INR", locale: "en-IN" },
    { code: "US", currency: "USD", locale: "en-US" },
    { code: "AE", currency: "AED", locale: "ar-AE" },
    { code: "GB", currency: "GBP", locale: "en-GB" },
    { code: "EU", currency: "EUR", locale: "de-DE" },
  ];

  const config = countries.find(c => c.code === savedCountry) || countries[0];

  try {
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.currency,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  } catch (error) {
    console.error("Currency formatting error:", error);
    return `${amount}`; 
  }
};

/**
 * ✅ GLOBAL PLAN: Standard Date Formatter
 * Ab ye Settings mein chuni gayi Date Format ko respect karega.
 */
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  
  const savedFormat = localStorage.getItem("date_format") || "DD/MM/YYYY";
  const date = new Date(dateString);

  // User ki pasand ke hisab se formatting
  if (savedFormat === "MM/DD/YYYY") {
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  } else if (savedFormat === "YYYY-MM-DD") {
    return date.toISOString().split('T')[0];
  }

  // Default: 20 Mar 2024 (DD/MM/YYYY style)
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

/**
 * ✅ EXISTING LOGIC: Member Initials (No changes)
 */
export const getInitials = (name) => {
  if (!name) return "??";
  const parts = name.split(' ');
  return parts.map(p => p[0]).join('').toUpperCase().substring(0, 2);
};

/**
 * ✅ EXISTING LOGIC: Status Color Helper (No changes)
 */
export const getStatusColor = (status) => {
  const s = status?.toLowerCase();
  if (s === 'active') return 'text-emerald-600 bg-emerald-50';
  if (s === 'expired') return 'text-rose-600 bg-rose-50';
  if (s === 'pending') return 'text-amber-600 bg-amber-50';
  return 'text-slate-600 bg-slate-50';
};