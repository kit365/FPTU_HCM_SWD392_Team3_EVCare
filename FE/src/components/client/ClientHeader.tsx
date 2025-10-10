import React, { useEffect, useState } from 'react';
import { AliwangwangOutlined, HomeOutlined, IdcardOutlined, LogoutOutlined, ScheduleOutlined, LoginOutlined } from '@ant-design/icons';
import { Menu, notification } from 'antd';
import type { MenuProps } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/useAuthContext.tsx';
import { useAuthClient } from '../../hooks/useAuthClient';

const ClientHeader = () => {
    const [current, setCurrent] = useState('homepage');
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
    }, [user]);

    const items: MenuProps['items'] = [
        {
            label: <Link to={"/"}>Trang Chủ</Link>,
            key: 'homepage',
            icon: <HomeOutlined />,
        },
        {
            label: <Link to={"service-booking"}>Đặt lịch</Link>,
            key: 'booking',
            icon: <ScheduleOutlined />,
        },
        {
            label: <Link to={"car-profile"}>Hồ sơ xe</Link>,
            key: 'carprofile',
            icon: <IdcardOutlined />,
        },
        // Hiển thị menu Đăng nhập khi chưa có user
        ...(!user?.userId ? [{
            label: <Link to={"/client/login"}>Đăng nhập</Link>,
            key: 'login',
            icon: <LoginOutlined />,
        }] : []),

        // Hiển thị menu User khi đã đăng nhập
        ...(user?.userId ? [{
            label: `Welcome ${user.username}`,
            key: 'setting',
            icon: <AliwangwangOutlined />,
            children: [
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