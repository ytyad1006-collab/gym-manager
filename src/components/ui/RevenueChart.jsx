import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
// ✅ Global utility import ki
import { formatCurrency } from "../../lib/utils";

function RevenueChart({ data }) {
  const safeData = Array.isArray(data) ? data : [];

  // 🌍 Dynamic Currency Symbol nikalne ke liye
  const currencySymbol = formatCurrency(0).replace(/[0-9.,\s]/g, '');

  return (
    <div className="card-base w-full min-w-0 flex flex-col overflow-hidden">
      <h3 className="text-lg font-bold text-slate-800 mb-6">
        Monthly Revenue
      </h3>

      <div className="w-full h-[350px] min-h-[300px] relative"> 
        {safeData.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-slate-400">No revenue data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <LineChart 
              data={safeData} 
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /> 
              
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                dy={10}
              />
              
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                // ✅ Symbol ab dynamic hai (₹/$) aur k logic bhi chalta rahega
                tickFormatter={(value) => `${currencySymbol}${value >= 1000 ? (value/1000) + 'k' : value}`}
              />

              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' 
                }}
                // ✅ Tooltip mein poora formatted currency dikhega (comma ke sath)
                formatter={(v) => [formatCurrency(v), "Revenue"]} 
              />

              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={1500}
                connectNulls={true}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default RevenueChart;