import { Link } from "react-router-dom";


interface ButtonProps {
    icon?: React.ComponentType<{ className?: string }>;
    text: string;
    className?: string;
    href?: string;
}

export const ButtonAdmin = ({
    icon: Icon,
    text,
    className = "",
    type = "button",
    onClick,
    disabled,
    href,
}: ButtonProps & { type?: "button" | "submit" | "reset"; onClick?: () => void; disabled?: boolean }) => {
    const baseClass = `flex items-center cursor-pointer text-white text-[1.3rem] font-[500] py-[0.82rem] px-[1.52rem] leading-[1.5] border rounded-[0.64rem] hover:opacity-90 transition-opacity duration-150 ease-in-out ${className}`;

    if (href) {
        return (
            <Link to={href} className={baseClass} aria-disabled={disabled} onClick={disabled ? (e) => e.preventDefault() : undefined}>
                {Icon && <Icon className="w-[2rem] h-[2rem] mr-[0.5rem]" />}
                <span>{text}</span>
            </Link>
        );
    }

    return (
        <button
            type={type}
            className={baseClass}
            onClick={onClick}
            disabled={disabled}
        >
            {Icon && <Icon className="w-[2rem] h-[2rem] mr-[0.5rem]" />}
            <span>{text}</span>
        </button>
    );
};