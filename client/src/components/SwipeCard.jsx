import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function SwipeCard({
    children,
    leftAction,
    rightAction,
    isActive,
    onActivate,
    onCloseOther,
}) {
    const [translateX, setTranslateX] = useState(0);
    const isDragging = useRef(false);

    const startX = useRef(0);
    const currentX = useRef(0);
    const startTime = useRef(0);

    const MAX_SWIPE = 90;

    const handleTouchStart = (e) => {
        isDragging.current = true;

        if (onActivate) onActivate();

        startX.current = e.touches[0].clientX;
        currentX.current = startX.current;
        startTime.current = Date.now();
    };

    const handleTouchMove = (e) => {
        if (isActive === false) return;

        const x = e.touches[0].clientX;

        currentX.current = x;

        let diff = x - startX.current;

        // resistance near edges
        if (diff > MAX_SWIPE) {
            diff = MAX_SWIPE + (diff - MAX_SWIPE) * 0.2;
        }

        if (diff < -MAX_SWIPE) {
            diff = -MAX_SWIPE + (diff + MAX_SWIPE) * 0.2;
        }

        setTranslateX(diff);
    };

    const handleTouchEnd = () => {
        isDragging.current = false;

        const distance = currentX.current - startX.current;
        const time = Date.now() - startTime.current;
        const velocity = distance / time;

        const shouldOpenRight = distance > 55 || velocity > 0.45;
        const shouldOpenLeft = distance < -55 || velocity < -0.45;

        if (shouldOpenRight) setTranslateX(MAX_SWIPE);
        else if (shouldOpenLeft) setTranslateX(-MAX_SWIPE);
        else setTranslateX(0);
    };

    const forceClose = () => {
        setTranslateX(0);
    };

    const closeCard = () => {
        setTranslateX(0);
        if (onCloseOther) onCloseOther();
    };

    useEffect(() => {
        if (!isActive && translateX !== 0) {
            setTranslateX(0);
        }
    }, [isActive]);

    return (
        <div className="swipe-wrapper">
            {/* LEFT ACTION */}
            <div className="swipe-action swipe-left">
                {leftAction && leftAction(closeCard)}
            </div>

            {/* RIGHT ACTION */}
            <div className="swipe-action swipe-right">
                {rightAction && rightAction(closeCard)}
            </div>

            {/* CARD */}
            <motion.div
                className="swipe-card"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                animate={{
                    x: translateX,
                }}
                transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 30,
                    mass: 0.7,
                }}
                whileTap={{
                    scale: 0.995,
                }}
            >
                {children}
            </motion.div>
        </div>
    );
}
