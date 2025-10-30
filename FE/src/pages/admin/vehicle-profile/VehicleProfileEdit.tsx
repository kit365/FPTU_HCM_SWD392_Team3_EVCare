import { useForm } from "react-hook-form";
import { Card } from "@mui/material";
import { LabelAdmin } from "../../../components/admin/ui/form/Label";
import { InputAdmin } from "../../../components/admin/ui/form/Input";
import { SelectAdmin } from "../../../components/admin/ui/form/Select";
import { useParams, useNavigate } from "react-router-dom";
import { pathAdmin } from "../../../constants/paths.constant";
import { useVehicleProfile } from "../../../hooks/useVehicleProfile";
import { useVehicleType } from "../../../hooks/useVehicleType";
import { useUser } from "../../../hooks/useUser";
import { useEffect, useCallback, useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import { toast } from "react-toastify";

import type { UpdationVehicleProfileRequest } from "../../../types/vehicle-profile.types";
import type { UserResponse } from "../../../types/user.types";

type FormData = {
  userId?: string;
  vehicleTypeId?: string;
  plateNumber?: string;
  vin?: string;
  currentKm?: number;
  lastMaintenanceDate?: string;
  lastMaintenanceKm?: number;
  notes?: string;
};

export const VehicleProfileEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, getById, update } = useVehicleProfile();
  const { vehicleTypeOptions, fetchVehicleTypeNames } = useVehicleType();
  const { searchUserProfile } = useUser();
  const [loadingData, setLoadingData] = useState(true);

  const [userSearchInput, setUserSearchInput] = useState("");
  const [searchingUser, setSearchingUser] = useState(false);
  const [foundUser, setFoundUser] = useState<UserResponse | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>();

  // Validation function
  const validateForm = (data: FormData): boolean => {
    if (!data.userId || data.userId.trim() === "") {
      toast.error("Vui lòng tìm kiếm và chọn khách hàng trước!");
      return false;
    }
    if (!data.vehicleTypeId || data.vehicleTypeId.trim() === "") {
      toast.error("Vui lòng chọn loại xe!");
      return false;
    }
    if (!data.plateNumber || data.plateNumber.trim() === "") {
      toast.error("Vui lòng nhập biển số xe!");
      return false;
    }
    if (!data.vin || data.vin.trim() === "") {
      toast.error("Vui lòng nhập số khung (VIN)!");
      return false;
    }
    if (data.currentKm !== undefined && data.currentKm < 0) {
      toast.error("Km hiện tại phải lớn hơn hoặc bằng 0!");
      return false;
    }
    if (data.lastMaintenanceKm !== undefined && data.lastMaintenanceKm < 0) {
      toast.error("Km bảo trì phải lớn hơn hoặc bằng 0!");
      return false;
    }

    return true;
  };

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoadingData(true);
    try {
      const data = await getById(id);
      if (data) {
        reset({
          userId: data.user?.userId || "",
          vehicleTypeId: data.vehicleType?.vehicleTypeId || "",
          plateNumber: data.plateNumber || "",
          vin: data.vin || "",
          currentKm: data.currentKm || undefined,
          lastMaintenanceDate: data.lastMaintenanceDate 
            ? new Date(data.lastMaintenanceDate).toISOString().split('T')[0]
            : "",
          lastMaintenanceKm: data.lastMaintenanceKm || undefined,
          notes: data.notes || "",
        });
        // Load thông tin user hiện tại
        if (data.user) {
          setFoundUser(data.user);
          setUserSearchInput(data.user.email || data.user.username || "");
        }
      }
    } finally {
      setLoadingData(false);
    }
  }, [id, getById, reset]);

  useEffect(() => {
    fetchVehicleTypeNames();
  }, [fetchVehicleTypeNames]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUserSearchInputChange = (value: string) => {
    setUserSearchInput(value);
    // Clear foundUser và userId khi input thay đổi hoặc bị xóa
    if (!value.trim()) {
      setFoundUser(null);
      setValue("userId", "");
    }
  };

  const handleSearchUser = async () => {
    if (!userSearchInput.trim()) {
      toast.error("Vui lòng nhập email, username hoặc số điện thoại!");
      return;
    }
    setSearchingUser(true);
    const user = await searchUserProfile(userSearchInput.trim());
    if (user) {
      setFoundUser(user);
      setValue("userId", user.userId);
      toast.success(`Đã tìm thấy khách hàng: ${user.fullName || user.username}`);
    } else {
      setFoundUser(null);
      setValue("userId", "");
      toast.error("Không tìm thấy khách hàng với thông tin này!");
    }
    setSearchingUser(false);
  };

  const onSubmit = async (data: FormData) => {
    if (!id) return;

    // Validate form
    if (!validateForm(data)) {
      return;
    }

    // Convert date format from "YYYY-MM-DD" to "YYYY-MM-DDTHH:mm:ss" for BE LocalDateTime
    let formattedMaintenanceDate = data.lastMaintenanceDate;
    if (data.lastMaintenanceDate && data.lastMaintenanceDate.trim() !== "" && !data.lastMaintenanceDate.includes('T')) {
      formattedMaintenanceDate = `${data.lastMaintenanceDate}T00:00:00`;
    }

    const payload: UpdationVehicleProfileRequest = {
      userId: data.userId,
      vehicleTypeId: data.vehicleTypeId,
      plateNumber: data.plateNumber,
      vin: data.vin,
      currentKm: data.currentKm,
      lastMaintenanceDate: formattedMaintenanceDate || undefined,
      lastMaintenanceKm: data.lastMaintenanceKm,
      notes: data.notes,
    };

    const result = await update(id, payload);
    if (result) {
      navigate(`/${pathAdmin}/vehicle-profile`);
    }
  };

  return (
    <div className="max-w-[1320px] px-[12px] mx-auto">
      <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
        <div className="px-[2.4rem] py-[2.4rem] flex items-center justify-between border-b border-gray-200">
          <h1 className="text-[2rem] font-[700] text-[#2b2d3b]">Chỉnh sửa hồ sơ xe</h1>
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
            {/* Loading Skeleton */}
            <div className="animate-pulse space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div key={i}>
                    <div className="h-[1.4rem] bg-gray-200 rounded w-[30%] mb-2"></div>
                    <div className="h-[4.5rem] bg-gray-200 rounded"></div>
                  </div>
                ))}
                <div className="col-span-2">
                  <div className="h-[1.4rem] bg-gray-200 rounded w-[15%] mb-2"></div>
                  <div className="h-[4.5rem] bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="px-[2.4rem] pb-[2.4rem] grid grid-cols-2 gap-x-[24px] gap-y-[24px]"
          >
            {/* Tìm kiếm khách hàng */}
            <div className="col-span-2">
              <LabelAdmin htmlFor="userSearch" content="Tìm kiếm khách hàng" />
              <div className="flex gap-2">
                <input
                  id="userSearch"
                  type="text"
                  value={userSearchInput}
                  onChange={(e) => handleUserSearchInputChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearchUser();
                    }
                  }}
                  placeholder="Nhập email, username hoặc số điện thoại..."
                  className="flex-1 px-[1.6rem] py-[1.2rem] text-[1.4rem] border-2 border-gray-300 rounded-[0.8rem] focus:border-blue-500 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={handleSearchUser}
                  disabled={searchingUser || !userSearchInput.trim()}
                  className="flex items-center gap-2 cursor-pointer text-white text-[1.3rem] font-[500] py-[1.2rem] px-[2rem] leading-[1.5] border rounded-[0.8rem] hover:opacity-90 transition-opacity duration-150 ease-in-out bg-[#3498db] border-[#3498db] shadow-[0_1px_2px_0_rgba(52,152,219,0.35)] disabled:opacity-50"
                >
                  <SearchIcon className="!w-[1.6rem] !h-[1.6rem]" />
                  {searchingUser ? "Đang tìm..." : "Tìm"}
                </button>
              </div>
              {errors.userId && (
                <p className="text-[1.2rem] text-red-500 mt-1">{errors.userId.message}</p>
              )}
              <input type="hidden" {...register("userId")} />
              
              {/* Hiển thị thông tin user */}
              {foundUser && (
                <div className="mt-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center">
                      <span className="text-white text-[1.4rem]">✓</span>
                    </div>
                    <span className="text-[1.3rem] font-[700] text-green-800">Khách hàng hiện tại</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[1.3rem]">
                    <div>
                      <span className="text-gray-600 font-[500]">Họ tên: </span>
                      <span className="text-gray-900 font-[600]">{foundUser.fullName || foundUser.username}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 font-[500]">Email: </span>
                      <span className="text-gray-900">{foundUser.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 font-[500]">SĐT: </span>
                      <span className="text-gray-900 font-[600]">{foundUser.numberPhone || "-"}</span>
                    </div>
                    {foundUser.address && (
                      <div>
                        <span className="text-gray-600 font-[500]">Địa chỉ: </span>
                        <span className="text-gray-900">{foundUser.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Loại xe */}
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

            {/* Biển số xe */}
            <div>
              <LabelAdmin htmlFor="plateNumber" content="Biển số xe" />
              <InputAdmin
                id="plateNumber"
                placeholder="VD: 51A-123.45 hoặc 29B-12345"
                {...register("plateNumber", {
                  pattern: {
                    value: /^\d{2,3}[A-Z]{1,2}-\d{3,5}(\.\d{2})?$/,
                    message: "Biển số xe không đúng định dạng (VD: 51A-123.45 hoặc 29B-12345)"
                  }
                })}
                error={errors.plateNumber?.message as string}
              />
            </div>

            {/* Số khung (VIN) */}
            <div>
              <LabelAdmin htmlFor="vin" content="Số khung (VIN)" />
              <InputAdmin
                id="vin"
                placeholder="Nhập số khung xe..."
                {...register("vin")}
                error={errors.vin?.message as string}
              />
            </div>

            {/* Km hiện tại */}
            <div>
              <LabelAdmin htmlFor="currentKm" content="Km hiện tại (Tùy chọn)" />
              <InputAdmin
                id="currentKm"
                type="number"
                placeholder="Nhập số km hiện tại..."
                {...register("currentKm")}
                error={errors.currentKm?.message as string}
              />
            </div>

            {/* Ngày bảo trì gần nhất */}
            <div>
              <label htmlFor="lastMaintenanceDate" className="block text-[1.3rem] font-[500] text-[#2b2d3b] mb-[0.8rem]">
                Ngày bảo trì gần nhất <span className="text-gray-400 font-normal">(Tùy chọn)</span>
              </label>
              <input
                id="lastMaintenanceDate"
                type="date"
                {...register("lastMaintenanceDate")}
                className="w-full px-[1.6rem] py-[1.2rem] text-[1.4rem] border-2 border-gray-300 rounded-[0.8rem] focus:border-blue-500 focus:outline-none transition-colors"
              />
              {errors.lastMaintenanceDate && (
                <p className="text-[1.2rem] text-red-500 mt-1">{errors.lastMaintenanceDate.message}</p>
              )}
            </div>

            {/* Km bảo trì gần nhất */}
            <div>
              <LabelAdmin htmlFor="lastMaintenanceKm" content="Km bảo trì gần nhất (Tùy chọn)" />
              <InputAdmin
                id="lastMaintenanceKm"
                type="number"
                placeholder="Nhập số km bảo trì gần nhất..."
                {...register("lastMaintenanceKm")}
                error={errors.lastMaintenanceKm?.message as string}
              />
            </div>

            {/* Ghi chú */}
            <div className="col-span-2">
              <LabelAdmin htmlFor="notes" content="Ghi chú (Tùy chọn)" />
              <textarea
                id="notes"
                rows={4}
                placeholder="Nhập ghi chú về xe (tình trạng, lịch sử sửa chữa, đặc điểm...)..."
                {...register("notes")}
                className="w-full px-[1.6rem] py-[1.2rem] text-[1.4rem] border-2 border-gray-300 rounded-[0.8rem] focus:border-blue-500 focus:outline-none transition-colors resize-y"
              />
              {errors.notes && (
                <p className="text-[1.2rem] text-red-500 mt-1">{errors.notes.message}</p>
              )}
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
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

