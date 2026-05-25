import { motion } from "framer-motion";

export default function Card({ children, icon, className = "" }) {
    return (
        <motion.div
            className={`card item-card ${className}`}
            layout
            initial={false}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{
                layout: {
                    type: "spring",
                    stiffness: 500,
                    damping: 40,
                },
                opacity: { duration: 0.12 },
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
