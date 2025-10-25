import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Card } from "@mui/material";
import { CardHeaderAdmin } from "../../../components/admin/ui/CardHeader";
import { LabelAdmin } from "../../../components/admin/ui/form/Label";
import { InputAdmin } from "../../../components/admin/ui/form/Input";
import { Link } from "react-router-dom";
import { pathAdmin } from "../../../constants/paths.constant";
import { useVehiclePartCategory } from "../../../hooks/useVehiclePartCategory";

export const VehiclePartCategoryEdit = () => {
  const { id } = useParams();
  const { loading, getById, update } = useVehiclePartCategory();

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        const response = await getById(id);
        if (response) {
          reset({
            ...response,
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
        <CardHeaderAdmin title="Chỉnh sửa danh mục phụ tùng" />
        <form onSubmit={handleSubmit(onSubmit)} className="px-[2.4rem] pb-[2.4rem] grid grid-cols-2 gap-x-[24px] gap-y-[24px]">
          <div>
            <LabelAdmin htmlFor="partCategoryName" content="Tên danh mục" />
            <InputAdmin 
              id="partCategoryName" 
              placeholder="Nhập tên danh mục phụ tùng..." 
              {...register("partCategoryName")} 
              error={errors.partCategoryName?.message as string} 
            />
          </div>

          <div>
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
              {loading ? "Đang cập nhật..." : "Cập nhật"}
            </button>
            <Link 
              to={`/${pathAdmin}/vehicle-part-category`} 
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
