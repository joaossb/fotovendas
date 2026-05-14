import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import ResetPassword from "./ResetPassword.jsx";

const isReset = window.location.hash.includes("type=recovery") ||
                window.location.hash.includes("error_code=otp_expired") ||
                window.location.hash.includes("error=access_denied");

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {isReset ? <ResetPassword /> : <App />}
  </StrictMode>
);