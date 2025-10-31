import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Card } from "@mui/material";
import { CardHeaderAdmin } from "../../../components/admin/ui/CardHeader";
import { LabelAdmin } from "../../../components/admin/ui/form/Label";
import { InputAdmin } from "../../../components/admin/ui/form/Input";
import { SelectAdmin } from "../../../components/admin/ui/form/Select";
import { Link } from "react-router-dom";
import { pathAdmin } from "../../../constants/paths.constant";
import { useVehiclePart } from "../../../hooks/useVehiclePart";
import { useVehicleType } from "../../../hooks/useVehicleType";
import { useVehiclePartCategory } from "../../../hooks/useVehiclePartCategory";
import { VEHICLE_PART_STATUS_OPTIONS } from "../../../constants/service-type-vehicle-part.constant";

export const VehiclePartEdit = () => {
  const { id } = useParams();
  const { loading, getById, update } = useVehiclePart();
  const { vehicleTypeOptions, fetchVehicleTypeNames } = useVehicleType();
  const { list: categoryOptions, getAll: fetchCategories } = useVehiclePartCategory();
  const [response, setResponse] = useState<any>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    fetchVehicleTypeNames();
    fetchCategories();
  }, [fetchVehicleTypeNames, fetchCategories]);

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        const response = await getById(id);
        if (response) {
          setResponse(response);
          reset({
            ...response,
            vehicleTypeId: response.vehicleType?.vehicleTypeId || "",
            vehiclePartCategoryId: response.vehiclePartCategory?.vehiclePartCategoryId || "",
          });
        }
      }
    };
    fetchData();
  }, [id, getById, reset]);

  const onSubmit = async (data: any) => {
    if (!id) return;

    const ok = await update(id, data);
    if (ok) {
      const updatedData = await getById(id);
      if (updatedData) {
        reset({
          ...updatedData,
        });
      }
    }
  };

  return (
    <div className="max-w-[1320px] px-[12px] mx-auto">
      <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
        <CardHeaderAdmin title="Chỉnh sửa phụ tùng" />
        <form onSubmit={handleSubmit(onSubmit)} className="px-[2.4rem] pb-[2.4rem] grid grid-cols-2 gap-x-[24px] gap-y-[24px]">
          <div>
            <LabelAdmin htmlFor="vehiclePartName" content="Tên phụ tùng" />
            <InputAdmin id="vehiclePartName" placeholder="Nhập tên phụ tùng..." {...register("vehiclePartName")} error={errors.vehiclePartName?.message as string} />
          </div>

          <div>
            <LabelAdmin htmlFor="currentQuantity" content="Số lượng" />
            <InputAdmin id="currentQuantity" type="number" placeholder="Nhập số lượng..." {...register("currentQuantity")} error={errors.currentQuantity?.message as string} />
          </div>

          <div>
            <LabelAdmin htmlFor="minStock" content="Tồn tối thiểu" />
            <InputAdmin id="minStock" type="number" placeholder="Nhập tồn tối thiểu..." {...register("minStock")} error={errors.minStock?.message as string} />
          </div>

          <div>
            <LabelAdmin htmlFor="unitPrice" content="Giá" />
            <InputAdmin id="unitPrice" type="number" placeholder="Nhập giá..." {...register("unitPrice")} error={errors.unitPrice?.message as string} />
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

          <div>
            <LabelAdmin htmlFor="vehiclePartCategoryId" content="Danh mục phụ tùng" />
            <SelectAdmin 
              id="vehiclePartCategoryId" 
              name="vehiclePartCategoryId" 
              placeholder="-- Chọn danh mục phụ tùng --"
              options={Array.isArray(categoryOptions) ? categoryOptions.map(category => ({ value: category.vehiclePartCategoryId, label: category.partCategoryName })) : []} 
              register={register("vehiclePartCategoryId")} 
              error={errors.vehiclePartCategoryId?.message as string}
            />
          </div>

          <div>
            <LabelAdmin htmlFor="status" content="Trạng thái" />
            <SelectAdmin id="status" name="status" options={VEHICLE_PART_STATUS_OPTIONS} register={register("status")} />
          </div>

          <div>
            <LabelAdmin htmlFor="averageLifespan" content="Tuổi thọ TB (năm)" />
            <InputAdmin id="averageLifespan" type="number" placeholder="Nhập tuổi thọ..." {...register("averageLifespan")} error={errors.averageLifespan?.message as string} />
          </div>

          <div className="col-span-2">
            <LabelAdmin htmlFor="note" content="Ghi chú" />
            <InputAdmin id="note" placeholder="Ghi chú..." {...register("note")} />
          </div>

          {/* Buttons */}
          <div className="col-span-2 flex items-center gap-[6px] justify-end">
            <button type="submit" disabled={loading} className="flex items-center cursor-pointer text-white text-[1.3rem] font-[500] py-[0.82rem] px-[1.52rem] leading-[1.5] border rounded-[0.64rem] hover:opacity-90 transition-opacity duration-150 ease-in-out bg-[#22c55e] border-[#22c55e] shadow-[0_1px_2px_0_rgba(34,197,94,0.35)]">
              {loading ? "Đang cập nhật..." : "Cập nhật"}
            </button>
            <Link to={`/${pathAdmin}/vehicle-part`} className="flex items-center cursor-pointer text-white text-[1.3rem] font-[500] py-[0.82rem] px-[1.52rem] leading-[1.5] border rounded-[0.64rem] hover:opacity-90 transition-opacity duration-150 ease-in-out bg-[#ef4d56] border-[#ef4d56] shadow-[0_1px_2px_0_rgba(239,77,86,0.35)]">Hủy</Link>
          </div>
        </form>
      </Card>
    </div>
  );
};
