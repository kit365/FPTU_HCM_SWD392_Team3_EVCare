import React from "react";
import { Card } from "@mui/material";
import { CardHeaderAdmin } from "../../../components/admin/ui/CardHeader";
import { LabelAdmin } from "../../../components/admin/ui/form/Label";
import { SelectAdmin } from "../../../components/admin/ui/form/Select";
import { ButtonAdmin } from "../../../components/admin/ui/Button";
import { pathAdmin } from "../../../constants/paths.constant";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { InputAdmin } from "../../../components/admin/ui/form/Input";
import { DatePicker, notification } from "antd"; 
import dayjs from "dayjs"; 

interface CarFileForm {
  username: string;
  email: string;
  vehicleTypeName: string;
  plateNumber: string;
  lastMaintenanceDate: string;
}

const CarFileCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CarFileForm>();

  const vehicleOptions = [
    { label: "Toyota Vios", value: "Toyota Vios" },
    { label: "Honda Civic", value: "Honda Civic" },
    { label: "Mazda 3", value: "Mazda 3" },
  ];

  const onSubmit = (data: CarFileForm) => {
    setLoading(true);
    console.log("Hồ sơ xe mới:", data);
    
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
        <CardHeaderAdmin title="Thêm mới hồ sơ xe người dùng" />
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
              register={register("vehicleTypeName", {
                required: "Vui lòng chọn tên xe",
              })}
              error={errors.vehicleTypeName?.message}
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

          {/* ✅ Ngày bảo trì gần nhất (dùng Antd DatePicker) */}
          <div>
            <LabelAdmin
              htmlFor="lastMaintenanceDate"
              content="Ngày bảo trì gần nhất"
            />
            <DatePicker
              format="YYYY-MM-DD"
              className="w-full h-[42px]" // để khớp chiều cao input cũ
              placeholder="Chọn ngày bảo trì"
              onChange={(date) =>
                setValue(
                  "lastMaintenanceDate",
                  date ? dayjs(date).format("YYYY-MM-DD") : ""
                )
              }
            />
            {errors.lastMaintenanceDate && (
              <p className="mt-[6px] text-[1.2rem] text-red-500">
                {errors.lastMaintenanceDate.message}
              </p>
            )}
          </div>

          {/* Nút hành động */}
          <div className="col-span-2 flex items-center gap-[6px] justify-end mt-6">
            <ButtonAdmin
              text={loading ? "Đang tạo..." : "Tạo mới"}
              type="submit"
              className="bg-[#22c55e] border-[#22c55e] shadow-[0_1px_2px_0_rgba(34,197,94,0.35)]"
              disabled={loading}
            />
            <ButtonAdmin
              text="Hủy"
              href={`/${pathAdmin}/car-file-management`}
              className="bg-[#ef4d56] border-[#ef4d56] shadow-[0_1px_2px_0_rgba(239,77,86,0.35)]"
            />
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CarFileCreate;
