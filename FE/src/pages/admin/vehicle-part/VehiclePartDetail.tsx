import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Card } from "@mui/material";
import moment from "moment";
import { CardHeaderAdmin } from "../../../components/admin/ui/CardHeader";
import { LabelAdmin } from "../../../components/admin/ui/form/Label";
import { InputAdmin } from "../../../components/admin/ui/form/Input";
import { SelectAdmin } from "../../../components/admin/ui/form/Select";
import { useVehiclePart } from "../../../hooks/useVehiclePart";
import { useVehicleType } from "../../../hooks/useVehicleType";
import { useVehiclePartCategory } from "../../../hooks/useVehiclePartCategory";
import { VEHICLE_PART_STATUS_OPTIONS } from "../../../constants/service-type-vehicle-part.constant";
import { pathAdmin } from "../../../constants/paths.constant";

export const VehiclePartDetail = () => {
  const { id } = useParams();
  const { getById } = useVehiclePart();
  const { vehicleTypeOptions, fetchVehicleTypeNames } = useVehicleType();
  const { list: categoryOptions, getAll: fetchCategories } = useVehiclePartCategory();
  const [response, setResponse] = useState<any>(null);
  const { register, reset } = useForm();

  useEffect(() => {
    fetchVehicleTypeNames();
    fetchCategories();
  }, [fetchVehicleTypeNames, fetchCategories]);

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        console.log('Fetching vehicle part detail with id:', id);
        const response = await getById(id);
        console.log('Vehicle part detail response:', response);
        if (response) {
          setResponse(response);
          reset({
            ...response,
            vehicleTypeId: response.vehicleType?.vehicleTypeId || "",
            vehiclePartCategoryId: response.vehiclePartCategory?.vehiclePartCategoryId || "",
            createdAt: moment(response.createdAt).format("HH:mm - DD/MM/YYYY"),
            updatedAt: moment(response.updatedAt).format("HH:mm - DD/MM/YYYY"),
          });
        }
      }
    };
    fetchData();
  }, [id, getById, reset]);

  return (
    <div className="max-w-[1320px] px-[12px] mx-auto">
      <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
        <CardHeaderAdmin title="Chi tiết phụ tùng" />
        <form className="px-[2.4rem] pb-[2.4rem] grid grid-cols-2 gap-x-[24px] gap-y-[24px]">
          <div>
            <LabelAdmin htmlFor="vehiclePartName" content="Tên phụ tùng" />
            <InputAdmin id="vehiclePartName" {...register("vehiclePartName")} disabled />
          </div>

          <div>
            <LabelAdmin htmlFor="currentQuantity" content="Số lượng" />
            <InputAdmin id="currentQuantity" type="number" {...register("currentQuantity")} disabled />
          </div>

          <div>
            <LabelAdmin htmlFor="minStock" content="Tồn tối thiểu" />
            <InputAdmin id="minStock" type="number" {...register("minStock")} disabled />
          </div>

          <div>
            <LabelAdmin htmlFor="unitPrice" content="Giá" />
            <InputAdmin id="unitPrice" type="number" {...register("unitPrice")} disabled />
          </div>

          <div>
            <LabelAdmin htmlFor="vehicleTypeId" content="Loại xe" />
            <SelectAdmin 
              id="vehicleTypeId" 
              name="vehicleTypeId" 
              options={vehicleTypeOptions} 
              register={register("vehicleTypeId")} 
              disabled 
            />
          </div>

          <div>
            <LabelAdmin htmlFor="vehiclePartCategoryId" content="Danh mục phụ tùng" />
            <SelectAdmin 
              id="vehiclePartCategoryId" 
              name="vehiclePartCategoryId" 
              options={Array.isArray(categoryOptions) ? categoryOptions.map(category => ({ value: category.vehiclePartCategoryId, label: category.partCategoryName })) : []} 
              register={register("vehiclePartCategoryId")} 
              disabled 
            />
          </div>

          <div>
            <LabelAdmin htmlFor="status" content="Trạng thái" />
            <SelectAdmin id="status" name="status" options={VEHICLE_PART_STATUS_OPTIONS} register={register("status")} disabled />
          </div>

          <div>
            <LabelAdmin htmlFor="averageLifespan" content="Tuổi thọ TB (năm)" />
            <InputAdmin id="averageLifespan" type="number" {...register("averageLifespan")} disabled />
          </div>

          <div>
            <LabelAdmin htmlFor="createdAt" content="Ngày tạo" />
            <InputAdmin id="createdAt" {...register("createdAt")} disabled />
          </div>

          <div>
            <LabelAdmin htmlFor="updatedAt" content="Ngày cập nhật" />
            <InputAdmin id="updatedAt" {...register("updatedAt")} disabled />
          </div>

          <div className="col-span-2">
            <LabelAdmin htmlFor="note" content="Ghi chú" />
            <InputAdmin id="note" {...register("note")} disabled />
          </div>

          {/* Buttons */}
          <div className="col-span-2 flex items-center gap-[6px] justify-end">
            <Link to={`/${pathAdmin}/vehicle-part`} className="flex items-center cursor-pointer text-white text-[1.3rem] font-[500] py-[0.82rem] px-[1.52rem] leading-[1.5] border rounded-[0.64rem] hover:opacity-90 transition-opacity duration-150 ease-in-out bg-[#7c3aed] border-[#7c3aed] shadow-[0_1px_2px_0_rgba(124,58,237,0.35)]">
              Quay lại
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
};
