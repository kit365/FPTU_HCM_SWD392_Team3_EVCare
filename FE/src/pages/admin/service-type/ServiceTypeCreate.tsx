import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Card } from "@mui/material";
import { CardHeaderAdmin } from "../../../components/admin/ui/CardHeader";
import { LabelAdmin } from "../../../components/admin/ui/form/Label";
import { InputAdmin } from "../../../components/admin/ui/form/Input";
import { SelectAdmin } from "../../../components/admin/ui/form/Select";
import { Link } from "react-router-dom";
import { pathAdmin } from "../../../constants/paths.constant";
import { useServiceType } from "../../../hooks/useServiceType";
import { useVehicleType } from "../../../hooks/useVehicleType";

const schema = yup.object({
  serviceName: yup.string().required("Tên dịch vụ không được để trống").max(100, "Tên dịch vụ không được vượt quá 100 kí tự"),
  description: yup.string().optional(),
  vehicleTypeId: yup.string().required("Loại xe không được để trống"),
});

export const ServiceTypeCreate = () => {
  const { loading, create } = useServiceType();
  const { vehicleTypeOptions, fetchVehicleTypeNames } = useVehicleType();

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema)
  });

  useEffect(() => {
    fetchVehicleTypeNames();
  }, [fetchVehicleTypeNames]);

  const onSubmit = async (data: any) => {
    const success = await create(data);
    if (success) {
      reset();
    }
  };

  return (
    <div className="max-w-[1320px] px-[12px] mx-auto">
      <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
        <CardHeaderAdmin title="Thêm loại dịch vụ" />
        <form onSubmit={handleSubmit(onSubmit)} className="px-[2.4rem] pb-[2.4rem] grid grid-cols-2 gap-x-[24px] gap-y-[24px]">
          <div>
            <LabelAdmin htmlFor="serviceName" content="Tên dịch vụ" />
            <InputAdmin 
              id="serviceName" 
              placeholder="Nhập tên dịch vụ..." 
              {...register("serviceName")} 
              error={errors.serviceName?.message as string} 
            />
          </div>

          <div>
            <LabelAdmin htmlFor="vehicleTypeId" content="Loại xe" />
            <SelectAdmin 
              id="vehicleTypeId" 
              name="vehicleTypeId" 
              placeholder="-- Chọn loại xe --"
              options={vehicleTypeOptions} 
              register={register("vehicleTypeId")} 
              error={errors.vehicleTypeId?.message as string}
            />
          </div>

          <div className="col-span-2">
            <LabelAdmin htmlFor="description" content="Mô tả" />
            <InputAdmin 
              id="description" 
              placeholder="Nhập mô tả..." 
              {...register("description")} 
              error={errors.description?.message as string} 
            />
          </div>

          {/* Buttons */}
          <div className="col-span-2 flex items-center gap-[6px] justify-end">
            <button 
              type="submit" 
              disabled={loading} 
              className="flex items-center cursor-pointer text-white text-[1.3rem] font-[500] py-[0.82rem] px-[1.52rem] leading-[1.5] border rounded-[0.64rem] hover:opacity-90 transition-opacity duration-150 ease-in-out bg-[#22c55e] border-[#22c55e] shadow-[0_1px_2px_0_rgba(34,197,94,0.35)]"
            >
              {loading ? "Đang tạo..." : "Tạo"}
            </button>
            <Link 
              to={`/${pathAdmin}/service-type`} 
              className="flex items-center cursor-pointer text-white text-[1.3rem] font-[500] py-[0.82rem] px-[1.52rem] leading-[1.5] border rounded-[0.64rem] hover:opacity-90 transition-opacity duration-150 ease-in-out bg-[#ef4d56] border-[#ef4d56] shadow-[0_1px_2px_0_rgba(239,77,86,0.35)]"
            >
              Hủy
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
};
