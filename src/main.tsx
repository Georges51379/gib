import { createRoot } from "react-dom/client";
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import App from "./App.tsx";
import "./index.css";

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

// Validate reCAPTCHA configuration
if (!RECAPTCHA_SITE_KEY || RECAPTCHA_SITE_KEY === 'your-recaptcha-site-key-here') {
  console.warn('⚠️ reCAPTCHA is not configured. Please add VITE_RECAPTCHA_SITE_KEY to your .env file');
  console.warn('Visit https://www.google.com/recaptcha/admin to get your reCAPTCHA v3 site key');
}

createRoot(document.getElementById("root")!).render(
  <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_SITE_KEY}>
    <App />
  </GoogleReCaptchaProvider>
);
