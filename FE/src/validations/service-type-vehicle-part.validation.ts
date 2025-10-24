import * as z from 'zod';

// Validation schema for creating service type vehicle part
export const createServiceTypeVehiclePartSchema = z.object({
  serviceTypeId: z.string().uuid('Service type ID phải là UUID hợp lệ'),
  vehiclePartId: z.string().uuid('Vehicle part ID phải là UUID hợp lệ'),
  requiredQuantity: z
    .number()
    .int('Số lượng yêu cầu phải là số nguyên')
    .min(1, 'Số lượng yêu cầu phải lớn hơn 0'),
  estimatedTimeDefault: z
    .number()
    .int('Thời gian ước tính phải là số nguyên')
    .min(1, 'Thời gian ước tính phải lớn hơn 0')
});

// Validation schema for updating service type vehicle part
export const updateServiceTypeVehiclePartSchema = z.object({
  serviceTypeId: z.string().uuid('Service type ID phải là UUID hợp lệ'),
  vehiclePartId: z.string().uuid('Vehicle part ID phải là UUID hợp lệ'),
  requiredQuantity: z
    .number()
    .int('Số lượng yêu cầu phải là số nguyên')
    .min(1, 'Số lượng yêu cầu phải lớn hơn 0'),
  estimatedTimeDefault: z
    .number()
    .int('Thời gian ước tính phải là số nguyên')
    .min(1, 'Thời gian ước tính phải lớn hơn 0'),
  isActive: z.boolean().optional(),
  isDeleted: z.boolean().optional(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional()
});

// Form validation schema (for UI forms)
export const serviceTypeVehiclePartFormSchema = z.object({
  serviceTypeId: z.string().min(1, 'Vui lòng chọn loại dịch vụ'),
  vehiclePartId: z.string().min(1, 'Vui lòng chọn phụ tùng'),
  requiredQuantity: z
    .number()
    .int('Số lượng yêu cầu phải là số nguyên')
    .min(1, 'Số lượng yêu cầu phải lớn hơn 0'),
  estimatedTimeDefault: z
    .number()
    .int('Thời gian ước tính phải là số nguyên')
    .min(1, 'Thời gian ước tính phải lớn hơn 0')
});

// Type inference from schemas
export type CreateServiceTypeVehiclePartInput = z.infer<typeof createServiceTypeVehiclePartSchema>;
export type UpdateServiceTypeVehiclePartInput = z.infer<typeof updateServiceTypeVehiclePartSchema>;
export type ServiceTypeVehiclePartFormInput = z.infer<typeof serviceTypeVehiclePartFormSchema>;
