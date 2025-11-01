import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Card } from "@mui/material";
import { CardHeaderAdmin } from "../../../components/admin/ui/CardHeader";
import { LabelAdmin } from "../../../components/admin/ui/form/Label";
import { InputAdmin } from "../../../components/admin/ui/form/Input";
import { useWarranty } from "../../../hooks/useWarranty";
import { pathAdmin } from "../../../constants/paths.constant";
import { Link, useNavigate } from "react-router-dom";
import * as yup from "yup";

const warrantyPackageSchema = yup.object().shape({
    warrantyPackageName: yup
        .string()
        .trim()
        .required("Vui lòng nhập tên gói bảo hành")
        .min(3, "Tên gói bảo hành phải có ít nhất 3 ký tự"),
    description: yup.string().trim().default(""),
    warrantyPeriodMonths: yup
        .number()
        .typeError("Thời gian bảo hành phải là số")
        .required("Vui lòng nhập thời gian bảo hành")
        .min(1, "Thời gian bảo hành phải ít nhất 1 tháng")
        .max(120, "Thời gian bảo hành không được vượt quá 120 tháng"),
    startDate: yup
        .string()
        .required("Vui lòng chọn ngày bắt đầu"),
    endDate: yup
        .string()
        .required("Vui lòng chọn ngày kết thúc")
        .test("date-after-start", "Ngày kết thúc phải sau ngày bắt đầu", function(value) {
            const { startDate } = this.parent;
            if (!startDate || !value) return true;
            return new Date(value) > new Date(startDate);
        }),
});

interface WarrantyPackageFormData {
    warrantyPackageName: string;
    description: string;
    warrantyPeriodMonths: number;
    startDate: string;
    endDate: string;
}

export const WarrantyPackageCreate = () => {
    const navigate = useNavigate();
    const { loading, createWarrantyPackage } = useWarranty();

    const { register, handleSubmit, formState: { errors } } = useForm<WarrantyPackageFormData>({
        resolver: yupResolver(warrantyPackageSchema),
        defaultValues: {
            warrantyPackageName: "",
            description: "",
            warrantyPeriodMonths: 12,
            startDate: "",
            endDate: "",
        },
    });

    const onSubmit = async (data: WarrantyPackageFormData) => {
        try {
            if (await createWarrantyPackage(data)) {
                navigate(`/${pathAdmin}/warranty`);
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="max-w-[1320px] px-[12px] mx-auto">
            <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
                <CardHeaderAdmin title="Tạo gói bảo hành mới" />
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="px-[2.4rem] pb-[2.4rem] grid grid-cols-2 gap-x-[24px] gap-y-[24px]"
                >
                    <div className="col-span-2">
                        <LabelAdmin htmlFor="warrantyPackageName" content="Tên gói bảo hành *" />
                        <InputAdmin
                            id="warrantyPackageName"
                            placeholder="Nhập tên gói bảo hành..."
                            {...register("warrantyPackageName")}
                            error={errors.warrantyPackageName?.message}
                        />
                    </div>

                    <div className="col-span-2">
                        <LabelAdmin htmlFor="description" content="Mô tả" />
                        <InputAdmin
                            id="description"
                            placeholder="Nhập mô tả..."
                            {...register("description")}
                            error={errors.description?.message}
                        />
                    </div>

                    <div>
                        <LabelAdmin htmlFor="warrantyPeriodMonths" content="Thời gian bảo hành (tháng) *" />
                        <InputAdmin
                            id="warrantyPeriodMonths"
                            type="number"
                            placeholder="Nhập số tháng bảo hành..."
                            {...register("warrantyPeriodMonths", { valueAsNumber: true })}
                            error={errors.warrantyPeriodMonths?.message}
                        />
                    </div>

                    <div>
                        {/* Empty div for layout */}
                    </div>

                    <div>
                        <LabelAdmin htmlFor="startDate" content="Ngày bắt đầu *" />
                        <input
                            id="startDate"
                            type="datetime-local"
                            step="1"
                            min={new Date().toISOString().slice(0, 16)}
                            {...register("startDate")}
                            className="w-full py-[0.83rem] px-[1.52rem] block text-[1.3rem] font-[400] leading-1.5 appearance-none outline-none border border-[#e2e7f1] rounded-[0.64rem] focus:border-[#24c660] focus:outline-none transition-[border] duration-150"
                        />
                        {errors.startDate && (
                            <p className="mt-[6px] text-[1.2rem] text-red-500">{errors.startDate.message}</p>
                        )}
                    </div>

                    <div>
                        <LabelAdmin htmlFor="endDate" content="Ngày kết thúc *" />
                        <input
                            id="endDate"
                            type="datetime-local"
                            step="1"
                            {...register("endDate")}
                            className="w-full py-[0.83rem] px-[1.52rem] block text-[1.3rem] font-[400] leading-1.5 appearance-none outline-none border border-[#e2e7f1] rounded-[0.64rem] focus:border-[#24c660] focus:outline-none transition-[border] duration-150"
                        />
                        {errors.endDate && (
                            <p className="mt-[6px] text-[1.2rem] text-red-500">{errors.endDate.message}</p>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="col-span-2 flex items-center gap-[6px] justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center cursor-pointer text-white text-[1.3rem] font-[500] py-[0.82rem] px-[1.52rem] leading-[1.5] border rounded-[0.64rem] hover:opacity-90 transition-opacity duration-150 ease-in-out bg-[#22c55e] border-[#22c55e] shadow-[0_1px_2px_0_rgba(34,197,94,0.35)] disabled:opacity-50"
                        >
                            {loading ? "Đang tạo..." : "Tạo gói bảo hành"}
                        </button>
                        <Link
                            to={`/${pathAdmin}/warranty`}
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

