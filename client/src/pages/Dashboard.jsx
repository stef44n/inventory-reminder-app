import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api/api";

export default function Dashboard() {
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await API.get("/dashboard");
                setData(res.data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchDashboard();
    }, []);

    if (!data) return <p style={{ padding: "20px" }}>Loading...</p>;

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/";
    };

    return (
        <div style={{ padding: "20px" }}>
            <button onClick={handleLogout}>Logout</button>

            <h2>Dashboard</h2>

            <div style={{ marginBottom: "20px" }}>
                <Link to="/consumables">Go to Consumables</Link>
                <br />
                <Link to="/chargeables">Go to Chargeables</Link>
                <br />
                <Link to="/expiry">Go to Expiry Items</Link>
                <br />
                <Link to="/subscriptions">Go to Subscriptions</Link>
            </div>

            <Section title="⚠️ Low Stock" items={data.lowStock} />
            <Section title="🔋 Needs Charging" items={data.needsCharging} />
            <Section title="⏳ Expiring Soon" items={data.expiringSoon} />
            <Section
                title="🔁 Subscriptions Due"
                items={data.dueSubscriptions}
            />
        </div>
    );
}

// 🔹 Reusable Section Component
function Section({ title, items }) {
    return (
        <div style={{ marginTop: "20px" }}>
            <h3>{title}</h3>

            {items.length === 0 ? (
                <p style={{ color: "#777" }}>Nothing here</p>
            ) : (
                <ul>
                    {items.map((item) => (
                        <li key={item.id}>
                            <strong>{item.name}</strong>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
