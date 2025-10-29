import { useState, useEffect } from 'react';
import { Card, Row, Col } from 'antd';
import { ResponsiveLine } from '@nivo/line';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveBar } from '@nivo/bar';
import { dashboardService } from '../../../service/dashboardService';
import type { DashboardChartsResponse } from '../../../types/dashboard.types';

export const ChartDashboard = () => {
  const [chartData, setChartData] = useState<DashboardChartsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    setLoading(true);
    try {
      const data = await dashboardService.getChartData();
      console.log('📊 Chart data received:', data);
      setChartData(data);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Transform data for Line Chart (Appointment Trend)
  const lineChartData = chartData ? [
    {
      id: 'Lịch hẹn',
      data: chartData.appointmentTrend.map(item => ({
        x: item.month,
        y: item.count,
      })),
    },
  ] : [];

  // Transform data for Pie Chart (Service Type Distribution)
  const pieChartData = chartData?.serviceTypeDistribution || [];

  // Transform data for Bar Chart (Monthly Revenue)
  const barChartData = chartData?.monthlyRevenue.map(item => ({
    month: item.month,
    revenue: item.revenue,
  })) || [];

  const formatCurrency = (value: number) => {
    return `${(value / 1000000).toFixed(1)}M`;
  };

    return (
        <>
      <Row gutter={[16, 16]}>
        {/* Line Chart - Appointment Trend */}
        <Col xs={24} lg={12}>
          <Card 
            title="Xu hướng lịch hẹn 12 tháng" 
            loading={loading}
            className="h-full"
          >
            <div style={{ height: '580px' }}>
              <ResponsiveLine
                data={lineChartData}
                margin={{ top: 20, right: 20, bottom: 70, left: 60 }}
                xScale={{ type: 'point' }}
                yScale={{
                  type: 'linear',
                  min: 'auto',
                  max: 'auto',
                  stacked: false,
                  reverse: false,
                }}
                yFormat=" >-.0f"
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: -45,
                  legend: 'Tháng',
                  legendOffset: 50,
                  legendPosition: 'middle',
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: 'Số lượng',
                  legendOffset: -50,
                  legendPosition: 'middle',
                }}
                pointSize={10}
                pointColor={{ theme: 'background' }}
                pointBorderWidth={2}
                pointBorderColor={{ from: 'serieColor' }}
                pointLabelYOffset={-12}
                useMesh={true}
                colors={{ scheme: 'nivo' }}
                legends={[
                  {
                    anchor: 'top-right',
                    direction: 'column',
                    justify: false,
                    translateX: 0,
                    translateY: 0,
                    itemsSpacing: 0,
                    itemDirection: 'left-to-right',
                    itemWidth: 80,
                    itemHeight: 20,
                    itemOpacity: 0.75,
                    symbolSize: 12,
                    symbolShape: 'circle',
                  },
                ]}
              />
            </div>
          </Card>
        </Col>

        {/* Pie Chart - Service Type Distribution */}
        <Col xs={24} lg={12}>
          <Card 
            title="Phân bổ loại dịch vụ" 
            loading={loading}
            className="h-full"
          >
            <div style={{ height: '580px' }}>
              <ResponsivePie
                data={pieChartData}
                margin={{ top: 40, right: 100, bottom: 165, left: 100 }}
                innerRadius={0.5}
                padAngle={0.7}
                cornerRadius={3}
                activeOuterRadiusOffset={8}
                colors={{ scheme: 'nivo' }}
                borderWidth={1}
                borderColor={{
                  from: 'color',
                  modifiers: [['darker', 0.2]],
                }}
                enableArcLabels={true}
                arcLabel={(d) => `${d.value}`}
                arcLabelsTextColor="#333333"
                arcLabelsSkipAngle={10}
                enableArcLinkLabels={false}
                legends={[
                  {
                    anchor: 'bottom',
                    direction: 'column',
                    justify: false,
                    translateX: 0,
                    translateY: 120,
                    itemsSpacing: 8,
                    itemWidth: 200,
                    itemHeight: 20,
                    itemTextColor: '#333',
                    itemDirection: 'left-to-right',
                    itemOpacity: 1,
                    symbolSize: 16,
                    symbolShape: 'circle',
                  },
                ]}
              />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        {/* Bar Chart - Monthly Revenue */}
        <Col xs={24}>
          <Card title="Doanh thu 6 tháng gần nhất" loading={loading}>
            <div style={{ height: '400px' }}>
              <ResponsiveBar
                data={barChartData}
                keys={['revenue']}
                indexBy="month"
                margin={{ top: 50, right: 130, bottom: 70, left: 80 }}
                padding={0.3}
                valueScale={{ type: 'linear' }}
                indexScale={{ type: 'band', round: true }}
                colors={{ scheme: 'nivo' }}
                borderColor={{
                  from: 'color',
                  modifiers: [['darker', 1.6]],
                }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: 'Tháng',
                  legendPosition: 'middle',
                  legendOffset: 40,
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: 'Doanh thu (triệu VNĐ)',
                  legendPosition: 'middle',
                  legendOffset: -60,
                  format: (value) => formatCurrency(value),
                }}
                labelSkipWidth={12}
                labelSkipHeight={12}
                labelTextColor={{
                  from: 'color',
                  modifiers: [['darker', 1.6]],
                }}
                legends={[
                  {
                    dataFrom: 'keys',
                    anchor: 'bottom-right',
                    direction: 'column',
                    justify: false,
                    translateX: 120,
                    translateY: 0,
                    itemsSpacing: 2,
                    itemWidth: 100,
                    itemHeight: 20,
                    itemDirection: 'left-to-right',
                    itemOpacity: 0.85,
                    symbolSize: 20,
                    effects: [
                      {
                        on: 'hover',
                        style: {
                          itemOpacity: 1,
                        },
                      },
                    ],
                  },
                ]}
                role="application"
                ariaLabel="Monthly revenue bar chart"
                tooltip={({ id, value, indexValue }) => (
                  <div
                    style={{
                      padding: '12px',
                      background: 'white',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                    }}
                  >
                    <strong>{indexValue}</strong>
                    <br />
                    Doanh thu: {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(Number(value))}
                  </div>
                )}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </>
  );
};
