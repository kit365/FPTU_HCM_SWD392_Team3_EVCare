import { Button, Input, notification, Modal } from "antd";
import { useState } from "react";

const { Search } = Input;

interface CarCreateProps {
    onSearch?: (value: string) => void;
}

const CarCreate: React.FC<CarCreateProps> = ({ onSearch }) => {
   
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [carName, setCarName] = useState("");
    const [licensePlate, setLicensePlate] = useState("");
    const [carType, setCarType] = useState("");

    const handleSubmitBtn = async () => {
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

    const handleSearch = (value: string) => {
        if (onSearch) {
            onSearch(value);
        }
    }

    return (
        <div className="car-form" style={{ margin: "10px 0", marginBottom: "40px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 className= "text-[20px] font-semibold">Bảng Hồ Sơ Xe</h3>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <Search 
                        placeholder="Tìm kiếm xe" 
                        onSearch={handleSearch}
                        onChange={(e) => handleSearch(e.target.value)}
                        style={{ width: 300}}
                        enterButton 
                        allowClear
                    />
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        type="primary"> Tạo Hồ Sơ Xe 
                    </Button>
                </div>
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