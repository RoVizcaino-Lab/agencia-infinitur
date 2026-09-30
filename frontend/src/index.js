import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

// If any image fails to load (e.g. a file that no longer exists), show a neutral placeholder
// instead of the browser's broken-image icon. 'error' doesn't bubble, so listen in the capture phase.
window.addEventListener(
  "error",
  (e) => {
    const img = e.target;
    if (img instanceof HTMLImageElement && !img.dataset.fallback) {
      img.dataset.fallback = "1";
      img.src = "/img-placeholder.svg";
    }
  },
  true,
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
