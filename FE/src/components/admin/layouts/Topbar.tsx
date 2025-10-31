import { MenuScale } from 'iconoir-react';
import { IconButtonAdmin } from '../ui/IconButton';
import { useState } from 'react';
import { Menu, MenuItem, Avatar, Box, Typography } from '@mui/material';
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
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleProfile = () => {
        handleClose();
        navigate('/admin/profile');
    };

    const handleViewClientSite = () => {
        handleClose();
        navigate('/client');
    };

    const handleLogout = () => {
        handleClose();
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
                    <div className='flex items-center'>
                        <Avatar
                            onClick={handleClick}
                            sx={{ 
                                width: 48, 
                                height: 48, 
                                cursor: 'pointer',
                                '&:hover': {
                                    opacity: 0.8
                                }
                            }}
                            src={user?.avatarUrl || "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcTN5i4i5V434kyMZRzwa-ar5eBpmX5rvxRSozeSEWoxbdzZNMdAdo-4-JkeqBQDIsNamRSFi9QrvMXf68-DLAyXatf0DLWkdzFswdYxlConfQ"}
                            alt={user?.fullName || 'User'}
                        />
                        <Menu
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleClose}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            PaperProps={{
                                sx: {
                                    mt: 1.5,
                                    minWidth: 200,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                }
                            }}
                        >
                            <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #eee' }}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {user?.fullName || 'User'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {user?.email || ''}
                                </Typography>
                            </Box>
                            <MenuItem onClick={handleProfile}>
                                Thông tin cá nhân
                            </MenuItem>
                            <MenuItem onClick={handleViewClientSite}>
                                Xem giao diện khách hàng
                            </MenuItem>
                            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                                Đăng xuất
                            </MenuItem>
                        </Menu>
                    </div>
                </div>
            </header>
        </>
    )
}