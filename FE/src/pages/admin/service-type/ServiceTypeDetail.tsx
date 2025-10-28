import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Card } from "@mui/material";
import moment from "moment";
import { CardHeaderAdmin } from "../../../components/admin/ui/CardHeader";
import { LabelAdmin } from "../../../components/admin/ui/form/Label";
import { InputAdmin } from "../../../components/admin/ui/form/Input";
import { useServiceType } from "../../../hooks/useServiceType";
import { useVehicleType } from "../../../hooks/useVehicleType";
import { pathAdmin } from "../../../constants/paths.constant";

export const ServiceTypeDetail = () => {
  const { id } = useParams();
  const { getById } = useServiceType();
  const { vehicleTypeOptions, fetchVehicleTypeNames } = useVehicleType();
  const [response, setResponse] = useState<any>(null);

  const { register, reset } = useForm();

  useEffect(() => {
    fetchVehicleTypeNames();
  }, [fetchVehicleTypeNames]);

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        console.log('Fetching service type detail with id:', id);
        const response = await getById(id);
        console.log('Service type detail response:', response);
        if (response) {
          setResponse(response);
          reset({
            ...response,
            vehicleTypeId: response.vehicleTypeResponse?.vehicleTypeId || "",
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
        <CardHeaderAdmin title="Chi tiết loại dịch vụ" />
        <form className="px-[2.4rem] pb-[2.4rem] grid grid-cols-2 gap-x-[24px] gap-y-[24px]">
          <div>
            <LabelAdmin htmlFor="serviceName" content="Tên dịch vụ" />
            <InputAdmin id="serviceName" {...register("serviceName")} disabled />
          </div>

          <div>
            <LabelAdmin htmlFor="vehicleTypeId" content="Loại xe" />
            <InputAdmin 
              id="vehicleTypeId" 
              name="vehicleTypeId"
              placeholder="Loại xe" 
              value={vehicleTypeOptions.find(option => option.value === response?.vehicleTypeResponse?.vehicleTypeId)?.label || ""}
              disabled
            />
          </div>

          <div className="col-span-2">
            <LabelAdmin htmlFor="description" content="Mô tả" />
            <InputAdmin id="description" {...register("description")} disabled />
          </div>

          <div>
            <LabelAdmin htmlFor="isActive" content="Trạng thái" />
            <InputAdmin 
              id="isActive" 
              name="isActive"
              value={response?.isActive ? "Hoạt động" : "Không hoạt động"}
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
            <Link 
              to={`/${pathAdmin}/service-type/edit/${id}`} 
              className="flex items-center cursor-pointer text-white text-[1.3rem] font-[500] py-[0.82rem] px-[1.52rem] leading-[1.5] border rounded-[0.64rem] hover:opacity-90 transition-opacity duration-150 ease-in-out bg-[#22c55e] border-[#22c55e] shadow-[0_1px_2px_0_rgba(34,197,94,0.35)]"
            >
              Chỉnh sửa
            </Link>
            <Link 
              to={`/${pathAdmin}/service-type`} 
              className="flex items-center cursor-pointer text-white text-[1.3rem] font-[500] py-[0.82rem] px-[1.52rem] leading-[1.5] border rounded-[0.64rem] hover:opacity-90 transition-opacity duration-150 ease-in-out bg-[#ef4d56] border-[#ef4d56] shadow-[0_1px_2px_0_rgba(239,77,86,0.35)]"
            >
              Quay lại
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
};

