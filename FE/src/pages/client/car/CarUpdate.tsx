import { Input, notification, Modal } from "antd";
import { useEffect, useState } from 'react'
import type { CarProfile } from "../../../type/carModel";
interface CarUpdateProps {
    dataUpdate: CarProfile | null;
    setDataUpdate: React.Dispatch<React.SetStateAction<CarProfile | null>>;
    isOpenUpdate: boolean;
    setIsOpenUpdate: React.Dispatch<React.SetStateAction<boolean>>;
}

const CarUpdate: React.FC<CarUpdateProps> = ({
    dataUpdate,
    setDataUpdate,
    isOpenUpdate,
    setIsOpenUpdate,
}) => {
    //isUpdateModal
    const [carName, setCarName] = useState("");
    const [licensePlate, setLicensePlate] = useState("");
    const [carType, setCarType] = useState("");

    const handleSubmit = () => {
        //goi API thuc hien update
        notification.success({
                message: "Updated car profile",
                description: "Cập nhật hồ sơ thành công"
            })
        resetAndCloseModal();
        //goi ham load ho so
    }
    const resetAndCloseModal = () => {
        setIsOpenUpdate(false)
        setCarName("")
        setLicensePlate("")
        setCarType("")
        setDataUpdate(null)
    }

    useEffect(() => {
        //set data truyền vào để hiện lên modal
        if (dataUpdate) {
            setCarName(dataUpdate.carName)
            setLicensePlate(dataUpdate.licensePlate)
            setCarType(dataUpdate.carType)
            console.log("check bien record", dataUpdate)
        }
    }, [dataUpdate])

    return (
        <>
            <Modal
                open={isOpenUpdate}
                onOk={() => handleSubmit()}
                onCancel={() => resetAndCloseModal()}
                maskClosable={false}
                okText={"Cập nhật"}
            >
                <div style={{ display: "flex", gap: "15px", flexDirection: "column" }}>
                    <div>
                        <span>Tên xe</span>
                        <Input
                            value={carName}
                            onChange={(event) => { setCarName(event.target.value) }}
                        />
                    </div>
                    <div>
                        <span>Biển số</span>
                        <Input
                            value={licensePlate}
                            onChange={(event) => { setLicensePlate(event.target.value) }}
                        />
                    </div>
                    <div>
                        <span>loại xe</span>
                        <Input
                            value={carType}
                            onChange={(event) => { setCarType(event.target.value) }}
                        />
                    </div>
                </div>
            </Modal><Modal>

            </Modal>
        </>
    )
}

export default CarUpdate