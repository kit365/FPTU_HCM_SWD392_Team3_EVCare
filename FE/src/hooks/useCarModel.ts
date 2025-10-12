//xử lý logic sau khi gọi API
import { useRef, useState } from "react";
import { carModelService } from "../service/carModelService";
import type { GetVehicleTypeListRequest } from "../type/carModel";
import type { VehicleProps } from "../types/admin/car.types";


export const useCarModel = () => {
    const [vehicleList, setVehicleList] = useState<VehicleProps[]>([]);
    const [loading, setLoading] = useState(false);
    const hasNotified = useRef(false); // 👈 flag để ngăn notify lặp


    const fetchVehicleTypeList = async (params: GetVehicleTypeListRequest) => {
        setLoading(true);
        try {
            const response = await carModelService.getVehicleTypeList(params);
            const carsArray = response.data.data.data;
            setVehicleList(carsArray);

            if (!hasNotified.current) { // 👈 chỉ chạy notify lần đầu
                if (response?.data.success === true) {
                    console.log(response?.data.message || "lấy mẫu xe thành công");
                } else {
                    console.error(response?.data.message || "lấy mẫu xe thất bại!");
                }
                hasNotified.current = true;
            }

        } catch (error) {
            console.error("Error fetching vehicle types:", error);
        } finally {
            setLoading(false);
        }
    };
    return {
        vehicleList,
        loading, 
        fetchVehicleTypeList
    };
};