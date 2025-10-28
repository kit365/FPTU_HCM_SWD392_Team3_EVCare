import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@mui/material";
import { useAppointment } from "../../../hooks/useAppointment";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const AppointmentView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { detail, loading, getById } = useAppointment();

  useEffect(() => {
    if (id) {
      getById(id);
    }
  }, [id, getById]);

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
    navigate('/admin/appointment-manage');
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

  if (!detail) {
    return (
      <div className="max-w-[1320px] px-[12px] mx-auto">
        <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
          <div className="p-[2.4rem] text-center">
            <p className="text-[1.4rem] text-gray-600">Không tìm thấy thông tin cuộc hẹn</p>
          </div>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusLabel(detail?.status || 'PENDING');

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
                    {detail?.customerFullName || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-[1.2rem] text-gray-500 mb-[0.4rem]">Số điện thoại</p>
                  <p className="text-[1.4rem] font-[500] text-gray-800">
                    {detail?.customerPhoneNumber || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-[1.2rem] text-gray-500 mb-[0.4rem]">Email</p>
                  <p className="text-[1.4rem] font-[500] text-gray-800">
                    {detail?.customerEmail || '-'}
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
                    {detail?.scheduledAt ? formatDate(detail.scheduledAt) : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-[1.2rem] text-gray-500 mb-[0.4rem]">Chế độ dịch vụ</p>
                  <p className="text-[1.4rem] font-[500] text-gray-800">
                    {detail?.serviceMode === 'STATIONARY' ? 'Tại cửa hàng' : detail?.serviceMode === 'MOBILE' ? 'Dịch vụ lưu động' : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-[1.2rem] text-gray-500 mb-[0.4rem]">Biển số xe</p>
                  <p className="text-[1.4rem] font-[500] text-gray-800">
                    {detail?.vehicleNumberPlate || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-[1.2rem] text-gray-500 mb-[0.4rem]">Loại xe</p>
                  <p className="text-[1.4rem] font-[500] text-gray-800">
                    {detail?.vehicleTypeResponse?.vehicleTypeName || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-[1.2rem] text-gray-500 mb-[0.4rem]">Giá tạm tính</p>
                  <p className="text-[1.4rem] font-[600] text-blue-600">
                    {formatCurrency(detail?.quotePrice || 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Thông tin phân công */}
            <div className="bg-gray-50 p-[2rem] rounded-[0.8rem]">
              <h3 className="text-[1.5rem] font-[600] text-gray-800 mb-[1.6rem]">
                Thông tin phân công
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.6rem]">
                <div>
                  <p className="text-[1.2rem] text-gray-500 mb-[0.4rem]">Người phụ trách</p>
                  <p className="text-[1.4rem] font-[500] text-gray-800">
                    {detail.assignee?.fullName || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-[1.2rem] text-gray-500 mb-[0.8rem]">Kỹ thuật viên</p>
                  {detail.technicianResponses && detail.technicianResponses.length > 0 ? (
                    <div className="flex flex-wrap gap-[0.8rem]">
                      {detail.technicianResponses.map((tech: any, index: number) => (
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

            {/* Dịch vụ đã chọn */}
            {detail.serviceTypeResponses && detail.serviceTypeResponses.length > 0 && (
              <div className="bg-gray-50 p-[2rem] rounded-[0.8rem]">
                <h3 className="text-[1.5rem] font-[600] text-gray-800 mb-[1.6rem]">
                  Dịch vụ đã chọn
                </h3>
                <div className="flex flex-wrap gap-[1rem]">
                  {detail.serviceTypeResponses.map((service: any, index: number) => (
                    <span
                      key={index}
                      className="px-[1.6rem] py-[0.8rem] bg-blue-100 text-blue-700 rounded-[0.6rem] text-[1.3rem] font-[500] border border-blue-200"
                    >
                      {service.serviceName}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Ghi chú */}
            {detail.notes && (
              <div className="bg-gray-50 p-[2rem] rounded-[0.8rem]">
                <h3 className="text-[1.5rem] font-[600] text-gray-800 mb-[1.6rem]">
                  Ghi chú
                </h3>
                <p className="text-[1.4rem] text-gray-700 leading-[1.6]">
                  {detail.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AppointmentView;
