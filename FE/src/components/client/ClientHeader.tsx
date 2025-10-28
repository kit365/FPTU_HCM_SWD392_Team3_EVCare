import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthClient } from '../../hooks/useAuthClient';
import { useAuthContext } from '../../context/useAuthContext';
import { notification } from 'antd';
import { useEffect, useState, useRef } from 'react';
import { UserBadgeCheck, LogOut } from "iconoir-react";
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';

const ClientHeader = () => {
    const location = useLocation().pathname;
    const [openMenu, setOpenMenu] = useState(false);
    const { user } = useAuthContext();
    const { logout } = useAuthClient();
    const navigate = useNavigate();
    const menuRef = useRef<HTMLDivElement>(null);

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
                        {/* User dropdown custom */}
                        <div className="relative">
                            <div
                                className="cursor-pointer flex items-center"
                                onClick={() => setOpenMenu((prev) => !prev)}
                            >
                                <AccountCircleOutlinedIcon sx={{ fontSize: '3rem' }} />
                            </div>

                            {openMenu && user && (
                                <div
                                    className="absolute bg-white border border-[#95a0c51a] rounded-[6.4px] right-0 mt-[10px] w-[240px] shadow-lg overflow-hidden animate-fadeIn z-[100]"
                                >
                                    <div className='flex items-center bg-[#F4F5F9] px-[24px] py-[12px] border-b border-[#95a0c51a]'>
                                        <img
                                            src="http://127.0.0.1:5500/frontend-admin/assets/images/users/avatar-1.jpg"
                                            alt={user.fullName}
                                            className='w-[36px] h-[36px] object-cover rounded-full'
                                        />
                                        <div className='ml-[12px]'>
                                            <div className='text-[1.3rem] text-[#2b2d3b] font-[500]'>{user.fullName}</div>
                                            <div className='text-[1.2rem] text-[#96a0b5]'>{user.email}</div>
                                        </div>
                                    </div>
                                    <Link to="/client/car-profile" className='px-[24px] py-[6px] block bg-white hover:bg-[#f4f6f9] transition-all duration-300 text-[#2b2d3b] text-[1.4rem] mt-[10px]'>
                                        <div className='flex items-center'>
                                            <UserBadgeCheck className='mr-[10px]' />
                                            Hồ sơ xe
                                        </div>
                                    </Link>
                                    <div onClick={handleLogout} className='cursor-pointer px-[24px] py-[6px] block bg-white hover:bg-[#f4f6f9] transition-all duration-300 text-[#ef4d56] text-[1.4rem]'>
                                        <div className='flex items-center'>
                                            <LogOut className='mr-[10px]' />
                                            Đăng xuất
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
