// @ts-nocheck
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { message } from "antd";
import { bookingService } from "../../../service/bookingService";
import type { UserAppointment } from "../../../types/booking.types";
import { Card } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const AppointmentDetailPage: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<UserAppointment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (appointmentId) {
      fetchAppointmentDetail();
    }
  }, [appointmentId]);

  const fetchAppointmentDetail = async () => {
    if (!appointmentId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await bookingService.getAppointmentById(appointmentId);
      if (response.data.success && response.data.data) {
        setAppointment(response.data.data);
      } else {
        setError(response.data.message || "Không thể tải thông tin cuộc hẹn");
      }
    } catch (error: any) {
      console.error("Error fetching appointment:", error);
      setError(error?.response?.data?.message || "Không thể tải thông tin cuộc hẹn");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!appointment) return;

    const confirmed = window.confirm("Bạn có chắc chắn muốn hủy cuộc hẹn này không?");
    if (!confirmed) return;

    setCancelling(true);
    try {
      const response = await bookingService.cancelAppointmentForCustomer(appointment.appointmentId);
      if (response.data.success) {
        message.success("Hủy cuộc hẹn thành công");
        fetchAppointmentDetail(); // Reload data
        navigate("/client/appointment-history");
      } else {
        message.error(response.data.message || "Hủy cuộc hẹn thất bại");
      }
    } catch (error: any) {
      console.error("Error cancelling appointment:", error);
      message.error(error?.response?.data?.message || "Hủy cuộc hẹn thất bại");
    } finally {
      setCancelling(false);
    }
  };

  const handleViewInvoice = () => {
    if (appointment) {
      navigate(`/client/invoice/${appointment.appointmentId}`);
    }
  };

  const handleEditAppointment = () => {
    if (appointment) {
      navigate(`/client/booking?appointmentId=${appointment.appointmentId}&mode=edit`);
    }
  };

  const handleViewPayment = () => {
    if (appointment) {
      navigate(`/client/invoice/${appointment.appointmentId}`);
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: { label: string; color: string } } = {
      'PENDING': { label: 'Chờ xử lý', color: 'bg-orange-100 text-orange-700' },
      'CONFIRMED': { label: 'Đã xác nhận', color: 'bg-sky-100 text-sky-700' },
      'IN_PROGRESS': { label: 'Đang thực hiện', color: 'bg-blue-100 text-blue-700' },
      'PENDING_PAYMENT': { label: 'Chờ thanh toán', color: 'bg-purple-100 text-purple-700' },
      'COMPLETED': { label: 'Hoàn thành', color: 'bg-green-100 text-green-700' },
      'CANCELLED': { label: 'Đã hủy', color: 'bg-red-100 text-red-700' }
    };
    return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const handleBack = () => {
    navigate('/client/appointment-history');
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

  if (error || !appointment) {
    return (
      <div className="max-w-[1320px] px-[12px] mx-auto">
        <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
          <div className="p-[2.4rem] text-center">
            <p className="text-[1.4rem] text-gray-600">{error || "Không tìm thấy thông tin cuộc hẹn"}</p>
            <button
              onClick={handleBack}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Quay lại
            </button>
          </div>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusLabel(appointment.status || 'PENDING');

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
                <h2 className="text-[1.8rem] font-[700] leading-[1.2] text-gray-800">
                  Chi tiết cuộc hẹn
                </h2>
                <p className="text-[1.3rem] text-gray-600 mt-1">
                  Thông tin chi tiết của cuộc hẹn
                </p>
              </div>
            </div>
            <span className={`px-[1.6rem] py-[0.8rem] rounded-[0.64rem] text-[1.3rem] font-[600] ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-[2rem]">
            {(appointment.status === "PENDING_PAYMENT" || appointment.status === "COMPLETED") && (
              <button
                onClick={appointment.status === "PENDING_PAYMENT" ? handleViewPayment : handleViewInvoice}
                className={`px-6 py-2 rounded-lg text-white font-semibold transition-all shadow-sm hover:shadow-md ${
                  appointment.status === "PENDING_PAYMENT" 
                    ? "bg-purple-600 hover:bg-purple-700" 
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {appointment.status === "PENDING_PAYMENT" ? "Thanh toán" : "Xem hóa đơn"}
              </button>
            )}
            {appointment.status === "PENDING" && (
              <>
                <button
                  onClick={handleEditAppointment}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-sm hover:shadow-md"
                >
                  Chỉnh sửa
                </button>
                <button
                  onClick={handleCancelAppointment}
                  disabled={cancelling}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all shadow-sm hover:shadow-md"
                >
                  {cancelling ? "Đang hủy..." : "Hủy cuộc hẹn"}
                </button>
              </>
            )}
          </div>

          {/* Appointment Information */}
          <div className="space-y-[2rem]">
            {/* Thông tin khách hàng */}
            <div className="bg-gray-50 p-[2rem] rounded-[0.8rem]">
              <h3 className="text-[1.5rem] font-[600] text-gray-800 mb-[1.6rem]">
                Thông tin khách hàng
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.6rem]">
                <div>
                  <p className="text-[1.2rem] text-gray-500 mb-[0.4rem]">Họ và tên</p>
                  <p className="text-[1.4rem] font-[500] text-gray-800">
                    {appointment?.customerFullName || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-[1.2rem] text-gray-500 mb-[0.4rem]">Số điện thoại</p>
                  <p className="text-[1.4rem] font-[500] text-gray-800">
                    {appointment?.customerPhoneNumber || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-[1.2rem] text-gray-500 mb-[0.4rem]">Email</p>
                  <p className="text-[1.4rem] font-[500] text-gray-800">
                    {appointment?.customerEmail || '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Thông tin cuộc hẹn */}
            <div className="bg-gray-50 p-[2rem] rounded-[0.8rem]">
              <h3 className="text-[1.5rem] font-[600] text-gray-800 mb-[1.6rem]">
                Thông tin cuộc hẹn
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.6rem]">
                <div>
                  <p className="text-[1.2rem] text-gray-500 mb-[0.4rem]">Ngày hẹn</p>
                  <p className="text-[1.4rem] font-[500] text-gray-800">
                    {appointment?.scheduledAt ? formatDate(appointment.scheduledAt) : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-[1.2rem] text-gray-500 mb-[0.4rem]">Chế độ dịch vụ</p>
                  <p className="text-[1.4rem] font-[500] text-gray-800">
                    {appointment?.serviceMode === 'STATIONARY' ? 'Tại cửa hàng' : appointment?.serviceMode === 'MOBILE' ? 'Dịch vụ lưu động' : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-[1.2rem] text-gray-500 mb-[0.4rem]">Biển số xe</p>
                  <p className="text-[1.4rem] font-[500] text-gray-800">
                    {appointment?.vehicleNumberPlate || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-[1.2rem] text-gray-500 mb-[0.4rem]">Loại xe</p>
                  <p className="text-[1.4rem] font-[500] text-gray-800">
                    {appointment?.vehicleTypeResponse?.vehicleTypeName || '-'}
                  </p>
                </div>
                {appointment?.userAddress && (
                  <div className="md:col-span-2">
                    <p className="text-[1.2rem] text-gray-500 mb-[0.4rem]">Địa chỉ</p>
                    <p className="text-[1.4rem] font-[500] text-gray-800">
                      {appointment.userAddress}
                    </p>
                  </div>
                )}
                {appointment?.quotePrice && (
                  <div>
                    <p className="text-[1.2rem] text-gray-500 mb-[0.4rem]">Giá tạm tính</p>
                    <p className="text-[1.4rem] font-[600] text-blue-600">
                      {formatCurrency(appointment.quotePrice || 0)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Thông tin phân công */}
            {(appointment.technicianResponses?.length > 0 || appointment.assignee) && (
              <div className="bg-gray-50 p-[2rem] rounded-[0.8rem]">
                <h3 className="text-[1.5rem] font-[600] text-gray-800 mb-[1.6rem]">
                  Thông tin phân công
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.6rem]">
                  {appointment.assignee && (
                    <div>
                      <p className="text-[1.2rem] text-gray-500 mb-[0.4rem]">Người phụ trách</p>
                      <p className="text-[1.4rem] font-[500] text-gray-800">
                        {appointment.assignee?.fullName || '-'}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-[1.2rem] text-gray-500 mb-[0.8rem]">Kỹ thuật viên</p>
                    {appointment.technicianResponses && appointment.technicianResponses.length > 0 ? (
                      <div className="flex flex-wrap gap-[0.8rem]">
                        {appointment.technicianResponses.map((tech: any, index: number) => (
                          <span
                            key={index}
                            className="px-[1.2rem] py-[0.6rem] bg-green-100 text-green-700 rounded-[0.4rem] text-[1.2rem] font-[500]"
                          >
                            {tech.fullName}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="px-[1.2rem] py-[0.6rem] bg-orange-100 text-orange-700 rounded-[0.4rem] text-[1.2rem] font-[500] inline-block">
                        Chưa phân công
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Dịch vụ đã chọn - Hiển thị theo cấu trúc parent-child */}
            {appointment.serviceTypeResponses && appointment.serviceTypeResponses.length > 0 && (
              <div className="bg-gray-50 p-[2rem] rounded-[0.8rem]">
                <h3 className="text-[1.5rem] font-[600] text-gray-800 mb-[1.6rem]">
                  Dịch vụ đã chọn
                </h3>
                <div className="space-y-[1.6rem]">
                  {appointment.serviceTypeResponses.map((parentService: any, parentIndex: number) => (
                    <div key={parentService.serviceTypeId || `parent-${parentIndex}`} className="border-l-4 border-blue-500 pl-4">
                      {/* Parent Service */}
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-[1.2rem] py-[0.6rem] bg-blue-100 text-blue-700 rounded-[0.4rem] text-[1.2rem] font-[600]">
                            {parentIndex + 1}. {parentService.serviceName}
                          </span>
                          {parentService.estimatedDurationMinutes && (
                            <span className="px-[1rem] py-[0.4rem] bg-gray-200 text-gray-700 rounded-[0.4rem] text-[1.1rem] font-[500]">
                              {parentService.estimatedDurationMinutes} phút
                            </span>
                          )}
                        </div>
                        {parentService.description && (
                          <p className="text-[1.3rem] text-gray-600 ml-2">
                            {parentService.description}
                          </p>
                        )}
                      </div>

                      {/* Children Services */}
                      {parentService.children && Array.isArray(parentService.children) && parentService.children.length > 0 && (
                        <div className="ml-4 pl-4 border-l-2 border-green-300 space-y-[1rem] mt-3">
                          <p className="text-[1.2rem] font-[600] text-gray-700 mb-2">
                            Dịch vụ con đã chọn:
                          </p>
                          {parentService.children.map((childService: any, childIndex: number) => (
                            <div key={childService?.serviceTypeId || `child-${parentIndex}-${childIndex}`} className="bg-green-50 p-3 rounded-[0.6rem]">
                              <div className="flex items-center gap-2">
                                <span className="px-[1rem] py-[0.5rem] bg-green-600 text-white rounded-[0.4rem] text-[1.1rem] font-[600]">
                                  {parentIndex + 1}.{childIndex + 1}
                                </span>
                                <span className="text-[1.3rem] font-[600] text-gray-800">
                                  {childService?.serviceName || "Tên dịch vụ không có"}
                                </span>
                                {childService?.estimatedDurationMinutes && (
                                  <span className="px-[1rem] py-[0.4rem] bg-gray-200 text-gray-700 rounded-[0.4rem] text-[1.1rem] font-[500]">
                                    {childService.estimatedDurationMinutes} phút
                                  </span>
                                )}
                              </div>
                              {childService?.description && (
                                <p className="text-[1.2rem] text-gray-600 mt-2 ml-2">
                                  {childService.description}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ghi chú */}
            {appointment.notes && (
              <div className="bg-gray-50 p-[2rem] rounded-[0.8rem]">
                <h3 className="text-[1.5rem] font-[600] text-gray-800 mb-[1.6rem]">
                  Ghi chú
                </h3>
                <p className="text-[1.4rem] text-gray-700 leading-[1.6]">
                  {appointment.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AppointmentDetailPage;
