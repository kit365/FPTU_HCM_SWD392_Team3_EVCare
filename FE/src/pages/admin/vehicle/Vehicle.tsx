import { Card, Pagination, Stack } from "@mui/material";
import { CardHeaderAdmin } from "../../../components/admin/ui/CardHeader";
import { pathAdmin } from "../../../constants/paths.constant";
import { useCallback, useEffect, useState } from "react";
import { FormSearch } from "../../../components/admin/ui/FormSearch";
import { Link } from "react-router-dom";
import { Popconfirm } from 'antd';
import { FormEmpty } from "../../../components/admin/ui/FormEmpty";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
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
    const userRoles = user?.roleName || [];
    const canCreate = userRoles.includes(RoleEnum.ADMIN);
    const canEdit = userRoles.includes(RoleEnum.ADMIN);
    const canDelete = userRoles.includes(RoleEnum.ADMIN);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const pageSize = 10;
    const [keyword, setKeyword] = useState<string>("");

    const { vehicleList, fetchVehicleTypeList, deleteVehicleType, totalPages } = useVehicleType();

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
        const success = await deleteVehicleType(id);
        if (success) loadVehicles();
    };

    const handleSearch = useCallback((value: string) => {
        setKeyword(value);
        setCurrentPage(1);
    }, []);

    return (
        <div className="max-w-[1320px] px-[12px] mx-auto">
            <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
                {/* Header */}
                <CardHeaderAdmin
                    title="Danh sách mẫu xe"
                    href={canCreate ? `/${pathAdmin}/vehicle/create` : undefined}
                    content={canCreate ? "Tạo mẫu xe" : undefined}
                />

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
                                        <td className="p-[1.2rem] text-center flex justify-center">
                                            <Link
                                                to={`/admin/vehicle/view/${item.vehicleTypeId}`}
                                                className="text-green-500 w-[2rem] h-[2rem] mr-2 inline-block hover:opacity-80"
                                                title="Xem chi tiết"
                                            >
                                                <RemoveRedEyeIcon className="!w-full !h-full" />
                                            </Link>
                                            <HasRole allow={RoleEnum.ADMIN}>
                                                <Link
                                                    to={`/admin/vehicle/edit/${item.vehicleTypeId}`}
                                                    className="text-blue-500 w-[2rem] h-[2rem] mr-2 inline-block hover:opacity-80"
                                                    title="Chỉnh sửa"
                                                >
                                                    <EditIcon className="!w-full !h-full" />
                                                </Link>
                                            </HasRole>
                                            <Link
                                                to={`/admin/vehicle/service/${item.vehicleTypeId}`}
                                                className="text-yellow-300 w-[2rem] h-[2rem] mr-2 inline-block hover:opacity-80"
                                                title="Dịch vụ"
                                            >
                                                <CompassCalibrationIcon className="!w-full !h-full" />
                                            </Link>
                                            <HasRole allow={RoleEnum.ADMIN}>
                                                <Popconfirm
                                                    title="Xóa mẫu xe"
                                                    description="Bạn chắc chắn xóa mẫu xe này?"
                                                    onConfirm={() =>
                                                        handleDelete(item.vehicleTypeId || item.id)
                                                    }
                                                    okText="Đồng ý"
                                                    cancelText="Hủy"
                                                    placement="left"
                                                >
                                                    <button className="text-red-500 w-[2rem] h-[2rem] cursor-pointer hover:opacity-80">
                                                        <DeleteOutlineIcon className="!w-full !h-full" />
                                                    </button>
                                                </Popconfirm>
                                            </HasRole>
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
