import { Card, Pagination, Stack } from "@mui/material";
import { CardHeaderAdmin } from "../../../components/admin/ui/CardHeader";
import { pathAdmin } from "../../../constants/paths.constant";
import { useCallback, useEffect, useState } from "react";
import { FormSearch } from "../../../components/admin/ui/FormSearch";
import { Link, useNavigate } from "react-router-dom";
import { Popconfirm } from 'antd';
import { FormEmpty } from "../../../components/admin/ui/FormEmpty";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import { useVehicleType } from "../../../hooks/useVehicleType";
import CompassCalibrationIcon from '@mui/icons-material/CompassCalibration';
import HasRole from "../../../components/common/HasRole";
import { RoleEnum } from "../../../constants/roleConstants";
import { useAuthContext } from "../../../context/useAuthContext";
interface TableColumn {
    title: string;
    width: number;
}

const columns: TableColumn[] = [
    { title: "STT", width: 5 },
    { title: "Tên mẫu xe", width: 20 },
    { title: "Hãng sản xuất", width: 15 },
    { title: "Dung lượng pin (kWh)", width: 15 },
    { title: "Bảo dưỡng (km)", width: 15 },
    { title: "Bảo dưỡng (tháng)", width: 15 },
    { title: "Hành động", width: 15 },
];

export const Vehicle = () => {
    const { user } = useAuthContext();
    const navigate = useNavigate();
    const userRoles = user?.roleName || [];
    const canCreate = userRoles.includes(RoleEnum.ADMIN);
    const canEdit = userRoles.includes(RoleEnum.ADMIN);
    const canDelete = userRoles.includes(RoleEnum.ADMIN);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const pageSize = 10;
    const [keyword, setKeyword] = useState<string>("");

    const { vehicleList, fetchVehicleTypeList, deleteVehicleType, totalPages, loading } = useVehicleType();

    // Debug: Log để kiểm tra quyền
    console.log("User roles:", userRoles);
    console.log("Can create:", canCreate);
    console.log("Can delete:", canDelete);

    const loadVehicles = useCallback(() => {
        fetchVehicleTypeList({
            page: currentPage - 1,
            pageSize,
            keyword,
        });
    }, [currentPage, pageSize, keyword, fetchVehicleTypeList]);

    useEffect(() => {
        loadVehicles();
    }, [loadVehicles]);

    // Khi xóa thành công thì reload list
    const handleDelete = async (id: string) => {
        try {
            const success = await deleteVehicleType(id);
            if (success) {
                loadVehicles();
            }
        } catch (error) {
            console.error("Lỗi khi xóa mẫu xe:", error);
        }
    };

    const handleCreate = () => {
        navigate(`/${pathAdmin}/vehicle/create`);
    };

    const handleSearch = useCallback((value: string) => {
        setKeyword(value);
        setCurrentPage(1);
    }, []);

    return (
        <div className="max-w-[1320px] px-[12px] mx-auto">
            <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
                {/* Header */}
                <div className="p-[2.4rem] flex items-center justify-between border-b border-gray-100">
                    <div>
                        <h2 className="text-admin-secondary text-[1.8rem] font-[600] leading-[1.2] mb-1">Danh sách mẫu xe</h2>
                        <p className="text-[1.2rem] text-gray-500">Quản lý thông tin các mẫu xe điện</p>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="group flex items-center gap-2 cursor-pointer text-white text-[1.4rem] font-[600] py-[1rem] px-[2rem] leading-[1.5] rounded-[0.8rem] transition-all duration-200 ease-in-out 
                            bg-gradient-to-r from-[#22c55e] to-[#16a34a] 
                            hover:from-[#16a34a] hover:to-[#15803d] 
                            shadow-[0_4px_12px_rgba(34,197,94,0.3)] 
                            hover:shadow-[0_6px_16px_rgba(34,197,94,0.4)]
                            hover:scale-[1.02] active:scale-[0.98]
                            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        title="Tạo mẫu xe mới"
                    >
                        <AddIcon className="w-[2.2rem] h-[2.2rem] transition-transform duration-200 group-hover:rotate-90" />
                        <span>Tạo mẫu xe mới</span>
                    </button>
                </div>

                <div className="px-[2.4rem] pb-[2.4rem] h-full">
                    <FormSearch onSearch={handleSearch} />

                    {/* Table */}
                    <table className="w-full">
                        <thead className="text-[#000000] text-[1.3rem] border-dashed bg-[#f4f6f9]">
                            <tr>
                                {columns.map((col, index) => (
                                    <th
                                        key={index}
                                        className={`p-[1.2rem] font-[500] text-center
                                            ${index === 0 ? "rounded-l-[8px]" : ""}
                                            ${index === columns.length - 1 ? "rounded-r-[8px]" : ""}`}
                                        style={{ width: `${col.width}%` }}
                                    >
                                        {col.title}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="text-[#2b2d3b] text-[1.3rem]">
                            {vehicleList.length > 0 ? (
                                vehicleList.map((item: any, index: number) => (
                                    <tr
                                        key={item.id}
                                        className={`border-b border-gray-200 text-center ${index !== vehicleList.length - 1 ? "border-dashed" : "border-none"
                                            } ${index % 2 !== 0 ? "bg-transparent" : "bg-[#FBFBFD]"}`}
                                    >
                                        <td className="p-[1.2rem]">
                                            {(currentPage - 1) * pageSize + index + 1}
                                        </td>
                                        <td className="p-[1.2rem]">{item.vehicleTypeName}</td>
                                        <td className="p-[1.2rem]">{item.manufacturer}</td>
                                        <td className="p-[1.2rem]">{item.batteryCapacity}</td>
                                        <td className="p-[1.2rem]">{item.maintenanceIntervalKm}</td>
                                        <td className="p-[1.2rem]">{item.maintenanceIntervalMonths}</td>
                                        <td className="p-[1.2rem]">
                                            <div className="flex items-center justify-center gap-2 flex-wrap">
                                                <Link
                                                    to={`/admin/vehicle/view/${item.vehicleTypeId}`}
                                                    className="group flex items-center justify-center w-[3.6rem] h-[3.6rem] rounded-lg bg-green-50 hover:bg-green-100 transition-all duration-200 hover:scale-110"
                                                    title="Xem chi tiết"
                                                >
                                                    <RemoveRedEyeIcon className="w-[1.8rem] h-[1.8rem] text-green-600 group-hover:text-green-700" />
                                                </Link>
                                                <Link
                                                    to={`/admin/vehicle/edit/${item.vehicleTypeId}`}
                                                    className="group flex items-center justify-center w-[3.6rem] h-[3.6rem] rounded-lg bg-blue-50 hover:bg-blue-100 transition-all duration-200 hover:scale-110"
                                                    title="Chỉnh sửa"
                                                >
                                                    <EditIcon className="w-[1.8rem] h-[1.8rem] text-blue-600 group-hover:text-blue-700" />
                                                </Link>
                                                <Link
                                                    to={`/admin/vehicle/service/${item.vehicleTypeId}`}
                                                    className="group flex items-center justify-center w-[3.6rem] h-[3.6rem] rounded-lg bg-yellow-50 hover:bg-yellow-100 transition-all duration-200 hover:scale-110"
                                                    title="Quản lý dịch vụ"
                                                >
                                                    <CompassCalibrationIcon className="w-[1.8rem] h-[1.8rem] text-yellow-600 group-hover:text-yellow-700" />
                                                </Link>
                                                <Popconfirm
                                                    title={
                                                        <div className="flex flex-col gap-2">
                                                            <span className="text-[1.5rem] font-[600] text-gray-800">Xác nhận xóa</span>
                                                            <span className="text-[1.3rem] text-gray-600">Bạn có chắc chắn muốn xóa mẫu xe này?</span>
                                                            <span className="text-[1.2rem] text-red-600 font-[500]">Hành động này không thể hoàn tác!</span>
                                                        </div>
                                                    }
                                                    description=""
                                                    onConfirm={() => handleDelete(item.vehicleTypeId || item.id)}
                                                    okText="Đồng ý xóa"
                                                    cancelText="Hủy bỏ"
                                                    placement="left"
                                                    okButtonProps={{ 
                                                        loading: loading,
                                                        danger: true,
                                                        className: "bg-red-500 hover:bg-red-600"
                                                    }}
                                                    cancelButtonProps={{
                                                        className: "border-gray-300 text-gray-700 hover:bg-gray-50"
                                                    }}
                                                >
                                                    <button 
                                                        type="button"
                                                        disabled={loading}
                                                        className="group flex items-center justify-center w-[3.6rem] h-[3.6rem] rounded-lg bg-red-50 hover:bg-red-100 transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                                        title="Xóa mẫu xe"
                                                    >
                                                        <DeleteOutlineIcon className="w-[1.8rem] h-[1.8rem] text-red-600 group-hover:text-red-700 transition-colors" />
                                                    </button>
                                                </Popconfirm>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <FormEmpty colspan={columns.length} />
                            )}
                        </tbody>
                    </table>

                    {vehicleList.length > 0 && (
                        <Stack spacing={2} className="mt-[2rem]">
                            <Pagination
                                count={totalPages}
                                page={currentPage}
                                color="primary"
                                onChange={(_, value) => setCurrentPage(value)}
                            />
                        </Stack>
                    )}
                </div>
            </Card>
        </div>
    );
};
