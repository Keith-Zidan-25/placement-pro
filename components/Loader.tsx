interface LoaderProps {
    divStyle?: string;
    loaderStyle?: string;
}

export default function Loader({divStyle = "bg-white", loaderStyle = "h-10 w-10 mr-3 border-blue-500"}: LoaderProps) {
    return (
        <div className={divStyle + ` flex justify-center items-center`}>
            <span className={"animate-spin border-solid rounded-full border-t-transparent border-2 " + loaderStyle}>
            </span>
        </div>
    )
}