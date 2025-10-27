import React, { useState } from 'react'
import { Table, Popconfirm, Tag } from 'antd';
import type { TableColumnsType } from 'antd';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import AppointmentDetail from './AppointmentDetail.tsx';
import type { UserAppointment } from '../../../types/booking.types';

//định nghĩa prop
type CarTableProps = {
    appointments: UserAppointment[];
    loading: boolean;
    total: number;
    current: number;
    setCurrent: React.Dispatch<React.SetStateAction<number>>;
    pageSize: number;
    setPageSize: React.Dispatch<React.SetStateAction<number>>;
};


const CarTable: React.FC<CarTableProps> = ({ appointments, loading, total, current, setCurrent, pageSize, setPageSize }) => {

    const onChange = (pagination: any, filters: any, sorter: any, extra: any) => {
        console.log("check onChange:", pagination, filters, sorter, extra)
        //setCurrent, setPageSize
        //neu thay doi trang: current
        if (pagination && pagination.current) {
            if (pagination.current !== +current) {
                setCurrent(+pagination.current)
            }
        }
        //neu thay doi tong so Ptu: pageSize
        if (pagination && pagination.pageSize) {
            if (pagination.pageSize !== +pageSize) {
                setPageSize(+pagination.pageSize)
            }
        }

        console.log({ pagination, filters, sorter, extra })
    };

    const [dataDetail, setDataDetail] = useState<UserAppointment | null>(null);
    const [isOpenDetail, setIsOpenDetail] = useState(false);


    // Function to get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'orange';
            case 'CONFIRMED':
                return 'blue';
            case 'IN_PROGRESS':
                return 'purple';
            case 'COMPLETED':
                return 'green';
            case 'CANCELLED':
                return 'red';
            default:
                return 'default';
        }
    };

    // Function to get status text in Vietnamese
    const getStatusText = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'Chờ xác nhận';
            case 'CONFIRMED':
                return 'Đã xác nhận';
            case 'IN_PROGRESS':
                return 'Đang thực hiện';
            case 'COMPLETED':
                return 'Hoàn thành';
            case 'CANCELLED':
                return 'Đã hủy';
            default:
                return status;
        }
    };

    const columns: TableColumnsType<UserAppointment> = [
        {
            title: 'STT',
            align: 'center',
            width: 50,
            render: (_: any, record: any, index: number) => {
                return (
                    <>{(index + 1) + (current - 1) * pageSize}</>
                )
            }
        },
        {
            title: 'Tên xe',
            dataIndex: 'vehicleTypeResponse',
            sorter: (a, b) => a.vehicleTypeResponse.vehicleTypeName.localeCompare(b.vehicleTypeResponse.vehicleTypeName, 'vi', { sensitivity: 'base' }),
            sortDirections: ['ascend', 'descend'],
            render: (_: any, record: UserAppointment) => {
                return (
                    <a
                        href='#'
                        onClick={() => {
                            setDataDetail(record);
                            setIsOpenDetail(true);
                        }}
                    >{record.vehicleTypeResponse.vehicleTypeName}</a>
                )
            }
        },
        {
            title: 'Biển số xe',
            dataIndex: 'vehicleNumberPlate',
        },
        {
            title: 'Tình trạng',
            dataIndex: 'status',
            render: (status: string) => (
                <Tag color={getStatusColor(status)}>
                    {getStatusText(status)}
                </Tag>
            ),
        },
        {
            title: 'Hành Động',
            width: 120,
            key: 'action',
            align: 'center',
            render: (_: any, record: UserAppointment) => (
                <div style={{ display: "flex", gap: "20px", justifyContent: "center", alignItems: "center" }}>
                    <EyeOutlined
                        onClick={() => {
                            setDataDetail(record);
                            setIsOpenDetail(true);
                        }}
                        style={{ cursor: "pointer", color: "blue" }} 
                        title="Xem chi tiết"
                    />
                    {/* <EditOutlined
                        onClick={() => {
                            setDataUpdate(record)
                            setIsOpenUpdate(true)
                        }}
                        style={{ cursor: "pointer", color: "orange" }} 
                        title="Chỉnh sửa"
                    /> */}
                    <Popconfirm
                        title="Xóa cuộc hẹn"
                        description="Bạn chắc chắn xóa cuộc hẹn này ?"
                        // onConfirm={() => handleDeleteAppointment(record.appointmentId)}
                        okText="Yes"
                        cancelText="No"
                        placement="left"
                    >
                        <DeleteOutlined style={{ cursor: "pointer", color: "red" }} title="Xóa" />
                    </Popconfirm>
                </div>
            ),
        },
    ];
    return (
        <>
            <Table
                className="user-table"
                columns={columns}
                dataSource={appointments}
                rowKey={"appointmentId"}
                bordered
                size="middle"
                rowClassName="custom-row"
                loading={loading}
                pagination={
                    {
                        current: current,
                        pageSize: pageSize,
                        showSizeChanger: true,
                        total: total,
                        showTotal: (total, range) => { return (<div> {range[0]}-{range[1]} trên {total} rows</div>) }
                    }}
                onChange={onChange}
            />

            {/* <CarUpdate
                dataUpdate={dataUpdate}
                setDataUpdate={setDataUpdate}
                isOpenUpdate={isOpenUpdate}
                setIsOpenUpdate={setIsOpenUpdate}
            /> */}

            <AppointmentDetail
                dataDetail={dataDetail}
                setDataDetail={setDataDetail}
                isOpenDetail={isOpenDetail}
                setIsOpenDetail={setIsOpenDetail}
            />
        </>
    )
}

export default CarTable