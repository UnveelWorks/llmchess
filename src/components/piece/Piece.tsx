import { useCallback } from "react";
import pieceImages from "../../data/pieceImages";

function Piece(props: {
    value: string;
    index?: number;
    style?: React.CSSProperties;
    onMouseDown?: (value: string, index: number, e: React.MouseEvent<HTMLImageElement>) => void;
})
{
    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLImageElement>) => 
    {
        props.onMouseDown?.(props.value, props.index ?? 0, e);
    }, [props.value, props.index]);

    return (
        <img 
            src={pieceImages[props.value as keyof typeof pieceImages]}  
            className={`w-full h-full select-none`}
            style={props.style}
            onMouseDown={handleMouseDown}
        />
    )
}

export default Piece;