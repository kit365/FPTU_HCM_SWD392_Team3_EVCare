import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { adminMenuItems } from "../../../constants/adminMenu.constant";

interface SidebarProps {
    isOpen: boolean;
}

export const SidebarAdmin = ({ isOpen }: SidebarProps) => {
    const { pathname } = useLocation();
    const [isHovered, setIsHovered] = useState(false);

    const expanded = isOpen || isHovered; // hover hay open đều mở

    return (
        <aside
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`h-screen bg-white shadow-[0_3px_16px_rgba(142,134,171,0.05)] 
                fixed top-0 left-0 z-[1005] flex flex-col overflow-hidden 
                transition-[width,margin] duration-300
                ${expanded ? "w-sidebar" : "w-[70px]"}`}
        >
            <div className="h-topbar p-[4px] flex items-center justify-center">Logo</div>
            <nav className="flex-1 px-[16px] pb-[16px]">
                <ul>
                    {adminMenuItems.map(({ href, label, icon: Icon }) => {
                        const isActive = pathname.startsWith(href);

                        return (
                            <li key={href}>
                                <NavLink
                                    to={href}
                                    className={`relative flex items-center rounded-[10px] leading-[1.54] text-[1.3rem] font-[500] mb-[3px] border border-transparent hover:text-admin-primary transition-colors duration-150 ease-in-out sidebar-item
                                        ${isActive ? "text-admin-primary bg-[#22c55e0d]" : "text-[#061237]"}
                                        ${expanded ? "px-[16px] py-[10px]" : "px-[9px] py-[8px]"}
                                    `}
                                >
                                    <Icon
                                        className={`w-[20px] h-[20px] ${isActive ? "text-admin-primary" : "text-[rgb(150,160,181)]"
                                            } ${expanded ? "mr-[16px]" : "w-[25px] h-[25px]"}`}
                                    />
                                    {expanded && <span>{label}</span>}
                                </NavLink>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </aside>
    );
};
