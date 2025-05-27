'use strict';
import { useCallback } from 'react';
import { twMerge } from 'tailwind-merge';

function Button(props: {
    id?: string;
    className?: string;
    type?: "base" | "medium" | "large";
    theme?: string;
    children?: React.ReactNode;
    disabled?: boolean;
    onlyIcon?: boolean;

    onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
})
{
    let theme = "text-neutral-300 bg-white/10 hover:text-white hover:bg-white/20";
    switch (props.theme)
    {
        case "blue":
        {
            theme = "text-gray-300 bg-blue-500/80 hover:text-white hover:bg-blue-500";
        } break;
    }

    let type = "h-7 text-sm";
    switch (props.type)
    {
        case "base":
        {
            type = "h-7 text-sm";
        } break;
        case "medium": 
        {
            type = "h-10 text-sm";
        } break;
        case "large": 
        {
            type = "h-12 text-lg";
        } break;
    }

    const classes = twMerge(
        `flex items-center justify-center gap-2 rounded-md cursor-pointer transition-colors duration-150 ${theme} ${type} ${props.onlyIcon ? "aspect-square" : "px-2"}`, 
        props.className,
        props.disabled && "opacity-50",
    );

    const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => 
    {
        if (props.disabled)
        {
            return;
        }

        props.onClick?.(e);
    }, [props.disabled]);

    return (
        <div id={props.id} className={classes} onClick={handleClick}>
            { props.children }
        </div>
    );
}

export default Button;