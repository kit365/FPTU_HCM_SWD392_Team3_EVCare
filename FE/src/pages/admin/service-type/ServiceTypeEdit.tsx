import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Card, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { Popconfirm } from "antd";
import { LabelAdmin } from "../../../components/admin/ui/form/Label";
import { InputAdmin } from "../../../components/admin/ui/form/Input";
import { SelectAdmin } from "../../../components/admin/ui/form/Select";
import { useServiceType } from "../../../hooks/useServiceType";
import { useServiceTypeVehiclePart } from "../../../hooks/useServiceTypeVehiclePart";
import { ServicePartModal } from "../../../components/admin/common/ServicePartModal";
import BuildIcon from "@mui/icons-material/Build";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import type { UpdationServiceTypeRequest } from "../../../types/service-type.types";

const schema = yup.object({
  serviceName: yup.string().required("Tên dịch vụ không được để trống").max(100, "Tên dịch vụ không được vượt quá 100 kí tự"),
  description: yup.string().optional(),
  vehicleTypeId: yup.string().required("Loại xe không được để trống"),
  isActive: yup.string().optional(),
});

export const ServiceTypeEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, getById, update } = useServiceType();
  const { list: vehicleParts, getByServiceTypeId, remove: removeServicePart, update: updateServicePart } = useServiceTypeVehiclePart();
  const [response, setResponse] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true); // Loading cho việc fetch data ban đầu

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema)
  });

  const loadData = useCallback(async () => {
    if (id) {
      setLoadingData(true);
      try {
        const response = await getById(id);
        if (response) {
          // Kiểm tra xem ID hiện tại có phải là service con không
          let actualService = response;
          
          // Nếu response có children và ID không trùng với serviceTypeId của response
          // => Đang load service con, cần tìm trong children
          if (response.children && response.children.length > 0 && response.serviceTypeId !== id) {
            const childService = response.children.find((child: any) => child.serviceTypeId === id);
            if (childService) {
              actualService = {
                ...childService,
                vehicleTypeResponse: response.vehicleTypeResponse, // Inherit từ parent
              };
            }
          }
          
          setResponse(actualService);
          reset({
            serviceName: actualService.serviceName,
            description: actualService.description || "",
            vehicleTypeId: actualService.vehicleTypeResponse?.vehicleTypeId || "",
            isActive: actualService.isActive ? "true" : "false",
          });
          // Load vehicle parts separately
          await getByServiceTypeId(id);
        }
      } finally {
        setLoadingData(false);
      }
    }
  }, [id, getById, getByServiceTypeId, reset]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePartSuccess = () => {
    loadData();
  };

  const handleDeletePart = async (partId: string) => {
    const success = await removeServicePart(partId);
    if (success) loadData();
  };

  const handleEditPart = (part: any) => {
    // Clone object để tránh mutate state trực tiếp
    setEditingPart({
      ...part,
      vehiclePart: { ...part.vehiclePart }
    });
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditingPart(null);
  };

  const handleSaveEditPart = async () => {
    if (!editingPart) return;

    console.log('Saving edit part:', {
      id: editingPart.serviceTypeVehiclePartId,
      payload: {
        serviceTypeId: id!,
        vehiclePartId: editingPart.vehiclePart.vehiclePartId,
        requiredQuantity: editingPart.requiredQuantity,
        estimatedTimeDefault: editingPart.estimatedTimeDefault
      }
    });

    const success = await updateServicePart(editingPart.serviceTypeVehiclePartId, {
      serviceTypeId: id!,
      vehiclePartId: editingPart.vehiclePart.vehiclePartId,
      requiredQuantity: editingPart.requiredQuantity,
      estimatedTimeDefault: editingPart.estimatedTimeDefault
    });

    console.log('Update result:', success);

    if (success) {
      handleCloseEditModal();
      await loadData();
    }
  };

  const onSubmit = async (data: UpdationServiceTypeRequest) => {
    if (!id) return;
    const success = await update(id, data);
    
    if (success) {
      // Navigate back to vehicle service list
      const vehicleTypeId = response?.vehicleTypeResponse?.vehicleTypeId;
      if (vehicleTypeId) {
        navigate(`/admin/vehicle/service/${vehicleTypeId}`);
      } else {
        navigate(-1);
      }
    }
  };

  const existingPartIds = vehicleParts?.map((p: any) => p.vehiclePart?.vehiclePartId).filter(Boolean) || [];
  const vehicleTypeId = response?.vehicleTypeResponse?.vehicleTypeId;

  return (
    <div className="max-w-[1320px] px-[12px] mx-auto">
      <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
        <div className="px-[2.4rem] py-[2.4rem] flex items-center justify-between border-b border-gray-200">
          <h1 className="text-[2rem] font-[700] text-[#2b2d3b]">Chỉnh sửa dịch vụ</h1>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 cursor-pointer text-white text-[1.3rem] font-[500] py-[0.82rem] px-[1.52rem] leading-[1.5] border rounded-[0.64rem] hover:opacity-90 transition-opacity duration-150 ease-in-out bg-[#6c757d] border-[#6c757d] shadow-[0_1px_2px_0_rgba(108,117,125,0.35)]"
          >
            <ArrowBackIcon className="!w-[1.6rem] !h-[1.6rem]" />
            Quay lại
          </button>
        </div>

        {loadingData ? (
          <div className="px-[2.4rem] py-[4rem]">
            {/* Loading Skeleton cho Form */}
            <div className="animate-pulse space-y-6 mb-8">
              <div className="h-[2rem] bg-gray-200 rounded w-[30%]"></div>
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <div className="h-[1.4rem] bg-gray-200 rounded w-[15%] mb-2"></div>
                  <div className="h-[4.5rem] bg-gray-200 rounded"></div>
                </div>
                <div className="col-span-2">
                  <div className="h-[1.4rem] bg-gray-200 rounded w-[10%] mb-2"></div>
                  <div className="h-[4.5rem] bg-gray-200 rounded"></div>
                </div>
                <div>
                  <div className="h-[1.4rem] bg-gray-200 rounded w-[20%] mb-2"></div>
                  <div className="h-[4.5rem] bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>

            {/* Loading Skeleton cho Vehicle Parts */}
            <div className="animate-pulse border-t border-gray-200 pt-6">
              <div className="flex justify-between items-center mb-4">
                <div className="h-[2rem] bg-gray-200 rounded w-[25%]"></div>
                <div className="h-[4rem] w-[15rem] bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-[7rem] bg-gray-100 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
        <form onSubmit={handleSubmit(onSubmit)} className="px-[2.4rem] pb-[2.4rem] grid grid-cols-2 gap-x-[24px] gap-y-[24px]">
          <div className="col-span-2">
            <LabelAdmin htmlFor="serviceName" content="Tên dịch vụ" />
            <InputAdmin 
              id="serviceName" 
              placeholder="Nhập tên dịch vụ..." 
              {...register("serviceName")} 
              error={errors.serviceName?.message as string} 
            />
          </div>

          <div className="col-span-2">
            <LabelAdmin htmlFor="description" content="Mô tả" />
            <InputAdmin 
              id="description" 
              placeholder="Nhập mô tả..." 
              {...register("description")} 
              error={errors.description?.message as string} 
            />
          </div>

          <div>
            <LabelAdmin htmlFor="isActive" content="Trạng thái" />
            <SelectAdmin 
              id="isActive" 
              name="isActive" 
              placeholder="-- Chọn trạng thái --"
              options={[
                { value: "true", label: "Hoạt động" },
                { value: "false", label: "Không hoạt động" }
              ]} 
              register={register("isActive")} 
              error={errors.isActive?.message as string}
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
          </div>
        </form>




        {/* Vehicle Parts Section */}
        {response && (
          <div className="px-[2.4rem] pb-[2.4rem] border-t border-gray-200">
            <div className="flex items-center justify-between py-[1.6rem]">
              <h2 className="text-[1.6rem] font-[700] text-[#2b2d3b]">Phụ tùng dịch vụ</h2>
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 cursor-pointer text-white text-[1.3rem] font-[500] py-[0.82rem] px-[1.52rem] leading-[1.5] border rounded-[0.64rem] hover:opacity-90 transition-opacity duration-150 ease-in-out bg-[#22c55e] border-[#22c55e] shadow-[0_1px_2px_0_rgba(34,197,94,0.35)]"
              >
                <BuildIcon className="!w-[1.6rem] !h-[1.6rem]" />
                Thêm phụ tùng
              </button>
            </div>

            {vehicleParts && vehicleParts.length > 0 ? (
              <div className="space-y-2">
                {vehicleParts.map((part: any) => (
                  <div key={part.serviceTypeVehiclePartId} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-[600] text-[1.4rem] text-[#2b2d3b]">{part.vehiclePart?.vehiclePartName}</span>
                        <span className="text-[1.2rem] text-gray-500">
                          (Tồn kho: {part.vehiclePart?.currentQuantity})
                        </span>
                      </div>
                      <div className="flex gap-4 mt-1 text-[1.2rem] text-gray-600">
                        <span>Số lượng: <strong>{part.requiredQuantity}</strong></span>
                        <span>Thời gian: <strong>{part.estimatedTimeDefault}</strong> phút</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditPart(part)}
                        className="text-blue-500 hover:opacity-80 p-2"
                        title="Chỉnh sửa phụ tùng"
                      >
                        <EditIcon className="!w-[2rem] !h-[2rem]" />
                      </button>
                      <Popconfirm
                        title="Xóa phụ tùng"
                        description="Bạn chắc chắn muốn xóa phụ tùng này khỏi dịch vụ?"
                        onConfirm={() => handleDeletePart(part.serviceTypeVehiclePartId)}
                        okText="Đồng ý"
                        cancelText="Hủy"
                        placement="left"
                      >
                        <button className="text-red-500 hover:opacity-80 p-2">
                          <DeleteOutlineIcon className="!w-[2rem] !h-[2rem]" />
                        </button>
                      </Popconfirm>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <div className="text-[4rem] mb-2">📦</div>
                <p className="text-[1.4rem] text-gray-600 font-[500]">Chưa có phụ tùng nào</p>
                <p className="text-[1.2rem] text-gray-500">Hãy thêm phụ tùng cho dịch vụ này</p>
              </div>
            )}
          </div>
        )}
        </>
        )}
      </Card>

      {/* Modal to add vehicle parts */}
      {response && id && vehicleTypeId && (
        <ServicePartModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          serviceTypeId={id}
          serviceTypeName={response.serviceName || ""}
          vehicleTypeId={vehicleTypeId}
          existingPartIds={existingPartIds}
          onSuccess={handlePartSuccess}
        />
      )}

      {/* Modal to edit vehicle part */}
      <Dialog 
        key={editingPart?.serviceTypeVehiclePartId || 'edit-modal'}
        open={editModalOpen} 
        onClose={handleCloseEditModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: '1.8rem', fontWeight: 700, borderBottom: '1px solid #e5e7eb', pb: 2 }}>
          Chỉnh sửa phụ tùng
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {editingPart && (
            <div className="space-y-4">
              <div>
                <div className="text-[1.4rem] font-[600] text-gray-700 mb-2">Phụ tùng</div>
                <div className="px-4 py-3 bg-gray-100 rounded-lg text-[1.3rem] text-gray-800">
                  {editingPart.vehiclePart?.vehiclePartName}
                </div>
              </div>

              <div>
                <label htmlFor="requiredQuantity" className="block text-[1.3rem] font-[500] text-[#2b2d3b] mb-[0.8rem]">
                  Số lượng yêu cầu <span className="text-red-500">*</span>
                </label>
                <input
                  id="requiredQuantity"
                  name="requiredQuantity"
                  type="number"
                  min="1"
                  value={editingPart.requiredQuantity || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    const num = val === '' ? 1 : Math.max(1, parseInt(val) || 1);
                    setEditingPart({ ...editingPart, requiredQuantity: num });
                  }}
                  placeholder="Nhập số lượng..."
                  className="w-full px-[1.6rem] py-[1.2rem] text-[1.4rem] border-2 border-gray-300 rounded-[0.8rem] focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label htmlFor="estimatedTimeDefault" className="block text-[1.3rem] font-[500] text-[#2b2d3b] mb-[0.8rem]">
                  Thời gian ước tính (phút) <span className="text-red-500">*</span>
                </label>
                <input
                  id="estimatedTimeDefault"
                  name="estimatedTimeDefault"
                  type="number"
                  min="1"
                  value={editingPart.estimatedTimeDefault || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    const num = val === '' ? 1 : Math.max(1, parseInt(val) || 1);
                    setEditingPart({ ...editingPart, estimatedTimeDefault: num });
                  }}
                  placeholder="Nhập thời gian..."
                  className="w-full px-[1.6rem] py-[1.2rem] text-[1.4rem] border-2 border-gray-300 rounded-[0.8rem] focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #e5e7eb' }}>
          <button
            type="button"
            onClick={handleCloseEditModal}
            className="px-4 py-2 text-[1.3rem] font-[500] text-gray-700 bg-gray-200 rounded-[0.64rem] hover:bg-gray-300 transition-colors"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSaveEditPart}
            disabled={loading}
            className="px-4 py-2 text-[1.3rem] font-[500] text-white bg-[#22c55e] rounded-[0.64rem] hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
