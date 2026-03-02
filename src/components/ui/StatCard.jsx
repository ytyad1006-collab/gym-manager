function StatCard({ title, value, highlight, trend }) {
  return (
    <div
      style={{
        background: "white",
        padding: "24px",
        borderRadius: "16px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
        // ✅ Layout shift fix: Use 2px always, but change color
        border: "2px solid",
        borderColor: highlight ? "#3b82f6" : "transparent", 
        transition: "all 0.3s ease",
        flex: 1, // Dashboard grid mein barabar space lene ke liye
        minWidth: "200px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <p
          style={{
            fontSize: "14px",
            color: "#6b7280",
            marginBottom: "8px",
            fontWeight: "500",
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}
        >
          {title}
        </p>
        
        {/* Optional Trend Badge (Optional feature) */}
        {trend && (
          <span style={{ 
            fontSize: "12px", 
            padding: "4px 8px", 
            borderRadius: "20px",
            backgroundColor: trend > 0 ? "#ecfdf5" : "#fef2f2",
            color: trend > 0 ? "#10b981" : "#ef4444",
            fontWeight: "600"
          }}>
            {trend > 0 ? `+${trend}%` : `${trend}%`}
          </span>
        )}
      </div>

      <h2
        style={{
          fontSize: "32px", // Thoda bada font zyada impact dalta hai
          fontWeight: "800",
          color: "#111827",
          margin: 0
        }}
      >
        {value}
      </h2>
    </div>
  );
}

export default StatCard;