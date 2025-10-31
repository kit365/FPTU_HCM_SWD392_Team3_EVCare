import { Card } from "@mui/material";
import { CardHeaderAdmin } from "../../../components/admin/ui/CardHeader";
import { LabelAdmin } from "../../../components/admin/ui/form/Label";
import { SelectAdmin } from "../../../components/admin/ui/form/Select";
import { pathAdmin } from "../../../constants/paths.constant";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { InputAdmin } from "../../../components/admin/ui/form/Input";
import { DatePicker, notification, Select } from "antd";
import dayjs from "dayjs";
import { useVehicleProfile } from "../../../hooks/useVehicleProfile";
import { useVehicleType } from "../../../hooks/useVehicleType";
import { useUser } from "../../../hooks/useUser";
import type { CreationVehicleProfileRequest } from "../../../types/vehicle-profile.types";

interface CarFileForm {
  userId: string;
  vehicleTypeId: string;
  plateNumber: string;
  vin: string;
  currentKm: number;
  lastMaintenanceDate: string;
  lastMaintenanceKm: number;
  notes: string;
}

const CarFileCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  const { create } = useVehicleProfile();
  const { vehicleTypeOptions, fetchVehicleTypeNames } = useVehicleType();
  const { fetchUserOptions, userOptions } = useUser();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CarFileForm>();

  useEffect(() => {
    fetchVehicleTypeNames();
    fetchUserOptions();
  }, [fetchVehicleTypeNames, fetchUserOptions]);

  const onSubmit = async (data: CarFileForm) => {
    setLoading(true);
    try {
      const createData: CreationVehicleProfileRequest = {
        userId: data.userId,
        vehicleTypeId: data.vehicleTypeId,
        plateNumber: data.plateNumber,
        vin: data.vin,
        currentKm: data.currentKm || 0,
        lastMaintenanceDate: data.lastMaintenanceDate,
        lastMaintenanceKm: data.lastMaintenanceKm || 0,
        notes: data.notes,
      };

      await create(createData);
      
      notification.success({
        message: "Thành công",
        description: "Tạo hồ sơ xe thành công"
      });
      
      navigate(`/${pathAdmin}/car-file-management`);
    } catch (error) {
      console.error("Lỗi khi tạo hồ sơ xe:", error);
      notification.error({
        message: "Lỗi",
        description: "Có lỗi xảy ra khi tạo hồ sơ xe"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1320px] px-[12px] mx-auto">
      <Card
        elevation={0}
        className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]"
      >
        <CardHeaderAdmin title="Thêm mới hồ sơ xe người dùng" />
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="px-[2.4rem] pb-[2.4rem] grid grid-cols-2 gap-[24px]"
        >
          {/* Chọn khách hàng */}
          <div className="col-span-2">
            <LabelAdmin htmlFor="userId" content="Khách hàng" />
            <Select
              id="userId"
              showSearch
              placeholder="Chọn khách hàng"
              className="w-full"
              size="large"
              optionFilterProp="label"
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={userOptions}
              value={selectedUserId || undefined}
              onChange={(value) => {
                setSelectedUserId(value);
                setValue("userId", value);
              }}
            />
            {errors.userId && (
              <p className="mt-[6px] text-[1.2rem] text-red-500">
                Vui lòng chọn khách hàng
              </p>
            )}
          </div>

          {/* Loại xe */}
          <div>
            <LabelAdmin htmlFor="vehicleTypeId" content="Loại xe" />
            <SelectAdmin
              id="vehicleTypeId"
              name="vehicleTypeId"
              placeholder="Chọn loại xe"
              options={vehicleTypeOptions}
              register={register("vehicleTypeId", {
                required: "Vui lòng chọn loại xe",
              })}
              error={errors.vehicleTypeId?.message}
            />
          </div>

          {/* Biển số xe */}
          <div>
            <LabelAdmin htmlFor="plateNumber" content="Biển số xe" />
            <InputAdmin
              id="plateNumber"
              type="text"
              placeholder="VD: 51A-123.45"
              {...register("plateNumber", {
                required: "Vui lòng nhập biển số xe",
              })}
              error={errors.plateNumber?.message}
            />
          </div>

          {/* Số VIN */}
          <div>
            <LabelAdmin htmlFor="vin" content="Số VIN" />
            <InputAdmin
              id="vin"
              type="text"
              placeholder="Nhập số VIN"
              {...register("vin")}
              error={errors.vin?.message}
            />
          </div>

          {/* Số km hiện tại */}
          <div>
            <LabelAdmin htmlFor="currentKm" content="Số km hiện tại" />
            <InputAdmin
              id="currentKm"
              type="number"
              placeholder="Nhập số km hiện tại"
              {...register("currentKm", {
                valueAsNumber: true,
                min: { value: 0, message: "Số km phải lớn hơn hoặc bằng 0" }
              })}
              error={errors.currentKm?.message}
            />
          </div>

          {/* Ngày bảo trì gần nhất */}
          <div>
            <LabelAdmin
              htmlFor="lastMaintenanceDate"
              content="Ngày bảo trì gần nhất"
            />
            <DatePicker
              format="YYYY-MM-DD"
              className="w-full h-[42px]"
              placeholder="Chọn ngày bảo trì"
              value={selectedDate}
              onChange={(date) => {
                setSelectedDate(date);
                setValue(
                  "lastMaintenanceDate",
                  date ? dayjs(date).format("YYYY-MM-DD") : ""
                );
              }}
            />
            {errors.lastMaintenanceDate && (
              <p className="mt-[6px] text-[1.2rem] text-red-500">
                {errors.lastMaintenanceDate.message}
              </p>
            )}
          </div>

          {/* Số km bảo trì gần nhất */}
          <div>
            <LabelAdmin htmlFor="lastMaintenanceKm" content="Số km bảo trì gần nhất" />
            <InputAdmin
              id="lastMaintenanceKm"
              type="number"
              placeholder="Nhập số km bảo trì gần nhất"
              {...register("lastMaintenanceKm", {
                valueAsNumber: true,
                min: { value: 0, message: "Số km phải lớn hơn hoặc bằng 0" }
              })}
              error={errors.lastMaintenanceKm?.message}
            />
          </div>

          {/* Ghi chú */}
          <div className="col-span-2">
            <LabelAdmin htmlFor="notes" content="Ghi chú" />
            <InputAdmin
              id="notes"
              type="text"
              placeholder="Nhập ghi chú (tùy chọn)"
              {...register("notes")}
              error={errors.notes?.message}
            />
          </div>

          {/* Nút hành động */}
          <div className="col-span-2 flex items-center gap-[6px] justify-end mt-6">
            <button
              type="submit"
              disabled={loading}
              className="px-[1.6rem] py-[0.8rem] bg-[#22c55e] text-white border border-[#22c55e] rounded-[6px] shadow-[0_1px_2px_0_rgba(34,197,94,0.35)] hover:bg-[#16a34a] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang tạo..." : "Tạo mới"}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/${pathAdmin}/car-file-management`)}
              className="px-[1.6rem] py-[0.8rem] bg-[#ef4d56] text-white border border-[#ef4d56] rounded-[6px] shadow-[0_1px_2px_0_rgba(239,77,86,0.35)] hover:bg-[#dc2626]"
            >
              Hủy
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CarFileCreate;
