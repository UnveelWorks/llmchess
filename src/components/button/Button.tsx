'use strict';
import { twMerge } from 'tailwind-merge';
import Spinner from '../spinner/Spinner';

function Button(props: {
    id?: string;
    className?: string;
    type?: "base" | "medium" | "large";
    theme?: string;
    children?: React.ReactNode;
    disabled?: boolean;
    onlyIcon?: boolean;
    isLoading?: boolean;

    onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
})
{
    let theme = "text-neutral-300 bg-white/10 hover:text-white hover:bg-white/20",
        spinnerClasses = "fill-white";
    switch (props.theme)
    {
        case "white":
        {
            theme = "text-neutral-900 bg-white hover:text-neutral-900 hover:bg-white";
            spinnerClasses = "fill-neutral-900 text-neutral-900/20";
        } break;
        case "blue":
        {
            theme = "text-white bg-blue-500/80 hover:text-white hover:bg-blue-500";
        } break;
    }

    let type = "h-7 text-sm", padding = "px-2";
    switch (props.type)
    {
        case "base":
        {
            type = "h-7 text-sm";
            padding = "px-2";
        } break;
        case "medium": 
        {
            type = "h-9 text-sm";
            padding = "px-3";
        } break;
        case "large": 
        {
            type = "h-11 text-lg";
            padding = "px-4";
        } break;
    }

    const classes = twMerge(
        `relative flex items-center justify-center rounded-md cursor-pointer transition-colors duration-150 select-none ${theme} ${type} ${props.onlyIcon ? "aspect-square" : padding}`, 
        props.className,
        props.disabled && "opacity-50",
    );

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => 
    {
        if (props.disabled)
        {
            return;
        }

        props.onClick?.(e);
    }

    return (
        <div id={props.id} className={classes} onClick={handleClick}>
            <div className="flex items-center justify-center gap-2" style={{ opacity: props.isLoading ? 0 : 1 }}>
                { props.children }
            </div>
            { props.isLoading && <Spinner className={`absolute w-5 w-5 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${spinnerClasses}`} /> }
        </div>
    );
}

export default Button;