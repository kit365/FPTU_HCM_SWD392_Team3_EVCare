interface IconButtonProps {
    icon: React.ElementType;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    className?: string;
}


export const IconButtonAdmin = ({ icon: Icon, onClick, className }: IconButtonProps) => {
    return (
        <button
            onClick={onClick}
            className={`w-[48px] h-[48px] flex items-center justify-center bg-white rounded-full cursor-pointer text-[#96a0b5] mx-[8px] ${className}`}
        >
            <Icon />
        </button>
    );
};