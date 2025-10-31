import { Select } from 'antd';
import { FilterOutlined, ClearOutlined } from '@ant-design/icons';

interface FilterOption {
  value: string;
  label: string;
}

interface FormFilterProps {
  vehicleTypeOptions?: FilterOption[];
  categoryOptions?: FilterOption[];
  statusOptions?: FilterOption[];
  vehicleTypeId?: string;
  categoryId?: string;
  status?: string;
  minStock?: boolean;
  onVehicleTypeChange?: (value: string | undefined) => void;
  onCategoryChange?: (value: string | undefined) => void;
  onStatusChange?: (value: string | undefined) => void;
  onMinStockChange?: (checked: boolean) => void;
  onReset?: () => void;
  loading?: boolean;
}

export const FormFilter = ({
  vehicleTypeOptions = [],
  categoryOptions = [],
  statusOptions = [],
  vehicleTypeId,
  categoryId,
  status,
  minStock,
  onVehicleTypeChange,
  onCategoryChange,
  onStatusChange,
  onMinStockChange,
  onReset,
  loading = false,
}: FormFilterProps) => {
  const hasFilters = vehicleTypeId || categoryId || status || minStock;

  return (
    <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FilterOutlined className="text-[1.4rem] text-gray-600" />
          <h3 className="text-[1.3rem] font-semibold text-gray-800">Bộ lọc</h3>
        </div>
        {hasFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-3 py-1.5 text-[1.2rem] text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <ClearOutlined />
            <span>Xóa bộ lọc</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Loại xe */}
        <div className="flex flex-col">
          <label className="text-[1.2rem] font-medium text-gray-700 mb-1.5">
            Loại xe
          </label>
          <Select
            placeholder="Chọn loại xe"
            value={vehicleTypeId || undefined}
            onChange={(value) => onVehicleTypeChange?.(value || undefined)}
            allowClear
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={vehicleTypeOptions}
            loading={loading}
            className="w-full"
            size="large"
          />
        </div>

        {/* Danh mục phụ tùng */}
        <div className="flex flex-col">
          <label className="text-[1.2rem] font-medium text-gray-700 mb-1.5">
            Danh mục phụ tùng
          </label>
          <Select
            placeholder="Chọn danh mục"
            value={categoryId || undefined}
            onChange={(value) => onCategoryChange?.(value || undefined)}
            allowClear
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={categoryOptions}
            loading={loading}
            className="w-full"
            size="large"
          />
        </div>

        {/* Trạng thái */}
        <div className="flex flex-col">
          <label className="text-[1.2rem] font-medium text-gray-700 mb-1.5">
            Trạng thái
          </label>
          <Select
            placeholder="Chọn trạng thái"
            value={status || undefined}
            onChange={(value) => onStatusChange?.(value || undefined)}
            allowClear
            options={statusOptions}
            loading={loading}
            className="w-full"
            size="large"
          />
        </div>

        {/* Sắp hết hàng */}
        <div className="flex flex-col justify-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={minStock || false}
              onChange={(e) => onMinStockChange?.(e.target.checked)}
              className="w-[1.6rem] h-[1.6rem] cursor-pointer"
            />
            <span className="text-[1.2rem] font-medium text-gray-700">
              Sắp hết hàng
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

