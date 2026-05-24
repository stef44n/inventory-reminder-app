import { motion } from "framer-motion";

export default function Card({ children, icon, className = "" }) {
    return (
        <motion.div
            className={`card item-card ${className}`}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                duration: 0.22,
                ease: "easeOut",
            }}
            whileTap={{
                scale: 0.985,
            }}
        >
            <div className="card-icon">{icon}</div>

            <div className="card-content">{children}</div>
        </motion.div>
    );
}
