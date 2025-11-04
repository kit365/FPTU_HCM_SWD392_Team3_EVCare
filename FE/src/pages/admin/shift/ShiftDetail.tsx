import { Card, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { pathAdmin } from "../../../constants/paths.constant";
import { useShift } from "../../../hooks/useShift";
import { useEffect, useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import VisibilityIcon from "@mui/icons-material/Visibility";
import BuildIcon from "@mui/icons-material/Build";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-toastify";
import type { ShiftResponse } from "../../../types/shift.types";
import type { MaintenanceManagementResponse } from "../../../types/maintenance-management.types";
import { useAuthContext } from "../../../context/useAuthContext";
import { maintenanceManagementService } from "../../../service/maintenanceManagementService";
import { serviceTypeService } from "../../../service/serviceTypeService";
import { vehiclePartService } from "../../../service/vehiclePartService";
import type { ServiceTypeResponse } from "../../../types/service-type.types";
import type { VehiclePartResponse } from "../../../types/vehicle-part.types";


export const ShiftDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getById: getShiftById } = useShift();
  const { user } = useAuthContext();
  
  const [shift, setShift] = useState<ShiftResponse | null>(null);
  const [tasks, setTasks] = useState<MaintenanceManagementResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<MaintenanceManagementResponse | null>(null);
  
  // Form states for add/edit
  const [serviceTypes, setServiceTypes] = useState<ServiceTypeResponse[]>([]);
  const [selectedServiceTypeId, setSelectedServiceTypeId] = useState<string>("");
  const [vehicleParts, setVehicleParts] = useState<VehiclePartResponse[]>([]);
  const [selectedVehicleParts, setSelectedVehicleParts] = useState<Array<{partId: string; quantity: number}>>([]);
  const [selectedPartId, setSelectedPartId] = useState<string>(""); // For dropdown selection
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Phân biệt role
  const isTechnician = user?.roleName?.includes("TECHNICIAN");
  const isStaffOrAdmin = user?.roleName?.includes("ADMIN") || user?.roleName?.includes("STAFF");
  const canManageTasks = isStaffOrAdmin || isTechnician; // Cho phép ADMIN/STAFF cũng quản lý

  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        toast.error("Không tìm thấy ID ca làm việc!");
        // Navigate về trang tương ứng theo role
        navigate(isTechnician ? `/${pathAdmin}/schedule` : `/${pathAdmin}/shift`);
        return;
      }

      setLoading(true);
      const shiftData = await getShiftById(id);
      if (shiftData) {
        setShift(shiftData);
        
        // Fetch tasks nếu có appointment (cho cả TECHNICIAN và ADMIN/STAFF)
        if (shiftData.appointment?.appointmentId) {
          try {
            // Nếu là TECHNICIAN, dùng searchByTechnician
            if (isTechnician && user?.userId) {
              const response = await maintenanceManagementService.searchByTechnician(
                user.userId,
                {
                  appointmentId: shiftData.appointment.appointmentId,
                  page: 0,
                  pageSize: 100
                }
              );
              setTasks(response.data || []);
            } else if (isStaffOrAdmin) {
              // ADMIN/STAFF: fetch tất cả maintenance managements của appointment này
              // Có thể cần tạo endpoint mới hoặc dùng search với appointmentId filter
              // Tạm thời dùng searchByTechnician với technicianId đầu tiên trong shift
              if (shiftData.technicians && shiftData.technicians.length > 0) {
                const response = await maintenanceManagementService.searchByTechnician(
                  shiftData.technicians[0].userId,
                  {
                    appointmentId: shiftData.appointment.appointmentId,
                    page: 0,
                    pageSize: 100
                  }
                );
                setTasks(response.data || []);
              }
            }
          } catch (error) {
            console.error("Failed to fetch maintenance tasks:", error);
            toast.error("Không thể tải danh sách công việc!");
            setTasks([]);
          }
        }
      } else {
        // Navigate về trang tương ứng theo role
        navigate(isTechnician ? `/${pathAdmin}/schedule` : `/${pathAdmin}/shift`);
      }
      setLoading(false);
    };

    loadData();
  }, [id, getShiftById, navigate, isTechnician, user?.userId]);

  // Format shift type to Vietnamese
  const formatShiftType = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'APPOINTMENT': 'Theo lịch hẹn',
      'ON_DUTY': 'Trực',
      'INVENTORY_CHECK': 'Kiểm kê',
      'OTHER': 'Khác'
    };
    return typeMap[type] || type;
  };

  // Format status to Vietnamese
  const formatStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'SCHEDULED': 'Đã lên lịch',
      'IN_PROGRESS': 'Đang thực hiện',
      'COMPLETED': 'Hoàn thành',
      'CANCELLED': 'Đã hủy'
    };
    return statusMap[status] || status;
  };

  // Format datetime
  const formatDateTime = (dateTimeStr: string | null | undefined) => {
    if (!dateTimeStr) return 'N/A';
    try {
      const date = new Date(dateTimeStr);
      return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  const handleBack = () => {
    // Technician back về "Ca làm của tôi", Staff/Admin back về "Quản lý ca làm"
    if (isTechnician) {
      navigate(`/${pathAdmin}/schedule`);
    } else {
      navigate(`/${pathAdmin}/shift`);
    }
  };

  const handleEdit = () => {
    navigate(`/${pathAdmin}/shift/edit/${id}`);
  };

  // Load service types when opening add modal
  const loadServiceTypes = async () => {
    if (!shift?.appointment?.vehicleTypeResponse?.vehicleTypeId) {
      toast.error("Không tìm thấy thông tin loại xe");
      return;
    }

    try {
      const response = await serviceTypeService.getParentsByVehicleTypeId(
        shift.appointment.vehicleTypeResponse.vehicleTypeId
      );
      setServiceTypes(response || []);
    } catch (error: any) {
      toast.error("Không thể tải danh sách dịch vụ");
      console.error(error);
    }
  };

  // Load vehicle parts when service type is selected
  const loadVehicleParts = async () => {
    if (!shift?.appointment?.vehicleTypeResponse?.vehicleTypeId) {
      return;
    }

    try {
      const parts = await vehiclePartService.getByVehicleTypeId(
        shift.appointment.vehicleTypeResponse.vehicleTypeId
      );
      setVehicleParts(parts || []);
    } catch (error: any) {
      toast.error("Không thể tải danh sách phụ tùng");
      console.error(error);
    }
  };

  // Handle open add modal
  const handleOpenAddModal = async () => {
    setOpenAddModal(true);
    // Clear previous selection
    setSelectedServiceTypeId("");
    setSelectedVehicleParts([]);
    setSelectedPartId("");
    setNotes("");
    await loadServiceTypes();
    await loadVehicleParts();
    // Set default times from shift
    if (shift?.startTime) {
      setStartTime(new Date(shift.startTime).toISOString().slice(0, 16));
    }
    if (shift?.endTime) {
      setEndTime(new Date(shift.endTime).toISOString().slice(0, 16));
    }
  };

  // Handle close add modal
  const handleCloseAddModal = () => {
    setOpenAddModal(false);
    setSelectedServiceTypeId("");
    setSelectedVehicleParts([]);
    setSelectedPartId("");
    setStartTime("");
    setEndTime("");
    setNotes("");
  };

  // Handle open edit modal
  const handleOpenEditModal = (task: MaintenanceManagementResponse) => {
    setSelectedTask(task);
    setOpenEditModal(true);
    setSelectedServiceTypeId(task.serviceTypeResponse?.serviceTypeId || "");
    // Pre-fill form with task data
    if (task.startTime) {
      setStartTime(new Date(task.startTime).toISOString().slice(0, 16));
    }
    if (task.endTime) {
      setEndTime(new Date(task.endTime).toISOString().slice(0, 16));
    }
    setNotes(task.notes || "");
  };

  // Handle close edit modal
  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setSelectedTask(null);
    setSelectedServiceTypeId("");
    setStartTime("");
    setEndTime("");
    setNotes("");
  };

  // Handle open delete modal
  const handleOpenDeleteModal = (task: MaintenanceManagementResponse) => {
    setSelectedTask(task);
    setOpenDeleteModal(true);
  };

  // Handle close delete modal
  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setSelectedTask(null);
  };

  // Check if service type is already used
  const isServiceTypeAlreadyUsed = (serviceTypeId: string) => {
    return tasks.some(task => task.serviceTypeResponse?.serviceTypeId === serviceTypeId);
  };

  // Handle create maintenance management
  const handleCreateMaintenanceManagement = async () => {
    if (!shift?.appointment?.appointmentId) {
      toast.error("Không tìm thấy thông tin cuộc hẹn");
      return;
    }

    if (!selectedServiceTypeId) {
      toast.error("Vui lòng chọn dịch vụ");
      return;
    }

    // Check if service type is already used
    if (isServiceTypeAlreadyUsed(selectedServiceTypeId)) {
      const serviceName = serviceTypes.find(st => st.serviceTypeId === selectedServiceTypeId)?.serviceName || "Dịch vụ này";
      toast.error(`Dịch vụ "${serviceName}" đã được sử dụng cho cuộc hẹn này. Vui lòng chọn dịch vụ khác.`);
      return;
    }

    if (!startTime || !endTime) {
      toast.error("Vui lòng nhập thời gian bắt đầu và kết thúc");
      return;
    }

    if (selectedVehicleParts.length === 0) {
      toast.error("Vui lòng thêm ít nhất một phụ tùng");
      return;
    }

    setCreating(true);
    try {
      const requestData = {
        appointmentId: shift.appointment.appointmentId,
        serviceTypeId: selectedServiceTypeId,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        totalCost: 0, // Will be calculated by backend
        notes: notes || null,
        creationMaintenanceRecordRequests: selectedVehicleParts.map(vp => ({
          vehiclePartInventoryId: vp.partId,
          quantityUsed: vp.quantity,
          approvedByUser: false
        }))
      };

      await maintenanceManagementService.create(requestData);
      toast.success("Tạo công việc bảo dưỡng thành công!");
      
      // Reload tasks
      await reloadTasks();
      
      handleCloseAddModal();
    } catch (error: any) {
      console.error("Error creating maintenance management:", error);
      console.error("Error response:", error?.response);
      console.error("Error response data:", error?.response?.data);
      
      // Extract error message from different possible locations
      const errorMessage = error?.response?.data?.message 
        || error?.response?.data?.error 
        || error?.message 
        || "Không thể tạo công việc bảo dưỡng";
      
      toast.error(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  // Handle update maintenance management (set status to IN_PROGRESS)
  const handleUpdateMaintenanceManagement = async () => {
    if (!selectedTask) return;

    setUpdating(true);
    try {
      // Update status to IN_PROGRESS
      await maintenanceManagementService.updateStatus(selectedTask.maintenanceManagementId, "IN_PROGRESS");
      toast.success("Đã cập nhật công việc bảo dưỡng và chuyển sang trạng thái Đang thực hiện!");
      
      // Reload tasks
      await reloadTasks();
      
      handleCloseEditModal();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể cập nhật công việc bảo dưỡng");
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  // Handle delete maintenance management
  const handleDeleteMaintenanceManagement = async () => {
    if (!selectedTask) return;

    setDeleting(true);
    try {
      await maintenanceManagementService.delete(selectedTask.maintenanceManagementId);
      toast.success("Đã xóa công việc bảo dưỡng!");
      
      // Reload tasks
      await reloadTasks();
      
      handleCloseDeleteModal();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể xóa công việc bảo dưỡng");
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

  // Handle select vehicle part from dropdown
  const handleSelectVehiclePart = (partId: string) => {
    if (!partId) return;

    // Check if part is already in the list
    if (selectedVehicleParts.some(vp => vp.partId === partId)) {
      toast.warning("Phụ tùng này đã được thêm vào danh sách");
      setSelectedPartId("");
      return;
    }

    // Add the selected part to the list
    setSelectedVehicleParts([...selectedVehicleParts, {
      partId: partId,
      quantity: 1
    }]);
    
    // Reset dropdown
    setSelectedPartId("");
  };

  // Remove vehicle part from form
  const handleRemoveVehiclePart = (index: number) => {
    setSelectedVehicleParts(selectedVehicleParts.filter((_, i) => i !== index));
  };

  // Update vehicle part quantity
  const handleUpdateVehiclePartQuantity = (index: number, quantity: number) => {
    const updated = [...selectedVehicleParts];
    updated[index].quantity = Math.max(1, quantity);
    setSelectedVehicleParts(updated);
  };

  // Helper function to reload tasks
  const reloadTasks = async () => {
    if (!shift?.appointment?.appointmentId) return;

    try {
      if (isTechnician && user?.userId) {
        const response = await maintenanceManagementService.searchByTechnician(
          user.userId,
          {
            appointmentId: shift.appointment.appointmentId,
            page: 0,
            pageSize: 100
          }
        );
        setTasks(response.data || []);
      } else if (isStaffOrAdmin && shift.technicians && shift.technicians.length > 0) {
        const response = await maintenanceManagementService.searchByTechnician(
          shift.technicians[0].userId,
          {
            appointmentId: shift.appointment.appointmentId,
            page: 0,
            pageSize: 100
          }
        );
        setTasks(response.data || []);
      }
    } catch (error) {
      console.error("Failed to reload tasks:", error);
    }
  };

  // Clear selectedServiceTypeId if it becomes used after tasks update
  useEffect(() => {
    if (selectedServiceTypeId && tasks.some(task => task.serviceTypeResponse?.serviceTypeId === selectedServiceTypeId)) {
      setSelectedServiceTypeId("");
    }
  }, [tasks, selectedServiceTypeId]);

  if (loading) {
    return (
      <div className="max-w-[1320px] px-[12px] mx-auto">
        <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
          <div className="p-[2.4rem] text-center">
            <p className="text-[1.4rem] text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!shift) {
    return null;
  }

  return (
    <div className="max-w-[1320px] px-[12px] mx-auto">
      <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
        <div className="p-[2.4rem]">
          {/* Header */}
          <div className="flex items-center justify-between mb-[2.4rem]">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="flex items-center justify-center w-[3.6rem] h-[3.6rem] rounded-[0.8rem] bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <ArrowBackIcon sx={{ fontSize: "2rem", color: "#6c757d" }} />
              </button>
              <div>
                <h2 className="text-admin-secondary text-[1.8rem] font-[700] leading-[1.2]">
                  Chi tiết ca làm việc
                </h2>
                <p className="text-[1.3rem] text-gray-600 mt-1">
                  Thông tin chi tiết của ca làm việc
                </p>
              </div>
            </div>
            {/* Nút Chỉnh sửa - CHỈ cho ADMIN/STAFF */}
            {isStaffOrAdmin && (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-[1.6rem] py-[1rem] text-[1.3rem] font-[500] text-white bg-blue-500 rounded-[0.64rem] hover:bg-blue-600 transition-colors"
              >
                <EditIcon sx={{ fontSize: "1.8rem" }} />
                Chỉnh sửa
              </button>
            )}
          </div>

          {/* Shift Information */}
          <div className="space-y-[2rem]">
            {/* Appointment Information */}
            <div className="bg-gray-50 p-[2rem] rounded-[0.8rem]">
              <h3 className="text-[1.5rem] font-[600] text-gray-800 mb-[1.6rem]">
                Thông tin cuộc hẹn
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.6rem]">
                <div>
                  <p className="text-[1.2rem] text-gray-500 mb-[0.4rem]">Khách hàng</p>
                  <p className="text-[1.4rem] font-[500] text-gray-800">
                    {shift.appointment?.customerFullName || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-[1.2rem] text-gray-500 mb-[0.4rem]">Biển số xe</p>
                  <p className="text-[1.4rem] font-[500] text-gray-800">
                    {shift.appointment?.vehicleNumberPlate || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-[1.2rem] text-gray-500 mb-[0.4rem]">Loại xe</p>
                  <p className="text-[1.4rem] font-[500] text-gray-800">
                    {shift.appointment?.vehicleTypeResponse?.vehicleTypeName || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-[1.2rem] text-gray-500 mb-[0.4rem]">Chế độ dịch vụ</p>
                  <p className="text-[1.4rem] font-[500] text-gray-800">
                    {shift.appointment?.serviceMode === 'STATIONARY' ? 'Tại trung tâm' : 
                     shift.appointment?.serviceMode === 'MOBILE' ? 'Di động' : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Service Types & Quote Price - HIDDEN */}
              {/* {shift.appointment?.serviceTypeResponses && shift.appointment.serviceTypeResponses.length > 0 && (
                <div className="mt-[1.6rem] pt-[1.6rem] border-t border-gray-200">
                  <p className="text-[1.2rem] text-gray-500 mb-[0.8rem]">Dịch vụ yêu cầu</p>
                  <div className="flex flex-wrap gap-2 mb-[1.2rem]">
                    {shift.appointment.serviceTypeResponses.map((service: any) => (
                      <span
                        key={service.serviceTypeId}
                        className="inline-block px-3 py-1.5 text-[1.3rem] bg-blue-100 text-blue-800 rounded-lg font-[500]"
                      >
                        {service.serviceName}
                      </span>
                    ))}
                  </div>
                  {shift.appointment?.quotePrice && (
                    <div className="mt-[1.2rem]">
                      <p className="text-[1.2rem] text-gray-500 mb-[0.4rem]">Giá tạm tính</p>
                      <p className="text-[1.6rem] font-[600] text-green-600">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(shift.appointment.quotePrice)}
                      </p>
                    </div>
                  )}
                </div>
              )} */}
            </div>

            {/* Shift Details */}
            <div className="bg-white border border-gray-200 p-[2rem] rounded-[0.8rem]">
              <h3 className="text-[1.5rem] font-[600] text-gray-800 mb-[1.6rem]">
                Thông tin ca làm việc
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.6rem]">
                <div>
                  <p className="text-[1.2rem] text-gray-500 mb-[0.4rem]">Loại ca</p>
                  <p className="text-[1.4rem] font-[500] text-gray-800">
                    {formatShiftType(shift.shiftType)}
                  </p>
                </div>
                <div>
                  <p className="text-[1.2rem] text-gray-500 mb-[0.4rem]">Trạng thái</p>
                  <span className={`inline-block px-[1.2rem] py-[0.4rem] text-[1.2rem] font-[500] rounded-[0.4rem] ${
                    shift.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    shift.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                    shift.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {formatStatus(shift.status)}
                  </span>
                </div>
                <div>
                  <p className="text-[1.2rem] text-gray-500 mb-[0.4rem]">Thời gian bắt đầu</p>
                  <p className="text-[1.4rem] font-[500] text-gray-800">
                    {formatDateTime(shift.startTime)}
                  </p>
                </div>
                <div>
                  <p className="text-[1.2rem] text-gray-500 mb-[0.4rem]">Thời gian kết thúc</p>
                  <p className="text-[1.4rem] font-[500] text-gray-800">
                    {formatDateTime(shift.endTime)}
                  </p>
                </div>
                <div>
                  <p className="text-[1.2rem] text-gray-500 mb-[0.4rem]">Tổng số giờ</p>
                  <p className="text-[1.4rem] font-[500] text-gray-800">
                    {shift.totalHours ? `${shift.totalHours} giờ` : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-[1.2rem] text-gray-500 mb-[0.4rem]">Trạng thái hoạt động</p>
                  <span className={`inline-block px-[1.2rem] py-[0.4rem] text-[1.2rem] font-[500] rounded-[0.4rem] ${
                    shift.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {shift.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                  </span>
                </div>
              </div>

              {/* Notes */}
              {shift.notes && (
                <div className="mt-[1.6rem] pt-[1.6rem] border-t border-gray-200">
                  <p className="text-[1.2rem] text-gray-500 mb-[0.8rem]">Ghi chú</p>
                  <p className="text-[1.4rem] text-gray-800 whitespace-pre-wrap">
                    {shift.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Staff Information */}
            <div className="bg-white border border-gray-200 p-[2rem] rounded-[0.8rem]">
              <h3 className="text-[1.5rem] font-[600] text-gray-800 mb-[1.6rem]">
                Nhân viên được phân công
              </h3>
              <div className="space-y-[1.6rem]">
                {/* Assignee - Người phụ trách chính */}
                <div>
                  <p className="text-[1.2rem] text-gray-500 mb-[0.8rem]">Người phụ trách chính</p>
                  {shift.assignee ? (
                    <div className="p-[1.6rem] bg-blue-50 border border-blue-200 rounded-[0.8rem]">
                      <p className="text-[1.4rem] font-[500] text-gray-800">
                        {shift.assignee.fullName || shift.assignee.username}
                      </p>
                      <p className="text-[1.2rem] text-gray-500 mt-[0.4rem]">
                        {shift.assignee.email}
                      </p>
                    </div>
                  ) : (
                    <div className="p-[1.6rem] bg-gray-50 border border-gray-300 rounded-[0.8rem]">
                      <p className="text-[1.4rem] text-gray-500 italic">Chưa phân công</p>
                    </div>
                  )}
                </div>

                {/* Staff - Nhân viên hỗ trợ */}
                <div>
                  <p className="text-[1.2rem] text-gray-500 mb-[0.8rem]">Nhân viên hỗ trợ</p>
                  {shift.staff ? (
                    <div className="p-[1.6rem] bg-gray-50 rounded-[0.8rem]">
                      <p className="text-[1.4rem] font-[500] text-gray-800">
                        {shift.staff.fullName || shift.staff.username}
                      </p>
                      <p className="text-[1.2rem] text-gray-500 mt-[0.4rem]">
                        {shift.staff.email}
                      </p>
                    </div>
                  ) : (
                    <div className="p-[1.6rem] bg-gray-50 border border-gray-300 rounded-[0.8rem]">
                      <p className="text-[1.4rem] text-gray-500 italic">Chưa có nhân viên hỗ trợ</p>
                    </div>
                  )}
                </div>

                {/* Technicians - Kỹ thuật viên */}
                <div>
                  <p className="text-[1.2rem] text-gray-500 mb-[0.8rem]">Kỹ thuật viên</p>
                  {shift.technicians && shift.technicians.length > 0 ? (
                    <div className="space-y-[1.2rem]">
                      {shift.technicians.map((technician, index) => (
                        <div key={technician.userId} className="p-[1.6rem] bg-gray-50 rounded-[0.8rem]">
                          <p className="text-[1.4rem] font-[500] text-gray-800">
                            {index + 1}. {technician.fullName || technician.username}
                          </p>
                          <p className="text-[1.2rem] text-gray-500 mt-[0.4rem]">
                            {technician.email}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-[1.6rem] bg-gray-50 border border-gray-300 rounded-[0.8rem]">
                      <p className="text-[1.4rem] text-gray-500 italic">Chưa có kỹ thuật viên</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Audit Information */}
            <div className="bg-gray-50 p-[2rem] rounded-[0.8rem]">
              <h3 className="text-[1.5rem] font-[600] text-gray-800 mb-[1.6rem]">
                Thông tin hệ thống
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.6rem]">
                <div>
                  <p className="text-[1.2rem] text-gray-500 mb-[0.4rem]">Ngày tạo</p>
                  <p className="text-[1.4rem] font-[500] text-gray-800">
                    {formatDateTime(shift.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-[1.2rem] text-gray-500 mb-[0.4rem]">Ngày cập nhật</p>
                  <p className="text-[1.4rem] font-[500] text-gray-800">
                    {formatDateTime(shift.updatedAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Tasks / Maintenance Managements - Hiển thị cho TECHNICIAN và ADMIN/STAFF */}
            {canManageTasks && shift?.appointment?.appointmentId && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-[2rem] rounded-[0.8rem] border-2 border-blue-200">
              <div className="flex items-center justify-between mb-[1.6rem]">
                <div>
                  <h3 className="text-[1.6rem] font-[700] text-blue-900 flex items-center gap-2">
                    <BuildIcon sx={{ fontSize: "2rem" }} />
                    Công việc phải làm
                  </h3>
                  <p className="text-[1.2rem] text-blue-700 mt-[0.4rem]">
                    Danh sách bảo dưỡng trong ca làm này
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {tasks.length > 0 && (
                    <div className="px-[1.6rem] py-[0.8rem] bg-blue-600 text-white rounded-full text-[1.4rem] font-[600]">
                      {tasks.length} công việc
                    </div>
                  )}
                  {/* Nút Thêm - cho cả ADMIN/STAFF và TECHNICIAN */}
                  {canManageTasks && (
                    <button
                      onClick={handleOpenAddModal}
                      className="flex items-center gap-2 px-[1.6rem] py-[0.8rem] text-[1.3rem] font-[500] text-white bg-green-500 rounded-[0.8rem] hover:bg-green-600 transition-colors"
                    >
                      <AddIcon sx={{ fontSize: "1.8rem" }} />
                      Thêm
                    </button>
                  )}
                </div>
              </div>

              {tasks.length === 0 ? (
                <div className="bg-white p-[2.4rem] rounded-[0.8rem] text-center border border-blue-200">
                  <BuildIcon sx={{ fontSize: "4rem", color: "#cbd5e1" }} />
                  <p className="text-[1.4rem] text-gray-500 mt-[1.2rem]">
                    Chưa có công việc nào trong ca này
                  </p>
                </div>
              ) : (
                <div className="space-y-[1.2rem]">
                  {tasks.map((task) => {
                    const getStatusStyles = (status: string) => {
                      switch (status) {
                        case "PENDING":
                          return {
                            bg: "bg-orange-50",
                            border: "border-orange-300",
                            badge: "bg-orange-500 text-white",
                            button: "bg-orange-500 hover:bg-orange-600",
                            icon: <PlayArrowIcon />,
                            label: "Bắt đầu"
                          };
                        case "IN_PROGRESS":
                          return {
                            bg: "bg-blue-50",
                            border: "border-blue-300",
                            badge: "bg-blue-500 text-white",
                            button: "bg-blue-500 hover:bg-blue-600",
                            icon: <BuildIcon />,
                            label: "Tiếp tục"
                          };
                        case "COMPLETED":
                          return {
                            bg: "bg-green-50",
                            border: "border-green-300",
                            badge: "bg-green-500 text-white",
                            button: "bg-gray-400 hover:bg-gray-500",
                            icon: <VisibilityIcon />,
                            label: "Xem"
                          };
                        default:
                          return {
                            bg: "bg-gray-50",
                            border: "border-gray-300",
                            badge: "bg-gray-500 text-white",
                            button: "bg-gray-500 hover:bg-gray-600",
                            icon: <VisibilityIcon />,
                            label: "Xem"
                          };
                      }
                    };

                    const styles = getStatusStyles(task.status);

                    return (
                      <div
                        key={task.maintenanceManagementId}
                        className={`${styles.bg} border-2 ${styles.border} p-[1.6rem] rounded-[0.8rem] hover:shadow-md transition-shadow`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-[1.2rem] mb-[1.2rem]">
                              <h4 className="text-[1.5rem] font-[600] text-gray-800">
                                {task.serviceTypeResponse?.serviceName || "Dịch vụ"}
                              </h4>
                              <span className={`px-[1.2rem] py-[0.4rem] ${styles.badge} rounded-full text-[1.2rem] font-[500]`}>
                                {task.status === "PENDING" ? "Chờ bắt đầu" :
                                 task.status === "IN_PROGRESS" ? "Đang làm" :
                                 task.status === "COMPLETED" ? "Hoàn thành" : task.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.2rem] text-[1.3rem] text-gray-700">
                              <div>
                                <span className="text-gray-500">Khách hàng: </span>
                                <span className="font-[500]">
                                  {task.appointmentResponse?.customerFullName || "N/A"}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">Xe: </span>
                                <span className="font-[500]">
                                  {task.appointmentResponse?.vehicleNumberPlate || "N/A"}
                                </span>
                              </div>
                              {task.totalCost && (
                                <div className="md:col-span-2">
                                  <span className="text-gray-500">Chi phí: </span>
                                  <span className="font-[600] text-green-600">
                                    {task.totalCost.toLocaleString("vi-VN")} ₫
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 ml-[1.6rem]">
                            <button
                              onClick={() => navigate(`/${pathAdmin}/maintenance/${task.maintenanceManagementId}`)}
                              className={`${styles.button} text-white px-[2rem] py-[1rem] rounded-[0.8rem] font-[500] text-[1.3rem] transition-colors flex items-center gap-2`}
                            >
                              {styles.icon}
                              {styles.label}
                            </button>
                            
                            {/* Nút Sửa và Xóa - cho cả ADMIN/STAFF và TECHNICIAN */}
                            {canManageTasks && task.status !== "COMPLETED" && (
                              <>
                                <button
                                  onClick={() => handleOpenEditModal(task)}
                                  className="flex items-center justify-center w-[4rem] h-[4rem] bg-blue-500 text-white rounded-[0.8rem] hover:bg-blue-600 transition-colors"
                                  title="Chỉnh sửa"
                                >
                                  <EditIcon sx={{ fontSize: "1.8rem" }} />
                                </button>
                                <button
                                  onClick={() => handleOpenDeleteModal(task)}
                                  className="flex items-center justify-center w-[4rem] h-[4rem] bg-red-500 text-white rounded-[0.8rem] hover:bg-red-600 transition-colors"
                                  title="Xóa"
                                >
                                  <DeleteIcon sx={{ fontSize: "1.8rem" }} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            )}
          </div>
        </div>
      </Card>

      {/* Add Maintenance Management Modal */}
      <Dialog open={openAddModal} onClose={handleCloseAddModal} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontSize: "1.6rem", fontWeight: 700, color: "#1976d2" }}>
          Thêm công việc bảo dưỡng mới
        </DialogTitle>
        <DialogContent>
          <div className="space-y-4 mt-4">
            {/* Service Type Selection */}
            <FormControl fullWidth>
              <InputLabel>Dịch vụ *</InputLabel>
              <Select
                value={selectedServiceTypeId}
                onChange={(e) => {
                  const serviceId = e.target.value;
                  // Check if service type is already used
                  if (isServiceTypeAlreadyUsed(serviceId)) {
                    const serviceName = serviceTypes.find(st => st.serviceTypeId === serviceId)?.serviceName || "Dịch vụ này";
                    toast.warning(`Dịch vụ "${serviceName}" đã được sử dụng. Vui lòng chọn dịch vụ khác.`);
                    return;
                  }
                  setSelectedServiceTypeId(serviceId);
                }}
                label="Dịch vụ *"
              >
                {serviceTypes.map((st) => {
                  const isUsed = isServiceTypeAlreadyUsed(st.serviceTypeId);
                  return (
                    <MenuItem 
                      key={st.serviceTypeId} 
                      value={st.serviceTypeId}
                      disabled={isUsed}
                      sx={{
                        opacity: isUsed ? 0.5 : 1,
                        cursor: isUsed ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {st.serviceName} {isUsed && "(Đã sử dụng)"}
                    </MenuItem>
                  );
                })}
              </Select>
              {serviceTypes.length > 0 && serviceTypes.every(st => isServiceTypeAlreadyUsed(st.serviceTypeId)) && (
                <p className="text-[1.1rem] text-red-500 mt-1">
                  ⚠️ Tất cả dịch vụ đã được sử dụng cho cuộc hẹn này
                </p>
              )}
            </FormControl>

            {/* Start Time */}
            <TextField
              fullWidth
              type="datetime-local"
              label="Thời gian bắt đầu *"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />

            {/* End Time */}
            <TextField
              fullWidth
              type="datetime-local"
              label="Thời gian kết thúc *"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />

            {/* Vehicle Parts */}
            <div>
              <label className="text-[1.3rem] font-[500] mb-2 block">Phụ tùng sử dụng *</label>
              
              {/* Dropdown to select vehicle part */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Chọn phụ tùng</InputLabel>
                <Select
                  value={selectedPartId}
                  onChange={(e) => handleSelectVehiclePart(e.target.value)}
                  label="Chọn phụ tùng"
                  disabled={selectedVehicleParts.length >= vehicleParts.length}
                >
                  {vehicleParts
                    .filter(part => !selectedVehicleParts.some(vp => vp.partId === part.vehiclePartId))
                    .map((part) => (
                      <MenuItem key={part.vehiclePartId} value={part.vehiclePartId}>
                        {part.vehiclePartName} - {part.unitPrice?.toLocaleString("vi-VN")} ₫/cái 
                        {part.currentQuantity !== undefined && ` (Tồn kho: ${part.currentQuantity})`}
                      </MenuItem>
                    ))}
                </Select>
                {selectedVehicleParts.length >= vehicleParts.length && (
                  <p className="text-[1.1rem] text-gray-500 mt-1">
                    Đã thêm tất cả phụ tùng có sẵn
                  </p>
                )}
              </FormControl>

              {/* List of selected vehicle parts */}
              {selectedVehicleParts.length === 0 ? (
                <p className="text-gray-500 text-[1.2rem]">Chưa có phụ tùng nào. Vui lòng chọn phụ tùng từ dropdown trên.</p>
              ) : (
                <div className="space-y-2">
                  {selectedVehicleParts.map((vp, index) => {
                    const part = vehicleParts.find(p => p.vehiclePartId === vp.partId);
                    return (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <div className="flex-1">
                          <p className="font-[500]">{part?.vehiclePartName || "N/A"}</p>
                          <p className="text-[1.1rem] text-gray-600">
                            {part?.unitPrice?.toLocaleString("vi-VN")} ₫/cái
                            {part?.currentQuantity !== undefined && (
                              <span className="ml-2 text-blue-600">
                                (Tồn kho: {part.currentQuantity})
                              </span>
                            )}
                          </p>
                        </div>
                        <TextField
                          type="number"
                          size="small"
                          label="Số lượng"
                          value={vp.quantity}
                          onChange={(e) => handleUpdateVehiclePartQuantity(index, parseInt(e.target.value) || 1)}
                          inputProps={{ 
                            min: 1, 
                            max: part?.currentQuantity ? part.currentQuantity : undefined 
                          }}
                          sx={{ width: "120px" }}
                        />
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleRemoveVehiclePart(index)}
                        >
                          <DeleteIcon />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Notes */}
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Ghi chú"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddModal} disabled={creating}>
            Hủy
          </Button>
          <Button
            onClick={handleCreateMaintenanceManagement}
            variant="contained"
            disabled={
              creating || 
              !selectedServiceTypeId || 
              !startTime || 
              !endTime || 
              selectedVehicleParts.length === 0 ||
              isServiceTypeAlreadyUsed(selectedServiceTypeId)
            }
            sx={{ backgroundColor: "#4caf50" }}
          >
            {creating ? "Đang tạo..." : "Tạo"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Maintenance Management Modal */}
      <Dialog open={openEditModal} onClose={handleCloseEditModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: "1.6rem", fontWeight: 700, color: "#1976d2" }}>
          Chỉnh sửa công việc bảo dưỡng
        </DialogTitle>
        <DialogContent>
          <div className="space-y-4 mt-4">
            <p className="text-[1.3rem] text-gray-700">
              Dịch vụ: <strong>{selectedTask?.serviceTypeResponse?.serviceName || "N/A"}</strong>
            </p>
            <p className="text-[1.2rem] text-gray-600">
              Khi lưu, công việc này sẽ được chuyển sang trạng thái <strong>"Đang thực hiện"</strong>
            </p>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditModal} disabled={updating}>
            Hủy
          </Button>
          <Button
            onClick={handleUpdateMaintenanceManagement}
            variant="contained"
            disabled={updating}
            sx={{ backgroundColor: "#1976d2" }}
          >
            {updating ? "Đang cập nhật..." : "Lưu và chuyển trạng thái"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={openDeleteModal} onClose={handleCloseDeleteModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: "1.6rem", fontWeight: 700, color: "#d32f2f" }}>
          Xác nhận xóa
        </DialogTitle>
        <DialogContent>
          <div className="space-y-4 mt-4">
            <p className="text-[1.3rem] text-gray-700">
              Bạn có chắc chắn muốn xóa công việc bảo dưỡng này?
            </p>
            {selectedTask && (
              <div className="p-3 bg-gray-50 rounded">
                <p className="font-[500] text-[1.3rem]">
                  {selectedTask.serviceTypeResponse?.serviceName || "N/A"}
                </p>
                <p className="text-[1.2rem] text-gray-600 mt-1">
                  Trạng thái: {selectedTask.status === "PENDING" ? "Chờ bắt đầu" :
                               selectedTask.status === "IN_PROGRESS" ? "Đang làm" :
                               selectedTask.status === "COMPLETED" ? "Hoàn thành" : selectedTask.status}
                </p>
              </div>
            )}
            <p className="text-[1.2rem] text-red-600 font-[500]">
              ⚠️ Hành động này không thể hoàn tác!
            </p>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteModal} disabled={deleting}>
            Hủy
          </Button>
          <Button
            onClick={handleDeleteMaintenanceManagement}
            variant="contained"
            disabled={deleting}
            sx={{ backgroundColor: "#d32f2f" }}
          >
            {deleting ? "Đang xóa..." : "Xác nhận xóa"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ShiftDetail;

