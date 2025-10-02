import React, { useState } from 'react';
import { AliwangwangOutlined, HomeOutlined, IdcardOutlined, LogoutOutlined, ScheduleOutlined, } from '@ant-design/icons';
import { Menu } from 'antd';
import type { MenuProps } from 'antd'; // Thêm dòng này
import { Link, useNavigate } from 'react-router-dom';
import { LoginOutlined } from '@mui/icons-material';
import { useAuthContext } from '../../context/useAuthContext.tsx';
import { notification } from "antd";

const ClientHeader = () => {
    const [current, setCurrent] = useState('homepage');
    const { user } = useAuthContext(); //logout thêm sau

    const navigate = useNavigate();


    const onClick: MenuProps['onClick'] = (e) => {  // Sửa dòng này
        console.log('click ', e);
        setCurrent(e.key);
    }

    const handleLogout = () => {
        // logout(); gọi hàm logout từ authContext
        notification.success({
            message: "Đăng xuất thành công!"
        })

        navigate("/client/login")
    };

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
            label: <Link to={"car-profile"}>Hồ sơ xe</Link>,
            key: 'carprofile',
            icon: <IdcardOutlined />,
        },

        ...(!user?.id ? [{
            label: <Link to={"/client/login"}>Đăng nhập</Link>,
            key: 'login',
            icon: <LoginOutlined />,
        }] : []),

        ...(user?.id ? [{
            label: `Welcome ${user.fullName}`,
            key: 'setting',
            icon: <AliwangwangOutlined />,
            children: [
                {
                    label: <span>Đăng xuất</span>,
                    key: 'logout',
                    icon: <LogoutOutlined />,
                    onClick: () => handleLogout()
                },
            ],
        }] : []),
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