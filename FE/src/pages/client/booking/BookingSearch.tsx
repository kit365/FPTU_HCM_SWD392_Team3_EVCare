import React, { useState } from "react";
import { Button, Input, Table, Tag, message, Card, Row, Col, Typography } from "antd";
import { SearchOutlined, CalendarOutlined, CarOutlined, UserOutlined, PhoneOutlined, MailOutlined } from "@ant-design/icons";
import { bookingService } from "../../../service/bookingService";
import { useAuthContext } from "../../../context/useAuthContext";
import type { UserAppointment } from "../../../types/booking.types";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Search } = Input;

export const BookingSearchPage: React.FC = () => {
  const [appointments, setAppointments] = useState<UserAppointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const { user } = useAuthContext();

  const handleSearch = async (keyword: string, page: number = 0) => {
    setLoading(true);
    try {
      const params = {
        page,
        pageSize: pagination.pageSize,
        keyword: keyword.trim(),
      };

      let response;
      if (user?.userId) {
        // Nếu đã đăng nhập, sử dụng API customer (cần authentication)
        response = await bookingService.searchCustomerAppointments(params);
      } else {
        // Nếu chưa đăng nhập, sử dụng API guest (public)
        response = await bookingService.searchGuestAppointments(params);
      }

      if (response.data.success) {
        setAppointments(response.data.data.data);
        setPagination(prev => ({
          ...prev,
          current: page + 1,
          total: response.data.data.totalElements,
        }));
      } else {
        message.error(response.data.message || "Không thể tìm kiếm lịch hẹn");
      }
    } catch (error: any) {
      console.error("Error searching appointments:", error);
      message.error("Đã có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pagination: any) => {
    const newPage = pagination.current - 1;
    handleSearch(searchKeyword, newPage);
  };

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      PENDING: "orange",
      CONFIRMED: "blue",
      IN_PROGRESS: "purple",
      COMPLETED: "green",
      CANCELLED: "red",
    };
    return statusColors[status] || "default";
  };

  const getStatusText = (status: string) => {
    const statusTexts: { [key: string]: string } = {
      PENDING: "Chờ xác nhận",
      CONFIRMED: "Đã xác nhận",
      IN_PROGRESS: "Đang thực hiện",
      COMPLETED: "Hoàn thành",
      CANCELLED: "Đã hủy",
    };
    return statusTexts[status] || status;
  };

  const getServiceModeText = (mode: string) => {
    const modeTexts: { [key: string]: string } = {
      STATIONARY: "Tại trung tâm",
      MOBILE: "Di động (Tận nơi)",
    };
    return modeTexts[mode] || mode;
  };

  const columns = [
    {
      title: "Mã lịch hẹn",
      dataIndex: "appointmentId",
      key: "appointmentId",
      width: 200,
      render: (id: string) => (
        <Text code style={{ fontSize: "12px" }}>
          {id.substring(0, 8)}...
        </Text>
      ),
    },
    {
      title: "Thông tin khách hàng",
      key: "customer",
      width: 250,
      render: (record: UserAppointment) => (
        <div>
          <div className="flex items-center mb-1">
            <UserOutlined className="mr-2 text-blue-500" />
            <Text strong>{record.customerFullName}</Text>
          </div>
          <div className="flex items-center mb-1">
            <PhoneOutlined className="mr-2 text-green-500" />
            <Text>{record.customerPhoneNumber}</Text>
          </div>
          <div className="flex items-center">
            <MailOutlined className="mr-2 text-purple-500" />
            <Text>{record.customerEmail}</Text>
          </div>
        </div>
      ),
    },
    {
      title: "Thông tin xe",
      key: "vehicle",
      width: 200,
      render: (record: UserAppointment) => (
        <div>
          <div className="flex items-center mb-1">
            <CarOutlined className="mr-2 text-orange-500" />
            <Text strong>{record.vehicleTypeResponse.vehicleTypeName}</Text>
          </div>
          <Text>Biển số: {record.vehicleNumberPlate}</Text>
          {record.vehicleKmDistances && (
            <div>
              <Text>Km: {record.vehicleKmDistances}</Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Dịch vụ",
      key: "services",
      width: 200,
      render: (record: UserAppointment) => (
        <div>
          <Text strong>{getServiceModeText(record.serviceMode)}</Text>
          {record.serviceTypeResponses && record.serviceTypeResponses.length > 0 && (
            <div className="mt-1">
              {record.serviceTypeResponses.slice(0, 2).map((service, index) => (
                <Tag key={index} className="mb-1 text-xs">
                  {service.serviceName}
                </Tag>
              ))}
              {record.serviceTypeResponses.length > 2 && (
                <Tag className="text-xs">+{record.serviceTypeResponses.length - 2} khác</Tag>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Thời gian hẹn",
      key: "scheduledAt",
      width: 150,
      render: (record: UserAppointment) => (
        <div className="flex items-center">
          <CalendarOutlined className="mr-2 text-blue-500" />
          <div>
            <div>{dayjs(record.scheduledAt).format("DD/MM/YYYY")}</div>
            <div>{dayjs(record.scheduledAt).format("HH:mm")}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: "Địa chỉ",
      key: "address",
      width: 200,
      render: (record: UserAppointment) => (
        <Text ellipsis={{ tooltip: record.userAddress }}>
          {record.userAddress || "Chưa có địa chỉ"}
        </Text>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <Card className="mb-6">
          <div className="text-center mb-6">
            <Title level={2} className="text-blue-600 mb-2">
              Tra cứu lịch hẹn dịch vụ
            </Title>
            <Text className="text-gray-600 text-lg">
              {user?.userId 
                ? "Tìm kiếm lịch hẹn của bạn bằng email hoặc số điện thoại"
                : "Tìm kiếm lịch hẹn bằng email hoặc số điện thoại (không cần đăng nhập)"
              }
            </Text>
          </div>

          <Row justify="center">
            <Col xs={24} sm={20} md={16} lg={12}>
              <Search
                placeholder="Nhập email hoặc số điện thoại để tìm kiếm..."
                enterButton={
                  <Button type="primary" icon={<SearchOutlined />} loading={loading}>
                    Tìm kiếm
                  </Button>
                }
                size="large"
                onSearch={(value) => {
                  setSearchKeyword(value);
                  handleSearch(value, 0);
                }}
                loading={loading}
              />
            </Col>
          </Row>
        </Card>

        {appointments.length > 0 && (
          <Card>
            <div className="mb-4">
              <Title level={4}>
                Kết quả tìm kiếm ({pagination.total} lịch hẹn)
              </Title>
            </div>
            
            <Table
              columns={columns}
              dataSource={appointments}
              rowKey="appointmentId"
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} lịch hẹn`,
                onChange: handleTableChange,
              }}
              scroll={{ x: 1200 }}
              size="middle"
            />
          </Card>
        )}

        {!loading && appointments.length === 0 && searchKeyword && (
          <Card>
            <div className="text-center py-8">
              <SearchOutlined className="text-6xl text-gray-300 mb-4" />
              <Title level={4} className="text-gray-500">
                Không tìm thấy lịch hẹn nào
              </Title>
              <Text className="text-gray-400">
                Vui lòng kiểm tra lại email hoặc số điện thoại và thử lại
              </Text>
            </div>
          </Card>
        )}

        {!searchKeyword && (
          <Card>
            <div className="text-center py-8">
              <CalendarOutlined className="text-6xl text-blue-300 mb-4" />
              <Title level={4} className="text-gray-600">
                Nhập thông tin để tra cứu lịch hẹn
              </Title>
              <Text className="text-gray-500">
                Sử dụng email hoặc số điện thoại đã đăng ký khi đặt lịch
              </Text>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
