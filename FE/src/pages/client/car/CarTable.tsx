import React, { useState } from 'react'
import { Table, Popconfirm } from 'antd';
import type { TableColumnsType } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import CarUpdate from './CarUpdate.tsx';
import type { CarProfile } from '../../../types/carModel.ts';
import CarDetail from './CarDetail.tsx';

//định nghĩa prop
type Vehicle = {
    id: number;
    carName: string;
    licensePlate: string;
    carType: string;
};

type CarTableProps = {
    vehicles: Vehicle[];
    total: number;
    current: number;
    setCurrent: React.Dispatch<React.SetStateAction<number>>;
    pageSize: number;
    setPageSize: React.Dispatch<React.SetStateAction<number>>;
};


const CarTable: React.FC<CarTableProps> = ({ vehicles, total, current, setCurrent, pageSize, setPageSize }) => {

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

    const [dataUpdate, setDataUpdate] = useState<CarProfile | null>(null);
    const [dataDetail, setDataDetail] = useState<CarProfile | null>(null);
    const [isOpenUpdate, setIsOpenUpdate] = useState(false);
    const [isOpenDetail, setIsOpenDetail] = useState(false);


    const columns: TableColumnsType<Vehicle> = [
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
            dataIndex: 'carName',
            sorter: (a, b) => a.carName.localeCompare(b.carName, 'vi', { sensitivity: 'base' }),
            sortDirections: ['ascend', 'descend'],

            render: (_: any, record: any) => {
                return (
                    <a
                        href='#'
                        onClick={() => {
                            setDataDetail(record);
                            setIsOpenDetail(true);
                        }}
                    >{record.carName}</a>
                )
            }
        },

        {
            title: 'Biển số',
            dataIndex: 'licensePlate',
        },
        {
            title: 'Loại xe',
            dataIndex: 'carType',
        },
        {
            title: 'Hành Động',
            width: 120,
            key: 'action',
            align: 'center',
            render: (_: any, record: any) => (
                <div style={{ display: "flex", gap: "20px", justifyContent: "center", alignItems: "center" }}>
                    <EditOutlined
                        onClick={() => {
                            setDataUpdate(record)
                            setIsOpenUpdate(true)
                        }}
                        style={{ cursor: "pointer", color: "orange" }} />
                    <Popconfirm
                        title="Xóa hồ sơ xe"
                        description="Bạn chắc chắn xóa hồ sơ xe này ?"
                        // onConfirm={() => handleDeleteCar(record.carId)}
                        okText="Yes"
                        cancelText="No"
                        placement="left"

                    >
                        <DeleteOutlined style={{ cursor: "pointer", color: "red" }} />
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
                dataSource={vehicles}
                rowKey={"id"}
                bordered
                size="middle"
                rowClassName="custom-row"
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
            />

            <CarDetail
                dataDetail={dataDetail}
                setDataDetail={setDataDetail}
                isOpenDetail={isOpenDetail}
                setIsOpenDetail={setIsOpenDetail}
            />
        </>
    )
}

export default CarTable