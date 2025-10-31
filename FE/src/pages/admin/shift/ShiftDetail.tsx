import { Card } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { pathAdmin } from "../../../constants/paths.constant";
import { useShift } from "../../../hooks/useShift";
import { useEffect, useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import VisibilityIcon from "@mui/icons-material/Visibility";
import BuildIcon from "@mui/icons-material/Build";
import { toast } from "react-toastify";
import type { ShiftResponse } from "../../../types/shift.types";
import type { MaintenanceManagementResponse } from "../../../types/maintenance-management.types";
import { useAuthContext } from "../../../context/useAuthContext";
import { maintenanceManagementService } from "../../../service/maintenanceManagementService";


export const ShiftDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getById: getShiftById } = useShift();
  const { user } = useAuthContext();
  
  const [shift, setShift] = useState<ShiftResponse | null>(null);
  const [tasks, setTasks] = useState<MaintenanceManagementResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Phân biệt role
  const isTechnician = user?.roleName?.includes("TECHNICIAN");
  const isStaffOrAdmin = user?.roleName?.includes("ADMIN") || user?.roleName?.includes("STAFF");

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
        
        // CHỈ fetch tasks nếu là TECHNICIAN và có appointment
        if (isTechnician && shiftData.appointment?.appointmentId && user?.userId) {
          try {
            // Fetch MaintenanceManagements theo appointmentId
            const response = await maintenanceManagementService.searchByTechnician(
              user.userId,
              {
                appointmentId: shiftData.appointment.appointmentId,
                page: 0,
                pageSize: 100
              }
            );
            setTasks(response.data || []);
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

            {/* Tasks / Maintenance Managements - CHỈ hiển thị cho TECHNICIAN */}
            {isTechnician && (
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
                {tasks.length > 0 && (
                  <div className="px-[1.6rem] py-[0.8rem] bg-blue-600 text-white rounded-full text-[1.4rem] font-[600]">
                    {tasks.length} công việc
                  </div>
                )}
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

                          <button
                            onClick={() => navigate(`/${pathAdmin}/maintenance/${task.maintenanceManagementId}`)}
                            className={`${styles.button} text-white px-[2rem] py-[1rem] rounded-[0.8rem] font-[500] text-[1.3rem] transition-colors flex items-center gap-2 ml-[1.6rem]`}
                          >
                            {styles.icon}
                            {styles.label}
                          </button>
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
    </div>
  );
};

export default ShiftDetail;

