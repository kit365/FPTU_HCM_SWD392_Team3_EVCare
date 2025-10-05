import { useState } from "react";
import { SidebarAdmin } from "../components/admin/layouts/Sidebar"
import { TopbarAdmin } from "../components/admin/layouts/Topbar"
import { Outlet } from "react-router-dom";
import { FooterAdmin } from "../components/admin/layouts/Footer";


export const LayoutAdmin = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

    return (
        <>
            <div className="app w-full flex">
                <SidebarAdmin isOpen={isSidebarOpen} />
                <main
                    className={`min-h-screen flex flex-col relative transition-[width,margin] duration-300 ${isSidebarOpen ? "ml-sidebar w-content" : "ml-sidebarCollapse w-contentCollapse"
                        }`}
                >
                    <TopbarAdmin isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />

                    <div className="mt-topbar flex-1 w-full px-[8px] transition-[width,margin] duration-300">
                        <Outlet />
                    </div>

                    <FooterAdmin />
                </main>
            </div>
        </>
    )
}