import { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { DatePicker } from "antd";
import type { Dayjs } from 'dayjs';
import { LabelAdmin } from "../../../../components/admin/ui/form/Label";
import { SelectAdmin } from "../../../../components/admin/ui/form/Select";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useUser } from "../../../../hooks/useUser";
import { useAppointment } from "../../../../hooks/useAppointment";
import { toast } from "react-toastify";
import type { AppointmentResponse } from "../../../../types/appointment.types";
import type { UserResponse } from "../../../../types/user.types";

interface CreateShiftModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ShiftFormData {
  staffId: string;
  appointmentId: string;
}

const schema = yup.object({
  staffId: yup.string().required("Vui lòng chọn nhân viên"),
  appointmentId: yup.string().required("Vui lòng chọn appointment"),
});

export const CreateShiftModal = ({ open, onClose, onSuccess }: CreateShiftModalProps) => {
  const { search: searchUsers, list: userList, loading: loadingUsers } = useUser();
  const { search: searchAppointments, list: appointmentList, loading: loadingAppointments } = useAppointment();
  
  const [staffOptions, setStaffOptions] = useState<{ value: string; label: string }[]>([]);
  const [appointmentOptions, setAppointmentOptions] = useState<{ value: string; label: string }[]>([]);
  const [selectedDateTime, setSelectedDateTime] = useState<Dayjs | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<ShiftFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      staffId: "",
      appointmentId: "",
    }
  });

  // Fetch staff (users with STAFF role) when modal opens
  useEffect(() => {
    if (open) {
      fetchStaffUsers();
      fetchPendingAppointments();
    }
  }, [open]);

  // Update staff options when user list changes
  useEffect(() => {
    if (userList && userList.length > 0) {
      // Filter users with STAFF role
      const staffUsers = userList.filter((user: UserResponse) => 
        user.roleName && user.roleName.includes('STAFF')
      );
      
      const options = staffUsers.map((user: UserResponse) => ({
        value: user.userId,
        label: user.username,
      }));
      
      setStaffOptions(options);
    }
  }, [userList]);

  // Update appointment options when appointment list changes
  useEffect(() => {
    if (appointmentList && appointmentList.length > 0) {
      const options = appointmentList.map((appointment: AppointmentResponse) => {
        // Find parent service type (the one that has children)
        // children có thể là array of strings hoặc array of objects
        let parentServiceType = appointment.serviceTypeResponses.find(
          (service) => service.children && service.children.length > 0
        );
        
        // Nếu không tìm thấy parent có children, tìm service type không có parentId
        if (!parentServiceType) {
          parentServiceType = appointment.serviceTypeResponses.find(
            (service) => !service.parentId || service.parentId === null || service.parentId === ""
          );
        }
        
        const serviceTypeName = parentServiceType 
          ? parentServiceType.serviceName 
          : (appointment.serviceTypeResponses[0]?.serviceName || 'N/A');
        
        return {
          value: appointment.appointmentId,
          label: serviceTypeName,
        };
      });
      
      setAppointmentOptions(options);
    }
  }, [appointmentList]);

  const fetchStaffUsers = async () => {
    try {
      await searchUsers({ page: 0, pageSize: 100 });
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error("Không thể tải danh sách nhân viên!");
    }
  };

  const fetchPendingAppointments = async () => {
    try {
      await searchAppointments({ page: 0, pageSize: 100 });
      // Note: API doesn't support status filter yet, so we fetch all
      // In production, you would filter by status=PENDING on the backend
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error("Không thể tải danh sách appointment!");
    }
  };

  const onSubmit = async (data: ShiftFormData) => {
    if (!selectedDateTime) {
      toast.error("Vui lòng chọn ngày và giờ làm việc!");
      return;
    }

    setSubmitting(true);
    try {
      // Simulate API call to create shift
      console.log("Creating shift with data:", {
        ...data,
        scheduledDateTime: selectedDateTime.format('YYYY-MM-DD HH:mm:ss'),
      });

      // In production, call actual API here
      // await shiftService.create({ ... });

      setTimeout(() => {
        toast.success("Tạo ca làm thành công!");
        handleClose();
        onSuccess();
        setSubmitting(false);
      }, 1000);
    } catch (error) {
      console.error('Error creating shift:', error);
      toast.error("Không thể tạo ca làm!");
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedDateTime(null);
    onClose();
  };

  const handleDateTimeChange = (date: Dayjs | null) => {
    setSelectedDateTime(date);
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '600px',
          maxHeight: '90vh',
          overflow: 'visible'
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="text-[1.8rem] font-[700] text-[#2b2d3b]">Tạo ca làm mới</div>
          <div className="text-[1.3rem] text-gray-600 mt-1">Phân công nhân viên cho appointment</div>
        </div>
        <IconButton aria-label="close" onClick={handleClose} sx={{ color: (theme) => theme.palette.grey[500] }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers sx={{ overflow: 'visible', minHeight: '400px' }}>
        <form className="space-y-4">
          {/* Chọn nhân viên */}
          <div>
            <LabelAdmin htmlFor="staffId" content="Nhân viên *" />
            {loadingUsers ? (
              <div className="text-[1.3rem] text-gray-500 py-2">Đang tải danh sách nhân viên...</div>
            ) : staffOptions.length === 0 ? (
              <div className="text-[1.3rem] text-red-500 py-2">Không có nhân viên nào</div>
            ) : (
              <SelectAdmin
                id="staffId"
                name="staffId"
                placeholder="-- Chọn nhân viên --"
                options={staffOptions}
                register={register("staffId")}
                error={errors.staffId?.message as string}
                onChange={(e) => setValue("staffId", e.target.value)}
              />
            )}
          </div>

          {/* Chọn appointment */}
          <div>
            <LabelAdmin htmlFor="appointmentId" content="Appointment *" />
            {loadingAppointments ? (
              <div className="text-[1.3rem] text-gray-500 py-2">Đang tải danh sách appointment...</div>
            ) : appointmentOptions.length === 0 ? (
              <div className="text-[1.3rem] text-red-500 py-2">Không có appointment nào</div>
            ) : (
              <SelectAdmin
                id="appointmentId"
                name="appointmentId"
                placeholder="-- Chọn appointment --"
                options={appointmentOptions}
                register={register("appointmentId")}
                error={errors.appointmentId?.message as string}
                onChange={(e) => setValue("appointmentId", e.target.value)}
              />
            )}
          </div>

          {/* Chọn ngày giờ */}
          <div>
            <LabelAdmin htmlFor="dateTime" content="Ngày và giờ làm việc *" />
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              className="w-full h-[4.4rem] text-[1.3rem]"
              placeholder="Chọn ngày và giờ"
              value={selectedDateTime}
              onChange={handleDateTimeChange}
              getPopupContainer={(trigger) => trigger.parentElement || document.body}
              popupStyle={{ zIndex: 9999 }}
            />
            {!selectedDateTime && (
              <div className="text-[1.2rem] text-gray-500 mt-1">
                Chọn ngày và giờ bắt đầu ca làm việc
              </div>
            )}
          </div>
        </form>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <button
          type="button"
          onClick={handleClose}
          disabled={submitting}
          className="px-4 py-2 text-[1.3rem] font-[500] text-gray-700 bg-gray-200 rounded-[0.64rem] hover:bg-gray-300 transition-colors disabled:opacity-50"
        >
          Hủy
        </button>
        <button
          type="button"
          onClick={handleSubmit(onSubmit)}
          disabled={submitting || loadingUsers || loadingAppointments}
          className="px-4 py-2 text-[1.3rem] font-[500] text-white bg-[#22c55e] rounded-[0.64rem] hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {submitting ? "Đang tạo..." : "Tạo ca làm"}
        </button>
      </DialogActions>
    </Dialog>
  );
};

