import { useEffect, useState } from "react";
import { Card } from "@mui/material";
import { CardHeaderAdmin } from "../../../components/admin/ui/CardHeader";
import { LabelAdmin } from "../../../components/admin/ui/form/Label";
import { SelectAdmin } from "../../../components/admin/ui/form/Select";
import { InputAdmin } from "../../../components/admin/ui/form/Input";
import { useForm } from "react-hook-form";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { pathAdmin } from "../../../constants/paths.constant";
import { DatePicker, notification } from "antd";
import dayjs from "dayjs";
import { useVehicleProfile } from "../../../hooks/useVehicleProfile";
import { useVehicleType } from "../../../hooks/useVehicleType";
import type { UpdationVehicleProfileRequest } from "../../../types/vehicle-profile.types";

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

const CarFileEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isViewMode = location.pathname.includes("view");

  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
  const [vehicleData, setVehicleData] = useState<any>(null);

  const { getById, update } = useVehicleProfile();
  const { vehicleTypeOptions, fetchVehicleTypeNames } = useVehicleType();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CarFileForm>();

  useEffect(() => {
    fetchVehicleTypeNames();
  }, [fetchVehicleTypeNames]);

  useEffect(() => {
    // Lấy dữ liệu theo id từ API
    const fetchVehicleData = async () => {
      if (id) {
        try {
          const data = await getById(id);
          setVehicleData(data);
          
          if (data) {
            setValue("userId", data.user?.userId || "");
            setValue("vehicleTypeId", data.vehicleType?.vehicleTypeId || "");
            setValue("plateNumber", data.plateNumber || "");
            setValue("vin", data.vin || "");
            setValue("currentKm", data.currentKm || 0);
            setValue("lastMaintenanceKm", data.lastMaintenanceKm || 0);
            setValue("notes", data.notes || "");
            
            if (data.lastMaintenanceDate) {
              setValue("lastMaintenanceDate", data.lastMaintenanceDate);
              setSelectedDate(dayjs(data.lastMaintenanceDate));
            }
          }
        } catch (error) {
          console.error(`Không tìm thấy hồ sơ xe với id: ${id}`, error);
          notification.error({
            message: "Lỗi",
            description: "Không tìm thấy hồ sơ xe"
          });
          navigate(`/${pathAdmin}/car-file-management`);
        }
      }
    };

    fetchVehicleData();
  }, [id, setValue, navigate, getById]);

  const onSubmit = async (data: CarFileForm) => {
    if (isViewMode || !id) return;
    
    setLoading(true);
    try {
      const updateData: UpdationVehicleProfileRequest = {
        userId: data.userId,
        vehicleTypeId: data.vehicleTypeId,
        plateNumber: data.plateNumber,
        vin: data.vin,
        currentKm: data.currentKm,
        lastMaintenanceDate: data.lastMaintenanceDate,
        lastMaintenanceKm: data.lastMaintenanceKm,
        notes: data.notes,
      };

      await update(id, updateData);
      
      notification.success({
        message: "Thành công",
        description: "Cập nhật hồ sơ xe thành công"
      });
      
      navigate(`/${pathAdmin}/car-file-management`);
    } catch (error) {
      console.error("Lỗi khi cập nhật hồ sơ xe:", error);
      notification.error({
        message: "Lỗi",
        description: "Có lỗi xảy ra khi cập nhật hồ sơ xe"
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
        <CardHeaderAdmin
          title={
            isViewMode
              ? "Chi tiết hồ sơ xe người dùng"
              : "Chỉnh sửa hồ sơ xe người dùng"
          }
        />

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="px-[2.4rem] pb-[2.4rem] grid grid-cols-2 gap-[24px]"
        >
          {/* Thông tin khách hàng (chỉ hiển thị) */}
          {vehicleData && (
            <>
              <div>
                <LabelAdmin htmlFor="username" content="Tên khách hàng" />
                <InputAdmin
                  id="username"
                  name="username"
                  type="text"
                  value={vehicleData.user?.fullName || ""}
                  disabled={true}
                />
              </div>

              <div>
                <LabelAdmin htmlFor="email" content="Email" />
                <InputAdmin
                  id="email"
                  name="email"
                  type="email"
                  value={vehicleData.user?.email || ""}
                  disabled={true}
                />
              </div>
            </>
          )}

          {/* Loại xe */}
          <div>
            <LabelAdmin htmlFor="vehicleTypeId" content="Loại xe" />
            <SelectAdmin
              id="vehicleTypeId"
              name="vehicleTypeId"
              placeholder="Chọn loại xe"
              options={vehicleTypeOptions}
              disabled={isViewMode}
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
              disabled={isViewMode}
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
              disabled={isViewMode}
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
              disabled={isViewMode}
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
              disabled={isViewMode}
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
              disabled={isViewMode}
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
              disabled={isViewMode}
              {...register("notes")}
              error={errors.notes?.message}
            />
          </div>

          {/* Nút hành động */}
          <div className="col-span-2 flex items-center gap-[6px] justify-end mt-6">
            {!isViewMode && (
              <button
                type="submit"
                disabled={loading}
                className="px-[1.6rem] py-[0.8rem] bg-[#22c55e] text-white border border-[#22c55e] rounded-[6px] shadow-[0_1px_2px_0_rgba(34,197,94,0.35)] hover:bg-[#16a34a] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate(`/${pathAdmin}/car-file-management`)}
              className="px-[1.6rem] py-[0.8rem] bg-[#ef4d56] text-white border border-[#ef4d56] rounded-[6px] shadow-[0_1px_2px_0_rgba(239,77,86,0.35)] hover:bg-[#dc2626]"
            >
              Quay lại
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CarFileEdit;