import type { Color } from "chess.js";
import { useCallback } from "react";
import { twJoin } from "tailwind-merge";


function PromotionPopup(props: {
    color: Color;
    playingAs: Color;
    handlePromotion: (piece: string) => void
})
{
    const handlePromotion = useCallback((piece: string) =>
    {
        props.handlePromotion(piece);
    }, [props.handlePromotion]);

    return (
        <div 
            className={twJoin(
                "absolute h-[400%] w-full bg-white/50 z-20 backdrop-blur-sm grid grid-cols-1",
                props.playingAs === props.color
                    ? "top-0 left-0"
                    : "bottom-0 right-0"
            )}
        >
            {
                ["q", "r", "b", "n"].map((piece) => (
                    <img
                        key={piece}
                        src={`/images/${props.color}${piece}.png`}
                        className={`w-full h-full select-none hover:scale-110 transition-all duration-300`}
                        onClick={() => handlePromotion(piece)}
                    />
                ))
            }
        </div>
    )
}

export default PromotionPopup;