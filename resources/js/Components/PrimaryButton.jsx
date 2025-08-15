export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center rounded-md border border-transparent 
                 bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white 
                 transition duration-150 ease-in-out 
                 hover:bg-primary-800 focus:bg-primary-800 focus:outline-none 
                 focus:ring-2 focus:ring-primary focus:ring-offset-2 
                 active:bg-primary-900 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} 
                 ${className}`
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}