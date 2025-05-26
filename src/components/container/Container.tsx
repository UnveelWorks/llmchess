import { twMerge } from "tailwind-merge";

function Container(props: {
    className?: string;
    children?: React.ReactNode;
})
{
    const classes = twMerge("w-full max-w-6xl m-auto px-4 xl:px-0 flex flex-col", props.className);
    return (
        <div className={classes}>
            {props.children}
        </div>
    );
}

export default Container;