import { useState, useEffect, useRef } from 'react';

export function useScrollDirection() {
    const [isHidden, setIsHidden] = useState(false);
    const lastTouchY = useRef(0);

    useEffect(() => {
        // Handle wheel events (desktop)
        const handleWheel = (e: WheelEvent) => {
            if (e.deltaY > 0) {
                // Scrolling down
                setIsHidden(true);
            } else if (e.deltaY < 0) {
                // Scrolling up
                setIsHidden(false);
            }
        };

        // Handle touch events (mobile)
        const handleTouchStart = (e: TouchEvent) => {
            lastTouchY.current = e.touches[0].clientY;
        };

        const handleTouchMove = (e: TouchEvent) => {
            const currentY = e.touches[0].clientY;
            const diff = lastTouchY.current - currentY;

            if (Math.abs(diff) > 10) {
                if (diff > 0) {
                    // Swiping up (scrolling down)
                    setIsHidden(true);
                } else {
                    // Swiping down (scrolling up)
                    setIsHidden(false);
                }
                lastTouchY.current = currentY;
            }
        };

        // Add listeners with passive: true for better performance
        window.addEventListener('wheel', handleWheel, { passive: true });
        window.addEventListener('touchstart', handleTouchStart, { passive: true });
        window.addEventListener('touchmove', handleTouchMove, { passive: true });

        return () => {
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
        };
    }, []);

    return isHidden ? 'down' : 'up';
}
