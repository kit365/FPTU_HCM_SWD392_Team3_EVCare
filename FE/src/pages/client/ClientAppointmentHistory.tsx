import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Input, Space, Typography, Tag, Card, Button, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { bookingService } from "../../service/bookingService";
import { useAuthContext } from "../../context/useAuthContext";
import { Receipt, Payment } from "@mui/icons-material";
import moment from "moment";
import AppointmentDetail from "./car/AppointmentDetail";
import type { UserAppointment } from "../../types/booking.types";

const { Title } = Typography;

interface AppointmentRow {
  key: string;
  appointmentId: string;
  customerFullName: string;
  customerPhoneNumber: string;
  customerEmail: string;
  vehicleNumberPlate: string;
  serviceMode: string;
  status: string;
  scheduledAt: string;
  quotePrice: number;
  hasInvoice: boolean;
  invoiceStatus?: string; // PENDING, PAID, CANCELLED
}

const ClientAppointmentHistory: React.FC = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<AppointmentRow[]>([]);
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [appointmentDetail, setAppointmentDetail] = useState<UserAppointment | null>(null);
  const [isOpenDetail, setIsOpenDetail] = useState<boolean>(false);

  const fetchData = async (_page = page, _pageSize = pageSize, _keyword = keyword) => {
    if (!user?.userId) return;
    
    setLoading(true);
    try {
      // Use user's email or phone as keyword to find their appointments
      // The search/customer endpoint searches by email or phone number
      const searchKeyword = _keyword || user.email || user.numberPhone || '';
      
      console.log("🔍 Fetching appointments for user:", { userId: user.userId, searchKeyword });
      
      const res = await bookingService.getUserAppointments(user.userId, {
        page: _page,
        pageSize: _pageSize,
        keyword: searchKeyword,
      });
      
      console.log("📥 GET USER APPOINTMENTS RESPONSE:", res);
      
      // Handle response format from /appointment/search/customer/ endpoint
      const responseData = (res as any).data;
      const payload = responseData?.data || responseData;
      console.log("📋 Parsed payload:", payload);
      
      const items: AppointmentRow[] = (payload?.data || []).map((a: any) => ({
        key: a.appointmentId,
        appointmentId: a.appointmentId,
        customerFullName: a.customerFullName || '',
        customerPhoneNumber: a.customerPhoneNumber || '',
        customerEmail: a.customerEmail || '',
        vehicleNumberPlate: a.vehicleNumberPlate,
        serviceMode: a.serviceMode,
        status: a.status,
        scheduledAt: a.scheduledAt,
        quotePrice: a.quotePrice || 0,
        hasInvoice: a.status === "PENDING_PAYMENT" || a.status === "COMPLETED",
        invoiceStatus: a.status === "PENDING_PAYMENT" ? "PENDING" : 
                      a.status === "COMPLETED" ? "PAID" : undefined,
      }));

      // Sắp xếp: appointments chưa thanh toán (PENDING_PAYMENT) hiển thị trước
      const sortedItems = items.sort((a, b) => {
        if (a.status === "PENDING_PAYMENT" && b.status !== "PENDING_PAYMENT") return -1;
        if (a.status !== "PENDING_PAYMENT" && b.status === "PENDING_PAYMENT") return 1;
        return 0;
      });

      setData(sortedItems);
      setPage(payload?.page ?? _page);
      // Don't update pageSize from backend, keep it at 10
      setTotal(payload?.totalElements ?? sortedItems.length);
    } catch (error: any) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.userId]);

  const handleSearch = () => {
    fetchData(0, pageSize, keyword);
  };

  const handleViewInvoice = (appointmentId: string) => {
    navigate(`/client/invoice/${appointmentId}`);
  };

  const handleViewDetail = (appointmentId: string) => {
    navigate(`/client/appointment/${appointmentId}`);
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      PENDING: "default",
      CONFIRMED: "blue",
      IN_PROGRESS: "processing",
      PENDING_PAYMENT: "warning",
      COMPLETED: "success",
      CANCELLED: "error",
    };
    return statusColors[status] || "default";
  };

  const getStatusText = (status: string) => {
    const statusTexts: Record<string, string> = {
      PENDING: "Chờ xác nhận",
      CONFIRMED: "Đã xác nhận",
      IN_PROGRESS: "Đang xử lý",
      PENDING_PAYMENT: "Chờ thanh toán",
      COMPLETED: "Hoàn thành",
      CANCELLED: "Đã hủy",
    };
    return statusTexts[status] || status;
  };

  const columns: ColumnsType<AppointmentRow> = [
    {
      title: "Khách hàng",
      dataIndex: "customerFullName",
      key: "customerFullName",
      width: 220,
      ellipsis: { showTitle: true },
    },
    {
      title: "SĐT",
      dataIndex: "customerPhoneNumber",
      key: "customerPhoneNumber",
      width: 160,
    },
    {
      title: "Email",
      dataIndex: "customerEmail",
      key: "customerEmail",
      width: 280,
      ellipsis: { showTitle: true },
    },
    {
      title: "Biển số",
      dataIndex: "vehicleNumberPlate",
      key: "vehicleNumberPlate",
      width: 160,
    },
    {
      title: "Hình thức",
      dataIndex: "serviceMode",
      key: "serviceMode",
      width: 140,
      render: (v: string) => <Tag color={v === "MOBILE" ? "blue" : "green"}>{v === "MOBILE" ? "Tại nhà" : "Tại trạm"}</Tag>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 160,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
      sorter: (a, b) => {
        // Sắp xếp: PENDING_PAYMENT trước
        if (a.status === "PENDING_PAYMENT" && b.status !== "PENDING_PAYMENT") return -1;
        if (a.status !== "PENDING_PAYMENT" && b.status === "PENDING_PAYMENT") return 1;
        return 0;
      },
      defaultSortOrder: "ascend" as const,
    },
    {
      title: "Thời gian",
      dataIndex: "scheduledAt",
      key: "scheduledAt",
      width: 220,
      render: (date: string) => moment(date).format("DD/MM/YYYY HH:mm"),
      sorter: (a, b) => 
        moment(a.scheduledAt).unix() - moment(b.scheduledAt).unix(),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 180,
      fixed: "right" as const,
      render: (_: any, record: AppointmentRow) => (
        <Space size="small" direction="vertical" style={{ width: "100%" }}>
          <Button
            type="link"
            size="small"
            onClick={() => handleViewDetail(record.appointmentId)}
            style={{ padding: 0, fontSize: "13px" }}
          >
            Xem chi tiết
          </Button>
          {record.status === "PENDING_PAYMENT" && (
            <Button
              type="link"
              size="small"
              icon={<Payment />}
              onClick={() => handleViewInvoice(record.appointmentId)}
              style={{ padding: 0, color: "#3b82f6", fontSize: "13px" }}
            >
              Thanh toán
            </Button>
          )}
          {record.hasInvoice && record.status !== "PENDING_PAYMENT" && (
            <Button
              type="link"
              size="small"
              icon={<Receipt />}
              onClick={() => handleViewInvoice(record.appointmentId)}
              style={{ padding: 0, fontSize: "13px" }}
            >
              Hóa đơn
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-cyan-600/5"></div>
      <div className="relative z-10 max-w-[95%] mx-auto p-6">
        <Card className="shadow-xl border-0 rounded-3xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 -m-6 mb-6 text-white">
            <Title level={3} className="!mb-0 !text-white">Lịch sử đặt lịch</Title>
          </div>
          <Space style={{ marginBottom: 16 }}>
            <Input
              placeholder="Nhập email hoặc số điện thoại"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onPressEnter={handleSearch}
              allowClear
              style={{ width: 400 }}
            />
            <Button type="primary" onClick={handleSearch} loading={loading}>
              Tìm kiếm
            </Button>
            <Button
              onClick={() => {
                setKeyword("");
                fetchData(0, pageSize, "");
              }}
            >
              Xóa
            </Button>
          </Space>

          <Table
            loading={loading}
            columns={columns}
            dataSource={data}
            pagination={
              total > pageSize
                ? {
                    current: page + 1,
                    pageSize,
                    total,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} lịch hẹn`,
                    onChange: (p, ps) => {
                      setPage(p - 1);
                      setPageSize(ps);
                      fetchData(p - 1, ps, keyword);
                    },
                  }
                : false
            }
            bordered
            rowKey="appointmentId"
            scroll={{ x: 1500 }}
          />
          {total > 0 && total <= pageSize && (
            <div className="mt-4 text-center text-gray-600">
              Tổng {total} lịch hẹn
            </div>
          )}
        </Card>

        {/* Appointment Detail Modal */}
        <AppointmentDetail
          dataDetail={appointmentDetail}
          setDataDetail={setAppointmentDetail}
          isOpenDetail={isOpenDetail}
          setIsOpenDetail={setIsOpenDetail}
          onSuccess={() => {
            fetchData(page, pageSize, keyword);
          }}
        />
      </div>
    </div>
  );
};

export default ClientAppointmentHistory;

