import React, { useState } from 'react'
import { Table, Tag, Modal, Descriptions } from 'antd';
import type { TableColumnsType } from 'antd';
import { EyeOutlined, EditOutlined } from '@ant-design/icons';
import CarUpdate from './CarUpdate';
import type { VehicleProfileResponse } from '../../../types/vehicle-profile.types';
import dayjs from 'dayjs';

//định nghĩa prop
type CarTableProps = {
    vehicleProfiles: VehicleProfileResponse[];
    loading: boolean;
    total: number;
    current: number;
    setCurrent: React.Dispatch<React.SetStateAction<number>>;
    pageSize: number;
    setPageSize: React.Dispatch<React.SetStateAction<number>>;
    onSuccess?: () => void;
};


const CarTable: React.FC<CarTableProps> = ({ vehicleProfiles, loading, total, current, setCurrent, pageSize, setPageSize, onSuccess }) => {
    const [dataDetail, setDataDetail] = useState<VehicleProfileResponse | null>(null);
    const [isOpenDetail, setIsOpenDetail] = useState(false);
    const [dataUpdate, setDataUpdate] = useState<VehicleProfileResponse | null>(null);
    const [isOpenUpdate, setIsOpenUpdate] = useState(false);

    const onChange = (pagination: any, filters: any, sorter: any, extra: any) => {
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
    };


    const columns: TableColumnsType<VehicleProfileResponse> = [
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
            title: 'Loại xe',
            dataIndex: ['vehicleType', 'vehicleTypeName'],
            sorter: (a, b) => a.vehicleType.vehicleTypeName.localeCompare(b.vehicleType.vehicleTypeName, 'vi', { sensitivity: 'base' }),
            sortDirections: ['ascend', 'descend'],
            render: (_: any, record: VehicleProfileResponse) => {
                return (
                    <a
                        href='#'
                        onClick={(e) => {
                            e.preventDefault();
                            setDataDetail(record);
                            setIsOpenDetail(true);
                        }}
                    >{record.vehicleType.vehicleTypeName}</a>
                )
            }
        },
        {
            title: 'Biển số xe',
            dataIndex: 'plateNumber',
        },
        {
            title: 'Số khung (VIN)',
            dataIndex: 'vin',
        },
        {
            title: 'Km hiện tại',
            dataIndex: 'currentKm',
            align: 'right',
            render: (km: number) => km ? km.toLocaleString('vi-VN') : '-',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isDeleted',
            align: 'center',
            render: (isDeleted: boolean) => (
                <Tag color={isDeleted ? 'red' : 'green'}>
                    {isDeleted ? 'Đã xóa' : 'Hoạt động'}
                </Tag>
            ),
        },
        {
            title: 'Hành Động',
            width: 100,
            key: 'action',
            align: 'center',
            render: (_: any, record: VehicleProfileResponse) => (
                <div style={{ display: "flex", gap: "10px", justifyContent: "center", alignItems: "center" }}>
                    <EyeOutlined
                        onClick={() => {
                            setDataDetail(record);
                            setIsOpenDetail(true);
                        }}
                        style={{ cursor: "pointer", color: "blue" }} 
                        title="Xem chi tiết"
                    />
                    <EditOutlined
                        onClick={() => {
                            setDataUpdate(record)
                            setIsOpenUpdate(true)
                        }}
                        style={{ cursor: "pointer", color: "orange" }} 
                        title="Chỉnh sửa"
                    />
                </div>
            ),
        },
    ];
    return (
        <>
            <Table
                className="user-table"
                columns={columns}
                dataSource={vehicleProfiles}
                rowKey={"vehicleId"}
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

            <CarUpdate
                dataUpdate={dataUpdate}
                setDataUpdate={setDataUpdate}
                isOpenUpdate={isOpenUpdate}
                setIsOpenUpdate={setIsOpenUpdate}
                onSuccess={onSuccess}
            />

            {/* Vehicle Profile Detail Modal */}
            <Modal
                title="Chi tiết hồ sơ xe"
                open={isOpenDetail}
                onCancel={() => {
                    setIsOpenDetail(false);
                    setDataDetail(null);
                }}
                footer={null}
                width={700}
            >
                {dataDetail && (
                    <Descriptions bordered column={2}>
                        <Descriptions.Item label="Loại xe" span={2}>
                            {dataDetail.vehicleType.vehicleTypeName}
                        </Descriptions.Item>
                        <Descriptions.Item label="Hãng sản xuất" span={2}>
                            {dataDetail.vehicleType.manufacturer}
                        </Descriptions.Item>
                        <Descriptions.Item label="Năm sản xuất">
                            {dataDetail.vehicleType.modelYear}
                        </Descriptions.Item>
                        <Descriptions.Item label="Dung lượng pin">
                            {dataDetail.vehicleType.batteryCapacity} kWh
                        </Descriptions.Item>
                        <Descriptions.Item label="Biển số xe">
                            {dataDetail.plateNumber}
                        </Descriptions.Item>
                        <Descriptions.Item label="Số khung (VIN)">
                            {dataDetail.vin}
                        </Descriptions.Item>
                        <Descriptions.Item label="Km hiện tại">
                            {dataDetail.currentKm ? dataDetail.currentKm.toLocaleString('vi-VN') : '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Km bảo trì gần nhất">
                            {dataDetail.lastMaintenanceKm ? dataDetail.lastMaintenanceKm.toLocaleString('vi-VN') : '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày bảo trì gần nhất" span={2}>
                            {dataDetail.lastMaintenanceDate 
                                ? dayjs(dataDetail.lastMaintenanceDate).format('DD/MM/YYYY')
                                : '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ghi chú" span={2}>
                            {dataDetail.notes || '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Chủ xe" span={2}>
                            {dataDetail.user.fullName || dataDetail.user.username}
                        </Descriptions.Item>
                        <Descriptions.Item label="Email">
                            {dataDetail.user.email}
                        </Descriptions.Item>
                        <Descriptions.Item label="Số điện thoại">
                            {dataDetail.user.numberPhone || '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày tạo" span={2}>
                            {dayjs(dataDetail.createdAt).format('DD/MM/YYYY HH:mm:ss')}
                        </Descriptions.Item>
                        <Descriptions.Item label="Cập nhật lần cuối" span={2}>
                            {dayjs(dataDetail.updatedAt).format('DD/MM/YYYY HH:mm:ss')}
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </>
    )
}

export default CarTable