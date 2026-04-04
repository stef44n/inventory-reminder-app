import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Consumables from "./pages/Consumables";
import Chargeables from "./pages/Chargeables";
import Expiry from "./pages/Expiry";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/consumables" element={<Consumables />} />
                <Route path="/chargeables" element={<Chargeables />} />
                <Route path="/expiry" element={<Expiry />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
