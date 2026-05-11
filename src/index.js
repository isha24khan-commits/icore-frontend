/**
 * Entry point of the React application.
 * This file mounts the React app into the root DOM element.
 */

import React from "react";
import ReactDOM from "react-dom/client";

// Global styles (Tailwind + custom CSS)
import "@/index.css";

// Main App component that contains all routes and pages
import App from "@/App";

/**
 * Create a React root using React 18+ API
 * This attaches React to the <div id="root"></div> in index.html
 */
const root = ReactDOM.createRoot(document.getElementById("root"));

/**
 * Render the application inside React.StrictMode
 * StrictMode helps highlight potential problems in development
 */
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);