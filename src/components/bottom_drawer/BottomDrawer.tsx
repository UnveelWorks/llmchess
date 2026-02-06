import { useCallback, useRef, useState, type ReactNode } from "react";

const HANDLE_HEIGHT = 24; // 1.5rem
const HALF_VH = 0.4;
const FULL_VH = 0.85;

type SnapPoint = "closed" | "half" | "full";

function BottomDrawer(props: { children: ReactNode }) {
    const [snap, setSnap] = useState<SnapPoint>("closed");
    const [dragging, setDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState(0);
    const startY = useRef(0);
    const startHeight = useRef(0);

    const getSnapHeight = useCallback((point: SnapPoint) => {
        switch (point) {
            case "closed": return HANDLE_HEIGHT;
            case "half": return window.innerHeight * HALF_VH;
            case "full": return window.innerHeight * FULL_VH;
        }
    }, []);

    const currentHeight = dragging
        ? Math.max(HANDLE_HEIGHT, Math.min(window.innerHeight * FULL_VH, startHeight.current + dragOffset))
        : getSnapHeight(snap);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        setDragging(true);
        startY.current = e.touches[0].clientY;
        startHeight.current = getSnapHeight(snap);
    }, [snap, getSnapHeight]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!dragging) return;
        const delta = startY.current - e.touches[0].clientY;
        setDragOffset(delta);
    }, [dragging]);

    const handleTouchEnd = useCallback(() => {
        if (!dragging) return;
        setDragging(false);

        const finalHeight = Math.max(HANDLE_HEIGHT, startHeight.current + dragOffset);
        const vh = window.innerHeight;

        // Velocity-based: if dragged up significantly, go to next snap; if down, go to previous
        const velocity = dragOffset;
        const threshold = vh * 0.1;

        if (velocity > threshold) {
            // Swiped up
            if (snap === "closed") setSnap("half");
            else if (snap === "half") setSnap("full");
            else setSnap("full");
        } else if (velocity < -threshold) {
            // Swiped down
            if (snap === "full") setSnap("half");
            else if (snap === "half") setSnap("closed");
            else setSnap("closed");
        } else {
            // Snap to nearest
            const closedDist = Math.abs(finalHeight - HANDLE_HEIGHT);
            const halfDist = Math.abs(finalHeight - vh * HALF_VH);
            const fullDist = Math.abs(finalHeight - vh * FULL_VH);
            const min = Math.min(closedDist, halfDist, fullDist);
            if (min === closedDist) setSnap("closed");
            else if (min === halfDist) setSnap("half");
            else setSnap("full");
        }

        setDragOffset(0);
    }, [dragging, dragOffset, snap]);

    const handleClick = useCallback(() => {
        if (dragging) return;
        setSnap(prev => prev === "closed" ? "half" : "closed");
    }, [dragging]);

    const showBackdrop = snap !== "closed" || (dragging && currentHeight > HANDLE_HEIGHT * 2);
    const backdropOpacity = Math.min(0.5, ((currentHeight - HANDLE_HEIGHT) / (window.innerHeight * HALF_VH)) * 0.5);

    return (
        <>
            {/* Backdrop */}
            {showBackdrop && (
                <div
                    className="fixed inset-0 z-30 bg-black lg:hidden"
                    style={{ opacity: backdropOpacity }}
                    onClick={() => setSnap("closed")}
                />
            )}

            {/* Drawer */}
            <div
                className="fixed bottom-0 inset-x-0 z-40 lg:hidden flex flex-col bg-neutral-900/95 backdrop-blur-xl border-t border-white/[0.08] will-change-transform"
                style={{
                    height: currentHeight,
                    transition: dragging ? "none" : "height 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
                    borderRadius: "16px 16px 0 0",
                }}
            >
                {/* Handle */}
                <div
                    className="flex items-center justify-center shrink-0 cursor-grab active:cursor-grabbing"
                    style={{ height: HANDLE_HEIGHT }}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onClick={handleClick}
                >
                    <div className="w-10 h-1 bg-white/20 rounded-full" />
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto min-h-0">
                    {props.children}
                </div>
            </div>
        </>
    );
}

export default BottomDrawer;
