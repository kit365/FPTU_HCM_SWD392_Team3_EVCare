import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, Pagination, Stack } from "@mui/material";
import { CardHeaderAdmin } from "../../../components/admin/ui/CardHeader";
import { FormSearch } from "../../../components/admin/ui/FormSearch";
import { FormEmpty } from "../../../components/admin/ui/FormEmpty";
import { useAppointment } from "../../../hooks/useAppointment";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import EditIcon from "@mui/icons-material/Edit";

const columns = [
  { title: "STT", width: 5 },
  { title: "Khách hàng", width: 12 },
  { title: "Số điện thoại", width: 10 },
  { title: "Email", width: 15 },
  { title: "Biển số xe", width: 10 },
  { title: "Loại xe", width: 12 },
  { title: "Ngày hẹn", width: 10 },
  { title: "Dịch vụ", width: 8 },
  { title: "Trạng thái", width: 8 },
  { title: "Hành động", width: 10 },
];

const AppointmentManage = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;
  const [keyword, setKeyword] = useState<string>("");

  const { list, totalPages, search, loading } = useAppointment();

  const load = useCallback(() => {
    search({ page: currentPage - 1, pageSize, keyword });
  }, [currentPage, pageSize, keyword, search]);

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
      'PENDING': { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800' },
      'CONFIRMED': { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800' },
      'IN_PROGRESS': { label: 'Đang xử lý', color: 'bg-purple-100 text-purple-800' },
      'COMPLETED': { label: 'Hoàn thành', color: 'bg-green-100 text-green-800' },
      'CANCELLED': { label: 'Đã hủy', color: 'bg-red-100 text-red-800' }
    };
    return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
  };

  const getServiceModeLabel = (mode: string) => {
    return mode === 'STATIONARY' ? 'Tại cửa hàng' : 'Dịch vụ tại nhà';
  };

  return (
    <div className="max-w-[1320px] px-[12px] mx-auto">
      <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
        <CardHeaderAdmin title="Danh sách cuộc hẹn" />

        <div className="px-[2.4rem] pb-[2.4rem] h-full">
          <FormSearch onSearch={handleSearch} />

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead className="text-[#000000] text-[1.3rem] border-dashed bg-[#f4f6f9]">
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
                <tbody className="text-[#2b2d3b] text-[1.3rem]">
                  {Array.isArray(list) && list.length > 0 ? (
                    list.map((item: any, index: number) => {
                      const statusInfo = getStatusLabel(item.status);
                      return (
                        <tr
                          key={item.appointmentId}
                          className={`border-b border-gray-200 text-center ${
                            index !== (Array.isArray(list) ? list.length - 1 : 0)
                              ? "border-dashed"
                              : "border-none"
                          } ${
                            index % 2 !== 0 ? "bg-transparent" : "bg-[#FBFBFD]"
                          }`}
                        >
                          <td className="p-[1.2rem]">
                            {(currentPage - 1) * pageSize + index + 1}
                          </td>
                          <td className="p-[1.2rem]">{item.customerFullName}</td>
                          <td className="p-[1.2rem]">{item.customerPhoneNumber}</td>
                          <td className="p-[1.2rem]">{item.customerEmail}</td>
                          <td className="p-[1.2rem]">{item.vehicleNumberPlate}</td>
                          <td className="p-[1.2rem]">
                            {item.vehicleTypeResponse?.vehicleTypeName || "-"}
                          </td>
                          <td className="p-[1.2rem]">
                            {formatDate(item.scheduledAt)}
                          </td>
                          <td className="p-[1.2rem]">
                            {getServiceModeLabel(item.serviceMode)}
                          </td>
                          <td className="p-[1.2rem]">
                            <span
                              className={`px-2 py-1 rounded-full text-[1rem] font-medium ${statusInfo.color}`}
                            >
                              {statusInfo.label}
                            </span>
                          </td>
                          <td className="p-[1.2rem] text-center flex justify-center">
                            <Link
                              to={`/admin/appointment/view/${item.appointmentId}`}
                              className="text-green-500 w-[2rem] h-[2rem] mr-2 inline-block hover:opacity-80"
                              title="Xem chi tiết"
                            >
                              <RemoveRedEyeIcon className="!w-full !h-full" />
                            </Link>
                            <Link
                              to={`/admin/appointment/edit/${item.appointmentId}`}
                              className="text-blue-500 w-[2rem] h-[2rem] mr-2 inline-block hover:opacity-80"
                              title="Chỉnh sửa"
                            >
                              <EditIcon className="!w-full !h-full" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <FormEmpty colspan={columns.length} />
                  )}
                </tbody>
              </table>

              {Array.isArray(list) && list.length > 0 && (
                <Stack spacing={2} className="mt-[2rem]">
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    color="primary"
                    onChange={(_, value) => setCurrentPage(value)}
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

export default AppointmentManage;