import { MenuScale, UserBadgeCheck, LogOut } from 'iconoir-react';
import { IconButtonAdmin } from '../ui/IconButton';
import { useState, useEffect, useRef } from 'react';
import { Avatar } from 'antd';
import { UserOutlined, HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useAuthContext } from '../../../context/useAuthContext';

interface TopbarProps {
    onToggleSidebar: () => void;
    isSidebarOpen: boolean;
}

export const TopbarAdmin = ({ onToggleSidebar, isSidebarOpen }: TopbarProps) => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const { user } = useAuthContext();
    const [openMenu, setOpenMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Click ra ngoài đóng dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleProfile = () => {
        setOpenMenu(false);
        navigate('/admin/profile');
    };

    const handleViewClientSite = () => {
        setOpenMenu(false);
        // Lưu đường dẫn admin hiện tại để quay lại sau
        const currentAdminPath = window.location.pathname;
        sessionStorage.setItem('adminReturnPath', currentAdminPath);
        navigate('/client');
    };

    const handleLogout = () => {
        setOpenMenu(false);
        logout();
        navigate('/admin/login');
    };

    return (
        <>
            <header
                className={`h-topbar fixed top-0 right-0 z-[1000] transition-[width,margin] duration-300
                ${isSidebarOpen ? "ml-sidebar w-content" : "ml-sidebarCollapse w-contentCollapse"}`}
            >
                <div className='max-w-[1320px] h-full px-[12px] mx-auto flex justify-between items-center'>
                    <div className="flex items-center">
                        <IconButtonAdmin icon={MenuScale} onClick={onToggleSidebar} className='ml-0' />
                        <h3 className='font-[700] text-[2.4rem] mx-[2.4rem] text-admin-secondary'>
                            Xin chào, {user?.fullName || 'Admin'}!
                        </h3>
                    </div>
                    <div className='flex items-center' ref={menuRef}>
                        {/* User dropdown custom */}
                        <div className="relative">
                            <div
                                className="cursor-pointer flex items-center"
                                onClick={() => setOpenMenu((prev) => !prev)}
                            >
                                <Avatar 
                                    src={user?.avatarUrl || undefined} 
                                    icon={<UserOutlined className="text-2xl" />} 
                                    size={48}
                                    className="border-2 border-gray-300 hover:border-blue-600 transition-all duration-300 bg-gradient-to-br from-blue-600 to-cyan-600"
                                />
                            </div>

                            {openMenu && user && (
                                <div
                                    className="absolute bg-white border border-[#95a0c51a] rounded-[12px] right-0 mt-[10px] w-[320px] shadow-2xl overflow-hidden animate-fadeIn z-[100]"
                                >
                                    {/* Facebook-style header with background and avatar */}
                                    <div className="relative">
                                        {/* Background image */}
                                        {user.backgroundUrl ? (
                                            <div 
                                                className="w-full h-[120px] bg-cover bg-center bg-no-repeat"
                                                style={{ backgroundImage: `url(${user.backgroundUrl})` }}
                                            >
                                                <div className="absolute inset-0 bg-black/10"></div>
                                            </div>
                                        ) : (
                                            <div className="w-full h-[120px] bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-600"></div>
                                        )}
                                        
                                        {/* Avatar positioned over background */}
                                        <div className="relative -mt-[40px] px-[24px] pb-[16px]">
                                            <Avatar 
                                                src={user.avatarUrl || undefined} 
                                                icon={<UserOutlined className="text-4xl text-white" />} 
                                                size={80}
                                                className="border-4 border-white shadow-lg bg-gradient-to-br from-blue-600 to-cyan-600"
                                            />
                                            <div className="mt-[12px]">
                                                <div className='text-[1.5rem] text-[#2b2d3b] font-[600]'>{user.fullName || 'Admin'}</div>
                                                <div className='text-[1.2rem] text-[#96a0b5]'>{user.email || ''}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Menu items */}
                                    <div className="py-[8px]">
                                        <div onClick={handleProfile} className='cursor-pointer px-[24px] py-[12px] block hover:bg-[#f4f6f9] transition-all duration-300 text-[#2b2d3b] text-[1.4rem]'>
                                            <div className='flex items-center'>
                                                <UserBadgeCheck className='mr-[10px]' />
                                                Thông tin cá nhân
                                            </div>
                                        </div>
                                        <div onClick={handleViewClientSite} className='cursor-pointer px-[24px] py-[12px] block hover:bg-[#f4f6f9] transition-all duration-300 text-[#2b2d3b] text-[1.4rem]'>
                                            <div className='flex items-center'>
                                                <HomeOutlined className='mr-[10px] text-[1.4rem]' />
                                                Xem giao diện khách hàng
                                            </div>
                                        </div>
                                        <div onClick={handleLogout} className='cursor-pointer px-[24px] py-[12px] block hover:bg-[#f4f6f9] transition-all duration-300 text-[#ef4d56] text-[1.4rem]'>
                                            <div className='flex items-center'>
                                                <LogOut className='mr-[10px]' />
                                                Đăng xuất
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>
        </>
    )
}