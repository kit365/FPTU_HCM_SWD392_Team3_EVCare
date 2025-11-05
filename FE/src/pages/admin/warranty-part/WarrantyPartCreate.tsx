import { useForm } from "react-hook-form";
import { Card } from "@mui/material";
import { CardHeaderAdmin } from "../../../components/admin/ui/CardHeader";
import { LabelAdmin } from "../../../components/admin/ui/form/Label";
import { InputAdmin } from "../../../components/admin/ui/form/Input";
import { SelectAdmin } from "../../../components/admin/ui/form/Select";
import { Link } from "react-router-dom";
import { pathAdmin } from "../../../constants/paths.constant";
import { useWarrantyPart } from "../../../hooks/useWarrantyPart";
import { useVehiclePart } from "../../../hooks/useVehiclePart";
import { useEffect, useState, useMemo } from "react";
import { WarrantyDiscountTypeEnum, ValidityPeriodUnitEnum } from "../../../types/warranty-part.types";

type FormData = {
  vehiclePartId: string;
  discountType: WarrantyDiscountTypeEnum;
  discountValue?: number | null;
  validityPeriod: number;
  validityPeriodUnit: ValidityPeriodUnitEnum;
};

const discountTypeOptions = [
  { value: WarrantyDiscountTypeEnum.PERCENTAGE, label: 'Giảm giá %' },
  { value: WarrantyDiscountTypeEnum.FREE, label: 'Miễn phí' },
];

const validityPeriodUnitOptions = [
  { value: ValidityPeriodUnitEnum.DAY, label: 'Ngày' },
  { value: ValidityPeriodUnitEnum.MONTH, label: 'Tháng' },
  { value: ValidityPeriodUnitEnum.YEAR, label: 'Năm' },
];

export const WarrantyPartCreate = () => {
  const { loading, create, search: searchWarrantyParts } = useWarrantyPart();
  const { getAll: getAllVehicleParts } = useVehiclePart();
  const [vehicleParts, setVehicleParts] = useState<any[]>([]);
  const [warrantyParts, setWarrantyParts] = useState<any[]>([]);
  const [loadingVehicleParts, setLoadingVehicleParts] = useState(false);
  const [discountType, setDiscountType] = useState<WarrantyDiscountTypeEnum>(WarrantyDiscountTypeEnum.PERCENTAGE);
  
  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<FormData>({
    defaultValues: {
      vehiclePartId: "",
      discountType: WarrantyDiscountTypeEnum.PERCENTAGE,
      discountValue: null,
      validityPeriod: 1,
      validityPeriodUnit: ValidityPeriodUnitEnum.MONTH,
    }
  });

  const watchedDiscountType = watch("discountType");

  // Load vehicle parts and warranty parts
  useEffect(() => {
    const loadData = async () => {
      setLoadingVehicleParts(true);
      try {
        // Load all vehicle parts
        const allVehicleParts = await getAllVehicleParts();
        setVehicleParts(Array.isArray(allVehicleParts) ? allVehicleParts : []);

        // Load all warranty parts to filter out vehicle parts that already have warranty
        const warrantyResponse = await searchWarrantyParts({ page: 0, pageSize: 1000 });
        if (warrantyResponse?.data?.success) {
          const warrantyData = warrantyResponse.data.data;
          setWarrantyParts(Array.isArray(warrantyData.data) ? warrantyData.data : []);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoadingVehicleParts(false);
      }
    };
    loadData();
  }, [getAllVehicleParts, searchWarrantyParts]);

  // Filter vehicle parts that don't have warranty yet
  const availableVehiclePartOptions = useMemo(() => {
    const warrantyVehiclePartIds = new Set(
      warrantyParts
        .filter((wp: any) => !wp.isDeleted)
        .map((wp: any) => wp.vehiclePart?.vehiclePartId)
    );
    
    return vehicleParts
      .filter((vp: any) => !vp.isDeleted && !warrantyVehiclePartIds.has(vp.vehiclePartId))
      .map((vp: any) => ({
        value: vp.vehiclePartId,
        label: vp.vehiclePartName,
      }));
  }, [vehicleParts, warrantyParts]);

  // Update discountType when watched value changes
  useEffect(() => {
    setDiscountType(watchedDiscountType);
    if (watchedDiscountType === WarrantyDiscountTypeEnum.FREE) {
      setValue("discountValue", null);
    }
  }, [watchedDiscountType, setValue]);

  const onSubmit = async (data: FormData) => {
    // Ensure discountValue is null if discountType is FREE
    const payload = {
      ...data,
      discountValue: data.discountType === WarrantyDiscountTypeEnum.FREE ? null : data.discountValue,
    };
    
    const ok = await create(payload);
    if (ok) {
      reset();
      // Reload warranty parts to update available vehicle parts list
      const warrantyResponse = await searchWarrantyParts({ page: 0, pageSize: 1000 });
      if (warrantyResponse?.data?.success) {
        const warrantyData = warrantyResponse.data.data;
        setWarrantyParts(Array.isArray(warrantyData.data) ? warrantyData.data : []);
      }
    }
  };

  return (
    <div className="max-w-[1320px] px-[12px] mx-auto">
      <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
        <CardHeaderAdmin title="Thêm mới bảo hành phụ tùng" />

        <form onSubmit={handleSubmit(onSubmit)} className="px-[2.4rem] pb-[2.4rem] grid grid-cols-2 gap-x-[24px] gap-y-[24px]">
          <div>
            <LabelAdmin htmlFor="vehiclePartId" content="Phụ tùng" />
            <SelectAdmin 
              id="vehiclePartId" 
              name="vehiclePartId" 
              placeholder="-- Chọn phụ tùng --"
              options={availableVehiclePartOptions} 
              register={register("vehiclePartId", { required: "Phụ tùng không được để trống" })} 
              error={errors.vehiclePartId?.message as string}
              disabled={loadingVehicleParts}
            />
            {availableVehiclePartOptions.length === 0 && !loadingVehicleParts && (
              <p className="text-red-500 text-[1.2rem] mt-1">Tất cả phụ tùng đã có bảo hành. Vui lòng xóa hoặc chỉnh sửa bảo hành hiện có để tạo mới.</p>
            )}
          </div>

          <div>
            <LabelAdmin htmlFor="discountType" content="Loại giảm giá" />
            <SelectAdmin 
              id="discountType" 
              name="discountType" 
              placeholder="-- Chọn loại giảm giá --"
              options={discountTypeOptions} 
              register={register("discountType", { required: "Loại giảm giá không được để trống" })} 
              error={errors.discountType?.message as string}
            />
          </div>

          {discountType === WarrantyDiscountTypeEnum.PERCENTAGE && (
            <div>
              <LabelAdmin htmlFor="discountValue" content="Giá trị giảm giá (%)" />
              <InputAdmin 
                id="discountValue" 
                type="number" 
                placeholder="Nhập giá trị giảm giá (0-100)..." 
                {...register("discountValue", {
                  required: discountType === WarrantyDiscountTypeEnum.PERCENTAGE ? "Giá trị giảm giá không được để trống" : false,
                  min: { value: 0, message: "Giá trị giảm giá phải lớn hơn hoặc bằng 0" },
                  max: { value: 100, message: "Giá trị giảm giá phải nhỏ hơn hoặc bằng 100" },
                })} 
                error={errors.discountValue?.message as string} 
              />
            </div>
          )}

          <div>
            <LabelAdmin htmlFor="validityPeriod" content="Thời gian hiệu lực" />
            <InputAdmin 
              id="validityPeriod" 
              type="number" 
              placeholder="Nhập thời gian hiệu lực..." 
              {...register("validityPeriod", {
                required: "Thời gian hiệu lực không được để trống",
                min: { value: 1, message: "Thời gian hiệu lực phải lớn hơn 0" },
              })} 
              error={errors.validityPeriod?.message as string} 
            />
          </div>

          <div>
            <LabelAdmin htmlFor="validityPeriodUnit" content="Đơn vị thời gian" />
            <SelectAdmin 
              id="validityPeriodUnit" 
              name="validityPeriodUnit" 
              placeholder="-- Chọn đơn vị thời gian --"
              options={validityPeriodUnitOptions} 
              register={register("validityPeriodUnit", { required: "Đơn vị thời gian không được để trống" })} 
              error={errors.validityPeriodUnit?.message as string}
            />
          </div>

          {/* Buttons */}
          <div className="col-span-2 flex items-center gap-[6px] justify-end">
            <button 
              type="submit" 
              disabled={loading || loadingVehicleParts || availableVehiclePartOptions.length === 0} 
              className="flex items-center cursor-pointer text-white text-[1.3rem] font-[500] py-[0.82rem] px-[1.52rem] leading-[1.5] border rounded-[0.64rem] hover:opacity-90 transition-opacity duration-150 ease-in-out bg-[#22c55e] border-[#22c55e] shadow-[0_1px_2px_0_rgba(34,197,94,0.35)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang tạo..." : "Tạo mới"}
            </button>
            <Link to={`/${pathAdmin}/warranty-part`} className="flex items-center cursor-pointer text-white text-[1.3rem] font-[500] py-[0.82rem] px-[1.52rem] leading-[1.5] border rounded-[0.64rem] hover:opacity-90 transition-opacity duration-150 ease-in-out bg-[#ef4d56] border-[#ef4d56] shadow-[0_1px_2px_0_rgba(239,77,86,0.35)]">
              Hủy
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
};
