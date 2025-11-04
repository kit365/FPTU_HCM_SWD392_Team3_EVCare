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
import type { AssignShiftRequest } from "../../../types/shift.types";
import { useAuthContext } from "../../../context/useAuthContext";
import { shiftService } from "../../../service/shiftService";

type FormData = {
  assigneeId: string;
  staffId: string; // Bắt buộc
  technicianIds: string[]; // Bắt buộc
  endTime: string; // Allow updating endTime
};

export const ShiftAssign = () => {
  const navigate = useNavigate();
  const { id: shiftId } = useParams<{ id: string }>();
  const { user: currentUser } = useAuthContext();
  const { getById } = useShift();
  const { fetchUserOptions, fetchUserOptionsByRole } = useUser();
  
  const [assigneeOptions, setAssigneeOptions] = useState<{ value: string; label: string }[]>([]);
  const [staffOptions, setStaffOptions] = useState<{ value: string; label: string }[]>([]);
  const [technicianOptions, setTechnicianOptions] = useState<{ value: string; label: string }[]>([]);
  const [loadingTechnicians, setLoadingTechnicians] = useState(false);
  const [shiftDetails, setShiftDetails] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    reset,
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      assigneeId: "",
      staffId: "",
      technicianIds: [],
      endTime: "",
    },
    mode: 'onChange', // Đổi sang 'onChange' để watch() update real-time
  });

  const calculateEndTime = (startTime: string, services: any[]): string => {
    if (!startTime) {
      // Fallback: current time + 2 hours
      const now = new Date();
      now.setHours(now.getHours() + 2);
      return now.toISOString().slice(0, 16);
    }

    if (!services || services.length === 0) {
      // Nếu không có services, default 2 giờ
      const start = new Date(startTime);
      start.setHours(start.getHours() + 2);
      return start.toISOString().slice(0, 16);
    }

    // Tính tổng thời gian từ services
    const totalMinutes = services.reduce((total, service) => {
      return total + (service.estimatedDurationMinutes || 60); // Default 60 phút nếu không có
    }, 0);

    const start = new Date(startTime);
    start.setMinutes(start.getMinutes() + totalMinutes);
    
    return start.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
  };

  // Load shift details and auto-fill assigneeId
  useEffect(() => {
    const loadShiftDetails = async () => {
      if (!shiftId) {
        console.error("❌ No shiftId provided");
        return;
      }

      try {
        console.log("🔍 Loading shift details for ID:", shiftId);
        const shift = await getById(shiftId);
        console.log("✅ Shift data:", shift);
        setShiftDetails(shift);

        // Auto-calculate endTime dựa trên services
        const calculatedEndTime = shift.endTime 
          ? shift.endTime.slice(0, 16) // Nếu đã có endTime, dùng luôn
          : calculateEndTime(
              shift.startTime, 
              shift.appointment?.serviceTypeResponses || []
            );

        console.log("✅ Calculated endTime:", calculatedEndTime);
        
        if (shift.appointment?.serviceTypeResponses) {
          console.log("📋 Services:", shift.appointment.serviceTypeResponses.map((s: any) => ({
            name: s.serviceName,
            duration: s.estimatedDurationMinutes || 'N/A'
          })));
        }

        // Reset form với values mới, bao gồm auto-fill assigneeId và endTime
        reset({
          assigneeId: currentUser?.userId || "",
          staffId: "",
          technicianIds: [],
          endTime: calculatedEndTime,
        });
        
      } catch (error: any) {
        console.error("❌ Error loading shift:", error);
        toast.error(error?.response?.data?.message || "Không thể tải thông tin ca làm việc!");
        navigate(`/${pathAdmin}/shift`);
      }
    };

    if (currentUser) {
      loadShiftDetails();
    }
  }, [shiftId, currentUser, getById, reset, navigate, pathAdmin]);

  // Load user options
  useEffect(() => {
    const loadData = async () => {
      // Load assignee options (all users)
      const assigneeOpts = await fetchUserOptions();
      setAssigneeOptions(assigneeOpts);
      
      // Load staff options (STAFF role)
      const staffOpts = await fetchUserOptionsByRole('STAFF');
      setStaffOptions(staffOpts);
    };
    loadData();
  }, [fetchUserOptions, fetchUserOptionsByRole]);

  // Watch endTime để load available technicians
  const endTimeValue = watch("endTime");
  
  // Watch form values để disable button
  const staffIdValue = watch("staffId");
  const technicianIdsValue = watch("technicianIds");
  
  // Debug logs (có thể remove sau)
  useEffect(() => {
    console.log("🔍 Form state debug:", {
      staffIdValue,
      technicianIdsValue,
      staffIdTrimmed: staffIdValue?.trim(),
      technicianIdsLength: technicianIdsValue?.length,
      currentUserId: currentUser?.userId
    });
  }, [staffIdValue, technicianIdsValue, currentUser?.userId]);
  
  // Check if form is valid for submission
  const isFormValid = !!(
    currentUser?.userId &&
    staffIdValue &&
    typeof staffIdValue === 'string' &&
    staffIdValue.trim() !== "" &&
    technicianIdsValue &&
    Array.isArray(technicianIdsValue) &&
    technicianIdsValue.length > 0
  );

  useEffect(() => {
    const loadAvailableTechnicians = async () => {
      if (!shiftDetails?.startTime || !endTimeValue) {
        console.log("⚠️ Missing startTime or endTime:", { 
          startTime: shiftDetails?.startTime, 
          endTime: endTimeValue 
        });
        setTechnicianOptions([]);
        return;
      }

      console.log("🔄 Loading available technicians for time range:", {
        startTime: shiftDetails.startTime,
        endTime: endTimeValue,
        shiftId
      });

      setLoadingTechnicians(true);
      try {
        // Format endTime từ datetime-local (YYYY-MM-DDTHH:mm) sang ISO format
        const formattedEndTime = endTimeValue.includes('T') 
          ? `${endTimeValue}:00` // Thêm seconds nếu chưa có
          : endTimeValue;

        const response = await shiftService.getAvailableTechnicians(
          shiftDetails.startTime,
          formattedEndTime,
          shiftId // Exclude current shift
        );

        const availableTechs = response.data.data || [];
        console.log("✅ Available technicians:", availableTechs.length);
        
        const techOpts = availableTechs.map((user: any) => ({
          value: user.userId,
          label: user.fullName || user.username || user.email,
        }));

        setTechnicianOptions(techOpts);
      } catch (error: any) {
        console.error("❌ Error loading available technicians:", error);
        toast.error("Không thể tải danh sách kỹ thuật viên!");
        setTechnicianOptions([]);
      } finally {
        setLoadingTechnicians(false);
      }
    };

    loadAvailableTechnicians();
  }, [shiftDetails, endTimeValue, shiftId]);

  const onSubmit = async (data: FormData) => {
    if (!shiftId) {
      toast.error("Thiếu ID ca làm việc!");
      return;
    }

    if (!currentUser?.userId) {
      toast.error("Không thể xác định người dùng hiện tại!");
      return;
    }

    // Validation: Bắt buộc phải có nhân viên và kỹ thuật viên
    if (!data.staffId || data.staffId.trim() === "") {
      toast.error("Vui lòng chọn nhân viên hỗ trợ!");
      return;
    }

    if (!data.technicianIds || data.technicianIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một kỹ thuật viên!");
      return;
    }

    try {
      // Format endTime từ datetime-local (YYYY-MM-DDTHH:mm) sang ISO format
      const formattedEndTime = data.endTime.includes('T') 
        ? `${data.endTime}:00` // Thêm seconds nếu chưa có
        : data.endTime;

      const payload: AssignShiftRequest = {
        assigneeId: data.assigneeId,
        staffId: data.staffId, // Bắt buộc
        technicianIds: data.technicianIds, // Bắt buộc
        endTime: formattedEndTime,
      };

      console.log("📤 Sending assign payload:", payload);
      
      await shiftService.assign(shiftId, payload);
      toast.success("Phân công ca làm việc thành công!");
      
      // Đợi 500ms để backend xử lý xong
      setTimeout(() => {
        navigate(`/${pathAdmin}/shift`);
      }, 500);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Phân công ca làm việc thất bại!";
      toast.error(errorMessage);
      console.error("❌ Error assigning shift:", error);
    }
  };

  const handleCancel = () => {
    navigate(`/${pathAdmin}/shift`);
  };

  if (!shiftDetails) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Đang tải thông tin ca làm việc...</div>
      </div>
    );
  }

  // Check if shift is assignable
  const isAssignable = shiftDetails.status === 'PENDING_ASSIGNMENT' || shiftDetails.status === 'LATE_ASSIGNMENT';

  if (!isAssignable) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-4">
        <div className="text-xl text-red-600">Ca làm việc này không thể phân công!</div>
        <div className="text-base">Trạng thái hiện tại: {shiftDetails.status}</div>
        <button
          onClick={handleCancel}
          className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="w-full px-[3.2rem] py-[3.2rem] flex flex-col gap-[2.4rem]">
      <div className="flex gap-[0.8rem] items-center">
        <ArrowBackIcon
          onClick={handleCancel}
          sx={{
            fontSize: "2.8rem",
            color: "#1976d2",
            cursor: "pointer",
            "&:hover": {
              opacity: 0.8,
            },
          }}
        />
        <h2 className="text-[2.4rem] font-semibold text-[#1976d2]">
          Phân Công Ca Làm Việc
        </h2>
      </div>

      {/* Appointment & Shift Info */}
      <Card sx={{ padding: "2.4rem", marginBottom: "2.4rem" }}>
        <h3 className="text-[1.8rem] font-semibold mb-4">Thông Tin Cuộc Hẹn</h3>
        <div className="grid grid-cols-2 gap-4 text-[1.4rem]">
          <div>
            <span className="font-semibold">Khách hàng:</span>{" "}
            {shiftDetails.appointment?.customerFullName || "N/A"}
          </div>
          <div>
            <span className="font-semibold">Loại xe:</span>{" "}
            {shiftDetails.appointment?.vehicleTypeResponse?.vehicleTypeName || "N/A"}
          </div>
          <div>
            <span className="font-semibold">Biển số xe:</span>{" "}
            {shiftDetails.appointment?.vehicleNumberPlate || "N/A"}
          </div>
          <div>
            <span className="font-semibold">Thời gian hẹn:</span>{" "}
            {shiftDetails.appointment?.scheduledAt 
              ? new Date(shiftDetails.appointment.scheduledAt).toLocaleString("vi-VN")
              : "N/A"}
          </div>
          <div className="col-span-2">
            <span className="font-semibold">Dịch vụ:</span>{" "}
            {shiftDetails.appointment?.serviceTypeResponses && shiftDetails.appointment.serviceTypeResponses.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {shiftDetails.appointment.serviceTypeResponses.map((service: any) => (
                  <span
                    key={service.serviceTypeId}
                    className="inline-block px-3 py-1 text-[1.2rem] bg-blue-100 text-blue-800 rounded-full"
                  >
                    {service.serviceName}
                  </span>
                ))}
              </div>
            ) : (
              "N/A"
            )}
          </div>
          <div>
            <span className="font-semibold">Giá tạm tính:</span>{" "}
            {shiftDetails.appointment?.quotePrice 
              ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(shiftDetails.appointment.quotePrice)
              : "N/A"}
          </div>
          <div>
            <span className="font-semibold">Trạng thái:</span>{" "}
            <span className={shiftDetails.status === 'LATE_ASSIGNMENT' ? 'text-red-600 font-bold' : 'text-amber-600 font-semibold'}>
              {shiftDetails.status === 'PENDING_ASSIGNMENT' ? 'Chờ phân công' : 
               shiftDetails.status === 'LATE_ASSIGNMENT' ? 'Trễ - Chưa phân công' : 
               shiftDetails.status}
            </span>
          </div>
        </div>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[2.4rem]">
        <Card sx={{ padding: "2.4rem" }}>
          <div className="flex flex-col gap-[2.4rem]">
            {/* Thời gian kết thúc */}
            <div className="flex flex-col gap-[0.8rem]">
              <LabelAdmin htmlFor="endTime" content="Thời gian kết thúc dự kiến" />
              <input
                id="endTime"
                type="datetime-local"
                {...register("endTime", {
                  required: "Thời gian kết thúc không được để trống!",
                })}
                className="w-full px-[1.6rem] py-[1.2rem] text-[1.4rem] border border-gray-300 rounded-[0.8rem] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[1.2rem] text-gray-500 italic">
                🤖 Tự động tính toán dựa trên thời lượng dịch vụ. Bạn có thể chỉnh sửa nếu cần.
              </p>
              {errors.endTime && (
                <span className="text-red-500 text-[1.2rem]">{errors.endTime.message}</span>
              )}
            </div>

            {/* Người phụ trách chính */}
            <div className="flex flex-col gap-[0.8rem]">
              <LabelAdmin htmlFor="assigneeId" content="Người phụ trách chính" />
              <SelectAdmin
                name="assigneeId"
                id="assigneeId"
                register={register("assigneeId", {
                  required: "Người phụ trách chính không được để trống!",
                })}
                options={assigneeOptions}
                placeholder="Chọn người phụ trách..."
              />
              <p className="text-[1.2rem] text-gray-500 italic">
                💡 Mặc định: Người đang phân công (bạn). Có thể thay đổi nếu cần.
              </p>
              {errors.assigneeId && (
                <span className="text-red-500 text-[1.2rem]">{errors.assigneeId.message}</span>
              )}
            </div>

            {/* Nhân viên hỗ trợ */}
            <div className="flex flex-col gap-[0.8rem]">
              <LabelAdmin htmlFor="staffId" content="Nhân viên hỗ trợ *" />
              <SelectAdmin
                name="staffId"
                id="staffId"
                register={register("staffId", {
                  required: "Nhân viên hỗ trợ không được để trống!",
                })}
                options={staffOptions}
                placeholder="Chọn nhân viên hỗ trợ..."
                onChange={(e) => {
                  const value = e.target.value;
                  setValue("staffId", value, { 
                    shouldValidate: true,
                    shouldDirty: true,
                    shouldTouch: true
                  });
                  // Force re-render để watch() update
                  console.log("✅ Staff ID changed to:", value);
                }}
              />
              {errors.staffId && (
                <span className="text-red-500 text-[1.2rem]">{errors.staffId.message}</span>
              )}
            </div>

            {/* Kỹ thuật viên */}
            <div className="flex flex-col gap-[0.8rem]">
              <LabelAdmin htmlFor="technicianIds" content="Kỹ thuật viên * (Có thể chọn nhiều)" />
              <Controller
                name="technicianIds"
                control={control}
                rules={{
                  required: "Vui lòng chọn ít nhất một kỹ thuật viên!",
                  validate: (value) => value && value.length > 0 || "Vui lòng chọn ít nhất một kỹ thuật viên!",
                }}
                render={({ field }) => (
                  <Autocomplete
                    multiple
                    id="technicianIds"
                    options={technicianOptions}
                    getOptionLabel={(option) => option.label}
                    value={technicianOptions.filter(opt => field.value?.includes(opt.value))}
                    onChange={(_, newValue) => {
                      const technicianIds = newValue.map(item => item.value);
                      field.onChange(technicianIds);
                      // Force re-render để watch() update
                      console.log("✅ Technician IDs changed to:", technicianIds);
                    }}
                    loading={loadingTechnicians}
                    disabled={!endTimeValue}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder={
                          !endTimeValue
                            ? "Vui lòng chọn thời gian kết thúc trước"
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
              {errors.technicianIds && (
                <span className="text-red-500 text-[1.2rem]">{errors.technicianIds.message}</span>
              )}
              {!endTimeValue && (
                <span className="text-amber-600 text-[1.2rem]">
                  ⚠️ Vui lòng chọn thời gian kết thúc để xem danh sách kỹ thuật viên available
                </span>
              )}
              {endTimeValue && technicianOptions.length === 0 && !loadingTechnicians && (
                <span className="text-red-600 text-[1.2rem]">
                  ⚠️ Không có kỹ thuật viên nào available trong thời gian này
                </span>
              )}
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-[1.6rem] justify-end">
          <button
            type="button"
            onClick={handleCancel}
            className="px-[2.4rem] py-[1.2rem] text-[1.4rem] bg-gray-500 text-white rounded-[0.8rem] hover:bg-gray-600 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={!isFormValid}
            className="px-[2.4rem] py-[1.2rem] text-[1.4rem] bg-blue-600 text-white rounded-[0.8rem] hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Phân Công
          </button>
        </div>
      </form>
    </div>
  );
};

