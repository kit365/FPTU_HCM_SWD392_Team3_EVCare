import { Plus } from "iconoir-react";
import { Link } from "react-router-dom";

export const CardHeaderAdmin = ({ title, href, content }: { title: string, href?: string, content?: string }) => {
    return (
        <div className="p-[2.4rem] flex items-center justify-between">
            <h2 className="text-admin-secondary text-[1.6rem] font-[500] leading-[1.2]">{title}</h2>
            {href && content && (
                <Link to={href} className="flex items-center cursor-pointer text-white text-[1.3rem] font-[500] py-[0.82rem] px-[1.52rem] leading-[1.5] border rounded-[0.64rem] hover:opacity-90 transition-opacity duration-150 ease-in-out bg-[#22c55e] border-[#22c55e] shadow-[0_1px_2px_0_rgba(34,197,94,0.35)]">
                    <Plus className="w-[2rem] h-[2rem] mr-[0.5rem]" />
                    <span>{content}</span>
                </Link>
            )}
        </div>
    )
}
