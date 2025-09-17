import { useState } from "react";
import { SidebarAdmin } from "../components/admin/layouts/Sidebar"
import { TopbarAdmin } from "../components/admin/layouts/Topbar"

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
                </main>
            </div>
        </>
    )
}