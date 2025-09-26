import type { ButtonProps } from "../../../types/admin/button-item.types";

export const ButtonAdmin = ({ icon: Icon, href, text, className = "" }: ButtonProps) => {
    return (
        <a
            href={href}
            className={`flex items-center cursor-pointer text-white text-[1.3rem] font-[500] py-[0.82rem] px-[1.52rem] leading-[1.5] border rounded-[0.64rem] hover:opacity-90 transition-opacity duration-150 ease-in-out ${className}`}
        >
            {Icon && <Icon className="w-[2rem] h-[2rem] mr-[0.5rem]" />}
            <span>{text}</span>
        </a>
    );
};