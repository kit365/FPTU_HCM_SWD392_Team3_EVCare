import { MenuScale, Search, SunLight, BellNotificationSolid } from 'iconoir-react';
import { IconButtonAdmin } from '../ui/Button';

interface TopbarProps {
    onToggleSidebar: () => void;
    isSidebarOpen: boolean;
}

export const TopbarAdmin = ({ onToggleSidebar, isSidebarOpen }: TopbarProps) => {
    return (
        <>
            <header
                className={`h-topbar fixed top-0 right-0 z-[1000] transition-[width,margin] duration-300
                ${isSidebarOpen ? "ml-sidebar w-content" : "ml-sidebarCollapse w-contentCollapse"}`}
            >
                <div className='max-w-[1320px] h-full px-[12px] mx-auto flex justify-between items-center'>
                    <div className="flex items-center">
                        <IconButtonAdmin icon={MenuScale} onClick={onToggleSidebar} className='ml-0' />
                        <h3 className='font-[700] text-[2.4rem] mx-[2.4rem] text-admin-secondary'>Good Morning, James!</h3>
                    </div>
                    <div className='flex items-center'>
                        <form action="" className='relative'>
                            <Search className='text-[#96a0b5] w-[22px] h-[22px] absolute left-[24px] top-1/2 -translate-y-1/2' />
                            <input className="mb-0 text-[1.3rem] h-[48px] shadow-[0_3px_16px_rgba(142,134,171,0.05)] w-[300px] bg-white border border-transparent mx-[8px] pl-[48px] font-[400] rounded-[30px] text-admin-secondary" placeholder="Tìm kiếm..." name="search" type="search"></input>
                        </form>
                        <IconButtonAdmin icon={SunLight} onClick={() => console.log("clicked")} />
                        <IconButtonAdmin icon={BellNotificationSolid} onClick={() => console.log("clicked")} />
                        <figure>
                            <img
                                src="https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcTN5i4i5V434kyMZRzwa-ar5eBpmX5rvxRSozeSEWoxbdzZNMdAdo-4-JkeqBQDIsNamRSFi9QrvMXf68-DLAyXatf0DLWkdzFswdYxlConfQ"
                                alt=""
                                className="w-[48px] h-[48px] rounded-full object-cover ml-[8px]"
                                data-aos="fade-up-right"
                            />
                        </figure>
                    </div>
                </div>
            </header>
        </>
    )
}