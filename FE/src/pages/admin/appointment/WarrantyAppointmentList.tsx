import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Card, 
  Pagination, 
  Stack, 
  Box,
  Typography,
  Chip,
} from "@mui/material";
import { CardHeaderAdmin } from "../../../components/admin/ui/CardHeader";
import { FormSearch } from "../../../components/admin/ui/FormSearch";
import { FormEmpty } from "../../../components/admin/ui/FormEmpty";
import { appointmentService } from "../../../service/appointmentService";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import type { AppointmentResponse, AppointmentListApiResponse } from "../../../types/appointment.types";

const columns = [
  { title: "STT", width: 4 },
  { title: "Khách hàng", width: 10 },
  { title: "Số điện thoại", width: 9 },
  { title: "Email", width: 12 },
  { title: "Biển số xe", width: 9 },
  { title: "Loại xe", width: 10 },
  { title: "Ngày hẹn", width: 10 },
  { title: "Dịch vụ", width: 7 },
  { title: "Appointment gốc", width: 10 },
  { title: "Trạng thái", width: 7 },
  { title: "Hành động", width: 12 },
];

const WarrantyAppointmentList = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;
  const [keyword, setKeyword] = useState<string>("");
  const [list, setList] = useState<AppointmentResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await appointmentService.searchWarranty({ 
        page: currentPage - 1, 
        pageSize, 
        keyword: keyword || undefined
      });
      
      if (response?.data?.success) {
        const data = response.data.data as any;
        setList(data.data || []);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
      } else {
        setList([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (error: any) {
      console.error("Error loading warranty appointments:", error);
      setList([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, keyword]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSearch = useCallback((value: string) => {
    setKeyword(value);
    setCurrentPage(1);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
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
    return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
  };

  const getServiceModeLabel = (mode: string) => {
    return mode === 'STATIONARY' ? 'Tại cửa hàng' : 'Dịch vụ tại nhà';
  };

  return (
    <div className="max-w-[1320px] px-[12px] mx-auto">
      <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
        <CardHeaderAdmin title="Danh sách cuộc hẹn bảo hành" />

        <div className="px-[2.4rem] pb-[2.4rem] h-full">
          <FormSearch onSearch={handleSearch} />

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead className="text-[#000000] text-[1.5rem] border-dashed bg-[#f4f6f9]">
                  <tr>
                    {columns.map((col, index) => (
                      <th
                        key={index}
                        className={`p-[1.2rem] font-[500] text-center ${
                          index === 0 ? "rounded-l-[8px]" : ""
                        } ${
                          index === columns.length - 1 ? "rounded-r-[8px]" : ""
                        }`}
                        style={{ width: `${col.width}%` }}
                      >
                        {col.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-[#2b2d3b] text-[1.5rem]">
                  {list.length > 0 ? (
                    list.map((item: any, index: number) => {
                      const statusInfo = getStatusLabel(item.status);
                      const serviceNames = item.serviceTypeResponses
                        ?.map((s: any) => s.serviceName)
                        .join(", ") || "N/A";
                      
                      return (
                        <tr
                          key={item.appointmentId}
                          className={`border-b border-gray-200 text-center ${
                            index !== list.length - 1
                              ? "border-dashed"
                              : "border-none"
                          } ${
                            index % 2 !== 0 ? "bg-transparent" : "bg-[#FBFBFD]"
                          }`}
                        >
                          <td className="p-[1.2rem]">
                            {(currentPage - 1) * pageSize + index + 1}
                          </td>
                          <td className="p-[1.2rem]">{item.customerFullName || "N/A"}</td>
                          <td className="p-[1.2rem]">{item.customerPhoneNumber || "N/A"}</td>
                          <td className="p-[1.2rem]">{item.customerEmail || "N/A"}</td>
                          <td className="p-[1.2rem]">{item.vehicleNumberPlate || "N/A"}</td>
                          <td className="p-[1.2rem]">
                            {item.vehicleTypeResponse?.vehicleTypeName || "N/A"}
                          </td>
                          <td className="p-[1.2rem]">
                            {item.scheduledAt ? formatDate(item.scheduledAt) : "N/A"}
                          </td>
                          <td className="p-[1.2rem]">
                            <span className="text-[1.35rem]" title={serviceNames}>
                              {serviceNames.length > 30 ? serviceNames.substring(0, 30) + "..." : serviceNames}
                            </span>
                          </td>
                          <td className="p-[1.2rem]">
                            {item.originalAppointment ? (
                              <Link
                                to={`/admin/appointment/view/${item.originalAppointment.appointmentId}`}
                                className="text-blue-600 hover:text-blue-800 underline text-[1.35rem]"
                              >
                                {item.originalAppointment.appointmentId.substring(0, 8).toUpperCase()}
                              </Link>
                            ) : (
                              "N/A"
                            )}
                          </td>
                          <td className="p-[1.2rem]">
                            <Chip
                              label={statusInfo.label}
                              className={statusInfo.color}
                              size="small"
                              sx={{ fontSize: "1.3rem", height: "32px" }}
                            />
                          </td>
                          <td className="p-[1.2rem]">
                            <Link
                              to={`/admin/appointment/view/${item.appointmentId}`}
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <RemoveRedEyeIcon sx={{ fontSize: "2rem" }} />
                              <span className="text-[1.4rem]">Xem</span>
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={columns.length} className="p-[2.4rem] text-center">
                        <FormEmpty />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {totalPages > 0 && (
                <Stack spacing={2} className="mt-6 flex items-center">
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={(_, page) => setCurrentPage(page)}
                    color="primary"
                    size="large"
                    showFirstButton
                    showLastButton
                  />
                  <Typography className="text-[1.4rem] text-gray-600">
                    Tổng: {totalElements} cuộc hẹn
                  </Typography>
                </Stack>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default WarrantyAppointmentList;

