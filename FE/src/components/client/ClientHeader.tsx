import { useEffect, useState } from 'react';
import { AliwangwangOutlined, HomeOutlined, IdcardOutlined, LogoutOutlined, ScheduleOutlined, LoginOutlined, MessageOutlined } from '@ant-design/icons';
import { Menu, notification, Badge } from 'antd';
import type { MenuProps } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/useAuthContext.tsx';
import { useAuthClient } from '../../hooks/useAuthClient';
import { messageService } from '../../service/messageService';
const ClientHeader = () => {
    const [current, setCurrent] = useState('homepage');
    const [unreadCount, setUnreadCount] = useState(0);
    const { user } = useAuthContext();
    const { logout } = useAuthClient();
    const navigate = useNavigate();
    const handleLogout = async () => {
        try {
            await logout();
            notification.success({
                message: "Đăng xuất thành công!"
            });
            navigate("/client/login");
        } catch {
            notification.error({
                message: "Đăng xuất thất bại!"
            });
        }
    };
    const onClick: MenuProps['onClick'] = (e) => {
        console.log('click ', e);
        setCurrent(e.key);
        // Xử lý logout khi click vào menu item logout
        if (e.key === 'logout') {
            handleLogout();
        }
    };
    useEffect(() => {
        console.log("kiểm tra giá trị user trong header:", user);
        console.log("user?.userId:", user?.userId);
        console.log("should show message menu:", !!user?.userId);
    }, [user]);

    // Load unread message count
    useEffect(() => {
        const loadUnreadCount = async () => {
            if (user?.userId) {
                try {
                    const response = await messageService.getUnreadCount(user.userId);
                    if (response?.data?.success) {
                        setUnreadCount(response.data.data || 0);
                    }
                } catch (error) {
                    console.error('Error loading unread count:', error);
                }
            }
        };
        
        loadUnreadCount();
        
        // Refresh unread count every 30 seconds
        const interval = setInterval(loadUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [user?.userId]);
    const items: MenuProps['items'] = [
        {
            label: <Link to={"/client"}>Trang Chủ</Link>,
            key: 'homepage',
            icon: <HomeOutlined />,
        },
        {
            label: <Link to={"/client/service-booking"}>Đặt lịch</Link>,
            key: 'booking',
            icon: <ScheduleOutlined />,
        },
        {
            label: <Link to={"/client/car-profile"}>Hồ sơ xe</Link>,
            key: 'carprofile',
            icon: <IdcardOutlined />,
        },
        // Hiển thị menu Tin nhắn khi đã đăng nhập
        ...(user?.userId ? [{
            label: (
                <Link to="/client/message">
                    <Badge count={unreadCount} size="small">
                        Tin nhắn
                    </Badge>
                </Link>
            ),
            key: 'message',
            icon: <MessageOutlined />,
        }] : []),
        // Hiển thị menu Đăng nhập khi chưa có user
        ...(!user?.userId ? [{
            label: <Link to={"/client/login"}>Đăng nhập</Link>,
            key: 'login',
            icon: <LoginOutlined />,
        }] : []),
        // Hiển thị menu User khi đã đăng nhập
        ...(user?.userId ? [{
            label: `Welcome ${user.email}`,
            key: 'setting',
            icon: <AliwangwangOutlined />,
            children: [
                {
                    label: (
                        <Link to="/client/message">
                            <Badge count={unreadCount} size="small">
                                Tin nhắn
                            </Badge>
                        </Link>
                    ),
                    key: 'message',
                    icon: <MessageOutlined />,
                },
                // Show Admin Panel link if user is admin
                ...(user.isAdmin ? [{
                    label: <Link to="/admin/dashboard">🔧 Trang quản trị</Link>,
                    key: 'admin-panel',
                }] : []),
                {
                    label: 'Đăng xuất',
                    key: 'logout',
                    icon: <LogoutOutlined />,
                },
            ],
        }] : []),
    ];
    return (
        <Menu
            onClick={onClick}
            selectedKeys={[current]}
            mode="horizontal"
            items={items}
        />
    );
}
export default ClientHeader;