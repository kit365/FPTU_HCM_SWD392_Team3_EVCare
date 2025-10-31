import { useCallback, useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import type { View } from "react-big-calendar";
import moment from "moment";

import "react-big-calendar/lib/css/react-big-calendar.css";
import { 
  Card, 
  Tabs,
  Tab,
  Box,
  Chip,
  Pagination,
  Stack,
  Tooltip,
  Typography
} from "@mui/material";
import { CardHeaderAdmin } from "../../../components/admin/ui/CardHeader";
import { FormSearch } from "../../../components/admin/ui/FormSearch";
import { FormEmpty } from "../../../components/admin/ui/FormEmpty";
import { useShift } from "../../../hooks/useShift";
import { useAuthContext } from "../../../context/useAuthContext";
import { useNavigate } from "react-router-dom";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ListIcon from "@mui/icons-material/List";
import { maintenanceManagementService } from "../../../service/maintenanceManagementService";
import { toast } from "react-toastify";

// Setup locale cho calendar
moment.locale("vi");
const localizer = momentLocalizer(moment);

// Custom messages cho calendar
const messages = {
  allDay: "Cả ngày",
  previous: "Trước",
  next: "Sau",
  today: "Hôm nay",
  month: "Tháng",
  week: "Tuần",
  day: "Ngày",
  agenda: "Lịch trình",
  date: "Ngày",
  time: "Thời gian",
  event: "Ca làm",
  noEventsInRange: "Không có ca làm nào trong khoảng thời gian này",
  showMore: (total: number) => `+${total} ca làm nữa`,
};

const columns = [
  { title: "STT", width: 5 },
  { title: "Loại ca", width: 12 },
  { title: "Khách hàng", width: 15 },
  { title: "Biển số xe", width: 10 },
  { title: "Thời gian bắt đầu", width: 15 },
  { title: "Thời gian kết thúc", width: 15 },
  { title: "Tổng giờ", width: 8 },
  { title: "Trạng thái", width: 12 },
  { title: "Hành động", width: 8 },
];

const MyShifts = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;
  const [keyword, setKeyword] = useState<string>("");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [calendarView, setCalendarView] = useState<View>("month");
  const [calendarDate, setCalendarDate] = useState(new Date());

  const { user } = useAuthContext();
  const { list, totalPages, searchByTechnician, loading } = useShift();
  const navigate = useNavigate();

  const load = useCallback(() => {
    if (user?.userId) {
      searchByTechnician(user.userId, {
        page: currentPage - 1,
        pageSize: viewMode === "calendar" ? 100 : pageSize, // Load nhiều hơn cho calendar view
        keyword
      });
    }
  }, [currentPage, pageSize, keyword, searchByTechnician, user?.userId, viewMode]);

  useEffect(() => {
    load();
  }, [load]);

  // Reload khi chuyển view mode
  useEffect(() => {
    if (user?.userId) {
      load();
    }
  }, [viewMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = useCallback((value: string) => {
    setKeyword(value);
    setCurrentPage(1);
  }, []);

  // Handle view shift detail - navigate to shift detail page to see all tasks
  const handleViewShiftDetail = useCallback((shift: any) => {
    if (!shift.shiftId) {
      toast.error("Không tìm thấy thông tin ca làm!");
      return;
    }
    // Navigate đến trang chi tiết shift để xem tất cả tasks
    navigate(`/admin/shift/view/${shift.shiftId}`);
  }, [navigate]);

  const formatDateTime = (dateString: string) => {
    return moment(dateString).format("DD/MM/YYYY HH:mm");
  };

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: { label: string; color: any } } = {
      'PENDING_ASSIGNMENT': { label: 'Chờ phân công', color: 'warning' },
      'LATE_ASSIGNMENT': { label: 'Quá hạn', color: 'error' },
      'SCHEDULED': { label: 'Đã lên lịch', color: 'info' },
      'IN_PROGRESS': { label: 'Đang thực hiện', color: 'primary' },
      'COMPLETED': { label: 'Hoàn thành', color: 'success' },
      'CANCELLED': { label: 'Đã hủy', color: 'default' }
    };
    return statusMap[status] || { label: status, color: 'default' };
  };

  const getShiftTypeLabel = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'APPOINTMENT': 'Lịch hẹn',
      'ON_DUTY': 'Ca trực',
      'INVENTORY_CHECK': 'Kiểm kê',
      'OTHER': 'Khác'
    };
    return typeMap[type] || type;
  };

  // Chuyển đổi shifts thành events cho calendar
  const calendarEvents = list.map(shift => ({
    id: shift.shiftId,
    title: shift.appointment 
      ? `${shift.appointment.customerFullName} - ${shift.appointment.vehicleNumberPlate}` 
      : getShiftTypeLabel(shift.shiftType),
    start: new Date(shift.startTime),
    end: shift.endTime ? new Date(shift.endTime) : new Date(shift.startTime),
    resource: shift,
  }));

  // Custom style cho events
  const eventStyleGetter = (event: any) => {
    const shift = event.resource;
    const statusColors: { [key: string]: string } = {
      'PENDING_ASSIGNMENT': '#ff9800',
      'LATE_ASSIGNMENT': '#f44336',
      'SCHEDULED': '#2196f3',
      'IN_PROGRESS': '#9c27b0',
      'COMPLETED': '#4caf50',
      'CANCELLED': '#9e9e9e'
    };
    
    return {
      style: {
        backgroundColor: statusColors[shift.status] || '#2196f3',
        borderRadius: '5px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  return (
    <div className="max-w-[1320px] px-[12px] mx-auto">
      <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
        <CardHeaderAdmin title="Ca làm của tôi" />

        <div className="px-[2.4rem] pb-[2.4rem] h-full">
          {/* Tabs để switch giữa List và Calendar */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={viewMode} 
              onChange={(_, newValue) => setViewMode(newValue)}
              aria-label="shift view tabs"
            >
              <Tab 
                icon={<ListIcon />} 
                iconPosition="start" 
                label="Danh sách" 
                value="list" 
              />
              <Tab 
                icon={<CalendarMonthIcon />} 
                iconPosition="start" 
                label="Lịch" 
                value="calendar" 
              />
            </Tabs>
          </Box>

          {/* Search bar cho cả 2 view */}
          <FormSearch onSearch={handleSearch} />

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* LIST VIEW */}
              {viewMode === "list" && (
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
                        list.map((item, index) => {
                          const statusInfo = getStatusLabel(item.status);
                          return (
                            <tr
                              key={item.shiftId}
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
                              <td className="p-[1.2rem]">
                                {getShiftTypeLabel(item.shiftType)}
                              </td>
                              <td className="p-[1.2rem]">
                                {item.appointment?.customerFullName || "-"}
                              </td>
                              <td className="p-[1.2rem]">
                                {item.appointment?.vehicleNumberPlate || "-"}
                              </td>
                              <td className="p-[1.2rem]">
                                {formatDateTime(item.startTime)}
                              </td>
                              <td className="p-[1.2rem]">
                                {item.endTime ? formatDateTime(item.endTime) : "-"}
                              </td>
                              <td className="p-[1.2rem]">
                                {item.totalHours ? `${item.totalHours}h` : "-"}
                              </td>
                              <td className="p-[1.2rem]">
                                <Chip
                                  label={statusInfo.label}
                                  color={statusInfo.color}
                                  size="small"
                                  sx={{ fontWeight: 600 }}
                                />
                              </td>
                              <td className="p-[1.2rem]">
                                <button
                                  onClick={() => handleViewShiftDetail(item)}
                                  className="text-blue-500 w-[2rem] h-[2rem] inline-flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer"
                                  title="Xem chi tiết quản lý bảo dưỡng"
                                >
                                  <RemoveRedEyeIcon className="!w-full !h-full" />
                                </button>
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

              {/* CALENDAR VIEW */}
              {viewMode === "calendar" && (
                <Box>
                  {/* Stats Summary */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
                    <Box sx={{ 
                      p: 2.5, 
                      background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                      borderRadius: 3,
                      color: 'white',
                      boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
                    }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                        {list.filter(s => s.status === 'SCHEDULED').length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>Đã lên lịch</Typography>
                    </Box>
                    <Box sx={{ 
                      p: 2.5, 
                      background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
                      borderRadius: 3,
                      color: 'white',
                      boxShadow: '0 4px 12px rgba(156, 39, 176, 0.3)'
                    }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                        {list.filter(s => s.status === 'IN_PROGRESS').length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>Đang thực hiện</Typography>
                    </Box>
                    <Box sx={{ 
                      p: 2.5, 
                      background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
                      borderRadius: 3,
                      color: 'white',
                      boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
                    }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                        {list.filter(s => s.status === 'COMPLETED').length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>Hoàn thành</Typography>
                    </Box>
                    <Box sx={{ 
                      p: 2.5, 
                      background: 'linear-gradient(135deg, #607d8b 0%, #455a64 100%)',
                      borderRadius: 3,
                      color: 'white',
                      boxShadow: '0 4px 12px rgba(96, 125, 139, 0.3)'
                    }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                        {list.length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>Tổng ca làm</Typography>
                    </Box>
                  </Box>

                  {/* Calendar Legend */}
                  <Box sx={{ 
                    mb: 3, 
                    p: 2.5, 
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                    borderRadius: 3,
                    border: '1px solid #dee2e6'
                  }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: '#495057', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#667eea' }} />
                      Chú thích trạng thái ca làm
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                      <Chip 
                        label="Đã lên lịch" 
                        size="small" 
                        sx={{ 
                          backgroundColor: '#2196f3', 
                          color: 'white', 
                          fontWeight: 600,
                          boxShadow: '0 2px 4px rgba(33, 150, 243, 0.3)'
                        }} 
                      />
                      <Chip 
                        label="Đang thực hiện" 
                        size="small" 
                        sx={{ 
                          backgroundColor: '#9c27b0', 
                          color: 'white', 
                          fontWeight: 600,
                          boxShadow: '0 2px 4px rgba(156, 39, 176, 0.3)'
                        }} 
                      />
                      <Chip 
                        label="Hoàn thành" 
                        size="small" 
                        sx={{ 
                          backgroundColor: '#4caf50', 
                          color: 'white', 
                          fontWeight: 600,
                          boxShadow: '0 2px 4px rgba(76, 175, 80, 0.3)'
                        }} 
                      />
                      <Chip 
                        label="Đã hủy" 
                        size="small" 
                        sx={{ 
                          backgroundColor: '#9e9e9e', 
                          color: 'white', 
                          fontWeight: 600,
                          boxShadow: '0 2px 4px rgba(158, 158, 158, 0.3)'
                        }} 
                      />
                    </Box>
                  </Box>

                  {/* Calendar Container với custom styling */}
                  <Box 
                    sx={{ 
                      backgroundColor: 'white',
                      p: 3,
                      borderRadius: 3,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                      border: '1px solid #e9ecef',
                      '& .rbc-calendar': {
                        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                      },
                      '& .rbc-header': {
                        padding: '18px 8px',
                        fontWeight: 700,
                        fontSize: '1rem',
                        color: 'white',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderBottom: 'none',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      },
                      '& .rbc-today': {
                        backgroundColor: '#fff3e0',
                        fontWeight: 700
                      },
                      '& .rbc-off-range-bg': {
                        backgroundColor: '#f8f9fa',
                      },
                      '& .rbc-event': {
                        padding: '6px 8px',
                        borderRadius: '6px',
                        border: 'none',
                        boxShadow: '0 3px 8px rgba(0,0,0,0.18)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateY(-3px) scale(1.02)',
                          boxShadow: '0 6px 16px rgba(0,0,0,0.28)',
                        }
                      },
                      '& .rbc-event-label': {
                        fontSize: '0.75rem',
                        fontWeight: 700
                      },
                      '& .rbc-toolbar': {
                        padding: '20px 0',
                        marginBottom: '24px',
                        flexWrap: 'wrap',
                        gap: '12px',
                        '& button': {
                          fontWeight: 600,
                          padding: '12px 24px',
                          borderRadius: '10px',
                          border: '2px solid #e9ecef',
                          backgroundColor: 'white',
                          color: '#495057',
                          fontSize: '0.95rem',
                          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                            borderColor: '#667eea',
                            color: '#667eea',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
                          },
                          '&.rbc-active': {
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            borderColor: '#667eea',
                            boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)',
                            transform: 'translateY(-2px)'
                          }
                        }
                      },
                      '& .rbc-toolbar-label': {
                        fontWeight: 800,
                        fontSize: '1.5rem',
                        color: '#212529',
                        textTransform: 'capitalize',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      },
                      '& .rbc-month-view': {
                        border: '2px solid #e9ecef',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
                      },
                      '& .rbc-day-bg': {
                        borderColor: '#e9ecef',
                      },
                      '& .rbc-date-cell': {
                        padding: '10px',
                        '& > a': {
                          fontWeight: 600,
                          color: '#495057',
                          fontSize: '0.95rem'
                        }
                      }
                    }}
                  >
                    <div style={{ height: 'calc(100vh - 400px)', minHeight: '600px' }}>
                      <Calendar
                        localizer={localizer}
                        events={calendarEvents}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: '100%' }}
                        messages={messages}
                        view={calendarView}
                        onView={(view) => setCalendarView(view)}
                        date={calendarDate}
                        onNavigate={(date) => setCalendarDate(date)}
                        eventPropGetter={eventStyleGetter}
                        onSelectEvent={(event) => {
                          // Navigate to maintenance management detail
                          handleViewShiftDetail(event.resource);
                        }}
                        components={{
                          event: ({ event }) => (
                            <Tooltip 
                              title={
                                <Box sx={{ p: 0.5 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                    {event.title}
                                  </Typography>
                                  <Typography variant="caption" sx={{ display: 'block' }}>
                                    Trạng thái: {getStatusLabel(event.resource.status).label}
                                  </Typography>
                                  <Typography variant="caption" sx={{ display: 'block' }}>
                                    Thời gian: {moment(event.start).format('HH:mm')} - {moment(event.end).format('HH:mm')}
                                  </Typography>
                                </Box>
                              }
                              arrow
                            >
                              <div style={{ 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                padding: '2px 4px'
                              }}>
                                {event.title}
                              </div>
                            </Tooltip>
                          ),
                        }}
                      />
                    </div>
                  </Box>
                </Box>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default MyShifts;

