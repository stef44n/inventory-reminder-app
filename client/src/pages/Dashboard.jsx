import { Link } from "react-router-dom";
import { subscribeToPush } from "../utils/push";
import { useEffect, useState } from "react";
import API from "../api/api";

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [darkMode, setDarkMode] = useState(
        localStorage.getItem("theme") === "dark",
    );

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

    useEffect(() => {
        if (darkMode) {
            document.body.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.body.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [darkMode]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/";
    };

    if (!data) {
        return (
            <div className="dashboard">
                <p className="empty-text">Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="dashboard">
            {/* HEADER */}
            <div className="dashboard-header">
                <div>
                    <div className="dashboard-title">Dashboard</div>

                    <div className="dashboard-subtitle">
                        Stay on top of your items
                    </div>
                </div>

                <div className="dashboard-actions">
                    <button
                        className="button-small"
                        onClick={() => setDarkMode(!darkMode)}
                    >
                        {darkMode ? "☀️" : "🌙"}
                    </button>

                    <button className="button-small" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>

            {/* NOTIFICATIONS */}
            <button className="button-primary" onClick={subscribeToPush}>
                Enable Notifications
            </button>

            {/* SUMMARY */}
            <div className="summary-grid">
                <SummaryCard
                    icon="🧃"
                    label="Low Stock"
                    value={data.lowStock.length}
                />

                <SummaryCard
                    icon="🔋"
                    label="Need Charging"
                    value={data.needsCharging.length}
                />

                <SummaryCard
                    icon="⏳"
                    label="Expiring Soon"
                    value={data.expiringSoon.length}
                />

                <SummaryCard
                    icon="🔁"
                    label="Subscriptions Due"
                    value={data.dueSubscriptions.length}
                />
            </div>

            {/* PRIORITY SECTION */}
            <div className="dashboard-section">
                <h3>Priority Items</h3>

                {data.lowStock.length === 0 &&
                data.needsCharging.length === 0 &&
                data.expiringSoon.length === 0 &&
                data.dueSubscriptions.length === 0 ? (
                    <div className="card">
                        <p className="empty-text">Everything looks good 🎉</p>
                    </div>
                ) : (
                    <>
                        <PrioritySection
                            title="Low Stock"
                            items={data.lowStock}
                            icon="🧃"
                            status="Low"
                            statusClass="status-due"
                        />

                        <PrioritySection
                            title="Need Charging"
                            items={data.needsCharging}
                            icon="🔋"
                            status="Due"
                            statusClass="status-soon"
                        />

                        <PrioritySection
                            title="Expiring Soon"
                            items={data.expiringSoon}
                            icon="⏳"
                            status="Soon"
                            statusClass="status-expired"
                        />

                        <PrioritySection
                            title="Subscriptions Due"
                            items={data.dueSubscriptions}
                            icon="🔁"
                            status="Due"
                            statusClass="status-due"
                        />
                    </>
                )}
            </div>

            {/* QUICK LINKS */}
            <div className="dashboard-section">
                <h3>Quick Access</h3>

                <div className="quick-links">
                    <Link to="/consumables" className="link-card">
                        🧃 Goods
                    </Link>

                    <Link to="/chargeables" className="link-card">
                        🔋 Chargeables
                    </Link>

                    <Link to="/expiry" className="link-card">
                        ⏳ Expiry
                    </Link>

                    <Link to="/subscriptions" className="link-card">
                        🔁 Subs
                    </Link>
                </div>
            </div>
        </div>
    );
}

/* SUMMARY CARD */
function SummaryCard({ icon, label, value }) {
    return (
        <div className="summary-card">
            <div className="summary-icon">{icon}</div>

            <div className="summary-number">{value}</div>

            <div className="summary-label">{label}</div>
        </div>
    );
}

/* PRIORITY LIST */
function PrioritySection({ title, items, icon, status, statusClass }) {
    if (items.length === 0) return null;

    return (
        <div className="dashboard-section">
            <h4>{title}</h4>

            {items.map((item) => (
                <div className="card" key={item.id}>
                    <div className="card-row">
                        <div className="card-left">
                            <div className="card-title">
                                {icon} {item.name}
                            </div>
                        </div>

                        <div className={`status ${statusClass}`}>{status}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
