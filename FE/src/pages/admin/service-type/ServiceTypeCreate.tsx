import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Card } from "@mui/material";
import { CardHeaderAdmin } from "../../../components/admin/ui/CardHeader";
import { LabelAdmin } from "../../../components/admin/ui/form/Label";
import { InputAdmin } from "../../../components/admin/ui/form/Input";
import { SelectAdmin } from "../../../components/admin/ui/form/Select";
import { useSearchParams, useNavigate } from "react-router-dom";
import { pathAdmin } from "../../../constants/paths.constant";
import { useServiceType } from "../../../hooks/useServiceType";
import { useVehicleType } from "../../../hooks/useVehicleType";

const schema = yup.object({
  serviceName: yup.string().required("Tên dịch vụ không được để trống").max(100, "Tên dịch vụ không được vượt quá 100 kí tự"),
  description: yup.string().optional(),
  parentId: yup.string().optional(),
  vehicleTypeId: yup.string().required("Loại xe không được để trống"),
});

export const ServiceTypeCreate = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const vehicleTypeIdFromUrl = searchParams.get("vehicleTypeId");
  const parentIdFromUrl = searchParams.get("parentId");
  
  const { loading, create, getParentsByVehicleTypeId } = useServiceType();
  const { vehicleTypeOptions, fetchVehicleTypeNames } = useVehicleType();
  const [parentOptions, setParentOptions] = useState<{ value: string; label: string }[]>([]);
  const [parentServiceName, setParentServiceName] = useState<string>("");

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      vehicleTypeId: vehicleTypeIdFromUrl || "",
      parentId: parentIdFromUrl || ""
    }
  });

  useEffect(() => {
    fetchVehicleTypeNames();
  }, [fetchVehicleTypeNames]);

  // Load parent service types when vehicleTypeId is available
  useEffect(() => {
    const loadParentServices = async () => {
      if (vehicleTypeIdFromUrl) {
        // Call API chuyên dụng để lấy danh sách parent services
        const data = await getParentsByVehicleTypeId(vehicleTypeIdFromUrl);
        
        if (data && Array.isArray(data)) {
          // Map parent services to options (không cần thêm option "Không có" vì đã có placeholder)
          const parents = data.map((item: any) => ({
            value: item.serviceTypeId,
            label: item.serviceName
          }));
          
          setParentOptions(parents);
          
          // If parentId is provided, find and set the parent service name
          if (parentIdFromUrl) {
            const parentService = data.find((item: any) => item.serviceTypeId === parentIdFromUrl);
            if (parentService) {
              setParentServiceName(parentService.serviceName);
            }
          }
        }
      } else {
        // Reset về empty khi không có vehicleTypeId
        setParentOptions([]);
      }
    };
    loadParentServices();
  }, [vehicleTypeIdFromUrl, parentIdFromUrl, getParentsByVehicleTypeId]);

  useEffect(() => {
    if (vehicleTypeIdFromUrl) {
      setValue("vehicleTypeId", vehicleTypeIdFromUrl);
    }
    if (parentIdFromUrl) {
      setValue("parentId", parentIdFromUrl);
    }
  }, [vehicleTypeIdFromUrl, parentIdFromUrl, setValue]);

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
          <div className={vehicleTypeIdFromUrl ? "col-span-2" : ""}>
            <LabelAdmin htmlFor="serviceName" content="Tên dịch vụ" />
            <InputAdmin 
              id="serviceName" 
              placeholder="Nhập tên dịch vụ..." 
              {...register("serviceName")} 
              error={errors.serviceName?.message as string} 
            />
          </div>

          {!vehicleTypeIdFromUrl && (
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
          )}

          {(!parentIdFromUrl || parentIdFromUrl === "" || parentIdFromUrl === "null") && (
            <div>
              <LabelAdmin htmlFor="parentId" content="Danh mục cha (tùy chọn)" />
              <SelectAdmin 
                id="parentId" 
                name="parentId" 
                placeholder="-- Chọn danh mục cha --"
                options={parentOptions} 
                register={register("parentId")} 
                error={errors.parentId?.message as string}
              />
              <p className="text-[1.1rem] text-gray-500 mt-[0.5rem]">
                * Không chọn để tạo danh mục cha, chọn một danh mục để tạo dịch vụ con
              </p>
            </div>
          )}

          {parentIdFromUrl && parentIdFromUrl !== "" && parentIdFromUrl !== "null" && (
            <div className="col-span-2">
              <div className="relative overflow-hidden rounded-[0.8rem] border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center shadow-md">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-block px-2 py-0.5 bg-blue-500 text-white text-[1.1rem] font-[600] rounded-full uppercase tracking-wide">
                        Dịch vụ con
                      </span>
                    </div>
                    <div className="text-[1.3rem] text-gray-600 mb-1">Thuộc danh mục:</div>
                    <div className="text-[1.6rem] text-gray-900 font-[700]">
                      {parentServiceName || 'Đang tải...'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <LabelAdmin htmlFor="description" content="Mô tả (tùy chọn)" />
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
            <button 
              type="button"
              onClick={() => vehicleTypeIdFromUrl ? navigate(`/${pathAdmin}/vehicle/service/${vehicleTypeIdFromUrl}`) : navigate(-1)}
              className="flex items-center cursor-pointer text-white text-[1.3rem] font-[500] py-[0.82rem] px-[1.52rem] leading-[1.5] border rounded-[0.64rem] hover:opacity-90 transition-opacity duration-150 ease-in-out bg-[#ef4d56] border-[#ef4d56] shadow-[0_1px_2px_0_rgba(239,77,86,0.35)]"
            >
              Hủy
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

