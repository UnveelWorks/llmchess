import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

interface Option {
    label: string;
    value: string;
}

function Select(props: {
    className?: string;
    label?: string;
    value?: string;
    options: Option[];

    onChange?: React.ChangeEventHandler<HTMLSelectElement>;
})
{
    const classes = twMerge(
        "max-w-md h-14 mt-3 first:mt-0 pt-2 flex flex-col bg-neutral-600 text-neutral-300 rounded-md border border-transparent focus-within:border-neutral-600 transition-colors", 
        props.className
    );
    
    return (
        <div className={classes}>
            {
                props.label ? (
                    <div className="px-2 flex items-center text-xs font-body font-medium select-none">
                        <label className="flex-1">
                            { props.label }
                        </label>
                    </div>
                ) : null
            }

            <select
                className="min-w-0 px-1 w-full flex-1 bg-transparent text-sm text-white font-body outline-none placeholder-neutral-400" 
                value={props.value}
                onChange={props.onChange}
            >
                {
                    props.options.map((option) => (
                        <option key={option.value} value={option.value}>
                            { option.label }
                        </option>
                    ))
                }
            </select>
        </div>
    );
}

export default Select;