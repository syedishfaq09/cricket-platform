import "bootstrap/dist/css/bootstrap.min.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import "./App.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js", {
        updateViaCache: "none",
      })
      .then((registration) => {
        console.log("Alamdar Stars service worker registered:", registration);

        registration.update();
      })
      .catch((error) => {
        console.error("Service worker registration failed:", error);
      });
  });
}
