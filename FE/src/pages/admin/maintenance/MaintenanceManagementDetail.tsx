import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMaintenanceManagement } from '../../../hooks/useMaintenanceManagement';
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditNoteIcon from '@mui/icons-material/EditNote';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BuildIcon from '@mui/icons-material/Build';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TimerIcon from '@mui/icons-material/Timer';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { maintenanceRecordService } from '../../../service/maintenanceRecordService';
import { toast } from 'react-toastify';
import { vehiclePartService } from '../../../service/vehiclePartService';
import type { VehiclePartResponse } from '../../../types/vehicle-part.types';
import { Autocomplete } from '@mui/material';

export const MaintenanceManagementDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { detail, statusList, loading, getById, updateNotes, updateStatus, getStatusList } = useMaintenanceManagement();
  
  const [openNotesDialog, setOpenNotesDialog] = useState(false);
  const [notes, setNotes] = useState('');
  const [approvingRecordId, setApprovingRecordId] = useState<string | null>(null);
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<any>(null);
  
  // Add new record states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [vehiclePartsList, setVehiclePartsList] = useState<VehiclePartResponse[]>([]);
  const [selectedVehiclePart, setSelectedVehiclePart] = useState<VehiclePartResponse | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [addingRecord, setAddingRecord] = useState(false);
  const [loadingVehicleParts, setLoadingVehicleParts] = useState(false);
  
  // Update quantity states
  const [openUpdateQuantityDialog, setOpenUpdateQuantityDialog] = useState(false);
  const [recordToUpdateQuantity, setRecordToUpdateQuantity] = useState<any>(null);
  const [updateQuantity, setUpdateQuantity] = useState<number>(1);
  const [updatingQuantity, setUpdatingQuantity] = useState(false);
  
  // Completion confirmation modal states
  const [openCompletionModal, setOpenCompletionModal] = useState(false);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (id) {
      getById(id, { page: 0, pageSize: 50 });
    }
    getStatusList(); // Load status list from BE
  }, [id, getById, getStatusList]);

  useEffect(() => {
    if (detail?.notes) {
      setNotes(detail.notes);
    }
  }, [detail]);

  // Check if maintenance is editable (not COMPLETED or CANCELLED)
  const isEditable = detail?.status !== 'COMPLETED' && detail?.status !== 'CANCELLED';

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: { label: string; color: string } } = {
      'PENDING': { label: 'Chờ xử lý', color: 'bg-orange-100 text-orange-700' },
      'IN_PROGRESS': { label: 'Đang thực hiện', color: 'bg-blue-100 text-blue-700' },
      'COMPLETED': { label: 'Hoàn thành', color: 'bg-green-100 text-green-700' },
      'CANCELLED': { label: 'Đã hủy', color: 'bg-red-100 text-red-700' }
    };
    return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
  };

  const handleUpdateNotes = async () => {
    if (id && notes !== detail?.notes) {
      const success = await updateNotes(id, notes);
      if (success) {
        setOpenNotesDialog(false);
        getById(id, { page: 0, pageSize: 50 });
      }
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (id && newStatus !== detail?.status) {
      // ✅ Kiểm tra nếu có maintenance record chưa được duyệt thì không cho phép chuyển trạng thái
      const maintenanceRecords = detail?.maintenanceRecords?.data;
      if (maintenanceRecords && maintenanceRecords.length > 0) {
        const hasUnapprovedRecord = maintenanceRecords.some((record: any) => !record?.approvedByUser);
        
        if (hasUnapprovedRecord) {
          toast.error("Không thể chuyển trạng thái. Vui lòng đợi khách hàng duyệt tất cả các phụ tùng đã sử dụng trước khi chuyển trạng thái.");
          return;
        }
      }

      const success = await updateStatus(id, newStatus);
      if (success) {
        getById(id, { page: 0, pageSize: 50 });
      }
    }
  };

  // Handle completion confirmation
  const handleOpenCompletionModal = () => {
    setOpenCompletionModal(true);
  };

  const handleCloseCompletionModal = () => {
    setOpenCompletionModal(false);
  };

  const handleConfirmCompletion = async () => {
    if (!id) return;
    
    // ✅ Kiểm tra nếu có maintenance record chưa được duyệt thì không cho phép hoàn thành
    const maintenanceRecords = detail?.maintenanceRecords?.data;
    if (maintenanceRecords && maintenanceRecords.length > 0) {
      const hasUnapprovedRecord = maintenanceRecords.some((record: any) => !record?.approvedByUser);
      
      if (hasUnapprovedRecord) {
        toast.error("Không thể hoàn thành bảo dưỡng. Vui lòng đợi khách hàng duyệt tất cả các phụ tùng đã sử dụng trước khi hoàn thành.");
        return;
      }
    }
    
    setCompleting(true);
    try {
      const success = await updateStatus(id, 'COMPLETED');
      if (success) {
        setOpenCompletionModal(false);
        getById(id, { page: 0, pageSize: 50 });
        toast.success("Đã hoàn thành bảo dưỡng thành công!");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể hoàn thành bảo dưỡng");
    } finally {
      setCompleting(false);
    }
  };

  // Handle approve maintenance record
  const handleApproveRecord = async (recordId: string, record: any) => {
    if (!recordId || !record) return;

    setApprovingRecordId(recordId);
    try {
      await maintenanceRecordService.approve(recordId, {
        vehiclePartInventoryId: record.vehiclePartResponse?.vehiclePartId || '',
        quantityUsed: record.quantityUsed || 1,
        approvedByUser: true,
        isActive: record.isActive,
        isDeleted: record.isDeleted,
      });
      
      toast.success("Đã duyệt phụ tùng thành công");

      // Refresh data
      if (id) {
        getById(id, { page: 0, pageSize: 50 });
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể duyệt phụ tùng");
    } finally {
      setApprovingRecordId(null);
    }
  };

  // Handle delete maintenance record
  const handleOpenDeleteDialog = (record: any) => {
    setRecordToDelete(record);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setRecordToDelete(null);
    setOpenDeleteDialog(false);
  };

  const handleConfirmDelete = async () => {
    if (!recordToDelete?.maintenanceRecordId) return;

    setDeletingRecordId(recordToDelete.maintenanceRecordId);
    try {
      await maintenanceRecordService.delete(recordToDelete.maintenanceRecordId);
      
      toast.success("Đã xóa phụ tùng thành công");

      // Refresh data
      if (id) {
        getById(id, { page: 0, pageSize: 50 });
      }
      
      handleCloseDeleteDialog();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể xóa phụ tùng");
    } finally {
      setDeletingRecordId(null);
    }
  };

  // Handle add new maintenance record
  const handleOpenAddDialog = async () => {
    // Get vehicleTypeId from appointment
    const vehicleTypeId = detail?.appointmentResponse?.vehicleTypeResponse?.vehicleTypeId;
    
    if (!vehicleTypeId) {
      toast.error("Không tìm thấy thông tin loại xe");
      return;
    }

    setOpenAddDialog(true);
    setLoadingVehicleParts(true);
    
    try {
      // Fetch vehicle parts by vehicle type ID - chỉ lấy phụ tùng phù hợp với loại xe
      const parts = await vehiclePartService.getByVehicleTypeId(vehicleTypeId);
      setVehiclePartsList(parts);
    } catch (error: any) {
      toast.error("Không thể tải danh sách phụ tùng");
      console.error(error);
    } finally {
      setLoadingVehicleParts(false);
    }
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setSelectedVehiclePart(null);
    setQuantity(1);
  };

  const handleConfirmAdd = async () => {
    if (!id || !selectedVehiclePart) {
      toast.error("Vui lòng chọn phụ tùng");
      return;
    }

    if (quantity < 1) {
      toast.error("Số lượng phải lớn hơn 0");
      return;
    }

    setAddingRecord(true);
    try {
      await maintenanceRecordService.create(id, {
        vehiclePartInventoryId: selectedVehiclePart.vehiclePartId,
        quantityUsed: quantity,
        approvedByUser: false, // Default: chưa duyệt
      });
      
      toast.success("Đã thêm phụ tùng thành công");

      // Refresh data
      getById(id, { page: 0, pageSize: 50 });
      
      handleCloseAddDialog();
    } catch (error: any) {
      console.error("❌ Error adding maintenance record:", error);
      console.error("❌ Error response:", error?.response);
      console.error("❌ Error data:", error?.response?.data);
      console.error("❌ Error message:", error?.response?.data?.message);
      
      const errorMessage = error?.response?.data?.message || error?.message || "Không thể thêm phụ tùng";
      
      // KHÔNG đóng dialog khi lỗi để user thấy toast
      // handleCloseAddDialog(); // ← Đã đóng ở line 212 nếu thành công
      
      toast.error(errorMessage, {
        autoClose: 5000, // 5 seconds
        position: "top-center", // Hiển thị ở top để không bị dialog che
      });
    } finally {
      setAddingRecord(false);
    }
  };

  // Handle update quantity
  const handleOpenUpdateQuantityDialog = (record: any) => {
    // Tìm record mới nhất từ detail để đảm bảo có dữ liệu tồn kho mới nhất
    const latestRecord = detail?.maintenanceRecords?.data?.find(
      (r: any) => r.maintenanceRecordId === record.maintenanceRecordId
    ) || record;
    
    setRecordToUpdateQuantity(latestRecord);
    setUpdateQuantity(latestRecord?.quantityUsed || 1);
    setOpenUpdateQuantityDialog(true);
  };

  const handleCloseUpdateQuantityDialog = () => {
    setRecordToUpdateQuantity(null);
    setUpdateQuantity(1);
    setOpenUpdateQuantityDialog(false);
  };

  const handleConfirmUpdateQuantity = async () => {
    if (!recordToUpdateQuantity?.maintenanceRecordId) return;

    if (updateQuantity < 1) {
      toast.error("Số lượng phải lớn hơn 0");
      return;
    }

    // Check max quantity based on current stock
    // Khi update, backend sẽ hoàn lại số lượng cũ trước, nên tồn kho thực tế = currentQuantity + quantityUsed hiện tại
    const currentStock = recordToUpdateQuantity?.vehiclePartResponse?.currentQuantity || 0;
    const currentQuantityUsed = recordToUpdateQuantity?.quantityUsed || 0;
    const maxStock = currentStock + currentQuantityUsed; // Tồn kho thực tế có sẵn
    
    if (updateQuantity > maxStock) {
      toast.error(`Số lượng không được vượt quá tồn kho hiện tại (${maxStock} cái)`);
      return;
    }

    setUpdatingQuantity(true);
    try {
      await maintenanceRecordService.update(recordToUpdateQuantity.maintenanceRecordId, {
        vehiclePartInventoryId: recordToUpdateQuantity.vehiclePartResponse?.vehiclePartId || '',
        quantityUsed: updateQuantity,
        approvedByUser: recordToUpdateQuantity.approvedByUser || false,
        isActive: recordToUpdateQuantity.isActive,
        isDeleted: recordToUpdateQuantity.isDeleted,
      });
      
      toast.success("Đã cập nhật số lượng thành công");

      // Refresh data và đợi cho dữ liệu được load xong
      if (id) {
        await getById(id, { page: 0, pageSize: 50 });
      }
      
      handleCloseUpdateQuantityDialog();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể cập nhật số lượng");
    } finally {
      setUpdatingQuantity(false);
    }
  };

  // Helper function to get next possible status
  const getNextStatus = (currentStatus: string): string | null => {
    const statusFlow: { [key: string]: string } = {
      'PENDING': 'IN_PROGRESS',
      'IN_PROGRESS': 'COMPLETED'
    };
    return statusFlow[currentStatus] || null;
  };

  // Helper function to get next status button label
  const getNextStatusButton = (currentStatus: string) => {
    const buttonConfig: { [key: string]: { label: string; icon: any; color: string } } = {
      'PENDING': { 
        label: 'Bắt đầu thực hiện', 
        icon: <BuildIcon />,
        color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      },
      'IN_PROGRESS': { 
        label: 'Hoàn thành', 
        icon: <CheckCircleIcon />,
        color: '#4caf50'
      }
    };
    return buttonConfig[currentStatus] || null;
  };

  if (loading && !detail) {
    return (
      <Box className="flex justify-center items-center min-h-[400px]">
        <CircularProgress />
      </Box>
    );
  }

  if (!detail) {
    return (
      <Box className="p-6">
        <Typography variant="h6" color="error">Không tìm thấy thông tin bảo dưỡng</Typography>
      </Box>
    );
  }

  const status = detail?.status || 'PENDING';
  const totalCost = detail?.totalCost || 0;
  const startTime = detail?.startTime || '';
  const endTime = detail?.endTime || '';
  const serviceTypeResponse = detail?.serviceTypeResponse;
  const appointmentResponse = detail?.appointmentResponse;
  const maintenanceRecords = detail?.maintenanceRecords;

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#fafbfc', p: 3 }}>
      <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)}
              sx={{
                color: '#6b7280',
                fontSize: '0.875rem',
                '&:hover': {
                  backgroundColor: '#f3f4f6',
                  color: '#111827'
                }
              }}
            >
              Quay lại
            </Button>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 600, color: '#111827', mb: 0.5, fontSize: '2rem' }}>
                Chi tiết quản lý bảo dưỡng
              </Typography>
              <Typography sx={{ color: '#6b7280', fontSize: '1.1rem' }}>
                Mã phiếu: {id?.substring(0, 8).toUpperCase() || 'N/A'}
              </Typography>
            </Box>

            {/* Status */}
            <Chip
              label={getStatusLabel(status)?.label || 'N/A'}
              className={`${getStatusLabel(status)?.color || 'bg-gray-100 text-gray-700'}`}
              sx={{ 
                height: 40,
                borderRadius: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                px: 2.5
              }}
            />
          </Box>
        </Box>

      {/* Main Content */}
      <Box className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <Box className="lg:col-span-2 space-y-6">
          {/* Maintenance Records (Parts Used) - MAIN SECTION */}
          <Box sx={{ 
            backgroundColor: 'white',
            borderRadius: 2,
            border: '1px solid #e5e7eb',
            overflow: 'hidden'
          }}>
            {/* Card Header */}
            <Box sx={{ 
              p: 3,
              borderBottom: '1px solid #e5e7eb',
              backgroundColor: '#f9fafb'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    backgroundColor: '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <BuildIcon sx={{ fontSize: '1.25rem', color: 'white' }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', fontSize: '1.4rem' }}>
                      {serviceTypeResponse?.serviceName || 'N/A'}
                    </Typography>
                    <Typography sx={{ color: '#6b7280', fontSize: '1rem' }}>
                      Phụ tùng & vật tư sử dụng
                    </Typography>
                  </Box>
                </Box>
                
                {/* Add Button & Counter */}
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Chip
                    label={`${maintenanceRecords?.totalElements || 0} phụ tùng`}
                    sx={{
                      backgroundColor: '#eff6ff',
                      color: '#3b82f6',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      height: 28
                    }}
                  />
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenAddDialog}
                    disabled={!isEditable}
                    sx={{
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      fontWeight: 600,
                      px: 2.5,
                      py: 1,
                      fontSize: '0.875rem',
                      textTransform: 'none',
                      boxShadow: 'none',
                      '&:hover': {
                        backgroundColor: '#2563eb',
                        boxShadow: 'none'
                      },
                      '&:disabled': {
                        backgroundColor: '#ccc',
                        color: '#666'
                      }
                    }}
                  >
                    Thêm phụ tùng
                  </Button>
                </Box>
              </Box>
            </Box>

            {/* Card Body */}
            <Box sx={{ p: 3 }}>

            {maintenanceRecords?.data && maintenanceRecords.data.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {maintenanceRecords.data.map((record, index) => (
                  <Box
                    key={record?.maintenanceRecordId || index}
                    sx={{
                      p: 3,
                      backgroundColor: 'white',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: record?.approvedByUser ? '#d1fae5' : '#fef3c7',
                      borderLeftWidth: 4,
                      borderLeftColor: record?.approvedByUser ? '#10b981' : '#f59e0b',
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        transform: 'translateX(4px)'
                      }
                    }}
                  >
                    <Box className="flex justify-between items-start">
                      <Box className="flex-1">
                        <Box className="flex items-center gap-2 mb-2">
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#212529', fontSize: '1.25rem' }}>
                            {index + 1}. {record?.vehiclePartResponse?.vehiclePartName || 'N/A'}
                          </Typography>
                          {record?.approvedByUser ? (
                            <Chip
                              label="✓ Đã duyệt"
                              size="small"
                              sx={{ 
                                backgroundColor: '#4caf50', 
                                color: 'white', 
                                fontWeight: 600,
                                height: '24px'
                              }}
                            />
                          ) : (
                            <Chip
                              label="⚠ Chưa duyệt"
                              size="small"
                              sx={{ 
                                backgroundColor: '#ff9800', 
                                color: 'white', 
                                fontWeight: 600,
                                height: '24px'
                              }}
                            />
                          )}
                        </Box>
                        <Box className="grid grid-cols-2 gap-3 mt-2">
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography variant="body2" sx={{ color: '#999', fontSize: '1rem' }}>
                                Số lượng sử dụng
                              </Typography>
                              {isEditable && (
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenUpdateQuantityDialog(record)}
                                  sx={{
                                    padding: '4px',
                                    color: '#667eea',
                                    '&:hover': {
                                      backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                      transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.2s'
                                  }}
                                  title="Chỉnh sửa số lượng"
                                >
                                  <EditIcon sx={{ fontSize: '1rem' }} />
                                </IconButton>
                              )}
                            </Box>
                            <Typography variant="body1" sx={{ fontWeight: 600, color: '#667eea', fontSize: '1.15rem' }}>
                              {record?.quantityUsed || 0} cái
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ color: '#999', display: 'block', fontSize: '1rem', mb: 0.5 }}>
                              Đơn giá
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '1.15rem' }}>
                              {record?.vehiclePartResponse?.unitPrice?.toLocaleString('vi-VN') || '0'} ₫/cái
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ color: '#999', display: 'block', fontSize: '1rem', mb: 0.5 }}>
                              Thành tiền
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 700, color: '#667eea', fontSize: '1.2rem' }}>
                              {((record?.quantityUsed || 0) * (record?.vehiclePartResponse?.unitPrice || 0)).toLocaleString('vi-VN')} ₫
                            </Typography>
                          </Box>
                        </Box>
                        {record?.notes && (
                          <Box sx={{ mt: 2, p: 1.5, backgroundColor: 'rgba(102, 126, 234, 0.1)', borderRadius: 1 }}>
                            <Typography variant="body2" sx={{ color: '#667eea', fontWeight: 600, fontSize: '1rem' }}>
                              📝 Ghi chú: {record.notes}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      
                      {/* Action Buttons */}
                      <Box sx={{ ml: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {/* Approve Button - Only show if not approved and editable */}
                        {!record?.approvedByUser && isEditable && (
                          <IconButton
                            onClick={() => handleApproveRecord(record.maintenanceRecordId, record)}
                            disabled={approvingRecordId === record.maintenanceRecordId}
                            sx={{
                              backgroundColor: '#4caf50',
                              color: 'white',
                              '&:hover': {
                                backgroundColor: '#45a049',
                                transform: 'scale(1.1)'
                              },
                              '&:disabled': {
                                backgroundColor: '#ccc'
                              },
                              transition: 'all 0.3s',
                              width: 48,
                              height: 48
                            }}
                            title="Duyệt phụ tùng này"
                          >
                            {approvingRecordId === record.maintenanceRecordId ? (
                              <CircularProgress size={24} sx={{ color: 'white' }} />
                            ) : (
                              <ThumbUpIcon />
                            )}
                          </IconButton>
                        )}

                        {/* Delete Button - Only show if editable */}
                        {isEditable && (
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDeleteDialog(record);
                          }}
                          disabled={deletingRecordId === record.maintenanceRecordId}
                          sx={{
                            backgroundColor: '#fff',
                            color: '#f44336',
                            border: '2px solid #f44336',
                            '&:hover': {
                              backgroundColor: '#f44336',
                              color: 'white',
                              transform: 'scale(1.1)',
                              boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)'
                            },
                            '&:disabled': {
                              backgroundColor: '#f5f5f5',
                              borderColor: '#ccc',
                              color: '#ccc'
                            },
                            transition: 'all 0.3s',
                            width: 48,
                            height: 48
                          }}
                          title="Xóa phụ tùng này"
                        >
                          {deletingRecordId === record.maintenanceRecordId ? (
                            <CircularProgress size={24} sx={{ color: '#f44336' }} />
                          ) : (
                            <DeleteOutlineIcon />
                          )}
                        </IconButton>
                        )}
                      </Box>
                    </Box>
                  </Box>
                ))}

                {/* Total Cost Summary */}
                <Box sx={{ 
                  mt: 3, 
                  p: 3, 
                  backgroundColor: '#f9fafb',
                  borderRadius: 2,
                  border: '2px solid #e5e7eb'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body1" sx={{ color: '#6b7280', mb: 0.5, fontSize: '1.15rem' }}>
                        Tổng chi phí
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', fontSize: '2rem' }}>
                        {totalCost?.toLocaleString('vi-VN') || '0'} ₫
                      </Typography>
                    </Box>
                    <Chip
                      label={`${maintenanceRecords?.totalElements || 0} phụ tùng`}
                      sx={{
                        backgroundColor: '#eff6ff',
                        color: '#3b82f6',
                        fontWeight: 600
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            ) : (
              <Box sx={{ 
                textAlign: 'center', 
                py: 8
              }}>
                <BuildIcon sx={{ fontSize: '4rem', color: '#d1d5db', mb: 2 }} />
                <Typography variant="h6" sx={{ color: '#6b7280', mb: 1, fontWeight: 500, fontSize: '1.3rem' }}>
                  Chưa có phụ tùng nào
                </Typography>
                <Typography variant="body1" sx={{ color: '#9ca3af', mb: 3, fontSize: '1.1rem' }}>
                  Click "Thêm phụ tùng" để bắt đầu
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenAddDialog}
                  disabled={!isEditable}
                  sx={{
                    backgroundColor: '#3b82f6',
                    textTransform: 'none',
                    boxShadow: 'none',
                    '&:hover': {
                      backgroundColor: '#2563eb',
                      boxShadow: 'none'
                    },
                    '&:disabled': {
                      backgroundColor: '#ccc',
                      color: '#666'
                    }
                  }}
                >
                  Thêm phụ tùng
                </Button>
              </Box>
            )}
            </Box>
          </Box>

          {/* Time Tracking Info */}
          <Box sx={{
            backgroundColor: 'white',
            borderRadius: 2,
            border: '1px solid #e5e7eb',
            p: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, pb: 2, borderBottom: '1px solid #e5e7eb' }}>
              <Box sx={{
                width: 32,
                height: 32,
                borderRadius: 2,
                backgroundColor: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <TimerIcon sx={{ color: '#3b82f6', fontSize: '1.25rem' }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', fontSize: '1.4rem' }}>
                Thời gian thực hiện
              </Typography>
            </Box>
              <Box className="space-y-3">
              <Box className="flex justify-between items-center py-3 border-b border-gray-100">
                <Box className="flex items-center gap-1">
                  <AccessTimeIcon sx={{ fontSize: '1.25rem', color: '#999' }} />
                  <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem', fontWeight: 500 }}>Thời gian bắt đầu:</Typography>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 600, color: startTime ? '#212529' : '#999', fontSize: '1.15rem' }}>
                  {startTime ? new Date(startTime).toLocaleString('vi-VN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  }) : 'Chưa bắt đầu'}
                </Typography>
              </Box>
              <Box className="flex justify-between items-center py-3 border-b border-gray-100">
                <Box className="flex items-center gap-1">
                  <CheckCircleIcon sx={{ fontSize: '1.25rem', color: endTime ? '#4caf50' : '#999' }} />
                  <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem', fontWeight: 500 }}>Thời gian kết thúc:</Typography>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 600, color: endTime ? '#212529' : '#999', fontSize: '1.15rem' }}>
                  {endTime ? new Date(endTime).toLocaleString('vi-VN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  }) : 'Chưa hoàn thành'}
                </Typography>
              </Box>
              {startTime && endTime && (
                <Box className="flex justify-between items-center py-3 bg-blue-50 rounded-lg px-3">
                  <Box className="flex items-center gap-1">
                    <TimerIcon sx={{ fontSize: '1.25rem', color: '#667eea' }} />
                    <Typography variant="body1" sx={{ color: '#667eea', fontWeight: 600, fontSize: '1.1rem' }}>Thời gian thực hiện:</Typography>
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: '#667eea', fontSize: '1.2rem' }}>
                    {(() => {
                      const start = new Date(startTime);
                      const end = new Date(endTime);
                      const diffMs = end.getTime() - start.getTime();
                      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                      return `${diffHours} giờ ${diffMinutes} phút`;
                    })()}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* Appointment Info */}
          {appointmentResponse && (
            <Box sx={{
              backgroundColor: 'white',
              borderRadius: 2,
              border: '1px solid #e5e7eb',
              p: 3
            }}>
              <Box sx={{ pb: 2, mb: 3, borderBottom: '1px solid #e5e7eb' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', fontSize: '1.5rem' }}>
                  Thông tin cuộc hẹn
                </Typography>
              </Box>
              <Box className="space-y-3">
                <Box className="flex justify-between items-center py-3 border-b border-gray-100">
                  <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem', fontWeight: 500 }}>Khách hàng:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '1.15rem', color: '#111827' }}>
                    {appointmentResponse?.customerFullName || 'N/A'}
                  </Typography>
                </Box>
                <Box className="flex justify-between items-center py-3 border-b border-gray-100">
                  <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem', fontWeight: 500 }}>Số điện thoại:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '1.15rem', color: '#111827' }}>
                    {appointmentResponse?.customerPhoneNumber || 'N/A'}
                  </Typography>
                </Box>
                {appointmentResponse?.customerEmail && (
                  <Box className="flex justify-between items-center py-3 border-b border-gray-100">
                    <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem', fontWeight: 500 }}>Email:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '1.15rem', color: '#111827' }}>
                      {appointmentResponse.customerEmail}
                    </Typography>
                  </Box>
                )}
                <Box className="flex justify-between items-center py-3 border-b border-gray-100">
                  <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem', fontWeight: 500 }}>Biển số xe:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '1.15rem', color: '#111827' }}>
                    {appointmentResponse?.vehicleNumberPlate || 'N/A'}
                  </Typography>
                </Box>
                {appointmentResponse?.vehicleTypeResponse && (
                  <>
                    <Box className="flex justify-between items-center py-3 border-b border-gray-100">
                      <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem', fontWeight: 500 }}>Loại xe:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '1.15rem', color: '#111827' }}>
                        {appointmentResponse.vehicleTypeResponse.vehicleTypeName || 'N/A'}
                      </Typography>
                    </Box>
                    {(appointmentResponse.vehicleTypeResponse.manufacturer || appointmentResponse.vehicleTypeResponse.modelYear) && (
                      <Box className="flex justify-between items-center py-3">
                        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem', fontWeight: 500 }}>Hãng & Năm:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '1.15rem', color: '#111827' }}>
                          {appointmentResponse.vehicleTypeResponse.manufacturer || ''} {appointmentResponse.vehicleTypeResponse.modelYear ? `- ${appointmentResponse.vehicleTypeResponse.modelYear}` : ''}
                        </Typography>
                      </Box>
                    )}
                  </>
                )}
              </Box>
            </Box>
          )}
        </Box>

        {/* Right Column - Actions & Notes */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Actions */}
          <Box sx={{
            backgroundColor: 'white',
            borderRadius: 2,
            border: '1px solid #e5e7eb',
            p: 3
          }}>
            <Box sx={{ pb: 2, mb: 3, borderBottom: '1px solid #e5e7eb' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', fontSize: '1.4rem' }}>
                Hành động
              </Typography>
            </Box>
            <Box className="space-y-2">
              {/* Dynamic status transition button */}
              {getNextStatus(status) && getNextStatusButton(status) && (
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={getNextStatusButton(status)!.icon}
                  onClick={() => {
                    const nextStatus = getNextStatus(status);
                    // Nếu là "Hoàn thành", mở modal xác nhận
                    if (nextStatus === 'COMPLETED') {
                      handleOpenCompletionModal();
                    } else {
                      // Nếu là "Bắt đầu thực hiện", gọi trực tiếp
                      handleUpdateStatus(nextStatus!);
                    }
                  }}
                  sx={{
                    background: getNextStatusButton(status)!.color,
                    '&:hover': {
                      background: status === 'PENDING' 
                        ? 'linear-gradient(135deg, #5568d3 0%, #653993 100%)'
                        : '#388e3c',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    },
                    transition: 'all 0.3s'
                  }}
                >
                  {getNextStatusButton(status)!.label}
                </Button>
              )}
              
              {/* Edit notes button */}
              <Button
                fullWidth
                variant="outlined"
                startIcon={<EditNoteIcon />}
                onClick={() => setOpenNotesDialog(true)}
                disabled={!isEditable}
                sx={{
                  borderColor: '#667eea',
                  color: '#667eea',
                  '&:hover': {
                    borderColor: '#5568d3',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    transform: 'translateY(-2px)'
                  },
                  '&:disabled': {
                    borderColor: '#ccc',
                    color: '#999'
                  },
                  transition: 'all 0.3s'
                }}
              >
                Chỉnh sửa ghi chú
              </Button>

              {/* Info about status list */}
              {/* {statusList && statusList.length > 0 && (
                <Box sx={{ mt: 3, p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
                    Trạng thái có sẵn:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {statusList.map((st) => (
                      <Chip 
                        key={st}
                        label={getStatusLabel(st).label}
                        size="small"
                        sx={{ 
                          fontSize: '0.7rem',
                          height: 'auto',
                          py: 0.5
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )} */}
            </Box>
          </Box>

          {/* Notes */}
          <Box sx={{
            backgroundColor: 'white',
            borderRadius: 2,
            border: '1px solid #e5e7eb',
            p: 3
          }}>
            <Box sx={{ pb: 2, mb: 3, borderBottom: '1px solid #e5e7eb' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', fontSize: '1.4rem' }}>
                Ghi chú
              </Typography>
            </Box>
            <Box sx={{
              p: 2.5,
              backgroundColor: '#f9fafb',
              borderRadius: 2,
              border: '1px solid #e5e7eb'
            }}>
              <Typography variant="body1" sx={{ 
                whiteSpace: 'pre-wrap',
                color: notes ? '#374151' : '#9ca3af',
                fontStyle: notes ? 'normal' : 'italic',
                lineHeight: 1.6,
                fontSize: '1.1rem'
              }}>
                {notes || 'Chưa có ghi chú...'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>

      {/* Notes Dialog */}
      <Dialog open={openNotesDialog} onClose={() => setOpenNotesDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Chỉnh sửa ghi chú</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={6}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Nhập ghi chú..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNotesDialog(false)}>Hủy</Button>
          <Button
            onClick={handleUpdateNotes}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={openDeleteDialog} 
        onClose={handleCloseDeleteDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
          color: 'white',
          fontWeight: 700
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DeleteOutlineIcon />
            Xác nhận xóa phụ tùng
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Bạn có chắc chắn muốn xóa phụ tùng này?
          </Typography>
          {recordToDelete && (
            <Box sx={{ 
              p: 2, 
              backgroundColor: '#f8f9fa', 
              borderRadius: 2,
              border: '1px solid #dee2e6'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                {recordToDelete.vehiclePartResponse?.vehiclePartName || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Số lượng: {recordToDelete.quantityUsed} cái
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Đơn giá: {recordToDelete.vehiclePartResponse?.unitPrice?.toLocaleString('vi-VN')} ₫/cái
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#f44336', mt: 1 }}>
                Thành tiền: {((recordToDelete.quantityUsed || 0) * (recordToDelete.vehiclePartResponse?.unitPrice || 0)).toLocaleString('vi-VN')} ₫
              </Typography>
            </Box>
          )}
          <Typography variant="body2" color="error" sx={{ mt: 2, fontWeight: 600 }}>
            ⚠️ Hành động này không thể hoàn tác!
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={handleCloseDeleteDialog}
            variant="outlined"
            sx={{
              borderColor: '#ddd',
              color: '#666',
              '&:hover': {
                borderColor: '#999',
                backgroundColor: 'rgba(0,0,0,0.02)'
              }
            }}
          >
            Hủy
          </Button>
          <Button 
            onClick={handleConfirmDelete}
            variant="contained"
            startIcon={<DeleteOutlineIcon />}
            disabled={!!deletingRecordId}
            sx={{
              backgroundColor: '#f44336',
              '&:hover': {
                backgroundColor: '#d32f2f',
              },
              '&:disabled': {
                backgroundColor: '#ccc'
              }
            }}
          >
            {deletingRecordId ? 'Đang xóa...' : 'Xác nhận xóa'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Maintenance Record Dialog */}
      <Dialog 
        open={openAddDialog} 
        onClose={handleCloseAddDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontWeight: 700,
          fontSize: '1.5rem',
          py: 2.5
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AddIcon sx={{ fontSize: '1.75rem' }} />
            Thêm phụ tùng mới
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 3, px: 3, py: 2 }}>
          {/* Vehicle Type Info */}
          <Box sx={{ 
            p: 2.5, 
            backgroundColor: '#e3f2fd', 
            borderRadius: 2,
            mb: 3,
            border: '1px solid #1976d2'
          }}>
            <Typography variant="body1" sx={{ color: '#666', display: 'block', mb: 1, fontSize: '1.1rem', fontWeight: 500 }}>
              Loại xe đang bảo dưỡng
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2', fontSize: '1.4rem', mb: 0.5 }}>
              {detail?.appointmentResponse?.vehicleTypeResponse?.vehicleTypeName || 'N/A'}
            </Typography>
            <Typography variant="body1" sx={{ color: '#666', fontSize: '1.1rem' }}>
              {detail?.appointmentResponse?.vehicleTypeResponse?.manufacturer} - {detail?.appointmentResponse?.vehicleTypeResponse?.modelYear}
            </Typography>
          </Box>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontSize: '1.15rem' }}>
            Chọn phụ tùng phù hợp và nhập số lượng sử dụng
          </Typography>

          {/* Vehicle Part Selection */}
          <Autocomplete
            fullWidth
            options={vehiclePartsList.filter(part => (part.currentQuantity || 0) >= quantity)}
            getOptionLabel={(option) => {
              const stock = option.currentQuantity || 0;
              const price = option.unitPrice?.toLocaleString('vi-VN') || '0';
              return `${option.vehiclePartName} - ${price} ₫/cái (Tồn: ${stock})`;
            }}
            value={selectedVehiclePart}
            onChange={(_, newValue) => {
              setSelectedVehiclePart(newValue);
              // Auto set quantity to 1 when selecting new part (user can adjust later)
              if (newValue) {
                setQuantity(1);
              }
            }}
            loading={loadingVehicleParts}
            noOptionsText={
              vehiclePartsList.length === 0 
                ? "Không có phụ tùng nào" 
                : `Không có phụ tùng nào có tồn kho >= ${quantity}. Giảm số lượng để xem thêm.`
            }
            renderOption={(props, option) => {
              const stock = option.currentQuantity || 0;
              return (
                <li {...props}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', py: 0.5 }}>
                    <Box>
                      <Typography variant="body1" sx={{ fontSize: '1.15rem', fontWeight: 500 }}>{option.vehiclePartName}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '1rem' }}>
                        {option.unitPrice?.toLocaleString('vi-VN')} ₫/cái
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: 600,
                          fontSize: '1.1rem',
                          color: stock < 10 ? 'warning.main' : 'success.main'
                        }}
                      >
                        Tồn: {stock}
                      </Typography>
                    </Box>
                  </Box>
                </li>
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Chọn phụ tùng"
                placeholder="Tìm kiếm phụ tùng..."
                variant="outlined"
                InputLabelProps={{
                  sx: { fontSize: '1.1rem' }
                }}
                inputProps={{
                  ...params.inputProps,
                  style: { fontSize: '1.15rem' }
                }}
                helperText={
                  vehiclePartsList.filter(p => (p.currentQuantity || 0) >= quantity).length > 0
                    ? `${vehiclePartsList.filter(p => (p.currentQuantity || 0) >= quantity).length} phụ tùng có sẵn với số lượng >= ${quantity}`
                    : `⚠️ Không có phụ tùng nào đủ stock. Giảm số lượng xuống.`
                }
                FormHelperTextProps={{
                  sx: { fontSize: '1rem' }
                }}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingVehicleParts ? <CircularProgress size={24} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '1.15rem',
                    '& input': {
                      fontSize: '1.15rem',
                      padding: '14px 14px'
                    }
                  }
                }}
              />
            )}
            sx={{ mb: 3 }}
          />

          {/* Quantity Input */}
          <TextField
            fullWidth
            type="number"
            label="Số lượng"
            value={quantity}
            onChange={(e) => {
              let newQty = parseInt(e.target.value) || 1;
              
              // ✅ Giới hạn min = 1
              if (newQty < 1) {
                newQty = 1;
              }
              
              // ✅ Giới hạn max = currentQuantity của phụ tùng đang chọn (auto clamp)
              if (selectedVehiclePart) {
                const maxStock = selectedVehiclePart.currentQuantity || 0;
                if (newQty > maxStock) {
                  newQty = maxStock; // Tự động giảm xuống max (VD: 81 → 80)
                }
              }
              
              setQuantity(newQty);
            }}
            InputLabelProps={{
              sx: { fontSize: '1.1rem' }
            }}
            inputProps={{ 
              min: 1,
              max: selectedVehiclePart ? selectedVehiclePart.currentQuantity : undefined,
              style: { fontSize: '1.15rem' }
            }}
            helperText={
              selectedVehiclePart 
                ? `Tối đa: ${selectedVehiclePart.currentQuantity} (tồn kho hiện tại)`
                : "Chọn phụ tùng trước để xem số lượng tối đa"
            }
            FormHelperTextProps={{
              sx: { fontSize: '1rem' }
            }}
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                fontSize: '1.15rem',
                '& input': {
                  fontSize: '1.15rem',
                  padding: '14px 14px'
                }
              }
            }}
          />

          {/* Preview Total */}
          {selectedVehiclePart && (
            <Box sx={{ 
              p: 2.5, 
              backgroundColor: '#f8f9fa', 
              borderRadius: 2,
              border: '1px solid #dee2e6'
            }}>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1, fontSize: '1.1rem' }}>
                Đơn giá: {selectedVehiclePart.unitPrice?.toLocaleString('vi-VN')} ₫/cái
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#667eea', fontSize: '1.75rem' }}>
                Tổng tiền: {((selectedVehiclePart.unitPrice || 0) * quantity).toLocaleString('vi-VN')} ₫
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={handleCloseAddDialog}
            variant="outlined"
            disabled={addingRecord}
            sx={{
              borderColor: '#ddd',
              color: '#666',
              fontSize: '1.1rem',
              fontWeight: 600,
              px: 3,
              py: 1.5,
              '&:hover': {
                borderColor: '#999',
                backgroundColor: 'rgba(0,0,0,0.02)'
              }
            }}
          >
            Hủy
          </Button>
          <Button 
            onClick={handleConfirmAdd}
            variant="contained"
            startIcon={<AddIcon sx={{ fontSize: '1.25rem' }} />}
            disabled={!selectedVehiclePart || addingRecord}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              fontSize: '1.1rem',
              fontWeight: 600,
              px: 3,
              py: 1.5,
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #653993 100%)',
              },
              '&:disabled': {
                backgroundColor: '#ccc'
              }
            }}
          >
            {addingRecord ? 'Đang thêm...' : 'Thêm phụ tùng'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Completion Confirmation Modal */}
      <Dialog 
        open={openCompletionModal} 
        onClose={handleCloseCompletionModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
          color: 'white',
          fontWeight: 700,
          fontSize: '1.5rem',
          py: 2.5
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CheckCircleIcon sx={{ fontSize: '1.75rem' }} />
            Xác nhận hoàn thành bảo dưỡng
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 3, px: 3, py: 2 }}>
          <Typography variant="body1" sx={{ mb: 3, fontSize: '1.15rem', color: '#666' }}>
            Vui lòng xem lại thông tin bảo dưỡng trước khi xác nhận hoàn thành:
          </Typography>

          {/* Service Info */}
          <Box sx={{ 
            p: 2.5, 
            backgroundColor: '#e3f2fd', 
            borderRadius: 2,
            mb: 3,
            border: '1px solid #1976d2'
          }}>
            <Typography variant="body1" sx={{ color: '#666', display: 'block', mb: 1, fontSize: '1.1rem', fontWeight: 500 }}>
              Dịch vụ bảo dưỡng
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2', fontSize: '1.4rem' }}>
              {serviceTypeResponse?.serviceName || 'N/A'}
            </Typography>
          </Box>

          {/* Parts Used Summary */}
          {maintenanceRecords?.data && maintenanceRecords.data.length > 0 ? (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: '1.3rem', color: '#111827' }}>
                Phụ tùng đã sử dụng ({maintenanceRecords.totalElements || 0} phụ tùng)
              </Typography>
              <Box sx={{ 
                maxHeight: '300px', 
                overflowY: 'auto',
                border: '1px solid #e5e7eb',
                borderRadius: 2,
                p: 2
              }}>
                {maintenanceRecords.data.map((record: any, index: number) => (
                  <Box
                    key={record?.maintenanceRecordId || index}
                    sx={{
                      p: 2,
                      mb: 1.5,
                      backgroundColor: record?.approvedByUser ? '#f0fdf4' : '#fef3c7',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: record?.approvedByUser ? '#d1fae5' : '#fde68a'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '1.15rem', color: '#111827' }}>
                        {index + 1}. {record?.vehiclePartResponse?.vehiclePartName || 'N/A'}
                      </Typography>
                      {record?.approvedByUser ? (
                        <Chip
                          label="✓ Đã duyệt"
                          size="small"
                          sx={{ 
                            backgroundColor: '#4caf50', 
                            color: 'white', 
                            fontWeight: 600,
                            height: '24px'
                          }}
                        />
                      ) : (
                        <Chip
                          label="⚠ Chưa duyệt"
                          size="small"
                          sx={{ 
                            backgroundColor: '#ff9800', 
                            color: 'white', 
                            fontWeight: 600,
                            height: '24px'
                          }}
                        />
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 3, mt: 1 }}>
                      <Typography variant="body2" sx={{ fontSize: '1rem', color: '#666' }}>
                        Số lượng: <strong>{record?.quantityUsed || 0} cái</strong>
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '1rem', color: '#666' }}>
                        Đơn giá: <strong>{record?.vehiclePartResponse?.unitPrice?.toLocaleString('vi-VN') || '0'} ₫</strong>
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '1rem', fontWeight: 600, color: '#667eea' }}>
                        Thành tiền: {((record?.quantityUsed || 0) * (record?.vehiclePartResponse?.unitPrice || 0)).toLocaleString('vi-VN')} ₫
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          ) : (
            <Box sx={{ 
              p: 2.5, 
              backgroundColor: '#fff3cd', 
              borderRadius: 2,
              mb: 3,
              border: '1px solid #ffc107'
            }}>
              <Typography variant="body1" sx={{ color: '#856404', fontSize: '1.1rem', fontWeight: 500 }}>
                ⚠️ Chưa có phụ tùng nào được sử dụng
              </Typography>
            </Box>
          )}

          {/* Total Cost */}
          <Box sx={{ 
            p: 2.5, 
            backgroundColor: '#f9fafb', 
            borderRadius: 2,
            mb: 3,
            border: '2px solid #e5e7eb'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.3rem', color: '#111827' }}>
                Tổng chi phí
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#4caf50', fontSize: '1.75rem' }}>
                {totalCost?.toLocaleString('vi-VN') || '0'} ₫
              </Typography>
            </Box>
          </Box>

          {/* Time Info */}
          {startTime && (
            <Box sx={{ 
              p: 2, 
              backgroundColor: '#f8f9fa', 
              borderRadius: 2,
              mb: 3,
              border: '1px solid #dee2e6'
            }}>
              <Typography variant="body2" sx={{ color: '#666', fontSize: '1rem', mb: 0.5 }}>
                Thời gian bắt đầu: {new Date(startTime).toLocaleString('vi-VN', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Typography>
              {endTime && (
                <Typography variant="body2" sx={{ color: '#666', fontSize: '1rem' }}>
                  Thời gian kết thúc: {new Date(endTime).toLocaleString('vi-VN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Typography>
              )}
            </Box>
          )}

          {/* Notes */}
          {notes && (
            <Box sx={{ 
              p: 2, 
              backgroundColor: '#f8f9fa', 
              borderRadius: 2,
              mb: 3,
              border: '1px solid #dee2e6'
            }}>
              <Typography variant="body2" sx={{ color: '#666', fontSize: '1rem', fontWeight: 600, mb: 1 }}>
                Ghi chú:
              </Typography>
              <Typography variant="body2" sx={{ color: '#333', fontSize: '1rem', whiteSpace: 'pre-wrap' }}>
                {notes}
              </Typography>
            </Box>
          )}

          {/* Warning if there are unapproved parts */}
          {maintenanceRecords?.data?.some((record: any) => !record?.approvedByUser) && (
            <Box sx={{ 
              p: 2.5, 
              backgroundColor: '#fff3cd', 
              borderRadius: 2,
              border: '1px solid #ffc107'
            }}>
              <Typography variant="body1" sx={{ color: '#856404', fontSize: '1.1rem', fontWeight: 600, mb: 0.5 }}>
                ⚠️ Cảnh báo
              </Typography>
              <Typography variant="body2" sx={{ color: '#856404', fontSize: '1rem' }}>
                Vẫn còn phụ tùng chưa được duyệt. Bạn có chắc chắn muốn hoàn thành bảo dưỡng không?
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={handleCloseCompletionModal}
            variant="outlined"
            disabled={completing}
            sx={{
              borderColor: '#ddd',
              color: '#666',
              fontSize: '1.1rem',
              fontWeight: 600,
              px: 3,
              py: 1.5,
              '&:hover': {
                borderColor: '#999',
                backgroundColor: 'rgba(0,0,0,0.02)'
              }
            }}
          >
            Hủy
          </Button>
          <Button 
            onClick={handleConfirmCompletion}
            variant="contained"
            startIcon={<CheckCircleIcon sx={{ fontSize: '1.25rem' }} />}
            disabled={completing}
            sx={{
              backgroundColor: '#4caf50',
              fontSize: '1.1rem',
              fontWeight: 600,
              px: 3,
              py: 1.5,
              '&:hover': {
                backgroundColor: '#388e3c',
              },
              '&:disabled': {
                backgroundColor: '#ccc'
              }
            }}
          >
            {completing ? 'Đang xử lý...' : 'Xác nhận hoàn thành'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Quantity Dialog */}
      <Dialog 
        open={openUpdateQuantityDialog} 
        onClose={handleCloseUpdateQuantityDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontWeight: 700,
          fontSize: '1.5rem',
          py: 2.5
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <EditIcon sx={{ fontSize: '1.75rem' }} />
            Cập nhật số lượng
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 3, px: 3, py: 2 }}>
          {/* Vehicle Part Info */}
          {recordToUpdateQuantity && (
            <Box sx={{ 
              p: 2.5, 
              backgroundColor: '#e3f2fd', 
              borderRadius: 2,
              mb: 3,
              border: '1px solid #1976d2'
            }}>
              <Typography variant="body1" sx={{ color: '#666', display: 'block', mb: 1, fontSize: '1.1rem', fontWeight: 500 }}>
                Phụ tùng
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2', fontSize: '1.4rem', mb: 0.5 }}>
                {recordToUpdateQuantity.vehiclePartResponse?.vehiclePartName || 'N/A'}
              </Typography>
              <Typography variant="body1" sx={{ color: '#666', fontSize: '1.1rem' }}>
                Đơn giá: {recordToUpdateQuantity.vehiclePartResponse?.unitPrice?.toLocaleString('vi-VN') || '0'} ₫/cái
              </Typography>
              <Typography variant="body1" sx={{ color: '#666', fontSize: '1.1rem', mt: 0.5 }}>
                Tồn kho hiện tại: {recordToUpdateQuantity.vehiclePartResponse?.currentQuantity || 0} cái
              </Typography>
              <Typography variant="body1" sx={{ color: '#666', fontSize: '1.1rem', mt: 0.5 }}>
                Số lượng đang sử dụng: {recordToUpdateQuantity?.quantityUsed || 0} cái
              </Typography>
              <Typography variant="body1" sx={{ color: '#1976d2', fontWeight: 600, fontSize: '1.15rem', mt: 0.5 }}>
                Tồn kho có thể sử dụng: {(recordToUpdateQuantity.vehiclePartResponse?.currentQuantity || 0) + (recordToUpdateQuantity?.quantityUsed || 0)} cái
              </Typography>
            </Box>
          )}

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontSize: '1.15rem' }}>
            Nhập số lượng mới cho phụ tùng này
          </Typography>

          {/* Quantity Input */}
          <TextField
            fullWidth
            type="number"
            label="Số lượng"
            value={updateQuantity}
            onChange={(e) => {
              let newQty = parseInt(e.target.value) || 1;
              
              // ✅ Giới hạn min = 1
              if (newQty < 1) {
                newQty = 1;
              }
              
              // ✅ Giới hạn max = currentQuantity + quantityUsed (vì backend sẽ hoàn lại số lượng cũ)
              if (recordToUpdateQuantity?.vehiclePartResponse?.currentQuantity !== undefined) {
                const currentStock = recordToUpdateQuantity.vehiclePartResponse.currentQuantity || 0;
                const currentQuantityUsed = recordToUpdateQuantity?.quantityUsed || 0;
                const maxStock = currentStock + currentQuantityUsed;
                if (newQty > maxStock) {
                  newQty = maxStock;
                }
              }
              
              setUpdateQuantity(newQty);
            }}
            InputLabelProps={{
              sx: { fontSize: '1.1rem' }
            }}
            inputProps={{ 
              min: 1,
              max: recordToUpdateQuantity?.vehiclePartResponse?.currentQuantity !== undefined
                ? (recordToUpdateQuantity.vehiclePartResponse.currentQuantity || 0) + (recordToUpdateQuantity?.quantityUsed || 0)
                : undefined,
              style: { fontSize: '1.15rem' }
            }}
            helperText={
              recordToUpdateQuantity?.vehiclePartResponse?.currentQuantity !== undefined
                ? `Tối đa: ${((recordToUpdateQuantity.vehiclePartResponse.currentQuantity || 0) + (recordToUpdateQuantity?.quantityUsed || 0))} (tồn kho + số lượng đang sử dụng)`
                : "Vui lòng nhập số lượng"
            }
            FormHelperTextProps={{
              sx: { fontSize: '1rem' }
            }}
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                fontSize: '1.15rem',
                '& input': {
                  fontSize: '1.15rem',
                  padding: '14px 14px'
                }
              }
            }}
          />

          {/* Preview Total */}
          {recordToUpdateQuantity && (
            <Box sx={{ 
              p: 2.5, 
              backgroundColor: '#f8f9fa', 
              borderRadius: 2,
              border: '1px solid #dee2e6'
            }}>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1, fontSize: '1.1rem' }}>
                Đơn giá: {recordToUpdateQuantity.vehiclePartResponse?.unitPrice?.toLocaleString('vi-VN')} ₫/cái
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#667eea', fontSize: '1.75rem' }}>
                Thành tiền: {((recordToUpdateQuantity.vehiclePartResponse?.unitPrice || 0) * updateQuantity).toLocaleString('vi-VN')} ₫
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={handleCloseUpdateQuantityDialog}
            variant="outlined"
            disabled={updatingQuantity}
            sx={{
              borderColor: '#ddd',
              color: '#666',
              fontSize: '1.1rem',
              fontWeight: 600,
              px: 3,
              py: 1.5,
              '&:hover': {
                borderColor: '#999',
                backgroundColor: 'rgba(0,0,0,0.02)'
              }
            }}
          >
            Hủy
          </Button>
          <Button 
            onClick={handleConfirmUpdateQuantity}
            variant="contained"
            startIcon={<EditIcon sx={{ fontSize: '1.25rem' }} />}
            disabled={updatingQuantity || !recordToUpdateQuantity}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              fontSize: '1.1rem',
              fontWeight: 600,
              px: 3,
              py: 1.5,
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #653993 100%)',
              },
              '&:disabled': {
                backgroundColor: '#ccc'
              }
            }}
          >
            {updatingQuantity ? 'Đang cập nhật...' : 'Cập nhật'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MaintenanceManagementDetail;

