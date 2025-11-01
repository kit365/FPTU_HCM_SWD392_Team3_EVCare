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
import { useWarranty } from "../../../hooks/useWarranty";
import HasRole from "../../../components/common/HasRole";
import { RoleEnum } from "../../../constants/roleConstants";
import { useAuthContext } from "../../../context/useAuthContext";

interface TableColumn {
    title: string;
    width: number;
}

const columns: TableColumn[] = [
    { title: "STT", width: 5 },
    { title: "Tên gói bảo hành", width: 25 },
    { title: "Thời gian bảo hành (tháng)", width: 15 },
    { title: "Ngày bắt đầu", width: 15 },
    { title: "Ngày kết thúc", width: 15 },
    { title: "Trạng thái", width: 10 },
    { title: "Hành động", width: 15 },
];

export const WarrantyPackageList = () => {
    const { user } = useAuthContext();
    const navigate = useNavigate();
    const userRoles = user?.roleName || [];
    const canCreate = userRoles.includes(RoleEnum.ADMIN) || userRoles.includes(RoleEnum.STAFF);
    const canEdit = userRoles.includes(RoleEnum.ADMIN) || userRoles.includes(RoleEnum.STAFF);
    const canDelete = userRoles.includes(RoleEnum.ADMIN) || userRoles.includes(RoleEnum.STAFF);
    
    const [currentPage, setCurrentPage] = useState<number>(1);
    const pageSize = 10;
    const [keyword, setKeyword] = useState<string>("");

    const { warrantyPackageList, fetchWarrantyPackageList, deleteWarrantyPackage, totalPages, loading } = useWarranty();

    const loadWarrantyPackages = useCallback(() => {
        fetchWarrantyPackageList({
            page: currentPage - 1,
            pageSize,
            keyword,
        });
    }, [currentPage, pageSize, keyword, fetchWarrantyPackageList]);

    useEffect(() => {
        loadWarrantyPackages();
    }, [loadWarrantyPackages]);

    const handleDelete = async (id: string) => {
        try {
            const success = await deleteWarrantyPackage(id);
            if (success) {
                loadWarrantyPackages();
            }
        } catch (error) {
            console.error("Lỗi khi xóa gói bảo hành:", error);
        }
    };

    const handleCreate = () => {
        navigate(`/${pathAdmin}/warranty/create`);
    };

    const handleSearch = useCallback((value: string) => {
        setKeyword(value);
        setCurrentPage(1);
    }, []);

    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN");
    };

    const isWarrantyValid = (item: any) => {
        const now = new Date();
        const startDate = new Date(item.startDate);
        const endDate = new Date(item.endDate);
        return now >= startDate && now <= endDate;
    };

    return (
        <div className="max-w-[1320px] px-[12px] mx-auto">
            <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
                {/* Header */}
                <div className="p-[2.4rem] flex items-center justify-between border-b border-gray-100">
                    <div>
                        <h2 className="text-admin-secondary text-[1.8rem] font-[600] leading-[1.2] mb-1">Danh sách gói bảo hành</h2>
                        <p className="text-[1.2rem] text-gray-500">Quản lý các gói bảo hành phụ tùng</p>
                    </div>
                    {canCreate && (
                        <button
                            onClick={handleCreate}
                            className="group flex items-center gap-2 cursor-pointer text-white text-[1.4rem] font-[600] py-[1rem] px-[2rem] leading-[1.5] rounded-[0.8rem] transition-all duration-200 ease-in-out 
                                bg-gradient-to-r from-[#22c55e] to-[#16a34a] 
                                hover:from-[#16a34a] hover:to-[#15803d] 
                                shadow-[0_4px_12px_rgba(34,197,94,0.3)] 
                                hover:shadow-[0_6px_16px_rgba(34,197,94,0.4)]
                                hover:scale-[1.02] active:scale-[0.98]"
                            title="Tạo gói bảo hành mới"
                        >
                            <AddIcon className="w-[2.2rem] h-[2.2rem] transition-transform duration-200 group-hover:rotate-90" />
                            <span>Tạo gói bảo hành mới</span>
                        </button>
                    )}
                </div>

                {/* Search */}
                <div className="p-[2.4rem] border-b border-gray-100">
                    <FormSearch
                        placeholder="Tìm kiếm theo tên gói bảo hành..."
                        onSearch={handleSearch}
                    />
                </div>

                {/* Table */}
                <div className="p-[2.4rem]">
                    {loading ? (
                        <div className="flex justify-center items-center py-[4rem]">
                            <div className="text-[1.4rem] text-gray-500">Đang tải...</div>
                        </div>
                    ) : warrantyPackageList.length === 0 ? (
                        <FormEmpty message="Không có gói bảo hành nào" />
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            {columns.map((col, index) => (
                                                <th
                                                    key={index}
                                                    className="p-[1.2rem] text-left text-[1.3rem] font-[600] text-gray-700"
                                                    style={{ width: `${col.width}%` }}
                                                >
                                                    {col.title}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {warrantyPackageList.map((item, index) => {
                                            const isValid = isWarrantyValid(item);
                                            return (
                                                <tr
                                                    key={item.warrantyPackageId}
                                                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                                >
                                                    <td className="p-[1.2rem] text-[1.3rem] text-gray-600">
                                                        {(currentPage - 1) * pageSize + index + 1}
                                                    </td>
                                                    <td className="p-[1.2rem] text-[1.3rem] text-gray-800 font-[500]">
                                                        {item.warrantyPackageName}
                                                    </td>
                                                    <td className="p-[1.2rem] text-[1.3rem] text-gray-600">
                                                        {item.warrantyPeriodMonths} tháng
                                                    </td>
                                                    <td className="p-[1.2rem] text-[1.3rem] text-gray-600">
                                                        {formatDate(item.startDate)}
                                                    </td>
                                                    <td className="p-[1.2rem] text-[1.3rem] text-gray-600">
                                                        {formatDate(item.endDate)}
                                                    </td>
                                                    <td className="p-[1.2rem]">
                                                        <span
                                                            className={`inline-flex items-center px-[1rem] py-[0.4rem] rounded-full text-[1.2rem] font-[500] ${
                                                                isValid
                                                                    ? "bg-green-100 text-green-700"
                                                                    : "bg-gray-100 text-gray-600"
                                                            }`}
                                                        >
                                                            {isValid ? "Đang hiệu lực" : "Hết hạn"}
                                                        </span>
                                                    </td>
                                                    <td className="p-[1.2rem]">
                                                        <div className="flex items-center gap-[0.8rem]">
                                                            <Link
                                                                to={`/${pathAdmin}/warranty/view/${item.warrantyPackageId}`}
                                                                className="flex items-center justify-center w-[3.6rem] h-[3.6rem] rounded-lg bg-blue-50 hover:bg-blue-100 transition-all duration-200 hover:scale-110"
                                                                title="Xem chi tiết"
                                                            >
                                                                <RemoveRedEyeIcon className="w-[1.8rem] h-[1.8rem] text-blue-600" />
                                                            </Link>
                                                            {canEdit && (
                                                                <Link
                                                                    to={`/${pathAdmin}/warranty/edit/${item.warrantyPackageId}`}
                                                                    className="flex items-center justify-center w-[3.6rem] h-[3.6rem] rounded-lg bg-yellow-50 hover:bg-yellow-100 transition-all duration-200 hover:scale-110"
                                                                    title="Chỉnh sửa"
                                                                >
                                                                    <EditIcon className="w-[1.8rem] h-[1.8rem] text-yellow-600" />
                                                                </Link>
                                                            )}
                                                            {canDelete && (
                                                                <Popconfirm
                                                                    title="Xác nhận xóa"
                                                                    description="Bạn có chắc chắn muốn xóa gói bảo hành này?"
                                                                    onConfirm={() => handleDelete(item.warrantyPackageId)}
                                                                    okText="Đồng ý"
                                                                    cancelText="Hủy"
                                                                    okButtonProps={{ danger: true }}
                                                                >
                                                                    <button
                                                                        type="button"
                                                                        disabled={loading}
                                                                        className="flex items-center justify-center w-[3.6rem] h-[3.6rem] rounded-lg bg-red-50 hover:bg-red-100 transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                        title="Xóa"
                                                                    >
                                                                        <DeleteOutlineIcon className="w-[1.8rem] h-[1.8rem] text-red-600" />
                                                                    </button>
                                                                </Popconfirm>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <Stack spacing={2} className="mt-[2.4rem] flex items-center">
                                    <Pagination
                                        count={totalPages}
                                        page={currentPage}
                                        onChange={(_, page) => setCurrentPage(page)}
                                        color="primary"
                                        size="large"
                                    />
                                </Stack>
                            )}
                        </>
                    )}
                </div>
            </Card>
        </div>
    );
};

