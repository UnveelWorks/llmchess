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
        <div className="h-12 px-4 flex items-center gap-2 border-b border-white/[0.06]">
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
        <div className="h-14 px-4 flex items-center justify-end gap-2 border-t border-white/[0.06]">
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
        "fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-none opacity-0 transition-all duration-200 z-50",
        props.className,
        props.open && "pointer-events-auto opacity-100"
    );

    const windowsClasses = twMerge(
        "w-full max-w-md mx-4 bg-neutral-800/95 rounded-2xl border border-white/[0.06] shadow-[0_24px_64px_rgba(0,0,0,0.5)] scale-95 transition-all duration-200",
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
