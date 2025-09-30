import React from 'react'
import { Table, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

//định nghĩa prop
type Vehicle = {
    id: number;
    carName: string;
    licensePlate: string;
    carType: string;
};

type CarTableProps = {
    vehicles:Vehicle[];
    total: number;
    current: number;
    setCurrent: React.Dispatch<React.SetStateAction<number>>;
    pageSize: number;
    setPageSize: React.Dispatch<React.SetStateAction<number>>;
};

const CarTable: React.FC<CarTableProps> = ({ vehicles, total, current, setCurrent, pageSize, setPageSize }) => {


    // const handleDeleteCar = async (id) => {
    //     const res = await deleteUserAPI(id);
    //     if (res.data) {
    //         notification.success({
    //             message: "Delete car",
    //             description: "Xóa car thành công"
    //         })
    //         await loadUser();

    //     } else {
    //         notification.error({
    //             message: "Error delete user",
    //             description: JSON.stringify(res.message)
    //         })
    //     }
    // }

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

    const columns = [
        {
            title: 'STT',
            render: (_: any, record: any, index: number) => {
                return (
                    <>{(index + 1) + (current - 1) * pageSize}</>
                )
            }
        },
        {
            title: 'Car Name',
            dataIndex: 'carName',

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
            key: 'action',
            render: (_: any, record: any) => (
                <div style={{ display: "flex", gap: "20px" }}>
                    <EditOutlined
                        onClick={() => {
                            //hanh dong EDIT
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



        </>
    )
}

export default CarTable