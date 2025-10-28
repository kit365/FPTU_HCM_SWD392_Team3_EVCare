import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  ToolOutlined,
  CarOutlined,
  CalendarOutlined,
  DollarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import { ChartDashboard } from "./ChartDashboard";
import { dashboardService } from '../../../service/dashboardService';
import type { DashboardStatsResponse } from '../../../types/dashboard.types';

export const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: '24px' }}>Tổng quan hệ thống</h1>

      {/* User Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={8}>
          <Card loading={loading}>
            <Statistic
              title="Tổng số khách hàng"
              value={stats?.totalCustomers || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600', fontSize: '2.4rem' }}
            />
            <div style={{ marginTop: '8px', color: '#666' }}>
              Đang hoạt động: {stats?.activeCustomers || 0}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card loading={loading}>
            <Statistic
              title="Tổng số nhân viên"
              value={stats?.totalStaff || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff', fontSize: '2.4rem' }}
            />
            <div style={{ marginTop: '8px', color: '#666', height: '22px' }}>
              {/* Placeholder for consistent height */}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card loading={loading}>
            <Statistic
              title="Tổng số kỹ thuật viên"
              value={stats?.totalTechnicians || 0}
              prefix={<ToolOutlined />}
              valueStyle={{ color: '#cf1322', fontSize: '2.4rem' }}
            />
            <div style={{ marginTop: '8px', color: '#666', height: '22px' }}>
              {/* Placeholder for consistent height */}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Vehicle & Appointment Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={8}>
          <Card loading={loading}>
            <Statistic
              title="Tổng số xe"
              value={stats?.totalVehicles || 0}
              prefix={<CarOutlined />}
              valueStyle={{ color: '#722ed1', fontSize: '2.4rem' }}
            />
            <div style={{ marginTop: '8px', color: '#666', height: '22px' }}>
              {/* Placeholder for consistent height */}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card loading={loading}>
            <Statistic
              title="Tổng lịch hẹn"
              value={stats?.totalAppointments || 0}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#13c2c2', fontSize: '2.4rem' }}
            />
            <div style={{ marginTop: '8px', color: '#666', height: '22px' }}>
              {/* Placeholder for consistent height */}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card loading={loading}>
            <Statistic
              title="Lịch hẹn tháng này"
              value={stats?.appointmentsThisMonth || 0}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#eb2f96', fontSize: '2.4rem' }}
              suffix={
                stats && stats.appointmentGrowthRate !== 0 ? (
                  <span style={{ fontSize: '14px', marginLeft: '8px' }}>
                    {stats.appointmentGrowthRate > 0 ? (
                      <ArrowUpOutlined style={{ color: '#3f8600' }} />
                    ) : (
                      <ArrowDownOutlined style={{ color: '#cf1322' }} />
                    )}
                    {' '}
                    {Math.abs(stats.appointmentGrowthRate).toFixed(1)}%
                  </span>
                ) : null
              }
            />
            <div style={{ marginTop: '8px', color: '#666', height: '22px' }}>
              {/* Placeholder for consistent height */}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Revenue Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={8}>
          <Card loading={loading}>
            <Statistic
              title="Doanh thu tháng này"
              value={stats?.monthlyRevenue || 0}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#faad14', fontSize: '2.4rem' }}
              formatter={(value) => formatCurrency(Number(value))}
            />
            <div style={{ marginTop: '8px', color: '#666', height: '22px' }}>
              {/* Placeholder for consistent height */}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card loading={loading}>
            <Statistic
              title="Lịch hẹn chờ xác nhận"
              value={stats?.pendingAppointments || 0}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#faad14', fontSize: '2.4rem' }}
            />
            <div style={{ marginTop: '8px', color: '#666', height: '22px' }}>
              {/* Placeholder for consistent height */}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card loading={loading}>
            <Statistic
              title="Lịch hẹn hoàn thành"
              value={stats?.completedAppointments || 0}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#52c41a', fontSize: '2.4rem' }}
            />
            <div style={{ marginTop: '8px', color: '#666', height: '22px' }}>
              {/* Placeholder for consistent height */}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <ChartDashboard />
    </div>
  );
};
