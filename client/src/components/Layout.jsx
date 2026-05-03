import { NavLink, Outlet } from "react-router-dom";

export default function Layout() {
    return (
        <div style={{ paddingBottom: "70px" }}>
            {/* Page Content */}
            <Outlet />

            {/* Bottom Navigation */}
            <nav className="bottom-nav">
                <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                        isActive ? "nav-item active" : "nav-item"
                    }
                >
                    <span className="nav-icon">🏠</span>
                    Home
                </NavLink>

                <NavLink
                    to="/consumables"
                    className={({ isActive }) =>
                        isActive ? "nav-item active" : "nav-item"
                    }
                >
                    <span className="nav-icon">🧃</span>
                    Consumables
                </NavLink>

                <NavLink
                    to="/chargeables"
                    className={({ isActive }) =>
                        isActive ? "nav-item active" : "nav-item"
                    }
                >
                    <span className="nav-icon">🔋</span>
                    Charge
                </NavLink>

                <NavLink
                    to="/expiry"
                    className={({ isActive }) =>
                        isActive ? "nav-item active" : "nav-item"
                    }
                >
                    <span className="nav-icon">⏳</span>
                    Expiry
                </NavLink>

                <NavLink
                    to="/subscriptions"
                    className={({ isActive }) =>
                        isActive ? "nav-item active" : "nav-item"
                    }
                >
                    <span className="nav-icon">💳</span>
                    Subs
                </NavLink>
            </nav>
        </div>
    );
}
