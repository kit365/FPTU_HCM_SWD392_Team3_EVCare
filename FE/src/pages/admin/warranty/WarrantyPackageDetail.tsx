import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card } from "@mui/material";
import { CardHeaderAdmin } from "../../../components/admin/ui/CardHeader";
import { FormEmpty } from "../../../components/admin/ui/FormEmpty";
import { useWarranty } from "../../../hooks/useWarranty";
import { pathAdmin } from "../../../constants/paths.constant";
import { Popconfirm } from 'antd';
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { vehiclePartService } from "../../../service/vehiclePartService";
import type { VehiclePartResponse } from "../../../types/vehicle-part.types";

export const WarrantyPackageDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { warrantyPackageDetail, getWarrantyPackage, deleteWarrantyPackagePart, deleteWarrantyPackage, loading, fetchWarrantyPackageParts, warrantyPackagePartList, totalPages, createWarrantyPackagePart } = useWarranty();
    const [currentPage, setCurrentPage] = useState<number>(1);
    const pageSize = 10;
    const [vehicleParts, setVehicleParts] = useState<VehiclePartResponse[]>([]);
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedVehiclePartId, setSelectedVehiclePartId] = useState<string>("");
    const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
    const [installedDate, setInstalledDate] = useState<string>("");
    const [notes, setNotes] = useState<string>("");

    useEffect(() => {
        if (id) {
            getWarrantyPackage(id);
            loadParts();
            loadVehicleParts();
            loadVehicles();
        }
    }, [id]);

    const loadParts = useCallback(() => {
        if (id) {
            fetchWarrantyPackageParts({
                warrantyPackageId: id,
                page: currentPage - 1,
                pageSize,
            });
        }
    }, [id, currentPage, pageSize, fetchWarrantyPackageParts]);

    useEffect(() => {
        loadParts();
    }, [loadParts]);

    const loadVehicleParts = async () => {
        try {
            const response = await vehiclePartService.getAll();
            setVehicleParts(response);
        } catch (error) {
            console.error("Error loading vehicle parts:", error);
        }
    };

    const loadVehicles = async () => {
        // Load vehicles from vehicleProfileService or similar
        // This is a placeholder - adjust based on your actual service
    };

    const handleAddPart = async () => {
        if (!id || !selectedVehiclePartId || !installedDate) {
            alert("Vui lòng điền đầy đủ thông tin!");
            return;
        }

        try {
            // Calculate expiry date based on warranty period
            const installedDateObj = new Date(installedDate);
            const expiryDate = new Date(installedDateObj);
            if (warrantyPackageDetail?.warrantyPeriodMonths) {
                expiryDate.setMonth(expiryDate.getMonth() + warrantyPackageDetail.warrantyPeriodMonths);
            }

            const payload = {
                vehiclePartId: selectedVehiclePartId,
                vehicleId: selectedVehicleId || undefined,
                installedDate: installedDateObj.toISOString(),
                warrantyExpiryDate: expiryDate.toISOString(),
                notes: notes || undefined,
            };

            if (await createWarrantyPackagePart(id, payload)) {
                setShowAddModal(false);
                setSelectedVehiclePartId("");
                setSelectedVehicleId("");
                setInstalledDate("");
                setNotes("");
                loadParts();
            }
        } catch (error) {
            console.error("Error adding warranty part:", error);
        }
    };

    const handleDeletePart = async (partId: string) => {
        try {
            if (await deleteWarrantyPackagePart(partId)) {
                loadParts();
            }
        } catch (error) {
            console.error("Error deleting warranty part:", error);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (!warrantyPackageDetail) {
        return (
            <div className="max-w-[1320px] px-[12px] mx-auto">
                <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
                    <div className="p-[2.4rem] text-center">
                        <div className="text-[1.4rem] text-gray-500">Đang tải...</div>
                    </div>
                </Card>
            </div>
        );
    }

    const isWarrantyValid = () => {
        const now = new Date();
        const startDate = new Date(warrantyPackageDetail.startDate);
        const endDate = new Date(warrantyPackageDetail.endDate);
        return now >= startDate && now <= endDate;
    };

    return (
        <div className="max-w-[1320px] px-[12px] mx-auto">
            {/* Package Info Card */}
            <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)] mb-[2.4rem]">
                <div className="p-[2.4rem]">
                    <div className="flex items-center justify-between mb-[2rem]">
                        <div className="flex items-center gap-[1.2rem]">
                            <Link
                                to={`/${pathAdmin}/warranty`}
                                className="flex items-center justify-center w-[4rem] h-[4rem] rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                                <ArrowBackIcon className="w-[2.4rem] h-[2.4rem] text-gray-600" />
                            </Link>
                            <div>
                                <h2 className="text-admin-secondary text-[1.8rem] font-[600] leading-[1.2]">
                                    {warrantyPackageDetail.warrantyPackageName}
                                </h2>
                                <p className="text-[1.2rem] text-gray-500 mt-[0.4rem]">
                                    Chi tiết gói bảo hành
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-[0.8rem]">
                            <Link
                                to={`/${pathAdmin}/warranty/edit/${id}`}
                                className="flex items-center gap-[0.8rem] px-[1.6rem] py-[0.8rem] bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
                            >
                                <EditIcon className="w-[1.8rem] h-[1.8rem] text-yellow-600" />
                                <span className="text-[1.3rem] font-[500] text-yellow-700">Chỉnh sửa</span>
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-[2rem]">
                        <div>
                            <p className="text-[1.2rem] text-gray-500 mb-[0.4rem]">Mô tả</p>
                            <p className="text-[1.4rem] text-gray-800">
                                {warrantyPackageDetail.description || "Không có mô tả"}
                            </p>
                        </div>
                        <div>
                            <p className="text-[1.2rem] text-gray-500 mb-[0.4rem]">Thời gian bảo hành</p>
                            <p className="text-[1.4rem] text-gray-800 font-[500]">
                                {warrantyPackageDetail.warrantyPeriodMonths} tháng
                            </p>
                        </div>
                        <div>
                            <p className="text-[1.2rem] text-gray-500 mb-[0.4rem]">Ngày bắt đầu</p>
                            <p className="text-[1.4rem] text-gray-800">
                                {formatDate(warrantyPackageDetail.startDate)}
                            </p>
                        </div>
                        <div>
                            <p className="text-[1.2rem] text-gray-500 mb-[0.4rem]">Ngày kết thúc</p>
                            <p className="text-[1.4rem] text-gray-800">
                                {formatDate(warrantyPackageDetail.endDate)}
                            </p>
                        </div>
                        <div>
                            <p className="text-[1.2rem] text-gray-500 mb-[0.4rem]">Trạng thái</p>
                            <span
                                className={`inline-flex items-center px-[1rem] py-[0.4rem] rounded-full text-[1.2rem] font-[500] ${
                                    isWarrantyValid()
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-100 text-gray-600"
                                }`}
                            >
                                {isWarrantyValid() ? "Đang hiệu lực" : "Hết hạn"}
                            </span>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Parts List Card */}
            <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
                <div className="p-[2.4rem]">
                    <div className="flex items-center justify-between mb-[2.4rem]">
                        <h3 className="text-[1.6rem] font-[600] text-gray-800">Danh sách phụ tùng bảo hành</h3>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-[0.8rem] px-[1.6rem] py-[0.8rem] bg-[#22c55e] hover:bg-[#16a34a] text-white rounded-lg transition-colors"
                        >
                            <AddIcon className="w-[1.8rem] h-[1.8rem]" />
                            <span className="text-[1.3rem] font-[500]">Thêm phụ tùng</span>
                        </button>
                    </div>

                    {warrantyPackagePartList.length === 0 ? (
                        <FormEmpty message="Chưa có phụ tùng nào trong gói bảo hành này" />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="p-[1.2rem] text-left text-[1.3rem] font-[600] text-gray-700">STT</th>
                                        <th className="p-[1.2rem] text-left text-[1.3rem] font-[600] text-gray-700">Phụ tùng</th>
                                        <th className="p-[1.2rem] text-left text-[1.3rem] font-[600] text-gray-700">Xe</th>
                                        <th className="p-[1.2rem] text-left text-[1.3rem] font-[600] text-gray-700">Ngày lắp đặt</th>
                                        <th className="p-[1.2rem] text-left text-[1.3rem] font-[600] text-gray-700">Hết hạn</th>
                                        <th className="p-[1.2rem] text-left text-[1.3rem] font-[600] text-gray-700">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {warrantyPackagePartList.map((part, index) => {
                                        const isExpired = new Date(part.warrantyExpiryDate) < new Date();
                                        return (
                                            <tr key={part.warrantyPackagePartId} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="p-[1.2rem] text-[1.3rem] text-gray-600">
                                                    {(currentPage - 1) * pageSize + index + 1}
                                                </td>
                                                <td className="p-[1.2rem] text-[1.3rem] text-gray-800 font-[500]">
                                                    {part.vehiclePart?.vehiclePartName || "-"}
                                                </td>
                                                <td className="p-[1.2rem] text-[1.3rem] text-gray-600">
                                                    {part.vehicle?.plateNumber || "Tổng quát"}
                                                </td>
                                                <td className="p-[1.2rem] text-[1.3rem] text-gray-600">
                                                    {formatDate(part.installedDate)}
                                                </td>
                                                <td className="p-[1.2rem]">
                                                    <span
                                                        className={`text-[1.3rem] font-[500] ${
                                                            isExpired ? "text-red-600" : "text-green-600"
                                                        }`}
                                                    >
                                                        {formatDate(part.warrantyExpiryDate)}
                                                    </span>
                                                </td>
                                                <td className="p-[1.2rem]">
                                                    <Popconfirm
                                                        title="Xác nhận xóa"
                                                        description="Bạn có chắc chắn muốn xóa phụ tùng này khỏi gói bảo hành?"
                                                        onConfirm={() => handleDeletePart(part.warrantyPackagePartId)}
                                                        okText="Đồng ý"
                                                        cancelText="Hủy"
                                                        okButtonProps={{ danger: true }}
                                                    >
                                                        <button
                                                            type="button"
                                                            className="flex items-center justify-center w-[3.6rem] h-[3.6rem] rounded-lg bg-red-50 hover:bg-red-100 transition-all"
                                                        >
                                                            <DeleteOutlineIcon className="w-[1.8rem] h-[1.8rem] text-red-600" />
                                                        </button>
                                                    </Popconfirm>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </Card>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-[2.4rem] w-full max-w-[600px] max-h-[90vh] overflow-y-auto">
                        <h3 className="text-[1.8rem] font-[600] mb-[2rem]">Thêm phụ tùng vào gói bảo hành</h3>
                        
                        <div className="space-y-[1.6rem]">
                            <div>
                                <label className="block text-[1.3rem] font-[500] mb-[0.8rem]">Phụ tùng *</label>
                                <select
                                    value={selectedVehiclePartId}
                                    onChange={(e) => setSelectedVehiclePartId(e.target.value)}
                                    className="w-full p-[1rem] border border-gray-300 rounded-lg"
                                >
                                    <option value="">-- Chọn phụ tùng --</option>
                                    {vehicleParts.map((part) => (
                                        <option key={part.vehiclePartId} value={part.vehiclePartId}>
                                            {part.vehiclePartName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[1.3rem] font-[500] mb-[0.8rem]">Xe (tùy chọn)</label>
                                <select
                                    value={selectedVehicleId}
                                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                                    className="w-full p-[1rem] border border-gray-300 rounded-lg"
                                >
                                    <option value="">-- Chọn xe (để trống nếu là bảo hành tổng quát) --</option>
                                    {/* Add vehicle options here */}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[1.3rem] font-[500] mb-[0.8rem]">Ngày lắp đặt *</label>
                                <input
                                    type="datetime-local"
                                    value={installedDate}
                                    onChange={(e) => setInstalledDate(e.target.value)}
                                    className="w-full p-[1rem] border border-gray-300 rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-[1.3rem] font-[500] mb-[0.8rem]">Ghi chú</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full p-[1rem] border border-gray-300 rounded-lg"
                                    rows={3}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-[1rem] justify-end mt-[2.4rem]">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="px-[1.6rem] py-[0.8rem] bg-gray-100 hover:bg-gray-200 rounded-lg text-[1.3rem] font-[500]"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleAddPart}
                                disabled={loading}
                                className="px-[1.6rem] py-[0.8rem] bg-[#22c55e] hover:bg-[#16a34a] text-white rounded-lg text-[1.3rem] font-[500] disabled:opacity-50"
                            >
                                {loading ? "Đang thêm..." : "Thêm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

