import { twMerge } from 'tailwind-merge';

function ScrollView(props: {
    parentClass?: string;
    class?: string;
    viewRef?: any;
    children?: any;
})
{
    const classes = twMerge(
        "flex-1 w-full relative overflow-hidden", 
        props.parentClass
    );
    const contentClasses = twMerge(
        "w-full p-3 absolute top-0 bottom-0 overflow-auto", 
        props.class
    );
    
    return (
        <div className={classes}>
            <div className={contentClasses} ref={props.viewRef}>
                { props.children }
            </div>
        </div>
    );
}

export default ScrollView;