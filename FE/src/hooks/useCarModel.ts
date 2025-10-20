//xử lý logic sau khi gọi API
import { useState } from "react";
import { toast } from "react-toastify";
import { carModelService } from "../service/carModelService";
import type { 
    GetVehicleTypeListRequest, 
    CreateVehicleTypeRequest,
    UpdateVehicleTypeRequest,
    VehicleDetailResponse
} from "../type/carModel";
import type { VehicleProps } from "../types/admin/car.types";


export const useCarModel = () => {
    const [vehicleList, setVehicleList] = useState<VehicleProps[]>([]);
    const [vehicleDetail, setVehicleDetail] = useState<VehicleDetailResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);


    const fetchVehicleTypeList = async (params: GetVehicleTypeListRequest) => {
        setLoading(true);
        try {
            const response = await carModelService.getVehicleTypeList(params);
            const carsArray = response.data.data.data;
            setVehicleList(carsArray);
            setTotalPages(response.data.data.totalPages);
            setTotalElements(response.data.data.totalElements);

        } catch (error) {
            toast.error("Lỗi khi tải danh sách mẫu xe!");
        } finally {
            setLoading(false);
        }
    };

    const createVehicleType = async (data: CreateVehicleTypeRequest) => {
        setLoading(true);
        try {
            const response = await carModelService.createVehicleType(data);
            if (response?.data.success) {
                toast.success(response?.data.message || "Tạo mẫu xe thành công!");
                return true;
            } else {
                toast.error(response?.data.message || "Tạo mẫu xe thất bại!");
                return false;
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Lỗi khi tạo mẫu xe!");
            return false;
        } finally {
            setLoading(false);
        }
    };

    const findVehicleTypeById = async (id: string) => {
        setLoading(true);
        try {
            const response = await carModelService.findVehicleTypeById(id);
            if (response?.data.success) {
                setVehicleDetail(response.data.data);
                return response.data.data;
            } else {
                toast.error(response?.data.message || "Không tìm thấy mẫu xe!");
                return null;
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Lỗi khi tìm mẫu xe!");
            return null;
        } finally {
            setLoading(false);
        }
    };

    const updateVehicleType = async (id: string, data: UpdateVehicleTypeRequest) => {
        setLoading(true);
        try {
            const response = await carModelService.updateVehicleType(id, data);
            if (response?.data.success) {
                toast.success(response?.data.message || "Cập nhật mẫu xe thành công!");
                return true;
            } else {
                toast.error(response?.data.message || "Cập nhật mẫu xe thất bại!");
                return false;
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Lỗi khi cập nhật mẫu xe!");
            return false;
        } finally {
            setLoading(false);
        }
    };

    const deleteVehicleType = async (id: string) => {
        setLoading(true);
        try {
            const response = await carModelService.deleteVehicleType(id);
            if (response?.data.success) {
                toast.success(response?.data.message || "Xóa mẫu xe thành công!");
                return true;
            } else {
                toast.error(response?.data.message || "Xóa mẫu xe thất bại!");
                return false;
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Lỗi khi xóa mẫu xe!");
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        vehicleList,
        vehicleDetail,
        loading,
        totalPages,
        totalElements,
        fetchVehicleTypeList,
        createVehicleType,
        findVehicleTypeById,
        updateVehicleType,
        deleteVehicleType
    };
};