import { useState } from "react";
import { NavLink } from "react-router-dom";
import { adminMenuItems } from "../../../constants/adminMenu.constant";
import { useAuthContext } from "../../../context/useAuthContext";

interface SidebarProps {
    isOpen: boolean;
}

export const SidebarAdmin = ({ isOpen }: SidebarProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());
    const { user } = useAuthContext();

    const expanded = isOpen || isHovered;

    // Helper: Lấy href dựa vào role
    const getHrefByRole = (item: any) => {
        if (item.roleBasedHref && user?.roleName && user.roleName.length > 0) {
            const role = user.roleName[0]; // Lấy role đầu tiên
            return item.roleBasedHref[role] || item.href;
        }
        return item.href;
    };

    const toggleDropdown = (label: string) => {
        const newOpenDropdowns = new Set(openDropdowns);
        if (newOpenDropdowns.has(label)) {
            newOpenDropdowns.delete(label);
        } else {
            newOpenDropdowns.add(label);
        }
        setOpenDropdowns(newOpenDropdowns);
    };

    const isTechnician = user?.roleName?.includes('TECHNICIAN');

    const renderMenuItem = (item: any, level: number = 0) => {
        // Hide entire dashboard link for technician
        if (isTechnician && typeof item.href === 'string' && item.href.startsWith('/admin/dashboard')) {
            return null;
        }

        // Hide appointment management link for technician
        if (isTechnician && typeof item.href === 'string' && item.href.startsWith('/admin/appointment-manage')) {
            return null;
        }

        // Hide vehicle type (mẫu xe) link for technician, but NOT vehicle-part (phụ tùng)
        if (isTechnician && typeof item.href === 'string' && item.href.startsWith('/admin/vehicle') && 
            !item.href.includes('/vehicle-profile') && !item.href.includes('/vehicle-part')) {
            return null;
        }

        const childrenToRender = (item.children && item.children.length > 0)
            ? (isTechnician
                ? item.children.filter((child: any) => {
                    const href: string | undefined = child.href;
                    if (!href) return true;
                    // Hide user management and message management for technician
                    // Keep vehicle-part (phụ tùng) visible for technician
                    return !href.startsWith('/admin/users') && !href.startsWith('/admin/message');
                  })
                : item.children)
            : [];
        const hasChildren = childrenToRender.length > 0;
        const isOpen = openDropdowns.has(item.label);

        // Hide account management items for TECHNICIAN
        if (!hasChildren && isTechnician && typeof item.href === 'string' && item.href.startsWith('/admin/users')) {
            return null;
        }

        // If item is a parent group and after filtering it has no children, hide it entirely
        // But only for specific cases (like "Quản lý" with users, "Tin nhắn" with messages)
        // NOT for "Phụ tùng" which should always show children
        if (item.children && item.children.length > 0 && !hasChildren) {
            // Only hide if it's a restricted group
            const isRestrictedGroup = item.label === 'Quản lý' || item.label === 'Tin nhắn';
            if (isRestrictedGroup && isTechnician) {
                return null;
            }
        }

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
                                    className={`w-[30px] h-[30px] text-[rgb(150,160,181)] ${expanded ? "mr-[16px]" : "w-[25px] h-[25px]"}`}
                                />
                                {expanded && (
                                    <>
                                        <span className="flex-1">{item.label}</span>
                                        <span className="text-[1rem]">
                                            {isOpen ? '▼' : '▶'}
                                        </span>
                                    </>
                                )}
                            </button>
                        ) : (
                            <NavLink
                                to={getHrefByRole(item) || "#"}
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
                            {childrenToRender.map((child: any) => renderMenuItem(child, level + 1))}
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
