// @ts-nocheck
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Pagination,
  CircularProgress,
  Box,
  Typography,
  TextField,
  MenuItem,
  Grid,
  Button,
} from "@mui/material";
import { 
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon
} from "@mui/icons-material";

import { maintenanceManagementService } from "../../../service/maintenanceManagementService";
import type { MaintenanceManagementResponse } from "../../../types/maintenance-management.types";
import moment from "moment";
import { useAuthContext } from "../../../context/useAuthContext";

const MyMaintenanceManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  
  const [maintenanceList, setMaintenanceList] = useState<MaintenanceManagementResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  // Filters
  const [keyword, setKeyword] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Fetch danh sách maintenance của technician với filters
  const fetchMyMaintenance = useCallback(async () => {
    if (!user?.userId) {
      console.warn("User ID not found");
      return;
    }

    setLoading(true);
    try {
      const response = await maintenanceManagementService.searchByTechnician(
        user.userId,
        { 
          page, 
          pageSize,
          keyword: keyword || undefined,
          date: dateFilter || undefined,
          status: statusFilter || undefined,
        }
      );
      
      setMaintenanceList(response.data || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (error) {
      console.error("Failed to fetch maintenance list:", error);
      setMaintenanceList([]);
    } finally {
      setLoading(false);
    }
  }, [user?.userId, page, pageSize, keyword, dateFilter, statusFilter]);

  useEffect(() => {
    fetchMyMaintenance();
  }, [fetchMyMaintenance]);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value - 1);
  };

  const handleClearFilters = () => {
    setKeyword("");
    setDateFilter("");
    setStatusFilter("");
    setPage(0);
  };

  const handleSearch = () => {
    setPage(0);
    fetchMyMaintenance();
  };

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: { label: string; color: "default" | "warning" | "primary" | "success" | "error" } } = {
      PENDING: { label: "Chờ xử lý", color: "warning" },
      IN_PROGRESS: { label: "Đang thực hiện", color: "primary" },
      COMPLETED: { label: "Hoàn thành", color: "success" },
      CANCELLED: { label: "Đã hủy", color: "error" },
    };
    return statusMap[status] || { label: status, color: "default" };
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Chưa cập nhật";
    return moment(dateString).format("HH:mm - DD/MM/YYYY");
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (!user) {
    return (
      <div className="max-w-[1320px] px-[12px] mx-auto">
        <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
          <div className="p-[2.4rem] text-center">
            <Typography variant="h6" color="error">
              Vui lòng đăng nhập để xem danh sách công việc
            </Typography>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-[1320px] px-[12px] mx-auto">
      <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
        <div className="p-[2.4rem]">
          {/* Header */}
          <div className="mb-[2.4rem]">
            <Typography
              variant="h4"
              sx={{
                fontSize: "2rem",
                fontWeight: 700,
                color: "#1a1a1a",
                mb: 0.5,
              }}
            >
              📋 Công việc bảo dưỡng của tôi
            </Typography>
            <Typography sx={{ fontSize: "0.95rem", color: "#666" }}>
              Danh sách các công việc bảo dưỡng được phân công cho bạn
            </Typography>
          </div>

          {/* Filters */}
          <Box sx={{ mb: 3, p: 2, bgcolor: "#f8f9fa", borderRadius: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Tìm kiếm"
                  placeholder="Khách hàng, biển số..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Ngày"
                  InputLabelProps={{ shrink: true }}
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  select
                  label="Trạng thái"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="PENDING">Chờ xử lý</MenuItem>
                  <MenuItem value="IN_PROGRESS">Đang thực hiện</MenuItem>
                  <MenuItem value="COMPLETED">Hoàn thành</MenuItem>
                  <MenuItem value="CANCELLED">Đã hủy</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<FilterListIcon />}
                    onClick={handleSearch}
                    sx={{ textTransform: "none" }}
                  >
                    Lọc
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ClearIcon />}
                    onClick={handleClearFilters}
                    sx={{ textTransform: "none" }}
                  >
                    Xóa
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Loading State */}
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : maintenanceList.length === 0 ? (
            <Box py={4} textAlign="center">
              <Typography variant="h6" color="textSecondary">
                📭 Chưa có công việc nào được phân công
              </Typography>
            </Box>
          ) : (
            <>
              {/* Table */}
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
                      <TableCell sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
                        STT
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
                        Khách hàng
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
                        Biển số xe
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
                        Dịch vụ
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
                        Thời gian bắt đầu
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
                        Trạng thái
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
                        Tổng tiền
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ fontWeight: 600, fontSize: "0.9rem" }}
                      >
                        Hành động
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {maintenanceList.map((item, index) => {
                      const statusInfo = getStatusLabel(item.status || "PENDING");
                      return (
                        <TableRow
                          key={item.maintenanceManagementId}
                          hover
                          sx={{
                            "&:hover": { backgroundColor: "#fafafa" },
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            navigate(
                              `/admin/maintenance/${item.maintenanceManagementId}`
                            )
                          }
                         >
                           <TableCell>{page * pageSize + index + 1}</TableCell>
                           <TableCell>{item.appointmentResponse?.customerFullName || "N/A"}</TableCell>
                           <TableCell>
                             <strong>{item.appointmentResponse?.vehicleNumberPlate || "N/A"}</strong>
                           </TableCell>
                           <TableCell>{item.serviceTypeResponse?.serviceName || "N/A"}</TableCell>
                           <TableCell>{formatDate(item.startTime)}</TableCell>
                           <TableCell>
                             <Chip
                               label={statusInfo.label}
                               color={statusInfo.color}
                               size="small"
                             />
                           </TableCell>
                           <TableCell>
                             <strong>{formatCurrency(item.totalCost)}</strong>
                           </TableCell>
                          <TableCell align="center">
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(
                                  `/admin/maintenance/${item.maintenanceManagementId}`
                                );
                              }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box display="flex" justifyContent="center" mt={3}>
                  <Pagination
                    count={totalPages}
                    page={page + 1}
                    onChange={handlePageChange}
                    color="primary"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}

              {/* Summary */}
              <Box mt={2} textAlign="center">
                <Typography variant="body2" color="textSecondary">
                  Tổng số: <strong>{totalElements}</strong> công việc
                </Typography>
              </Box>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default MyMaintenanceManagement;

