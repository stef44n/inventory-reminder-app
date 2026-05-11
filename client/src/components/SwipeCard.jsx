import { useRef, useState } from "react";

export default function SwipeCard({ children, leftAction, rightAction }) {
    const [translateX, setTranslateX] = useState(0);
    const startX = useRef(0);

    const handleTouchStart = (e) => {
        startX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e) => {
        const currentX = e.touches[0].clientX;
        const diff = currentX - startX.current;

        // limit swipe distance
        if (diff > 100) {
            setTranslateX(100);
        } else if (diff < -100) {
            setTranslateX(-100);
        } else {
            setTranslateX(diff);
        }
    };

    const handleTouchEnd = () => {
        // snap open
        if (translateX > 60) {
            setTranslateX(80);
        } else if (translateX < -60) {
            setTranslateX(-80);
        } else {
            setTranslateX(0);
        }
    };

    const closeCard = () => {
        setTranslateX(0);
    };

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
            <div
                className="swipe-card"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{
                    transform: `translateX(${translateX}px)`,
                }}
            >
                {children}
            </div>
        </div>
    );
}
