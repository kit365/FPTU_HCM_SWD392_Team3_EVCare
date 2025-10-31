import { Input, Modal } from "antd";
import type { CarProfile } from "../../../types/carModel";

interface CarDetailProps {
    dataDetail: CarProfile | null;
    setDataDetail: React.Dispatch<React.SetStateAction<CarProfile | null>>;
    isOpenDetail: boolean;
    setIsOpenDetail: React.Dispatch<React.SetStateAction<boolean>>;
}

const CarDetail: React.FC<CarDetailProps> = ({ isOpenDetail, setIsOpenDetail }) => {

    const resetAndCloseModal = () => {
        setIsOpenDetail(false);
    }

    const handleSubmit = () => {
        //goi API get appointment
        resetAndCloseModal();
    }
    return (
        <>
            <Modal
                open={isOpenDetail}
                onOk={() => handleSubmit()}
                onCancel={() => resetAndCloseModal()}
                maskClosable={false}
                okText={"OK"}
            >
                <div style={{ display: "flex", gap: "15px", flexDirection: "column" }}>
                    <div>
                        <span>Tên xe</span>
                        <Input
                        // value={carName}
                        // onChange={(event) => { setCarName(event.target.value) }}
                        />
                    </div>
                    <div>
                        <span>Biển số</span>
                        <Input
                        // value={licensePlate}
                        // onChange={(event) => { setLicensePlate(event.target.value) }}
                        />
                    </div>
                    <div>
                        <span>Còn nữa...</span>
                        <Input
                        // value={carType}
                        // onChange={(event) => { setCarType(event.target.value) }}
                        />
                    </div>
                </div>
            </Modal>
        </>

    )
}

export default CarDetail