import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
// ✅ Step 1: Vercel Analytics import kiya
import { Analytics } from "@vercel/analytics/react"; 

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
    {/* ✅ Step 2: Analytics component ko App ke saath wrap kiya */}
    <Analytics />
  </StrictMode>
);