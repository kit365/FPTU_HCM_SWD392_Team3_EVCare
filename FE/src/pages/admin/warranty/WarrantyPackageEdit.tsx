import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Card } from "@mui/material";
import { CardHeaderAdmin } from "../../../components/admin/ui/CardHeader";
import { LabelAdmin } from "../../../components/admin/ui/form/Label";
import { InputAdmin } from "../../../components/admin/ui/form/Input";
import { useWarranty } from "../../../hooks/useWarranty";
import { pathAdmin } from "../../../constants/paths.constant";
import { Link } from "react-router-dom";
import * as yup from "yup";

const warrantyPackageSchema = yup.object().shape({
    warrantyPackageName: yup
        .string()
        .trim()
        .required("Vui lòng nhập tên gói bảo hành")
        .min(3, "Tên gói bảo hành phải có ít nhất 3 ký tự"),
    description: yup.string().trim(),
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

interface FormData {
    warrantyPackageName: string;
    description: string;
    warrantyPeriodMonths: number;
    startDate: string;
    endDate: string;
    isActive?: boolean;
}

export const WarrantyPackageEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { loading, getWarrantyPackage, updateWarrantyPackage } = useWarranty();

    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
        resolver: yupResolver(warrantyPackageSchema),
    });

    useEffect(() => {
        const fetchWarrantyPackage = async () => {
            if (id) {
                const response = await getWarrantyPackage(id);
                if (response) {
                    // Format dates for datetime-local input
                    const formatDateTimeLocal = (dateString: string) => {
                        if (!dateString) return "";
                        const date = new Date(dateString);
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, "0");
                        const day = String(date.getDate()).padStart(2, "0");
                        const hours = String(date.getHours()).padStart(2, "0");
                        const minutes = String(date.getMinutes()).padStart(2, "0");
                        return `${year}-${month}-${day}T${hours}:${minutes}`;
                    };

                    reset({
                        warrantyPackageName: response.warrantyPackageName,
                        description: response.description || "",
                        warrantyPeriodMonths: response.warrantyPeriodMonths,
                        startDate: formatDateTimeLocal(response.startDate),
                        endDate: formatDateTimeLocal(response.endDate),
                        isActive: response.isActive !== undefined ? response.isActive : true,
                    });
                }
            }
        };
        fetchWarrantyPackage();
    }, [id, getWarrantyPackage, reset]);

    const onSubmit = async (data: FormData) => {
        if (!id) return;

        try {
            const payload = {
                warrantyPackageName: data.warrantyPackageName,
                description: data.description || "",
                warrantyPeriodMonths: data.warrantyPeriodMonths,
                startDate: new Date(data.startDate).toISOString(),
                endDate: new Date(data.endDate).toISOString(),
                isActive: data.isActive !== undefined ? data.isActive : true,
            };

            if (await updateWarrantyPackage(id, payload)) {
                navigate(`/${pathAdmin}/warranty`);
            }
        } catch (error) {
            console.error("Error updating warranty package:", error);
        }
    };

    return (
        <div className="max-w-[1320px] px-[12px] mx-auto">
            <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
                <CardHeaderAdmin title="Chỉnh sửa gói bảo hành" />
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
                        <InputAdmin
                            id="startDate"
                            type="datetime-local"
                            {...register("startDate")}
                            error={errors.startDate?.message}
                        />
                    </div>

                    <div>
                        <LabelAdmin htmlFor="endDate" content="Ngày kết thúc *" />
                        <InputAdmin
                            id="endDate"
                            type="datetime-local"
                            {...register("endDate")}
                            error={errors.endDate?.message}
                        />
                    </div>

                    {/* Buttons */}
                    <div className="col-span-2 flex items-center gap-[6px] justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center cursor-pointer text-white text-[1.3rem] font-[500] py-[0.82rem] px-[1.52rem] leading-[1.5] border rounded-[0.64rem] hover:opacity-90 transition-opacity duration-150 ease-in-out bg-[#22c55e] border-[#22c55e] shadow-[0_1px_2px_0_rgba(34,197,94,0.35)] disabled:opacity-50"
                        >
                            {loading ? "Đang cập nhật..." : "Cập nhật"}
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

