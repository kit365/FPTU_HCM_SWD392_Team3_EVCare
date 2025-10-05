import React from 'react'
import { Button, Input, notification, Modal } from "antd";
import { useState } from "react";

const CarCreate = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [carName, setCarName] = useState("");
    const [licensePlate, setLicensePlate] = useState("");
    const [carType, setCarType] = useState("");

    const handleSubmitBtn = async () => {
        //     // const res = await createCarAPI(carName, licensePlate, carType);
        //     if (res.data) {
        //         notification.success({
        //             message: "Create car",
        //             description: "Tạo xe thành công"
        //         })
        //         resetAndCloseModal();
        //         // await loadCar(); //load lai table car
        //     } else {
        //         notification.error({
        //             message: "Error create car",
        //             description: JSON.stringify(res.message)
        //         })

        //     }

        notification.success({
            message: "Create car",
            description: "Tạo xe thành công"
        })
        resetAndCloseModal();
    }

    const resetAndCloseModal = () => {
        setIsModalOpen(false);
        setCarName("");
        setLicensePlate("");
        setCarType("");
    }
    return (
        <div className="car-form" style={{ margin: "10px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h3>Bảng Hồ Sơ Xe</h3>
                <Button
                    onClick={() => setIsModalOpen(true)}
                    type="primary"> Tạo Hồ Sơ Xe </Button>
            </div>

            <Modal
                title="Create Car"
                open={isModalOpen}
                onOk={() => handleSubmitBtn()}
                onCancel={() => resetAndCloseModal()}
                maskClosable={false}
                okText={"CREATE"}
            >
                <div style={{ display: "flex", gap: "15px", flexDirection: "column" }}>
                    <div>
                        <span>Tên Xe</span>
                        <Input
                            value={carName}
                            onChange={(event) => { setCarName(event.target.value) }}
                        />
                    </div>
                    <div>
                        <span>Biển Số</span>
                        <Input
                            value={licensePlate}
                            onChange={(event) => { setLicensePlate(event.target.value) }}
                        />
                    </div>
                    <div>
                        <span>Thể Loại</span>
                        <Input
                            value={carType}
                            onChange={(event) => { setCarType(event.target.value) }}
                        />
                    </div>
                </div>
            </Modal>

        </div>
    )
}

export default CarCreate