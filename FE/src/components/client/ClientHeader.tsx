import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAuthContext } from '../../context/useAuthContext';
import { notification } from 'antd';
import { useEffect, useState, useRef } from 'react';
import { UserBadgeCheck, LogOut, Calendar } from "iconoir-react";
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const ClientHeader = () => {
    const location = useLocation().pathname;
    const [openMenu, setOpenMenu] = useState(false);
    const [hasAdminReturnPath, setHasAdminReturnPath] = useState(false);
    const { user } = useAuthContext();
    const { logout } = useAuth({ type: 'client' });
    const navigate = useNavigate();
    const menuRef = useRef<HTMLDivElement>(null);

    // Kiểm tra xem có đường dẫn quay lại admin không
    useEffect(() => {
        const returnPath = sessionStorage.getItem('adminReturnPath');
        setHasAdminReturnPath(!!returnPath);
    }, [location]);

    const handleLogout = async () => {
        try {
            await logout();
            notification.success({
                message: "Đăng xuất thành công!"
            });
            navigate("/client");
        } catch {
            notification.error({
                message: "Đăng xuất thất bại!"
            });
        }
    };

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

    return (
        <header className='z-[50] relative'>
            <div className="max-w-[1400px] mx-auto flex items-center justify-between py-[18px] px-[40px]">
                <div className="flex items-center gap-[60px]">
                    {/* Logo */}
                    <div className="flex items-center gap-[8px]">
                        <img src="https://i.imgur.com/XAy1f1e.jpeg" alt="EVCare" className='w-[80px] h-[80px] object-cover' />
                    </div>

                    {/* Navigation */}
                    <nav className={`flex gap-[32px] ${location === "/client" ? "text-[#FAFAFA]" : "text-[#1A1A19]"}`}>
                        {[
                            { to: "/client", label: "Trang chủ" },
                            { to: "/client/service-booking", label: "Đặt lịch" },
                            { to: "/client/lookup", label: "Tra cứu" },
                            // Nếu chưa đăng nhập, thêm nút Đăng nhập
                            ...(!user?.userId
                                ? [{ to: "/client/login", label: "Đăng nhập" }]
                                : [])
                        ].map((item) => {
                            const isActive = location === item.to;
                            return (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    className={`
                                    text-[1.5rem] font-[500] relative transition-colors duration-300
                                    after:content-[''] after:absolute after:left-0 after:-bottom-[4px]
                                    after:h-[2px] after:bg-current after:transition-all after:duration-300
                                    hover:after:w-full
                                    ${isActive ? "after:w-full" : "after:w-0"}
                                `}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {user && (
                    <div className={`flex items-center gap-[20px] ${location === '/client' ? 'text-[#FAFAFA]' : 'text-[#1A1A19]'}`} ref={menuRef}>
                        {/* Nút quay lại quản lý cho STAFF */}
                        {user.roleName?.includes('STAFF') && hasAdminReturnPath && (
                            <button
                                onClick={() => {
                                    const returnPath = sessionStorage.getItem('adminReturnPath') || '/admin';
                                    sessionStorage.removeItem('adminReturnPath');
                                    setHasAdminReturnPath(false);
                                    navigate(returnPath);
                                }}
                                className={`px-[16px] py-[8px] rounded-[8px] font-[500] text-[1.4rem] transition-all duration-300 ${
                                    location === '/client' 
                                        ? 'bg-white/20 text-white hover:bg-white/30' 
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                            >
                                Quay lại quản lý
                            </button>
                        )}
                        {/* User dropdown custom */}
                        <div className="relative">
                            <div
                                className="cursor-pointer flex items-center"
                                onClick={() => setOpenMenu((prev) => !prev)}
                            >
                                <Avatar 
                                    src={user.avatarUrl || undefined} 
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
                                                <div className='text-[1.5rem] text-[#2b2d3b] font-[600]'>{user.fullName}</div>
                                                <div className='text-[1.2rem] text-[#96a0b5]'>{user.email}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Menu items */}
                                    <div className="py-[8px]">
                                        <Link to="/client/car-profile" className='px-[24px] py-[12px] block hover:bg-[#f4f6f9] transition-all duration-300 text-[#2b2d3b] text-[1.4rem]' onClick={() => setOpenMenu(false)}>
                                            <div className='flex items-center'>
                                                <UserBadgeCheck className='mr-[10px]' />
                                                Hồ sơ xe
                                            </div>
                                        </Link>
                                        <Link to="/client/appointment-history" className='px-[24px] py-[12px] block hover:bg-[#f4f6f9] transition-all duration-300 text-[#2b2d3b] text-[1.4rem]' onClick={() => setOpenMenu(false)}>
                                            <div className='flex items-center'>
                                                <Calendar className='mr-[10px]' />
                                                Lịch sử đặt lịch
                                            </div>
                                        </Link>
                                        <Link to="/client/profile" className='px-[24px] py-[12px] block hover:bg-[#f4f6f9] transition-all duration-300 text-[#2b2d3b] text-[1.4rem]' onClick={() => setOpenMenu(false)}>
                                            <div className='flex items-center'>
                                                <UserBadgeCheck className='mr-[10px]' />
                                                Thông tin cá nhân
                                            </div>
                                        </Link>
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
                )}
            </div>
        </header>
    );
};

export default ClientHeader;
