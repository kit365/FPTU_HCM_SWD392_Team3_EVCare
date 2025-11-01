import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Input, Space, Typography, Tag, Card, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import { bookingService } from "../../service/bookingService";
import { useAuthContext } from "../../context/useAuthContext";
import { Calendar, Search } from "iconoir-react";
import { Receipt } from "@mui/icons-material";
import moment from "moment";

const { Title } = Typography;

interface AppointmentRow {
  key: string;
  appointmentId: string;
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

  const fetchData = async (_page = page, _pageSize = pageSize, _keyword = keyword) => {
    if (!user?.userId) return;
    
    setLoading(true);
    try {
      const res = await bookingService.getUserAppointments(user.userId, {
        page: _page,
        pageSize: _pageSize,
        keyword: _keyword || undefined,
      });
      
      const payload: any = (res as any).data?.data ?? (res as any).data;
      const items: AppointmentRow[] = (payload?.data || []).map((a: any) => ({
        key: a.appointmentId,
        appointmentId: a.appointmentId,
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
      setPageSize(payload?.size ?? _pageSize);
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
      title: "Biển số xe",
      dataIndex: "vehicleNumberPlate",
      key: "vehicleNumberPlate",
      width: 150,
    },
    {
      title: "Hình thức",
      dataIndex: "serviceMode",
      key: "serviceMode",
      width: 120,
      render: (v: string) => (
        <Tag color={v === "MOBILE" ? "blue" : "green"}>
          {v === "MOBILE" ? "Tại nhà" : "Tại trạm"}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 150,
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
      title: "Thời gian hẹn",
      dataIndex: "scheduledAt",
      key: "scheduledAt",
      width: 180,
      render: (date: string) => moment(date).format("DD/MM/YYYY HH:mm"),
      sorter: (a, b) => 
        moment(a.scheduledAt).unix() - moment(b.scheduledAt).unix(),
    },
    {
      title: "Giá dự kiến",
      dataIndex: "quotePrice",
      key: "quotePrice",
      width: 150,
      render: (price: number) =>
        price > 0 ? `${price.toLocaleString("vi-VN")} VNĐ` : "-",
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      render: (_: any, record: AppointmentRow) => (
        <Space size="middle">
          {record.hasInvoice && (
            <Button
              type="link"
              icon={<Receipt />}
              onClick={() => handleViewInvoice(record.appointmentId)}
              style={{ padding: 0 }}
            >
              Xem hóa đơn
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-xl border-0 rounded-3xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 -m-6 mb-6 text-white">
            <div className="flex items-center gap-3">
              <Calendar className="text-3xl" />
              <Title level={3} className="!mb-0 !text-white">
                Lịch sử đặt lịch
              </Title>
            </div>
          </div>

          <Space style={{ marginBottom: 16, width: "100%" }} direction="vertical">
            <Space style={{ width: "100%" }}>
              <Input
                placeholder="Tìm kiếm theo biển số xe..."
                prefix={<Search />}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onPressEnter={handleSearch}
                style={{ width: 400 }}
                allowClear
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
          </Space>

          <Table
            loading={loading}
            columns={columns}
            dataSource={data}
            pagination={{
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
            }}
            bordered
            rowKey="appointmentId"
          />
        </Card>
      </div>
    </div>
  );
};

export default ClientAppointmentHistory;

