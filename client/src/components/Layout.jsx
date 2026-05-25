import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

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
            <AnimatePresence mode="wait">
                <motion.div
                    key={location.pathname}
                    initial={{
                        opacity: 0,
                        y: 10,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    exit={{
                        opacity: 0,
                        y: -10,
                    }}
                    transition={{
                        duration: 0.18,
                        ease: "easeOut",
                    }}
                >
                    <Outlet />
                </motion.div>
            </AnimatePresence>

            {/* Floating Action Button */}
            {!hideFab && (
                <motion.button
                    className="fab"
                    onClick={handleFabClick}
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.05 }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                    }}
                >
                    +
                </motion.button>
            )}

            {/* Bottom Navigation */}
            <nav className="bottom-nav">
                <motion.div whileTap={{ scale: 0.9 }}>
                    <NavLink to="/dashboard" className="nav-item">
                        <span className="nav-icon">🏠</span>
                        <span>Home</span>
                    </NavLink>{" "}
                </motion.div>

                <motion.div whileTap={{ scale: 0.9 }}>
                    <NavLink to="/consumables" className="nav-item">
                        <span className="nav-icon">🧃</span>
                        <span>Items</span>
                    </NavLink>
                </motion.div>

                <motion.div whileTap={{ scale: 0.9 }}>
                    <NavLink to="/chargeables" className="nav-item">
                        <span className="nav-icon">🔋</span>
                        <span>Charge</span>
                    </NavLink>
                </motion.div>

                <motion.div whileTap={{ scale: 0.9 }}>
                    <NavLink to="/expiry" className="nav-item">
                        <span className="nav-icon">⏳</span>
                        <span>Expiry</span>
                    </NavLink>
                </motion.div>

                <motion.div whileTap={{ scale: 0.9 }}>
                    <NavLink to="/subscriptions" className="nav-item">
                        <span className="nav-icon">🔁</span>
                        <span>Subs</span>
                    </NavLink>
                </motion.div>
            </nav>
        </div>
    );
}
