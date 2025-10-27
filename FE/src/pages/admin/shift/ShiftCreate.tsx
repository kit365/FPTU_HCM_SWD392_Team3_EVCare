import { useForm, Controller } from "react-hook-form";
import { Card, Autocomplete, TextField, Chip } from "@mui/material";
import { LabelAdmin } from "../../../components/admin/ui/form/Label";
import { SelectAdmin } from "../../../components/admin/ui/form/Select";
import { useNavigate } from "react-router-dom";
import { pathAdmin } from "../../../constants/paths.constant";
import { useShift } from "../../../hooks/useShift";
import { useAppointment } from "../../../hooks/useAppointment";
import { useUser } from "../../../hooks/useUser";
import { useEffect, useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { toast } from "react-toastify";
import type { CreationShiftRequest, ShiftTypeEnum, ShiftStatusEnum } from "../../../types/shift.types";
import type { AppointmentResponse } from "../../../types/appointment.types";
import { useAuthContext } from "../../../context/useAuthContext";
import { shiftService } from "../../../service/shiftService";

type FormData = {
  assigneeId: string;
  staffId?: string;
  technicianIds: string[];
  appointmentId?: string; // OPTIONAL - cho shifts không liên quan appointment
  shiftType?: string;
  startTime: string;
  endTime?: string;
  status?: string;
  totalHours?: number;
  notes?: string;
};

export const ShiftCreate = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthContext();
  const { loading, create, shiftTypes, shiftStatuses, getAllTypes, getAllStatuses } = useShift();
  const { search: searchAppointments, list: appointmentList } = useAppointment();
  const { fetchUserOptionsByRole } = useUser();
  
  const [appointmentOptions, setAppointmentOptions] = useState<{ value: string; label: string }[]>([]);
  const [staffOptions, setStaffOptions] = useState<{ value: string; label: string }[]>([]);
  const [technicianOptions, setTechnicianOptions] = useState<{ value: string; label: string }[]>([]);
  const [allTechnicianOptions, setAllTechnicianOptions] = useState<{ value: string; label: string }[]>([]);
  const [shiftTypeOptions, setShiftTypeOptions] = useState<{ value: string; label: string }[]>([]);
  const [statusOptions, setStatusOptions] = useState<{ value: string; label: string }[]>([]);
  const [loadingTechnicians, setLoadingTechnicians] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    control,
    watch,
    getValues,
  } = useForm<FormData>({
    defaultValues: {
      assigneeId: "",
      staffId: "",
      technicianIds: [],
      appointmentId: "",
      shiftType: "APPOINTMENT",
      startTime: "",
      endTime: "",
      status: "",
      totalHours: 0,
      notes: "",
    },
    mode: 'onSubmit',
  });

  // Load enums, appointments, and users
  useEffect(() => {
    const loadData = async () => {
      await getAllTypes();
      await getAllStatuses();
      await searchAppointments({ page: 0, pageSize: 100 });
      
      // Load staff options (STAFF role)
      const staffOpts = await fetchUserOptionsByRole('STAFF');
      setStaffOptions(staffOpts);
      
      // Load ALL technician options (TECHNICIAN role) - ban đầu
      const techOpts = await fetchUserOptionsByRole('TECHNICIAN');
      setAllTechnicianOptions(techOpts);
      setTechnicianOptions(techOpts); // Hiển thị tất cả ban đầu
    };
    loadData();
  }, [getAllTypes, getAllStatuses, searchAppointments, fetchUserOptionsByRole]);

  // Watch startTime và endTime để load available technicians
  const startTimeValue = watch("startTime");
  const endTimeValue = watch("endTime");

  useEffect(() => {
    console.log("", { 
      startTimeValue, 
      endTimeValue, 
      allTechnicianOptionsLength: allTechnicianOptions.length 
    });
    
    if (startTimeValue && endTimeValue) {
      loadAvailableTechnicians(startTimeValue, endTimeValue);
    } else {
      setTechnicianOptions(allTechnicianOptions);
    }
  }, [startTimeValue, endTimeValue, allTechnicianOptions]);

  // Auto-fill assignee với user hiện tại
  useEffect(() => {
    if (currentUser?.userId) {
      setValue("assigneeId", currentUser.userId);
    }
  }, [currentUser, setValue]);

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

  // Update appointment options
  useEffect(() => {
    if (!appointmentList || appointmentList.length === 0) {
      // No appointments in database - show disabled state
      setAppointmentOptions([
        {
          value: '',
          label: 'Không có cuộc hẹn nào'
        }
      ]);
    } else {
      // Has appointments - map them without empty option
      const appointmentOpts = appointmentList.map((appointment: AppointmentResponse) => {
        const serviceTypeName = appointment.serviceTypeResponses && appointment.serviceTypeResponses.length > 0
          ? appointment.serviceTypeResponses[0].serviceName
          : 'N/A';
        
        return {
          value: appointment.appointmentId,
          label: `${appointment.customerFullName || 'N/A'} - ${serviceTypeName} - ${appointment.vehicleNumberPlate || 'N/A'}`,
        };
      });
      
      setAppointmentOptions(appointmentOpts);
    }
  }, [appointmentList]);

  const onSubmit = async (data: FormData) => {
  
    if (!data.assigneeId || !data.startTime) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    // Validate assigneeId is not empty string
    if (data.assigneeId.trim() === "") {
      toast.error("Không thể xác định người phụ trách. Vui lòng đăng nhập lại!");
      return;
    }

    // Convert datetime format from "YYYY-MM-DDTHH:mm" to "YYYY-MM-DDTHH:mm:ss"
    const formattedStartTime = data.startTime ? `${data.startTime}:00` : undefined;
    const formattedEndTime = data.endTime ? `${data.endTime}:00` : undefined;

    const payload: CreationShiftRequest = {
      assigneeId: data.assigneeId,
      staffId: data.staffId && data.staffId.trim() !== "" ? data.staffId : undefined,
      technicianIds: data.technicianIds && data.technicianIds.length > 0 ? data.technicianIds : undefined,
      appointmentId: data.appointmentId && data.appointmentId.trim() !== "" ? data.appointmentId : undefined, // OPTIONAL
      // Set default to APPOINTMENT if not selected
      shiftType: (data.shiftType && data.shiftType.trim() !== "" ? data.shiftType : "APPOINTMENT") as ShiftTypeEnum,
      startTime: formattedStartTime!,
      endTime: formattedEndTime,
      // Set default to SCHEDULED if not selected
      status: (data.status && data.status.trim() !== "" ? data.status : "SCHEDULED") as ShiftStatusEnum,
      totalHours: data.totalHours,
      notes: data.notes,
    };

    const success = await create(payload);
    if (success) {
      reset();
      navigate(`/${pathAdmin}/shift`);
    }
  };

  const handleBack = () => {
    navigate(`/${pathAdmin}/shift`);
  };

  const loadAvailableTechnicians = async (startTime: string, endTime: string) => {
    console.log("", { startTime, endTime });
    setLoadingTechnicians(true);
    try {
      // Format datetime cho backend (ISO 8601)
      const formattedStart = new Date(startTime).toISOString().slice(0, 19);
      const formattedEnd = new Date(endTime).toISOString().slice(0, 19);

      const response = await shiftService.getAvailableTechnicians(
        formattedStart,
        formattedEnd
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
      console.error("❌ [DEBUG] Error loading available technicians:", error);
      // Fallback về tất cả technicians nếu có lỗi
      setTechnicianOptions(allTechnicianOptions);
    } finally {
      setLoadingTechnicians(false);
    }
  };

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
                Tạo ca làm việc thủ công
              </h2>
              <p className="text-[1.3rem] text-gray-600 mt-1">
                Chỉ dùng trong trường hợp đặc biệt (lỗi hệ thống, ca trực, kiểm kê,...)
              </p>
            </div>
          </div>
     

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-[2rem]">
            {/* Assignee - Người phụ trách chính (Auto-filled với user hiện tại) */}
            <div>
              <LabelAdmin htmlFor="assigneeId" content="Người phụ trách chính *" />
              <div className="relative">
                <input
                  type="text"
                  id="assigneeId-display"
                  value={currentUser?.fullName || currentUser?.username || currentUser?.email || 'Đang tải...'}
                  disabled
                  className="w-full h-[4.4rem] px-[1.6rem] text-[1.3rem] border border-gray-300 rounded-[0.64rem] bg-gray-50 text-gray-700 cursor-not-allowed"
                />
                <input
                  type="hidden"
                  {...register("assigneeId", {
                    required: "Vui lòng chọn người phụ trách chính"
                  })}
                />
              </div>
              <p className="text-[1.2rem] text-gray-500 mt-1">
                Bạn sẽ là người phụ trách chính cho ca làm việc này
              </p>
              {errors.assigneeId && (
                <p className="text-[1.2rem] text-red-500 mt-1">{errors.assigneeId.message}</p>
              )}
            </div>

            {/* Warning Banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-[0.8rem] p-[1.6rem]">
              <div className="flex gap-[1.2rem]">
                <div className="text-[2rem]">⚠️</div>
                <div>
                  <h3 className="text-[1.4rem] font-[600] text-amber-800 mb-[0.8rem]">
                    Lưu ý: Tạo ca làm thủ công
                  </h3>
                  <p className="text-[1.3rem] text-amber-700 leading-[1.6]">
                    Ca làm việc thường tự động tạo khi có lịch hẹn. Chỉ tạo thủ công trong các trường hợp:
                  </p>
                  <ul className="text-[1.2rem] text-amber-700 mt-[0.8rem] ml-[2rem] space-y-[0.4rem]">
                    <li>• Lỗi hệ thống (auto-create thất bại)</li>
                    <li>• Ca trực, ca kiểm kê, ca bảo trì (không liên quan lịch hẹn)</li>
                    <li>• Bù ca làm cho appointment cũ</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Appointment - OPTIONAL */}
            <div>
              <LabelAdmin htmlFor="appointmentId" content="Cuộc hẹn (Tùy chọn)" />
              <SelectAdmin
                id="appointmentId"
                name="appointmentId"
                placeholder="-- Không có (cho ca trực/kiểm kê/bảo trì) --"
                options={appointmentOptions}
                register={register("appointmentId")}
                error={errors.appointmentId?.message}
                onChange={(e) => setValue("appointmentId", e.target.value)}
              />
              <p className="text-[1.2rem] text-gray-600 mt-1">
                💡 Để trống nếu đây là ca trực, kiểm kê, bảo trì hoặc không liên quan lịch hẹn
              </p>
            </div>

            {/* Start Time */}
            <div>
              <LabelAdmin htmlFor="startTime" content="Thời gian bắt đầu *" />
              <input
                type="datetime-local"
                id="startTime"
                {...register("startTime", {
                  required: "Vui lòng chọn thời gian bắt đầu"
                })}
                className="w-full h-[4.4rem] px-[1.6rem] text-[1.3rem] border border-gray-300 rounded-[0.64rem] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.startTime && (
                <p className="text-[1.2rem] text-red-500 mt-1">{errors.startTime.message}</p>
              )}
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

            {/* Shift Type */}
            <div>
              <LabelAdmin htmlFor="shiftType" content="Loại ca làm việc (Tùy chọn)" />
              <SelectAdmin
                id="shiftType"
                name="shiftType"
                placeholder="-- Chọn loại ca --"
                options={shiftTypeOptions}
                register={register("shiftType")}
                error={errors.shiftType?.message}
                onChange={(e) => setValue("shiftType", e.target.value)}
              />
              <p className="text-[1.2rem] text-gray-500 mt-1">
                Mặc định sẽ là "Theo lịch hẹn"
              </p>
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
              <p className="text-[1.2rem] text-gray-500 mt-1">
                Mặc định sẽ là "Đã lên lịch"
              </p>
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
                disabled={loading || !appointmentList || appointmentList.length === 0 || !currentUser?.userId}
                className="px-[2rem] py-[1rem] text-[1.3rem] font-[500] text-white bg-[#22c55e] rounded-[0.64rem] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Đang tạo..." : "Tạo ca làm việc"}
              </button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default ShiftCreate;


