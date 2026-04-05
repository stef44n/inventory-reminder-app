import { Link, Outlet } from "react-router-dom";

export default function Layout() {
    return (
        <div style={{ paddingBottom: "60px" }}>
            {/* Page Content */}
            <Outlet />

            {/* Bottom Navigation */}
            <nav
                style={{
                    position: "fixed",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "60px",
                    background: "#eee",
                    display: "flex",
                    justifyContent: "space-around",
                    alignItems: "center",
                    borderTop: "1px solid #ccc",
                }}
            >
                <Link to="/dashboard">Home</Link>
                <Link to="/consumables">Consumables</Link>
                <Link to="/chargeables">Charge</Link>
                <Link to="/expiry">Expiry</Link>
                <Link to="/subscriptions">Subs</Link>
            </nav>
        </div>
    );
}
