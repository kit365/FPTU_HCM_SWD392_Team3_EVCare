import React, { useState } from "react";
import { Table, Input, Button, Space, Typography, Tag, message, Card } from "antd";
import type { ColumnsType } from "antd/es/table";
import { bookingService } from "../../service/bookingService";

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
}

const LookupAppointmentsPage: React.FC = () => {
  const [keyword, setKeyword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<AppointmentRow[]>([]);
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  const isValidEmail = (text: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
  const isValidPhone = (text: string) => /^[0-9]{9,12}$/.test(text.replace(/\D/g, ""));

  const fetchData = async (_page = page, _pageSize = pageSize, _keyword = keyword) => {
    if (!_keyword || (!isValidEmail(_keyword) && !isValidPhone(_keyword))) {
      message.warning("Vui lòng nhập email hoặc số điện thoại hợp lệ");
      return;
    }
    setLoading(true);
    try {
      const res = await bookingService.searchAppointmentsForCustomer({ page: _page, pageSize: _pageSize, keyword: _keyword });
      const payload: any = (res as any).data?.data ?? (res as any).data;
      const items: AppointmentRow[] = (payload?.data || []).map((a: any) => ({
        key: a.appointmentId,
        appointmentId: a.appointmentId,
        customerFullName: a.customerFullName,
        customerPhoneNumber: a.customerPhoneNumber,
        customerEmail: a.customerEmail,
        vehicleNumberPlate: a.vehicleNumberPlate,
        serviceMode: a.serviceMode,
        status: a.status,
        scheduledAt: a.scheduledAt,
      }));
      setData(items);
      setPage(payload?.page ?? _page);
      setPageSize(payload?.size ?? _pageSize);
      setTotal(payload?.totalElements ?? items.length);
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<AppointmentRow> = [
    { title: "Khách hàng", dataIndex: "customerFullName" },
    { title: "SĐT", dataIndex: "customerPhoneNumber" },
    { title: "Email", dataIndex: "customerEmail" },
    { title: "Biển số", dataIndex: "vehicleNumberPlate" },
    { title: "Hình thức", dataIndex: "serviceMode", render: (v: string) => <Tag color={v === 'MOBILE' ? 'blue' : 'green'}>{v}</Tag> },
    { title: "Trạng thái", dataIndex: "status", render: (v: string) => <Tag>{v}</Tag> },
    { title: "Thời gian", dataIndex: "scheduledAt" },
  ];

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-cyan-600/5"></div>
      <div className="relative z-10 max-w-6xl mx-auto p-6">
        <Card className="shadow-xl border-0 rounded-3xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 -m-6 mb-6 text-white">
            <Title level={3} className="!mb-0 !text-white">Tra cứu lịch hẹn</Title>
          </div>
          <Space style={{ marginBottom: 16 }}>
            <Input
              placeholder="Nhập email hoặc số điện thoại"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{ width: 360 }}
            />
            <Button
              type="primary"
              onClick={() => fetchData(0, pageSize, keyword)}
              disabled={!keyword || (!isValidEmail(keyword) && !isValidPhone(keyword))}
            >
              Tìm kiếm
            </Button>
            <Button onClick={() => { setKeyword(""); setData([]); setTotal(0); }}>Xóa</Button>
          </Space>
          <Table
            loading={loading}
            columns={columns}
            dataSource={data}
            pagination={{
              current: page + 1,
              pageSize,
              total,
              onChange: (p, ps) => { setPage(p - 1); setPageSize(ps); fetchData(p - 1, ps, keyword); }
            }}
            bordered
            rowKey="appointmentId"
          />
        </Card>
      </div>
    </div>
  );
};

export default LookupAppointmentsPage;


