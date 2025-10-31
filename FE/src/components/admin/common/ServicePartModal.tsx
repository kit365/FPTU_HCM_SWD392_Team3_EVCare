import { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useServiceTypeVehiclePart } from "../../../hooks/useServiceTypeVehiclePart";
import { useVehiclePart } from "../../../hooks/useVehiclePart";
import { LabelAdmin } from "../ui/form/Label";
import { InputAdmin } from "../ui/form/Input";
import { SelectAdmin } from "../ui/form/Select";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import type { CreationServiceTypeVehiclePartRequest } from "../../../types/service-type-vehicle-part.types";

interface ServicePartModalProps {
  open: boolean;
  onClose: () => void;
  serviceTypeId: string;
  serviceTypeName: string;
  vehicleTypeId: string;
  existingPartIds?: string[];
  onSuccess: () => void;
}

const schema = yup.object({
  vehiclePartId: yup.string().required("Vui lòng chọn phụ tùng"),
  requiredQuantity: yup
    .number()
    .typeError("Số lượng phải là số")
    .required("Số lượng yêu cầu không được để trống")
    .min(1, "Số lượng phải lớn hơn 0")
    .integer("Số lượng phải là số nguyên"),
  estimatedTimeDefault: yup
    .number()
    .typeError("Thời gian phải là số")
    .required("Thời gian ước tính không được để trống")
    .min(1, "Thời gian phải lớn hơn 0")
    .integer("Thời gian phải là số nguyên"),
});

export const ServicePartModal = ({ open, onClose, serviceTypeId, serviceTypeName, vehicleTypeId, existingPartIds = [], onSuccess }: ServicePartModalProps) => {
  const { create, loading } = useServiceTypeVehiclePart();
  const { getByVehicleTypeId, list } = useVehiclePart();
  const [vehiclePartOptions, setVehiclePartOptions] = useState<{ value: string; label: string }[]>([]);
  const [selectedPartStock, setSelectedPartStock] = useState<number | null>(null); // Track tồn kho của phụ tùng đang chọn

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      vehiclePartId: "",
      requiredQuantity: 1,
      estimatedTimeDefault: 30,
    }
  });

  const watchedVehiclePartId = watch("vehiclePartId");
  const watchedQuantity = watch("requiredQuantity");

  useEffect(() => {
    if (open && vehicleTypeId) {
      // Load vehicle parts for this vehicle type using dedicated endpoint
      getByVehicleTypeId(vehicleTypeId);
    }
  }, [open, vehicleTypeId, getByVehicleTypeId]);

  useEffect(() => {
    if (list && list.length > 0) {
      // Filter out parts that are already added to this service
      const filteredList = list.filter((part: any) => !existingPartIds.includes(part.vehiclePartId));
      
      // ✅ CHỈ hiển thị phụ tùng có tồn kho >= requiredQuantity
      const availableParts = filteredList.filter((part: any) => 
        (part.currentQuantity || 0) >= (watchedQuantity || 1)
      );
      
      const options = availableParts.map((part: any) => ({
        value: part.vehiclePartId,
        label: `${part.vehiclePartName} (Tồn: ${part.currentQuantity})`
      }));
      setVehiclePartOptions(options);
    }
  }, [list, existingPartIds, watchedQuantity]);

  // ✅ Track tồn kho của phụ tùng đang chọn
  useEffect(() => {
    if (watchedVehiclePartId && list) {
      const selectedPart = list.find((part: any) => part.vehiclePartId === watchedVehiclePartId);
      if (selectedPart) {
        setSelectedPartStock(selectedPart.currentQuantity || 0);
        
        // ✅ Clamp quantity nếu vượt quá tồn kho
        const currentQty = watchedQuantity || 1;
        if (currentQty > (selectedPart.currentQuantity || 0)) {
          setValue("requiredQuantity", selectedPart.currentQuantity || 1);
        }
      }
    } else {
      setSelectedPartStock(null);
    }
  }, [watchedVehiclePartId, list, watchedQuantity, setValue]);

  const onSubmit = async (data: any) => {
    const payload: CreationServiceTypeVehiclePartRequest = {
      serviceTypeId,
      vehiclePartId: data.vehiclePartId,
      requiredQuantity: Number(data.requiredQuantity),
      estimatedTimeDefault: Number(data.estimatedTimeDefault),
    };

    const success = await create(payload);
    if (success) {
      reset();
      onSuccess();
      onClose();
    }
  };

  const handleClose = () => {
    reset();
    setSelectedPartStock(null); // ✅ Reset stock khi đóng modal
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="text-[1.8rem] font-[700] text-[#2b2d3b]">Thêm phụ tùng cho dịch vụ</div>
          <div className="text-[1.3rem] text-gray-600 mt-1">"{serviceTypeName}"</div>
        </div>
        <IconButton aria-label="close" onClick={handleClose} sx={{ color: (theme) => theme.palette.grey[500] }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        {vehiclePartOptions.length === 0 && list.length > 0 ? (
          <div className="text-center py-8">
            <div className="text-[4rem] mb-4">✅</div>
            <p className="text-[1.4rem] text-gray-600 font-[500] mb-2">Đã thêm đủ phụ tùng</p>
            <p className="text-[1.2rem] text-gray-500">Tất cả phụ tùng tương thích đã được thêm vào dịch vụ này</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <LabelAdmin htmlFor="vehiclePartId" content="Phụ tùng *" />
              <SelectAdmin
                id="vehiclePartId"
                name="vehiclePartId"
                placeholder="-- Chọn phụ tùng --"
                options={vehiclePartOptions}
                register={register("vehiclePartId")}
                error={errors.vehiclePartId?.message as string}
              />
            </div>

          <div>
            <LabelAdmin htmlFor="requiredQuantity" content="Số lượng yêu cầu *" />
            <InputAdmin
              id="requiredQuantity"
              type="number"
              placeholder="Nhập số lượng..."
              {...register("requiredQuantity", {
                onChange: (e) => {
                  let qty = parseInt(e.target.value) || 1;
                  
                  // ✅ Clamp min = 1
                  if (qty < 1) {
                    qty = 1;
                  }
                  
                  // ✅ Clamp max = tồn kho (nếu đã chọn phụ tùng)
                  if (selectedPartStock && qty > selectedPartStock) {
                    qty = selectedPartStock;
                  }
                  
                  setValue("requiredQuantity", qty);
                }
              })}
              error={errors.requiredQuantity?.message as string}
            />
            {selectedPartStock !== null && (
              <p className="text-[1.2rem] text-gray-600 mt-1">
                Tối đa: {selectedPartStock} (tồn kho hiện tại)
              </p>
            )}
            {!watchedVehiclePartId && (
              <p className="text-[1.2rem] text-gray-500 mt-1">
                Chọn phụ tùng trước để xem số lượng tối đa
              </p>
            )}
          </div>

          <div>
            <LabelAdmin htmlFor="estimatedTimeDefault" content="Thời gian ước tính (phút) *" />
            <InputAdmin
              id="estimatedTimeDefault"
              type="number"
              placeholder="Nhập thời gian..."
              {...register("estimatedTimeDefault")}
              error={errors.estimatedTimeDefault?.message as string}
            />
            </div>
          </form>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <button
          type="button"
          onClick={handleClose}
          className="px-4 py-2 text-[1.3rem] font-[500] text-gray-700 bg-gray-200 rounded-[0.64rem] hover:bg-gray-300 transition-colors"
        >
          {vehiclePartOptions.length === 0 && list.length > 0 ? "Đóng" : "Hủy"}
        </button>
        {vehiclePartOptions.length > 0 && (
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            className="px-4 py-2 text-[1.3rem] font-[500] text-white bg-[#22c55e] rounded-[0.64rem] hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Đang thêm..." : "Thêm phụ tùng"}
          </button>
        )}
      </DialogActions>
    </Dialog>
  );
};

