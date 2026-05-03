import { Link } from "react-router-dom";
import { subscribeToPush } from "../utils/push";
import { useEffect, useState } from "react";
import API from "../api/api";
import Card from "../components/Card";

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

    if (!data) return <p className="empty-text">Loading...</p>;

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/";
    };

    return (
        <div className="dashboard">
            {/* HEADER */}
            <div className="dashboard-header">
                <div className="dashboard-title">Dashboard</div>

                <button className="button-small" onClick={handleLogout}>
                    Logout
                </button>
            </div>

            {/* SUMMARY */}
            <div className="summary-grid">
                <SummaryCard label="Low Stock" value={data.lowStock.length} />
                <SummaryCard
                    label="Charging"
                    value={data.needsCharging.length}
                />
                <SummaryCard
                    label="Expiring"
                    value={data.expiringSoon.length}
                />
                <SummaryCard
                    label="Subscriptions"
                    value={data.dueSubscriptions.length}
                />
            </div>

            {/* QUICK LINKS */}
            <div className="quick-links">
                <Link to="/consumables" className="link-card">
                    🧃 Consumables
                </Link>
                <Link to="/chargeables" className="link-card">
                    🔋 Chargeables
                </Link>
                <Link to="/expiry" className="link-card">
                    ⏳ Expiry
                </Link>
                <Link to="/subscriptions" className="link-card">
                    💳 Subscriptions
                </Link>
            </div>

            {/* NOTIFICATIONS */}
            <button className="button-primary" onClick={subscribeToPush}>
                Enable Notifications
            </button>

            {/* SECTIONS */}
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

/* 🔹 Summary Card */
function SummaryCard({ label, value }) {
    return (
        <div className="summary-card">
            <div className="summary-number">{value}</div>
            <div className="summary-label">{label}</div>
        </div>
    );
}

/* 🔹 Section */
function Section({ title, items }) {
    return (
        <div className="dashboard-section">
            <h3>{title}</h3>

            {items.length === 0 ? (
                <p className="empty-text">Nothing here</p>
            ) : (
                items.map((item) => (
                    <Card key={item.id} icon="📌">
                        <div className="card-row">
                            <div className="card-left">
                                <span className="card-title">{item.name}</span>
                            </div>
                        </div>
                    </Card>
                ))
            )}
        </div>
    );
}
