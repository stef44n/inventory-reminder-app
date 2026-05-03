import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Toaster } from "react-hot-toast";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <>
            <App />
            <Toaster position="top-center" />
        </>
    </React.StrictMode>,
);

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").then((reg) => {
        console.log("SW registered:", reg);

        // 🔥 FORCE READY STATE FIX FOR iOS
        if (!navigator.serviceWorker.controller) {
            window.location.reload();
        }
    });
}
