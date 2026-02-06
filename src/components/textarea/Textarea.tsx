import { twMerge } from "tailwind-merge";

function Textarea(props: {
    type?: string;
    className?: string;
    label?: string;
    defaultValue?: string;
    value?: string;
    placeholder?: string;
    maxLength?: number;
    autoFocus?: boolean;
    
    onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
    onFocus?: React.FocusEventHandler<HTMLTextAreaElement>;
    onBlur?: React.FocusEventHandler<HTMLTextAreaElement>;
    onKeyDown?: React.KeyboardEventHandler<HTMLTextAreaElement>;
})
{
    const classes = twMerge(
        "max-w-md mt-3 h-24 first:mt-0 flex flex-col bg-white/[0.06] text-neutral-300 rounded-lg border border-white/[0.06] focus-within:border-blue-500/40 transition-colors", 
        props.className
    );
    
    return (
        <div className={classes}>
            {
                props.label ? (
                    <div className="px-2 pt-2 pb-1.5 flex items-center text-xs font-body font-medium select-none">
                        <label className="flex-1">
                            { props.label }
                        </label>
                    </div>
                ) : null
            }

            <textarea
                className="min-w-0 px-2 pb-2 w-full flex-1 bg-transparent text-sm text-white font-body outline-none placeholder-neutral-400 resize-none"
                defaultValue={props.defaultValue}
                value={props.value}
                placeholder={props.placeholder} 
                maxLength={props.maxLength}
                onChange={props.onChange}
                onFocus={props.onFocus}
                onBlur={props.onBlur}
                autoFocus={props.autoFocus}
                onKeyDown={props.onKeyDown}
                spellCheck={false}
            />
        </div>
    );
}

export default Textarea;