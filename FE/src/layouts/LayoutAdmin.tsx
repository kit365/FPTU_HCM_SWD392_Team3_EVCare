import { useState } from "react";
import { SidebarAdmin } from "../components/admin/layouts/Sidebar"
import { TopbarAdmin } from "../components/admin/layouts/Topbar"
import { Outlet } from "react-router-dom";


export const LayoutAdmin = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

    return (
        <>
            <div className="app w-full flex">
                <SidebarAdmin isOpen={isSidebarOpen} />
                <main
                    className={`bg-admin-body transition-[width,margin] duration-300 ${isSidebarOpen ? "ml-sidebar w-content" : "ml-sidebarCollapse w-contentCollapse"}`}
                >
                    <TopbarAdmin isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
                    <div className="mt-topbar w-full min-h-content px-[8px] pb-[68px] transition-[width,margin] duration-300">
                        <Outlet />
                    </div>
                </main>
            </div>
        </>
    )
}