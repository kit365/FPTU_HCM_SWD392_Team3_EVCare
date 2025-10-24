import { MenuScale, User, LogOut } from 'iconoir-react';
import { IconButtonAdmin } from '../ui/IconButton';
import { useState, useRef, useEffect } from 'react';
import { useAuthContext } from '../../../context/useAuthContext';
import { useNavigate } from 'react-router-dom';

interface TopbarProps {
    onToggleSidebar: () => void;
    isSidebarOpen: boolean;
}

export const TopbarAdmin = ({ onToggleSidebar, isSidebarOpen }: TopbarProps) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { user, setUser } = useAuthContext();
    const navigate = useNavigate();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        setUser(null);
        navigate('/admin/login');
    };

    const handleProfile = () => {
        // Navigate to profile page
        navigate('/admin/profile');
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
                            Good Morning, {user?.username || 'Admin'}!
                        </h3>
                    </div>
                    <div className='flex items-center relative' ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
                        >
                            <img
                                src="https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcTN5i4i5V434kyMZRzwa-ar5eBpmX5rvxRSozeSEWoxbdzZNMdAdo-4-JkeqBQDIsNamRSFi9QrvMXf68-DLAyXatf0DLWkdzFswdYxlConfQ"
                                alt="Avatar"
                                className="w-[48px] h-[48px] rounded-full object-cover ml-[8px]"
                                data-aos="fade-up-right"
                            />
                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                <div className="px-4 py-2 border-b border-gray-100">
                                    <p className="text-sm font-medium text-gray-900">{user?.username || 'Admin'}</p>
                                    <p className="text-xs text-gray-500">{user?.email || 'admin@example.com'}</p>
                                </div>
                                
                                <button
                                    onClick={handleProfile}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                >
                                    <User className="w-4 h-4 mr-3" />
                                    Trang cá nhân
                                </button>
                                
                                <button
                                    onClick={handleLogout}
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                                >
                                    <LogOut className="w-4 h-4 mr-3" />
                                    Đăng xuất
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>
        </>
    )
}