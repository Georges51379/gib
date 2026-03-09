import { createRoot } from "react-dom/client";
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import App from "./App.tsx";
import "./index.css";

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

if (import.meta.env.DEV && (!RECAPTCHA_SITE_KEY || RECAPTCHA_SITE_KEY === 'your-recaptcha-site-key-here')) {
  console.warn('⚠️ reCAPTCHA is not configured. Please add VITE_RECAPTCHA_SITE_KEY to your .env file');
}

createRoot(document.getElementById("root")!).render(
  <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_SITE_KEY}>
    <App />
  </GoogleReCaptchaProvider>
);
