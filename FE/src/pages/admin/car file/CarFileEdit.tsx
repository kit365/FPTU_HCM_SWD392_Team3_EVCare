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

interface CarFileForm {
  username: string;
  email: string;
  vehicleTypeName: string;
  plateNumber: string;
  lastMaintenanceDate: string;
}

const CarFileEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  // const isEditMode = location.pathname.includes("edit");
  const isViewMode = location.pathname.includes("view");

  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CarFileForm>();

  // Giả lập database - danh sách tất cả car files
  const mockDatabase: Record<string, CarFileForm> = {
    "VH001": {
      username: "Nguyen Van A",
      email: "nguyenvana@gmail.com",
      vehicleTypeName: "Toyota Vios",
      plateNumber: "51A-123.45",
      lastMaintenanceDate: "2025-09-20",
    },
    "VH002": {
      username: "Tran Thi B",
      email: "tranthib@example.com",
      vehicleTypeName: "Honda Civic",
      plateNumber: "60B-678.90",
      lastMaintenanceDate: "2025-10-05",
    },
  };

  useEffect(() => {
    // Lấy dữ liệu theo id từ URL
    if (id) {
      const carFileData = mockDatabase[id];

      if (carFileData) {
        setValue("username", carFileData.username);
        setValue("email", carFileData.email);
        setValue("vehicleTypeName", carFileData.vehicleTypeName);
        setValue("plateNumber", carFileData.plateNumber);
        setValue("lastMaintenanceDate", carFileData.lastMaintenanceDate);
        setSelectedDate(dayjs(carFileData.lastMaintenanceDate));
      } else {
        // Nếu không tìm thấy id, có thể redirect về trang list
        console.error(`Không tìm thấy hồ sơ xe với id: ${id}`);
        // navigate(`/${pathAdmin}/car-file-management`);
      }
    }
  }, [id, setValue, navigate]);

  const vehicleOptions = [
    { label: "Toyota Vios", value: "Toyota Vios" },
    { label: "Honda Civic", value: "Honda Civic" },
    { label: "Mazda 3", value: "Mazda 3" },
  ];

  const onSubmit = (data: CarFileForm) => {
    if (isViewMode) return;
    setLoading(true);
    console.log("Dữ liệu chỉnh sửa cho ID:", id, data);

    setTimeout(() => {
      setLoading(false);
      navigate(`/${pathAdmin}/car-file-management`);
      notification.success({
        message: "Create Car file",
        description: "Tạo hồ sơ xe thành công"
      })
    }, 1000);
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
          {/* Tên khách hàng */}
          <div>
            <LabelAdmin htmlFor="username" content="Tên khách hàng" />
            <InputAdmin
              id="username"
              type="text"
              placeholder="Nhập tên khách hàng"
              disabled={isViewMode}
              {...register("username", {
                required: "Vui lòng nhập tên khách hàng",
              })}
              error={errors.username?.message}
            />
          </div>

          {/* Email */}
          <div>
            <LabelAdmin htmlFor="email" content="Email" />
            <InputAdmin
              id="email"
              type="email"
              placeholder="Nhập email"
              disabled={isViewMode}
              {...register("email", { required: "Vui lòng nhập email" })}
              error={errors.email?.message}
            />
          </div>

          {/* Tên xe */}
          <div>
            <LabelAdmin htmlFor="vehicleTypeName" content="Tên xe" />
            <SelectAdmin
              id="vehicleTypeName"
              name="vehicleTypeName"
              placeholder="Chọn tên xe"
              options={vehicleOptions}
              disabled={isViewMode}
              register={register("vehicleTypeName", {
                required: "Vui lòng chọn tên xe",
              })}
              error={errors.vehicleTypeName?.message}
            />
          </div>

          {/* Biển số xe - Luôn disable */}
          <div>
            <LabelAdmin htmlFor="plateNumber" content="Biển số xe" />
            <InputAdmin
              id="plateNumber"
              type="text"
              placeholder="VD: 51A-123.45"
              disabled={true}
              {...register("plateNumber")}
            />
          </div>

          {/* Ngày bảo trì gần nhất - Dùng DatePicker */}
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

          {/* Nút hành động */}
          <div className="col-span-2 flex items-center gap-[6px] justify-end mt-6">
            {!isViewMode && (
              <ButtonAdmin
                text={loading ? "Đang lưu..." : "Lưu thay đổi"}
                type="submit"
                className="bg-[#22c55e] border-[#22c55e] shadow-[0_1px_2px_0_rgba(34,197,94,0.35)]"
                disabled={loading}
              />
            )}
            <ButtonAdmin
              text="Quay lại"
              href={`/${pathAdmin}/car-file-management`}
              className="bg-[#ef4d56] border-[#ef4d56] shadow-[0_1px_2px_0_rgba(239,77,86,0.35)]"
            />
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CarFileEdit;