import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

export default function Layout() {
    const navigate = useNavigate();
    const location = useLocation();

    // Hide FAB on dashboard
    const hideFab = location.pathname === "/dashboard";

    const handleFabClick = () => {
        const path = location.pathname;

        if (path.includes("consumables")) {
            window.dispatchEvent(new Event("openAddConsumable"));
        } else if (path.includes("chargeables")) {
            window.dispatchEvent(new Event("openAddChargeable"));
        } else if (path.includes("expiry")) {
            window.dispatchEvent(new Event("openAddExpiry"));
        } else if (path.includes("subscriptions")) {
            window.dispatchEvent(new Event("openAddSubscription"));
        } else {
            navigate("/dashboard");
        }
    };

    return (
        <div className="page-wrapper">
            {/* Page */}
            <Outlet />

            {/* Floating Action Button */}
            {!hideFab && (
                <button className="fab" onClick={handleFabClick}>
                    +
                </button>
            )}

            {/* Bottom Navigation */}
            <nav className="bottom-nav">
                <NavLink to="/dashboard" className="nav-item">
                    <span className="nav-icon">🏠</span>
                    <span>Home</span>
                </NavLink>

                <NavLink to="/consumables" className="nav-item">
                    <span className="nav-icon">🧃</span>
                    <span>Items</span>
                </NavLink>

                <NavLink to="/chargeables" className="nav-item">
                    <span className="nav-icon">🔋</span>
                    <span>Charge</span>
                </NavLink>

                <NavLink to="/expiry" className="nav-item">
                    <span className="nav-icon">⏳</span>
                    <span>Expiry</span>
                </NavLink>

                <NavLink to="/subscriptions" className="nav-item">
                    <span className="nav-icon">🔁</span>
                    <span>Subs</span>
                </NavLink>
            </nav>
        </div>
    );
}
