import { twMerge } from "tailwind-merge";

function Input(props: {
    type?: string;
    className?: string;
    label?: string;
    defaultValue?: string;
    value?: string;
    placeholder?: string;
    maxLength?: number;
    autoFocus?: boolean;

    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    onFocus?: React.FocusEventHandler<HTMLInputElement>;
    onBlur?: React.FocusEventHandler<HTMLInputElement>;
    onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
})
{
    const type = props.type ? props.type : "text";
    const classes = twMerge(
        "max-w-md h-14 mt-3 first:mt-0 px-2 pt-2 flex flex-col bg-white/[0.06] text-neutral-300 rounded-lg border border-white/[0.06] focus-within:border-blue-500/40 transition-colors",
        props.className
    );

    return (
        <div className={classes}>
            {
                props.label ? (
                    <div className="flex items-center text-xs font-body font-medium select-none">
                        <label className="flex-1">
                            { props.label }
                        </label>
                    </div>
                ) : null
            }

            <input
                className="min-w-0 p-0 w-full flex-1 bg-transparent text-sm text-white font-body outline-none placeholder-neutral-500"
                type={type}
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

export default Input;
