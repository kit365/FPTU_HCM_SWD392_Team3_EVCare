// Service Type Vehicle Part Constants

export const SERVICE_TYPE_VEHICLE_PART_CONSTANTS = {
  // API Endpoints
  ENDPOINTS: {
    BASE: '/service-type/vehicle-part',
    ITEM: '/service-type/vehicle-part/{id}',
    RESTORE: '/service-type/vehicle-part/restore/{id}'
  },

  // Form Labels
  LABELS: {
    SERVICE_TYPE: 'Loại dịch vụ',
    VEHICLE_PART: 'Phụ tùng',
    REQUIRED_QUANTITY: 'Số lượng yêu cầu',
    ESTIMATED_TIME: 'Thời gian ước tính (phút)',
    STATUS: 'Trạng thái',
    CREATED_AT: 'Ngày tạo',
    UPDATED_AT: 'Ngày cập nhật',
    CREATED_BY: 'Người tạo',
    UPDATED_BY: 'Người cập nhật'
  },

  // Placeholders
  PLACEHOLDERS: {
    SELECT_SERVICE_TYPE: 'Chọn loại dịch vụ',
    SELECT_VEHICLE_PART: 'Chọn phụ tùng',
    REQUIRED_QUANTITY: 'Nhập số lượng yêu cầu',
    ESTIMATED_TIME: 'Nhập thời gian ước tính (phút)',
    SEARCH: 'Tìm kiếm theo tên dịch vụ hoặc phụ tùng'
  },

  // Messages
  MESSAGES: {
    CREATE_SUCCESS: 'Tạo liên kết dịch vụ - phụ tùng thành công',
    UPDATE_SUCCESS: 'Cập nhật liên kết dịch vụ - phụ tùng thành công',
    DELETE_SUCCESS: 'Xóa liên kết dịch vụ - phụ tùng thành công',
    RESTORE_SUCCESS: 'Khôi phục liên kết dịch vụ - phụ tùng thành công',
    CREATE_ERROR: 'Có lỗi xảy ra khi tạo liên kết dịch vụ - phụ tùng',
    UPDATE_ERROR: 'Có lỗi xảy ra khi cập nhật liên kết dịch vụ - phụ tùng',
    DELETE_ERROR: 'Có lỗi xảy ra khi xóa liên kết dịch vụ - phụ tùng',
    RESTORE_ERROR: 'Có lỗi xảy ra khi khôi phục liên kết dịch vụ - phụ tùng',
    NOT_FOUND: 'Không tìm thấy liên kết dịch vụ - phụ tùng',
    VALIDATION_ERROR: 'Dữ liệu không hợp lệ'
  },

  // Table Headers
  TABLE_HEADERS: {
    SERVICE_TYPE: 'Loại dịch vụ',
    VEHICLE_PART: 'Phụ tùng',
    VEHICLE_TYPE: 'Loại xe',
    PART_CATEGORY: 'Danh mục phụ tùng',
    REQUIRED_QUANTITY: 'Số lượng yêu cầu',
    ESTIMATED_TIME: 'Thời gian ước tính',
    STATUS: 'Trạng thái',
    ACTIONS: 'Thao tác'
  },

  // Status Options
  STATUS_OPTIONS: [
    { value: true, label: 'Hoạt động' },
    { value: false, label: 'Không hoạt động' }
  ],

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 20, 50]
  },

  // Form Validation Messages
  VALIDATION: {
    SERVICE_TYPE_REQUIRED: 'Vui lòng chọn loại dịch vụ',
    VEHICLE_PART_REQUIRED: 'Vui lòng chọn phụ tùng',
    REQUIRED_QUANTITY_REQUIRED: 'Số lượng yêu cầu không được để trống',
    REQUIRED_QUANTITY_MIN: 'Số lượng yêu cầu phải lớn hơn 0',
    REQUIRED_QUANTITY_INTEGER: 'Số lượng yêu cầu phải là số nguyên',
    ESTIMATED_TIME_REQUIRED: 'Thời gian ước tính không được để trống',
    ESTIMATED_TIME_MIN: 'Thời gian ước tính phải lớn hơn 0',
    ESTIMATED_TIME_INTEGER: 'Thời gian ước tính phải là số nguyên'
  }
};

// Vehicle Part Status Options
export const VEHICLE_PART_STATUS_OPTIONS = [
  { value: 'AVAILABLE', label: 'Có sẵn', color: 'green' },
  { value: 'LOW_STOCK', label: 'Sắp hết', color: 'yellow' },
  { value: 'OUT_OF_STOCK', label: 'Hết hàng', color: 'red' }
];

// Time Units for Estimated Time
export const TIME_UNITS = [
  { value: 'minutes', label: 'Phút' },
  { value: 'hours', label: 'Giờ' },
  { value: 'days', label: 'Ngày' }
];
