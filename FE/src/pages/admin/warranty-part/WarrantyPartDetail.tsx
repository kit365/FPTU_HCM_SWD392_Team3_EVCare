import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Card } from "@mui/material";
import moment from "moment";
import { CardHeaderAdmin } from "../../../components/admin/ui/CardHeader";
import { LabelAdmin } from "../../../components/admin/ui/form/Label";
import { InputAdmin } from "../../../components/admin/ui/form/Input";
import { SelectAdmin } from "../../../components/admin/ui/form/Select";
import { useWarrantyPart } from "../../../hooks/useWarrantyPart";
import { pathAdmin } from "../../../constants/paths.constant";
import { WarrantyDiscountTypeEnum, ValidityPeriodUnitEnum } from "../../../types/warranty-part.types";

const discountTypeOptions = [
  { value: WarrantyDiscountTypeEnum.PERCENTAGE, label: 'Giảm giá %' },
  { value: WarrantyDiscountTypeEnum.FREE, label: 'Miễn phí' },
];

const validityPeriodUnitOptions = [
  { value: ValidityPeriodUnitEnum.DAY, label: 'Ngày' },
  { value: ValidityPeriodUnitEnum.MONTH, label: 'Tháng' },
  { value: ValidityPeriodUnitEnum.YEAR, label: 'Năm' },
];

const isActiveOptions = [
  { value: "true", label: 'Hoạt động' },
  { value: "false", label: 'Không hoạt động' },
];

export const WarrantyPartDetail = () => {
  const { id } = useParams();
  const { getById } = useWarrantyPart();
  const { register, reset } = useForm();

  const [detailData, setDetailData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        const response = await getById(id);
        if (response) {
          setDetailData(response);
          reset({
            vehiclePartName: response.vehiclePart?.vehiclePartName || "",
            discountType: response.discountType,
            discountValue: response.discountType === 'FREE' ? 'Miễn phí' : (response.discountValue ? `${response.discountValue}%` : '-'),
            validityPeriod: response.validityPeriod,
            validityPeriodUnit: response.validityPeriodUnit,
            isActive: response.isActive ?? true,
            createdAt: moment(response.createdAt).format("HH:mm - DD/MM/YYYY"),
            updatedAt: moment(response.updatedAt).format("HH:mm - DD/MM/YYYY"),
            createdBy: response.createdBy || "-",
            updatedBy: response.updatedBy || "-",
          });
        }
      }
    };
    fetchData();
  }, [id, getById, reset]);

  return (
    <div className="max-w-[1320px] px-[12px] mx-auto">
      <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
        <CardHeaderAdmin title="Chi tiết bảo hành phụ tùng" />
        <form className="px-[2.4rem] pb-[2.4rem] grid grid-cols-2 gap-x-[24px] gap-y-[24px]">
          <div>
            <LabelAdmin htmlFor="vehiclePartName" content="Phụ tùng" />
            <InputAdmin id="vehiclePartName" {...register("vehiclePartName")} disabled />
          </div>

          <div>
            <LabelAdmin htmlFor="discountType" content="Loại giảm giá" />
            <SelectAdmin
              id="discountType"
              name="discountType"
              options={discountTypeOptions}
              register={register("discountType")}
              disabled
            />
          </div>

          <div>
            <LabelAdmin htmlFor="discountValue" content="Giá trị giảm giá (%)" />
            <InputAdmin 
              id="discountValue" 
              type="text" 
              {...register("discountValue")} 
              disabled 
              placeholder="-"
            />
          </div>

          <div>
            <LabelAdmin htmlFor="validityPeriod" content="Thời gian hiệu lực" />
            <InputAdmin id="validityPeriod" type="number" {...register("validityPeriod")} disabled />
          </div>

          <div>
            <LabelAdmin htmlFor="validityPeriodUnit" content="Đơn vị thời gian" />
            <SelectAdmin
              id="validityPeriodUnit"
              name="validityPeriodUnit"
              options={validityPeriodUnitOptions}
              register={register("validityPeriodUnit")}
              disabled
            />
          </div>

          <div>
            <LabelAdmin htmlFor="isActive" content="Trạng thái" />
            <SelectAdmin
              id="isActive"
              name="isActive"
              options={isActiveOptions}
              register={register("isActive")}
              disabled
            />
          </div>

          <div>
            <LabelAdmin htmlFor="createdAt" content="Ngày tạo" />
            <InputAdmin id="createdAt" {...register("createdAt")} disabled />
          </div>

          <div>
            <LabelAdmin htmlFor="updatedAt" content="Ngày cập nhật" />
            <InputAdmin id="updatedAt" {...register("updatedAt")} disabled />
          </div>

          <div>
            <LabelAdmin htmlFor="createdBy" content="Người tạo" />
            <InputAdmin id="createdBy" {...register("createdBy")} disabled />
          </div>

          <div>
            <LabelAdmin htmlFor="updatedBy" content="Người cập nhật" />
            <InputAdmin id="updatedBy" {...register("updatedBy")} disabled />
          </div>

          {/* Buttons */}
          <div className="col-span-2 flex items-center gap-[6px] justify-end">
            <Link to={`/${pathAdmin}/warranty-part`} className="flex items-center cursor-pointer text-white text-[1.3rem] font-[500] py-[0.82rem] px-[1.52rem] leading-[1.5] border rounded-[0.64rem] hover:opacity-90 transition-opacity duration-150 ease-in-out bg-[#7c3aed] border-[#7c3aed] shadow-[0_1px_2px_0_rgba(124,58,237,0.35)]">
              Quay lại
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
};
