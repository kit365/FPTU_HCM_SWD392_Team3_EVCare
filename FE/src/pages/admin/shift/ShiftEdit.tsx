import { useForm, Controller } from "react-hook-form";
import { Card, Autocomplete, TextField, Chip } from "@mui/material";
import { LabelAdmin } from "../../../components/admin/ui/form/Label";
import { SelectAdmin } from "../../../components/admin/ui/form/Select";
import { useNavigate, useParams } from "react-router-dom";
import { pathAdmin } from "../../../constants/paths.constant";
import { useShift } from "../../../hooks/useShift";
import { useUser } from "../../../hooks/useUser";
import { useEffect, useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { toast } from "react-toastify";
import type { UpdationShiftRequest, ShiftResponse } from "../../../types/shift.types";
import { shiftService } from "../../../service/shiftService";

type FormData = {
  assigneeId?: string;
  staffId?: string;
  technicianIds: string[];
  shiftType?: string;
  startTime?: string;
  endTime?: string;
  status?: string;
  totalHours?: number;
  notes?: string;
};

export const ShiftEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { loading, getById, update, shiftTypes, shiftStatuses, getAllTypes, getAllStatuses } = useShift();
  const { fetchUserOptions, fetchUserOptionsByRole } = useUser();
  
  const [loadingData, setLoadingData] = useState(true);
  const [shift, setShift] = useState<ShiftResponse | null>(null);
  const [staffOptions, setStaffOptions] = useState<{ value: string; label: string }[]>([]);
  const [technicianOptions, setTechnicianOptions] = useState<{ value: string; label: string }[]>([]);
  const [allTechnicianOptions, setAllTechnicianOptions] = useState<{ value: string; label: string }[]>([]);
  const [assigneeOptions, setAssigneeOptions] = useState<{ value: string; label: string }[]>([]);
  const [shiftTypeOptions, setShiftTypeOptions] = useState<{ value: string; label: string }[]>([]);
  const [statusOptions, setStatusOptions] = useState<{ value: string; label: string }[]>([]);
  const [loadingTechnicians, setLoadingTechnicians] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
    watch,
    getValues,
    reset,
  } = useForm<FormData>({
    defaultValues: {
      assigneeId: "",
      staffId: "",
      technicianIds: [],
      shiftType: "",
      startTime: "",
      endTime: "",
      status: "",
      totalHours: undefined,
      notes: "",
    },
  });

  // Load enums and users
  useEffect(() => {
    const loadData = async () => {
      await getAllTypes();
      await getAllStatuses();
      
      // Load assignee options - TẤT CẢ users vì assignee có thể là bất kỳ ai
      const assigneeOpts = await fetchUserOptions();
      setAssigneeOptions(assigneeOpts);
      
      // Load staff options (STAFF role)
      const staffOpts = await fetchUserOptionsByRole('STAFF');
      setStaffOptions(staffOpts);
      
      // Load ALL technician options (TECHNICIAN role) - ban đầu
      const techOpts = await fetchUserOptionsByRole('TECHNICIAN');
      setAllTechnicianOptions(techOpts);
      setTechnicianOptions(techOpts); // Hiển thị tất cả ban đầu
    };
    loadData();
  }, [getAllTypes, getAllStatuses, fetchUserOptions, fetchUserOptionsByRole]);

  // Watch startTime và endTime để load available technicians
  const startTimeValue = watch("startTime");
  const endTimeValue = watch("endTime");

  useEffect(() => {
    if (startTimeValue && endTimeValue && id) {
      loadAvailableTechnicians(startTimeValue, endTimeValue, id);
    } else if (startTimeValue && endTimeValue) {
      loadAvailableTechnicians(startTimeValue, endTimeValue);
    } else {
      // Chưa chọn thời gian -> hiển thị tất cả
      setTechnicianOptions(allTechnicianOptions);
    }
  }, [startTimeValue, endTimeValue, allTechnicianOptions, id]);

  // Load shift detail
  useEffect(() => {
    const loadShiftData = async () => {
      if (!id) {
        toast.error("Không tìm thấy ID ca làm việc!");
        navigate(`/${pathAdmin}/shift`);
        return;
      }

      setLoadingData(true);
      const shiftData = await getById(id);
      if (shiftData) {
        setShift(shiftData); // Save shift data for displaying appointment info
        
        // Convert datetime from "YYYY-MM-DDTHH:mm:ss" to "YYYY-MM-DDTHH:mm" for input
        const formatForInput = (dateTimeStr: string | undefined) => {
          if (!dateTimeStr) return "";
          try {
            const date = new Date(dateTimeStr);
            return date.toISOString().slice(0, 16);
          } catch {
            return "";
          }
        };
        
        // Use reset() to set all form values at once (prevent multiple re-renders)
        reset({
          assigneeId: shiftData.assignee?.userId || "",
          staffId: shiftData.staff?.userId || "",
          technicianIds: shiftData.technicians?.map(t => t.userId) || [],
          shiftType: shiftData.shiftType || "",
          startTime: formatForInput(shiftData.startTime),
          endTime: formatForInput(shiftData.endTime),
          status: shiftData.status || "",
          totalHours: shiftData.totalHours,
          notes: shiftData.notes || "",
        });
      }
      setLoadingData(false);
    };

    loadShiftData();
  }, [id, getById, reset, navigate]);

  // Update shift type options
  useEffect(() => {
    if (shiftTypes && shiftTypes.length > 0) {
      const typeMap: { [key: string]: string } = {
        'APPOINTMENT': 'Theo lịch hẹn',
        'ON_DUTY': 'Trực',
        'INVENTORY_CHECK': 'Kiểm kê',
        'OTHER': 'Khác'
      };
      
      const options = shiftTypes.map((type) => ({
        value: type,
        label: typeMap[type] || type,
      }));
      setShiftTypeOptions(options);
    }
  }, [shiftTypes]);

  // Update status options
  useEffect(() => {
    if (shiftStatuses && shiftStatuses.length > 0) {
      const statusMap: { [key: string]: string } = {
        'SCHEDULED': 'Đã lên lịch',
        'IN_PROGRESS': 'Đang thực hiện',
        'COMPLETED': 'Hoàn thành',
        'CANCELLED': 'Đã hủy'
      };
      
      const options = shiftStatuses.map((status) => ({
        value: status,
        label: statusMap[status] || status,
      }));
      setStatusOptions(options);
    }
  }, [shiftStatuses]);


  const onSubmit = async (data: FormData) => {
    if (!id) return;

    // Convert datetime format from "YYYY-MM-DDTHH:mm" to "YYYY-MM-DDTHH:mm:ss"
    const formattedStartTime = data.startTime ? `${data.startTime}:00` : undefined;
    const formattedEndTime = data.endTime ? `${data.endTime}:00` : undefined;

    const payload: UpdationShiftRequest = {
      assigneeId: data.assigneeId && data.assigneeId.trim() !== "" ? data.assigneeId : undefined,
      staffId: data.staffId && data.staffId.trim() !== "" ? data.staffId : undefined,
      technicianIds: data.technicianIds && data.technicianIds.length > 0 ? data.technicianIds : undefined,
      // appointmentId: Không cho phép thay đổi appointment sau khi shift được tạo
      shiftType: data.shiftType && data.shiftType.trim() !== "" ? data.shiftType as any : undefined,
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      status: data.status && data.status.trim() !== "" ? data.status as any : undefined,
      totalHours: data.totalHours,
      notes: data.notes,
    };

    const success = await update(id, payload);
    if (success) {
      navigate(`/${pathAdmin}/shift`);
    }
  };

  const handleBack = () => {
    navigate(`/${pathAdmin}/shift`);
  };

  const loadAvailableTechnicians = async (startTime: string, endTime: string, excludeShiftId?: string) => {
    setLoadingTechnicians(true);
    try {
      // Format datetime cho backend (ISO 8601)
      const formattedStart = new Date(startTime).toISOString().slice(0, 19);
      const formattedEnd = new Date(endTime).toISOString().slice(0, 19);

      const response = await shiftService.getAvailableTechnicians(
        formattedStart,
        formattedEnd,
        excludeShiftId
      );

      if (response.data.success) {
        const availableUsers = response.data.data || [];
        const options = availableUsers.map((user) => ({
          value: user.userId,
          label: `${user.fullName || user.username} (${user.email})`,
        }));

        setTechnicianOptions(options);

        // Remove technicians không available khỏi selection
        const currentSelection = getValues("technicianIds") || [];
        const availableIds = options.map((opt) => opt.value);
        const filteredSelection = currentSelection.filter((id) =>
          availableIds.includes(id)
        );

        if (filteredSelection.length !== currentSelection.length) {
          setValue("technicianIds", filteredSelection);
        }
      }
    } catch (error) {
      console.error("Error loading available technicians:", error);
      // Fallback về tất cả technicians nếu có lỗi
      setTechnicianOptions(allTechnicianOptions);
    } finally {
      setLoadingTechnicians(false);
    }
  };

  if (loadingData) {
    return (
      <div className="max-w-[1320px] px-[12px] mx-auto">
        <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
          <div className="p-[2.4rem] text-center">
            <p className="text-[1.4rem] text-gray-600">Đang tải dữ liệu...</p>
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
          <div className="flex items-center gap-3 mb-[2.4rem]">
            <button
              onClick={handleBack}
              className="flex items-center justify-center w-[3.6rem] h-[3.6rem] rounded-[0.8rem] bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ArrowBackIcon sx={{ fontSize: "2rem", color: "#6c757d" }} />
            </button>
            <div>
              <h2 className="text-admin-secondary text-[1.8rem] font-[700] leading-[1.2]">
                Chỉnh sửa ca làm việc
              </h2>
              <p className="text-[1.3rem] text-gray-600 mt-1">
                Cập nhật thông tin ca làm việc
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-[2rem]">
            {/* Assignee - Người phụ trách chính */}
            <div>
              <LabelAdmin htmlFor="assigneeId" content="Người phụ trách chính (Tùy chọn)" />
              <SelectAdmin
                id="assigneeId"
                name="assigneeId"
                placeholder="-- Chọn người phụ trách --"
                options={assigneeOptions}
                register={register("assigneeId")}
                error={errors.assigneeId?.message}
                onChange={(e) => setValue("assigneeId", e.target.value)}
              />
            </div>

            {/* Staff - Nhân viên hỗ trợ */}
            <div>
              <LabelAdmin htmlFor="staffId" content="Nhân viên hỗ trợ (Tùy chọn)" />
              <SelectAdmin
                id="staffId"
                name="staffId"
                placeholder="-- Chọn nhân viên hỗ trợ --"
                options={staffOptions}
                register={register("staffId")}
                error={errors.staffId?.message}
                onChange={(e) => setValue("staffId", e.target.value)}
              />
            </div>

            {/* Technicians - Kỹ thuật viên (Multi-select) */}
            <div>
              <LabelAdmin htmlFor="technicianIds" content="Kỹ thuật viên (Có thể chọn nhiều)" />
            <Controller
              name="technicianIds"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  multiple
                  id="technicianIds"
                  options={technicianOptions}
                  getOptionLabel={(option) => option.label}
                  value={technicianOptions.filter(opt => field.value?.includes(opt.value))}
                  onChange={(_, newValue) => {
                    field.onChange(newValue.map(item => item.value));
                  }}
                  loading={loadingTechnicians}
                  disabled={!startTimeValue || !endTimeValue}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder={
                        !startTimeValue || !endTimeValue
                          ? "Vui lòng chọn thời gian trước"
                          : loadingTechnicians
                          ? "Đang tải kỹ thuật viên available..."
                          : technicianOptions.length === 0
                          ? "Không có kỹ thuật viên available"
                          : "Chọn kỹ thuật viên..."
                      }
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          fontSize: '1.3rem',
                          minHeight: '4.4rem',
                          borderRadius: '0.64rem',
                        }
                      }}
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        label={option.label}
                        {...getTagProps({ index })}
                        sx={{
                          fontSize: '1.2rem',
                          height: '2.8rem',
                        }}
                      />
                    ))
                  }
                  sx={{ width: '100%' }}
                  noOptionsText={
                    loadingTechnicians
                      ? "Đang tải..."
                      : "Không có kỹ thuật viên available trong thời gian này"
                  }
                />
              )}
            />
            {startTimeValue && endTimeValue && technicianOptions.length === 0 && !loadingTechnicians && (
              <p style={{ color: "#f44336", fontSize: "1.2rem", marginTop: "0.5rem" }}>
                ⚠️ Không có kỹ thuật viên nào available trong thời gian này
              </p>
            )}
              <p className="text-[1.2rem] text-gray-500 mt-1">
                Có thể chọn nhiều kỹ thuật viên cho ca làm việc
              </p>
            </div>

            {/* Appointment Info (Read-only) */}
            {shift?.appointment && (
              <div>
                <div className="mb-[0.8rem]">
                  <span className="text-[1.3rem] font-[600] text-gray-700">
                    Cuộc hẹn liên quan
                  </span>
                </div>
                <div className="p-[1.2rem] bg-blue-50 border border-blue-200 rounded-[0.8rem]">
                  <p className="text-[1.3rem] font-[500] text-gray-800">
                    {shift.appointment.customerFullName || 'N/A'}
                  </p>
                  <p className="text-[1.2rem] text-gray-600 mt-[0.4rem]">
                    Biển số: {shift.appointment.vehicleNumberPlate || 'N/A'}
                  </p>
                  <p className="text-[1.1rem] text-gray-500 mt-[0.2rem] italic">
                    💡 Không thể thay đổi cuộc hẹn sau khi shift được tạo
                  </p>
                </div>
              </div>
            )}

            {/* Shift Type */}
            <div>
              <div className="mb-[0.8rem]">
                <span className="text-[1.3rem] font-[600] text-gray-700">
                  Loại ca làm việc{" "}
                  <span className="text-gray-400 font-[400]">(Tùy chọn)</span>
                </span>
              </div>
              <SelectAdmin
                id="shiftType"
                name="shiftType"
                placeholder="-- Chọn loại ca --"
                options={shiftTypeOptions}
                register={register("shiftType")}
                error={errors.shiftType?.message}
                onChange={(e) => setValue("shiftType", e.target.value)}
              />
            </div>

            {/* Start Time */}
            <div>
              <LabelAdmin htmlFor="startTime" content="Thời gian bắt đầu (Tùy chọn)" />
              <input
                type="datetime-local"
                id="startTime"
                {...register("startTime")}
                className="w-full h-[4.4rem] px-[1.6rem] text-[1.3rem] border border-gray-300 rounded-[0.64rem] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* End Time */}
            <div>
              <LabelAdmin htmlFor="endTime" content="Thời gian kết thúc (Tùy chọn)" />
              <input
                type="datetime-local"
                id="endTime"
                {...register("endTime")}
                className="w-full h-[4.4rem] px-[1.6rem] text-[1.3rem] border border-gray-300 rounded-[0.64rem] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status */}
            <div>
              <LabelAdmin htmlFor="status" content="Trạng thái (Tùy chọn)" />
              <SelectAdmin
                id="status"
                name="status"
                placeholder="-- Chọn trạng thái --"
                options={statusOptions}
                register={register("status")}
                error={errors.status?.message}
                onChange={(e) => setValue("status", e.target.value)}
              />
            </div>

            {/* Total Hours */}
            <div>
              <LabelAdmin htmlFor="totalHours" content="Tổng số giờ (Tùy chọn)" />
              <input
                type="number"
                step="0.01"
                id="totalHours"
                {...register("totalHours", {
                  min: { value: 0, message: "Số giờ phải lớn hơn hoặc bằng 0" }
                })}
                className="w-full h-[4.4rem] px-[1.6rem] text-[1.3rem] border border-gray-300 rounded-[0.64rem] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập tổng số giờ"
              />
              {errors.totalHours && (
                <p className="text-[1.2rem] text-red-500 mt-1">{errors.totalHours.message}</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <LabelAdmin htmlFor="notes" content="Ghi chú (Tùy chọn)" />
              <textarea
                id="notes"
                {...register("notes")}
                rows={4}
                className="w-full px-[1.6rem] py-[1.2rem] text-[1.3rem] border border-gray-300 rounded-[0.64rem] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                placeholder="Nhập ghi chú cho ca làm việc"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-[1.6rem]">
              <button
                type="button"
                onClick={handleBack}
                className="px-[2rem] py-[1rem] text-[1.3rem] font-[500] text-gray-700 bg-gray-200 rounded-[0.64rem] hover:bg-gray-300 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-[2rem] py-[1rem] text-[1.3rem] font-[500] text-white bg-[#22c55e] rounded-[0.64rem] hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? "Đang cập nhật..." : "Cập nhật ca làm việc"}
              </button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default ShiftEdit;


