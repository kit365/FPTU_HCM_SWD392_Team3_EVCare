import React, { useState } from 'react';
import { HomeOutlined, LogoutOutlined, ScheduleOutlined, SettingOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import type { MenuProps } from 'antd'; // Thêm dòng này
import { Link } from 'react-router-dom';
import { LoginOutlined } from '@mui/icons-material';

const ClientHeader = () => {
    const [current, setCurrent] = useState('homepage');

    const onClick: MenuProps['onClick'] = (e) => {  // Sửa dòng này
        console.log('click ', e);
        setCurrent(e.key);
    }

    const items = [
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
            label: 'Cài đặt',
            key: 'SubMenu',
            icon: <SettingOutlined />,
            children: [
                {
                    label: <Link to={"client/login"}>Đăng nhập</Link>,
                    key: 'login',
                    icon: <LoginOutlined />,
                },
                {
                    label: 'Đăng xuất',
                    key: 'logout',
                    icon: <LogoutOutlined />
                },
            ],
        },
    ];

    return (
        <>
            <Menu
                onClick={onClick}
                selectedKeys={[current]}
                mode="horizontal"
                items={items}
            />
        </>
    )
}

export default ClientHeader