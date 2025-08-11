import type { Tile } from "../../types";

function Piece(props: {
    value: Tile | null;
    style?: React.CSSProperties;
    onMouseDown?: (value: Tile, e: React.MouseEvent<HTMLImageElement>) => void;
    onTouchStart?: (value: Tile, e: React.TouchEvent<HTMLImageElement>) => void;
}) 
{
    const handleMouseDown = (e: React.MouseEvent<HTMLImageElement>) => 
    {
        props.onMouseDown?.(props.value!, e);
    };

    const handleTouchStart = (e: React.TouchEvent<HTMLImageElement>) => 
    {
        props.onTouchStart?.(props.value!, e);
    };

    return (
        <>
            {
                props.value && (
                    <img
                        src={`/images/${props.value.color}${props.value.type}.png`}
                        className={`absolute z-10 inset-0`}
                        style={props.style}
                        onMouseDown={handleMouseDown}
                        onTouchStart={handleTouchStart}
                        onDragStart={(e) => e.preventDefault()}
                    />
                )
            }
        </>
    );
}

export default Piece;