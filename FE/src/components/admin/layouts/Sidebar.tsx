import { useState } from "react";
import { NavLink } from "react-router-dom";
import { adminMenuItems } from "../../../constants/adminMenu.constant";

interface SidebarProps {
    isOpen: boolean;
}

export const SidebarAdmin = ({ isOpen }: SidebarProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());

    const expanded = isOpen || isHovered;

    const toggleDropdown = (label: string) => {
        const newOpenDropdowns = new Set(openDropdowns);
        if (newOpenDropdowns.has(label)) {
            newOpenDropdowns.delete(label);
        } else {
            newOpenDropdowns.add(label);
        }
        setOpenDropdowns(newOpenDropdowns);
    };

    const renderMenuItem = (item: any, level: number = 0) => {
        const hasChildren = item.children && item.children.length > 0;
        const isOpen = openDropdowns.has(item.label);

        return (
            <li key={item.label} className={`${level > 0 ? 'ml-4' : ''}`}>
                <div className="relative">
                    <div
                        className={`relative flex items-center rounded-[10px] leading-[1.54] text-[1.3rem] font-[500] mb-[3px] border border-transparent hover:text-admin-primary transition-colors duration-150 ease-in-out sidebar-item
                            ${expanded ? "px-[16px] py-[10px]" : "px-[9px] py-[8px]"}
                        `}
                    >
                        {hasChildren ? (
                            <button
                                onClick={() => toggleDropdown(item.label)}
                                className="flex items-center w-full text-left"
                            >
                                <item.icon
                                    className={`w-[20px] h-[20px] text-[rgb(150,160,181)] ${expanded ? "mr-[16px]" : "w-[25px] h-[25px]"}`}
                                />
                                {expanded && (
                                    <>
                                        <span className="flex-1">{item.label}</span>
                                        <span className="text-xs">
                                            {isOpen ? '▼' : '▶'}
                                        </span>
                                    </>
                                )}
                            </button>
                        ) : (
                            <NavLink
                                to={item.href || "#"}
                                className={`flex items-center w-full ${!expanded ? 'justify-center' : ''}`}
                            >
                                <item.icon
                                    className={`w-[20px] h-[20px] text-[rgb(150,160,181)] ${expanded ? "mr-[16px]" : "w-[25px] h-[25px]"}`}
                                />
                                {expanded && <span>{item.label}</span>}
                            </NavLink>
                        )}
                    </div>

                    {hasChildren && expanded && isOpen && (
                        <ul className="mt-1">
                            {item.children.map((child: any) => renderMenuItem(child, level + 1))}
                        </ul>
                    )}
                </div>
            </li>
        );
    };

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
                    {adminMenuItems.map((item) => renderMenuItem(item))}
                </ul>
            </nav>
        </aside>
    );
};
