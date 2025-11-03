import { useState, useEffect } from 'react';
import { Modal, Button, Box, Select, MenuItem, FormControl, InputLabel, FormHelperText } from "@mui/material";
import { DatePicker } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { employeeProfileService } from '../../../service/employeeProfileService';
import { notify } from '../../../components/admin/common/Toast';
import type { EmployeeProfileResponse } from '../../../types/employee-profile.types';
import type { UserResponse } from '../../../types/user.types';
import { SkillLevelEnum } from '../../../types/employee-profile.types';

interface EmployeeProfileFormProps {
  open: boolean;
  profile: EmployeeProfileResponse | null;
  userId: string | null;
  usersWithoutProfile: UserResponse[];
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EmployeeProfileForm({
  open,
  profile,
  userId: initialUserId,
  usersWithoutProfile,
  onSuccess,
  onCancel,
}: EmployeeProfileFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    userId: initialUserId || '',
    skillLevel: '' as SkillLevelEnum | '',
    certifications: '',
    performanceScore: '',
    totalHoursWorked: '',
    hireDate: null as Dayjs | null,
    salaryBase: '',
    emergencyContact: '',
    notes: '',
  });

  const [errors, setErrors] = useState({
    userId: '',
    skillLevel: '',
    performanceScore: '',
    totalHoursWorked: '',
    hireDate: '',
  });

  useEffect(() => {
    if (open) {
      if (profile) {
        // Edit mode
        setFormData({
          userId: profile.userId.userId,
          skillLevel: profile.skillLevel || '',
          certifications: profile.certifications || '',
          performanceScore: profile.performanceScore?.toString() || '',
          totalHoursWorked: profile.totalHoursWorked?.toString() || '',
          hireDate: profile.hireDate ? dayjs(profile.hireDate) : null,
          salaryBase: profile.salaryBase?.toString() || '',
          emergencyContact: profile.emergencyContact || '',
          notes: profile.notes || '',
        });
      } else {
        // Create mode
        setFormData({
          userId: initialUserId || '',
          skillLevel: '' as SkillLevelEnum | '',
          certifications: '',
          performanceScore: '',
          totalHoursWorked: '',
          hireDate: null,
          salaryBase: '',
          emergencyContact: '',
          notes: '',
        });
      }
      // Reset errors
      setErrors({
        userId: '',
        skillLevel: '',
        performanceScore: '',
        totalHoursWorked: '',
        hireDate: '',
      });
    }
  }, [open, profile, initialUserId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSkillLevelChange = (e: any) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, skillLevel: value as SkillLevelEnum }));
    if (errors.skillLevel) {
      setErrors(prev => ({ ...prev, skillLevel: '' }));
    }
  };

  const handleDateChange = (date: Dayjs | null) => {
    setFormData(prev => ({ ...prev, hireDate: date }));
    if (errors.hireDate) {
      setErrors(prev => ({ ...prev, hireDate: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors = {
      userId: '',
      skillLevel: '',
      performanceScore: '',
      totalHoursWorked: '',
      hireDate: '',
    };

    if (!profile && !formData.userId) {
      newErrors.userId = 'Vui lòng chọn nhân viên';
    }

    if (!formData.skillLevel) {
      newErrors.skillLevel = 'Vui lòng chọn trình độ kỹ năng';
    }

    if (formData.performanceScore && (isNaN(Number(formData.performanceScore)) || Number(formData.performanceScore) < 0 || Number(formData.performanceScore) > 10)) {
      newErrors.performanceScore = 'Điểm hiệu suất phải từ 0 đến 10';
    }

    if (formData.totalHoursWorked && (isNaN(Number(formData.totalHoursWorked)) || Number(formData.totalHoursWorked) < 0)) {
      newErrors.totalHoursWorked = 'Tổng giờ làm việc phải >= 0';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      notify.error('Vui lòng kiểm tra lại thông tin');
      return;
    }

    try {
      setSubmitting(true);

      const submitData: any = {
        skillLevel: formData.skillLevel,
        certifications: formData.certifications || undefined,
        performanceScore: formData.performanceScore ? Number(formData.performanceScore) : undefined,
        totalHoursWorked: formData.totalHoursWorked ? Number(formData.totalHoursWorked) : undefined,
        hireDate: formData.hireDate ? formData.hireDate.toISOString() : undefined,
        salaryBase: formData.salaryBase ? Number(formData.salaryBase) : undefined,
        emergencyContact: formData.emergencyContact || undefined,
        notes: formData.notes || undefined,
      };

      if (profile) {
        // Update mode
        await employeeProfileService.update(profile.employeeProfileId, submitData);
        notify.success('Cập nhật hồ sơ nhân viên thành công!');
      } else {
        // Create mode
        await employeeProfileService.create({
          userId: formData.userId,
          ...submitData,
        });
        notify.success('Tạo hồ sơ nhân viên thành công!');
        
        // Activate user after creating profile
        try {
          await userService.update(formData.userId, { isActive: true });
        } catch (error) {
          console.warn('Could not activate user:', error);
        }
      }

      onSuccess();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Có lỗi xảy ra';
      notify.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const skillLevelOptions = [
    { value: SkillLevelEnum.INTERNSHIP, label: 'Thực tập (Internship)' },
    { value: SkillLevelEnum.FRESHER, label: 'Fresher' },
    { value: SkillLevelEnum.JUNIOR, label: 'Junior' },
    { value: SkillLevelEnum.MIDDLE, label: 'Middle' },
    { value: SkillLevelEnum.SENIOR, label: 'Senior' },
  ];

  return (
    <Modal
      open={open}
      onClose={onCancel}
      aria-labelledby="form-modal-title"
      aria-describedby="form-modal-description"
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 800,
          maxHeight: '90vh',
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          overflow: 'auto',
        }}
      >
        <h2
          id="form-modal-title"
          className="text-[2rem] font-bold mb-6 text-[#2b2d3b]"
        >
          {profile ? 'Chỉnh sửa hồ sơ nhân viên' : 'Tạo hồ sơ nhân viên'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Selection (only for create mode) */}
          {!profile && (
            <div>
              <label className="block text-[1.3rem] font-medium text-gray-700 mb-2">
                Nhân viên <span className="text-red-500">*</span>
              </label>
              <select
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                className={`w-full px-4 py-3 text-[1.3rem] border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.userId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">-- Chọn nhân viên --</option>
                {usersWithoutProfile.map(user => (
                  <option key={user.userId} value={user.userId}>
                    {user.fullName || user.email} ({user.roleName?.join(', ')})
                  </option>
                ))}
              </select>
              {errors.userId && (
                <p className="text-red-500 text-[1.1rem] mt-1">{errors.userId}</p>
              )}
            </div>
          )}

          {/* Display User Info (edit mode) */}
          {profile && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-[1.3rem] text-gray-700">
                <strong>Nhân viên:</strong> {profile.userId?.fullName || profile.userId?.email}
              </p>
              <p className="text-[1.2rem] text-gray-600 mt-1">
                Email: {profile.userId?.email}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Skill Level */}
            <div>
              <label className="block text-[1.3rem] font-medium text-gray-700 mb-2">
                Trình độ kỹ năng <span className="text-red-500">*</span>
              </label>
              <FormControl fullWidth error={!!errors.skillLevel}>
                <Select
                  value={formData.skillLevel}
                  onChange={handleSkillLevelChange}
                  displayEmpty
                  className="text-[1.3rem]"
                >
                  <MenuItem value="">
                    <em>-- Chọn trình độ --</em>
                  </MenuItem>
                  {skillLevelOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.skillLevel && (
                  <FormHelperText className="text-[1.1rem]">{errors.skillLevel}</FormHelperText>
                )}
              </FormControl>
            </div>

            {/* Hire Date */}
            <div>
              <label className="block text-[1.3rem] font-medium text-gray-700 mb-2">
                Ngày tuyển dụng
              </label>
              <DatePicker
                value={formData.hireDate}
                onChange={handleDateChange}
                format="DD/MM/YYYY"
                className="w-full"
                style={{ width: '100%', height: '48px' }}
              />
            </div>

            {/* Performance Score */}
            <div>
              <label className="block text-[1.3rem] font-medium text-gray-700 mb-2">
                Điểm hiệu suất (0-10)
              </label>
              <input
                type="number"
                name="performanceScore"
                value={formData.performanceScore}
                onChange={handleChange}
                min="0"
                max="10"
                step="0.01"
                className={`w-full px-4 py-3 text-[1.3rem] border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.performanceScore ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00 - 10.00"
              />
              {errors.performanceScore && (
                <p className="text-red-500 text-[1.1rem] mt-1">{errors.performanceScore}</p>
              )}
            </div>

            {/* Total Hours Worked */}
            <div>
              <label className="block text-[1.3rem] font-medium text-gray-700 mb-2">
                Tổng giờ làm việc
              </label>
              <input
                type="number"
                name="totalHoursWorked"
                value={formData.totalHoursWorked}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`w-full px-4 py-3 text-[1.3rem] border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.totalHoursWorked ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.totalHoursWorked && (
                <p className="text-red-500 text-[1.1rem] mt-1">{errors.totalHoursWorked}</p>
              )}
            </div>

            {/* Salary Base */}
            <div>
              <label className="block text-[1.3rem] font-medium text-gray-700 mb-2">
                Lương cơ bản (VNĐ)
              </label>
              <input
                type="number"
                name="salaryBase"
                value={formData.salaryBase}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-3 text-[1.3rem] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            {/* Emergency Contact */}
            <div>
              <label className="block text-[1.3rem] font-medium text-gray-700 mb-2">
                Liên hệ khẩn cấp
              </label>
              <input
                type="text"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                maxLength={20}
                className="w-full px-4 py-3 text-[1.3rem] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Số điện thoại"
              />
            </div>
          </div>

          {/* Certifications */}
          <div>
            <label className="block text-[1.3rem] font-medium text-gray-700 mb-2">
              Chứng chỉ
            </label>
            <input
              type="text"
              name="certifications"
              value={formData.certifications}
              onChange={handleChange}
              className="w-full px-4 py-3 text-[1.3rem] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ví dụ: Chứng chỉ kỹ thuật viên, Chứng chỉ an toàn lao động"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[1.3rem] font-medium text-gray-700 mb-2">
              Ghi chú
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              maxLength={500}
              className="w-full px-4 py-3 text-[1.3rem] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ghi chú về nhân viên (tối đa 500 ký tự)"
            />
            <p className="text-gray-500 text-[1.1rem] mt-1">
              {formData.notes.length}/500 ký tự
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              onClick={onCancel}
              variant="outlined"
              disabled={submitting}
              sx={{
                textTransform: 'none',
                fontSize: '1.3rem',
                px: 3,
                py: 1,
              }}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{
                textTransform: 'none',
                fontSize: '1.3rem',
                px: 3,
                py: 1,
                bgcolor: '#2563eb',
                '&:hover': {
                  bgcolor: '#1d4ed8',
                },
              }}
            >
              {submitting ? 'Đang lưu...' : profile ? 'Cập nhật' : 'Tạo hồ sơ'}
            </Button>
          </div>
        </form>
      </Box>
    </Modal>
  );
}

