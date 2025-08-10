import { twMerge } from "tailwind-merge";
import Button from "../button/Button";
import { XSvg } from "../svgs/Svgs";

export function ModalHeader(props: {
    title: string;
    children?: React.ReactNode;
    onClose?: () => void;
})
{
    return (
        <div className="h-12 px-3 flex items-center gap-2 border-b border-white/5">
            <span className="flex-1 text-base font-medium">{props.title}</span>
            <Button onlyIcon onClick={props.onClose}>
                <XSvg className="w-5 h-5"/>
            </Button>
        </div>
    );
}

export function ModalContent(props: {
    children?: React.ReactNode;
    className?: string;
})
{
    const classes = twMerge(
        "p-3",
        props.className
    );

    return (
        <div className={classes}>
            { props.children }
        </div>
    );
}

export function ModalFooter(props: {
    children?: React.ReactNode;
})
{
    return (
        <div className="h-14 px-3 flex items-center justify-end gap-2 border-t border-white/5">
            { props.children }
        </div>
    );
}

function Modal(props: {
    className?: string;
    open: boolean;
    children?: React.ReactNode;
})  
{
    const classes = twMerge(
        "fixed inset-0 flex items-center justify-center bg-linear-to-b from-black/30 to-black/60 pointer-events-none opacity-0 transition-all duration-200 z-50 shadow-lg",
        props.className,
        props.open && "pointer-events-auto opacity-100"
    );

    const windowsClasses = twMerge(
        "w-full max-w-md bg-neutral-700 rounded-lg scale-90 transition-scale duration-200",
        props.open && "scale-100"
    );

    return (
        <div className={classes}>
            <div className={windowsClasses}>
                {props.children}
            </div>
        </div>
    );
}

export default Modal;