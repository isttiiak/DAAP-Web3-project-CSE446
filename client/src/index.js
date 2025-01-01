import React from "react";
import ReactDOM from "react-dom/client"; // Import `createRoot` from ReactDOM
import App from "./App"; // Import the main App component
import "./index.css"; // Optional styling file

// Create a root element and render the App
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
