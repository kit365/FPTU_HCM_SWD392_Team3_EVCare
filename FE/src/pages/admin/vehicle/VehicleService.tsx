import { Card, Pagination, Stack, Switch } from "@mui/material";
import { useEffect, useState, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Popconfirm } from "antd";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import BuildIcon from "@mui/icons-material/Build";
import { useServiceType } from "../../../hooks/useServiceType";
import { useServiceTypeVehiclePart } from "../../../hooks/useServiceTypeVehiclePart";
import { pathAdmin } from "../../../constants/paths.constant";
import { ServicePartModal } from "../../../components/admin/common/ServicePartModal";

export const VehicleService = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { detail, getByVehicleTypeId, loading } = useServiceType();
    const { remove: removeServicePart } = useServiceTypeVehiclePart();
    const [parentPages, setParentPages] = useState<Record<string, number>>({});
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<{ id: string; name: string; existingPartIds: string[] } | null>(null);
    const [showActive, setShowActive] = useState(true); // Toggle: true = active, false = inactive
    const [currentParentPage, setCurrentParentPage] = useState(1); // Pagination cho parent services (do BE)
    const pageSize = 10; // Số lượng children mỗi trang (FE tự phân trang)
    const parentPageSize = 10; // Số lượng parent services mỗi trang (BE phân trang)

    const loadData = useCallback(() => {
        if (id) {
            // Gửi param isActive lên BE: true = active, false = inactive
            getByVehicleTypeId(id, { 
                page: currentParentPage - 1, // BE dùng 0-based index
                pageSize: parentPageSize,
                isActive: showActive // true = active, false = inactive
            });
        }
    }, [id, getByVehicleTypeId, showActive, currentParentPage, parentPageSize]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Reset về trang 1 khi toggle showActive
    useEffect(() => {
        setCurrentParentPage(1);
    }, [showActive]);

    const handleOpenModal = (serviceId: string, serviceName: string, existingParts: any[] = []) => {
        const existingPartIds = existingParts.map(p => p.vehiclePart?.vehiclePartId).filter(Boolean);
        setSelectedService({ id: serviceId, name: serviceName, existingPartIds });
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedService(null);
    };

    const handlePartSuccess = () => {
        loadData(); // Reload data after adding part
    };

    const handleDeletePart = async (partId: string) => {
        const success = await removeServicePart(partId);
        if (success) loadData();
    };

    const renderVehicleParts = (parts: any[] = [], serviceId: string, serviceName: string) => {
        return (
            <div>
                {parts.length > 0 ? (
                    <ul className="space-y-2">
                        {parts.map((p) => (
                            <li key={p.serviceTypeVehiclePartId} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                <div>
                                    <span className="font-medium text-[1.3rem]">{p.vehiclePart?.vehiclePartName}</span>{" "}
                                    <span className="text-gray-500 text-[1.2rem]">
                                        (SL: {p.requiredQuantity || 0}, Thời gian: {p.estimatedTimeDefault || 0} phút)
                                    </span>
                                </div>
                                <Popconfirm
                                    title="Xóa phụ tùng"
                                    description="Bạn chắc chắn muốn xóa phụ tùng này khỏi dịch vụ?"
                                    onConfirm={() => handleDeletePart(p.serviceTypeVehiclePartId)}
                                    okText="Đồng ý"
                                    cancelText="Hủy"
                                    placement="left"
                                >
                                    <button className="text-red-500 hover:opacity-80">
                                        <DeleteOutlineIcon className="!w-[1.8rem] !h-[1.8rem]" />
                                    </button>
                                </Popconfirm>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-gray-400 italic text-[1.2rem]">Chưa có phụ tùng</div>
                )}
                <button
                    onClick={() => handleOpenModal(serviceId, serviceName, parts)}
                    className="mt-2 flex items-center gap-1 text-[1.2rem] text-blue-600 hover:text-blue-800 font-[500]"
                >
                    <BuildIcon className="!w-[1.6rem] !h-[1.6rem]" />
                    Thêm phụ tùng
                </button>
            </div>
        );
    };

    const renderChildren = (children: any[] = [], currentPage: number) => {
        if (!children.length) {
            return (
                <tr>
                    <td colSpan={5} className="text-center text-gray-400 italic py-[1rem]">
                        Không có dịch vụ con
                    </td>
                </tr>
            );
        }

        // Paginate children
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedChildren = children.slice(startIndex, endIndex);

        return paginatedChildren.map((child: any, idx: number) => (
            <tr key={child.serviceTypeId} className={`border-b border-gray-200 text-center hover:bg-[#f7f8fc] ${
                child.isActive ? 'bg-[#FBFBFD]' : 'bg-gray-50 opacity-60'
            }`}>
                <td className="p-[1.2rem]">{startIndex + idx + 1}</td>
                <td className="p-[1.2rem] font-[600] text-left">
                    {child.serviceName}
                </td>
                <td className="p-[1.2rem] text-left">{child.description || "-"}</td>
                <td className="p-[1.2rem]">{renderVehicleParts(child.serviceTypeVehiclePartResponses || [], child.serviceTypeId, child.serviceName)}</td>
                <td className="p-[1.2rem] flex justify-center gap-2">
                    <Link
                        to={`/${pathAdmin}/service-type/edit/${child.serviceTypeId}`}
                        className="text-blue-500 hover:opacity-80"
                        title="Chỉnh sửa dịch vụ"
                    >
                        <EditIcon className="!w-[2rem] !h-[2rem]" />
                    </Link>
                </td>
            </tr>
        ));
    };

    const handlePageChange = (parentId: string, newPage: number) => {
        setParentPages(prev => ({
            ...prev,
            [parentId]: newPage
        }));
    };

    const handleParentPageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
        setCurrentParentPage(page);
        setParentPages({}); // Reset sub-service pagination khi chuyển trang parent
    };

    // BE đã filter rồi, không cần filter client-side nữa
    const serviceList = (detail as any)?.data || [];
    const totalParentPages = (detail as any)?.totalPages || 0;

    return (
        <div className="max-w-[1320px] px-[12px] mx-auto">
            <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
                <div className="px-[2.4rem] py-[2.4rem] border-b border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                        <h1 className="text-[2rem] font-[700] text-[#2b2d3b]">Danh sách dịch vụ</h1>
                        <div className="flex gap-2">
                            <button
                                onClick={() => navigate(`/${pathAdmin}/vehicle`)}
                                className="flex items-center gap-2 cursor-pointer text-white text-[1.3rem] font-[500] py-[0.82rem] px-[1.52rem] leading-[1.5] border rounded-[0.64rem] hover:opacity-90 transition-opacity duration-150 ease-in-out bg-[#6c757d] border-[#6c757d] shadow-[0_1px_2px_0_rgba(108,117,125,0.35)]"
                            >
                                <ArrowBackIcon className="!w-[1.6rem] !h-[1.6rem]" />
                                Quay lại
                            </button>
                            <Link
                                to={`/${pathAdmin}/service-type/create?vehicleTypeId=${id}`}
                                className="flex items-center gap-2 cursor-pointer text-white text-[1.3rem] font-[500] py-[0.82rem] px-[1.52rem] leading-[1.5] border rounded-[0.64rem] hover:opacity-90 transition-opacity duration-150 ease-in-out bg-[#22c55e] border-[#22c55e] shadow-[0_1px_2px_0_rgba(34,197,94,0.35)]"
                            >
                                <AddIcon className="!w-[1.6rem] !h-[1.6rem]" />
                                Tạo dịch vụ
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
                        <span className="text-[1.3rem] font-[500] text-gray-700">Hiển thị:</span>
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={showActive}
                                onChange={(e) => setShowActive(e.target.checked)}
                                size="small"
                                sx={{
                                    '& .MuiSwitch-switchBase.Mui-checked': {
                                        color: '#22c55e',
                                    },
                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                        backgroundColor: '#22c55e',
                                    },
                                }}
                            />
                            <span className={`text-[1.3rem] font-[500] ${showActive ? 'text-green-600' : 'text-gray-600'}`}>
                                {showActive ? 'Đang hoạt động' : 'Không hoạt động'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="px-[2.4rem] pb-[2.4rem] h-full">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                                <p className="text-[1.4rem] text-gray-600">Đang tải dữ liệu...</p>
                            </div>
                        </div>
                    ) : serviceList.length === 0 ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <div className="text-[5rem] mb-4">📋</div>
                                <p className="text-[1.6rem] text-gray-600 font-[500] mb-2">
                                    {showActive ? 'Không có dịch vụ đang hoạt động' : 'Không có dịch vụ không hoạt động'}
                                </p>
                                <p className="text-[1.3rem] text-gray-500">
                                    {showActive 
                                        ? 'Thử bật nút "Không hoạt động" để xem các dịch vụ đã tắt' 
                                        : 'Thử bật nút "Đang hoạt động" để xem các dịch vụ đang hoạt động'}
                                </p>
                            </div>
                        </div>
                    ) : (
                        serviceList.map((serviceParent: any) => {
                        const currentPage = parentPages[serviceParent.serviceTypeId] || 1;
                        const totalChildren = serviceParent.children?.length || 0;
                        const totalPages = Math.ceil(totalChildren / pageSize);

                        return (
                            <div
                                key={serviceParent.serviceTypeId}
                                className="mb-[3rem] border border-gray-100 rounded-[10px] shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all"
                            >
                                <div className="p-[1.6rem] border-b bg-[#fafafa] rounded-t-[10px] flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-[0.6rem]">
                                            <h2 className="text-[1.6rem] font-[700] text-[#2b2d3b]">
                                                {serviceParent.serviceName}
                                            </h2>
                                            <span className={`px-3 py-1 text-[1.1rem] font-[500] rounded-full ${
                                                serviceParent.isActive 
                                                    ? 'bg-green-100 text-green-700' 
                                                    : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                {serviceParent.isActive ? '● Hoạt động' : '○ Không hoạt động'}
                                            </span>
                                        </div>
                                        <p className="text-[1.3rem] text-gray-600">{serviceParent.description}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link
                                            to={`/${pathAdmin}/service-type/edit/${serviceParent.serviceTypeId}`}
                                            className="flex items-center gap-1 cursor-pointer text-white text-[1.2rem] font-[500] py-[0.6rem] px-[1.2rem] leading-[1.5] border rounded-[0.64rem] hover:opacity-90 transition-opacity duration-150 ease-in-out bg-[#f59e0b] border-[#f59e0b] shadow-[0_1px_2px_0_rgba(245,158,11,0.35)]"
                                            title="Chỉnh sửa danh mục cha"
                                        >
                                            <EditIcon className="!w-[1.4rem] !h-[1.4rem]" />
                                            Sửa
                                        </Link>
                                        <Link
                                            to={`/${pathAdmin}/service-type/create?vehicleTypeId=${id}&parentId=${serviceParent.serviceTypeId}`}
                                            className="flex items-center gap-1 cursor-pointer text-white text-[1.2rem] font-[500] py-[0.6rem] px-[1.2rem] leading-[1.5] border rounded-[0.64rem] hover:opacity-90 transition-opacity duration-150 ease-in-out bg-[#3b82f6] border-[#3b82f6] shadow-[0_1px_2px_0_rgba(59,130,246,0.35)]"
                                            title="Thêm dịch vụ con"
                                        >
                                            <AddIcon className="!w-[1.4rem] !h-[1.4rem]" />
                                            Thêm dịch vụ con
                                        </Link>
                                    </div>
                                </div>

                                <div className="p-[1.2rem] overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead className="text-[#000000] text-[1.3rem] border-dashed bg-[#f4f6f9]">
                                            <tr>
                                                <th className="p-[1.2rem] font-[500] text-center w-[5%] rounded-l-[8px]">STT</th>
                                                <th className="p-[1.2rem] font-[500] text-center w-[25%]">Tên dịch vụ con</th>
                                                <th className="p-[1.2rem] font-[500] text-center w-[25%]">Mô tả</th>
                                                <th className="p-[1.2rem] font-[500] text-center w-[35%]">Linh kiện sử dụng</th>
                                                <th className="p-[1.2rem] font-[500] text-center w-[10%] rounded-r-[8px]">Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-[#2b2d3b] text-[1.3rem]">
                                            {renderChildren(serviceParent.children, currentPage)}
                                        </tbody>
                                    </table>

                                    {totalChildren > pageSize && (
                                        <Stack spacing={2} className="mt-[1.5rem]">
                                            <Pagination
                                                count={totalPages}
                                                page={currentPage}
                                                color="primary"
                                                onChange={(_, value) => handlePageChange(serviceParent.serviceTypeId, value)}
                                            />
                                        </Stack>
                                    )}
                                </div>
                            </div>
                        );
                    }))}

                    {/* Pagination cho parent services */}
                    {totalParentPages > 1 && (
                        <div className="flex justify-center mt-8 mb-4">
                            <Stack spacing={2}>
                                <Pagination
                                    count={totalParentPages}
                                    page={currentParentPage}
                                    color="primary"
                                    onChange={handleParentPageChange}
                                    showFirstButton
                                    showLastButton
                                    size="large"
                                />
                            </Stack>
                        </div>
                    )}
                </div>
            </Card>

            {/* Modal to add vehicle parts */}
            {selectedService && id && (
                <ServicePartModal
                    open={modalOpen}
                    onClose={handleCloseModal}
                    serviceTypeId={selectedService.id}
                    serviceTypeName={selectedService.name}
                    vehicleTypeId={id}
                    existingPartIds={selectedService.existingPartIds}
                    onSuccess={handlePartSuccess}
                />
            )}
        </div>
    );
};
