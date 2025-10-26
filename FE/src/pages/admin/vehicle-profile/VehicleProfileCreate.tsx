import { useForm } from "react-hook-form";
import { Card } from "@mui/material";
import { LabelAdmin } from "../../../components/admin/ui/form/Label";
import { InputAdmin } from "../../../components/admin/ui/form/Input";
import { SelectAdmin } from "../../../components/admin/ui/form/Select";
import { useNavigate } from "react-router-dom";
import { pathAdmin } from "../../../constants/paths.constant";
import { useVehicleProfile } from "../../../hooks/useVehicleProfile";
import { useVehicleType } from "../../../hooks/useVehicleType";
import { useUser } from "../../../hooks/useUser";
import { useEffect, useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import { toast } from "react-toastify";

import type { CreationVehicleProfileRequest } from "../../../types/vehicle-profile.types";
import type { UserResponse } from "../../../types/user.types";

type FormData = {
  userId: string;
  vehicleTypeId: string;
  plateNumber: string;
  vin: string;
  currentKm?: number;
  lastMaintenanceDate?: string;
  lastMaintenanceKm?: number;
  notes?: string;
};

export const VehicleProfileCreate = () => {
  const navigate = useNavigate();
  const { loading, create } = useVehicleProfile();
  const { vehicleTypeOptions, fetchVehicleTypeNames } = useVehicleType();
  const { searchUserProfile } = useUser();
  
  const [userSearchInput, setUserSearchInput] = useState("");
  const [searchingUser, setSearchingUser] = useState(false);
  const [foundUser, setFoundUser] = useState<UserResponse | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      userId: "",
      vehicleTypeId: "",
      plateNumber: "",
      vin: "",
      currentKm: undefined,
      lastMaintenanceDate: "",
      lastMaintenanceKm: undefined,
      notes: "",
    },
    mode: 'onSubmit',
  });

  // Validation function
  const validateForm = (data: FormData): boolean => {
    let isValid = true;

    if (!data.userId || data.userId.trim() === "") {
      isValid = false;
    }
    if (!data.vehicleTypeId || data.vehicleTypeId.trim() === "") {
      isValid = false;
    }
    if (!data.plateNumber || data.plateNumber.trim() === "") {
      isValid = false;
    }
    if (!data.vin || data.vin.trim() === "") {
      isValid = false;
    }
    if (data.currentKm !== undefined && data.currentKm < 0) {
      isValid = false;
    }
    if (data.lastMaintenanceKm !== undefined && data.lastMaintenanceKm < 0) {
      isValid = false;
    }

    return isValid;
  };

  useEffect(() => {
    fetchVehicleTypeNames();
  }, [fetchVehicleTypeNames]);

  const handleUserSearchInputChange = (value: string) => {
    setUserSearchInput(value);
    // Clear foundUser và userId khi input thay đổi hoặc bị xóa
    if (!value.trim()) {
      setFoundUser(null); // Clear foundUser
      setValue("userId", ""); // Clear userId
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
      setFoundUser(user); // Set foundUser
      setValue("userId", user.userId);
    } else {
      setFoundUser(null); // Clear foundUser if not found
      setValue("userId", ""); // Clear userId if not found
    }
    setSearchingUser(false);
  };

  const onSubmit = async (data: FormData) => {
    // Validate form
    if (!validateForm(data)) {
      return;
    }

    // Convert date format from "YYYY-MM-DD" to "YYYY-MM-DDTHH:mm:ss" for BE LocalDateTime
    let formattedMaintenanceDate = undefined;
    if (data.lastMaintenanceDate && data.lastMaintenanceDate.trim() !== "") {
      formattedMaintenanceDate = `${data.lastMaintenanceDate}T00:00:00`;
    }

    const payload: CreationVehicleProfileRequest = {
      userId: data.userId,
      vehicleTypeId: data.vehicleTypeId,
      plateNumber: data.plateNumber,
      vin: data.vin,
      currentKm: data.currentKm,
      lastMaintenanceDate: formattedMaintenanceDate,
      lastMaintenanceKm: data.lastMaintenanceKm,
      notes: data.notes,
    };

    const vehicleId = await create(payload);
    if (vehicleId) {
      reset();
      setUserSearchInput(""); // Clear search input
      setFoundUser(null); // Clear foundUser
      navigate(`/${pathAdmin}/vehicle-profile`);
    }
  };

  return (
    <div className="max-w-[1320px] px-[12px] mx-auto">
      <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
        <div className="px-[2.4rem] py-[2.4rem] flex items-center justify-between border-b border-gray-200">
          <h1 className="text-[2rem] font-[700] text-[#2b2d3b]">Thêm mới hồ sơ xe</h1>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 cursor-pointer text-white text-[1.3rem] font-[500] py-[0.82rem] px-[1.52rem] leading-[1.5] border rounded-[0.64rem] hover:opacity-90 transition-opacity duration-150 ease-in-out bg-[#6c757d] border-[#6c757d] shadow-[0_1px_2px_0_rgba(108,117,125,0.35)]"
          >
            <ArrowBackIcon className="!w-[1.6rem] !h-[1.6rem]" />
            Quay lại
          </button>
        </div>

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
            {/* Hidden input for userId */}
            <input type="hidden" {...register("userId")} />
            
            {/* Hiển thị thông tin user tìm được */}
            {foundUser && (
              <div className="mt-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="text-white text-[1.4rem]">✓</span>
                  </div>
                  <span className="text-[1.3rem] font-[700] text-green-800">Đã tìm thấy khách hàng</span>
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
              register={register("vehicleTypeId", { 
                required: "Loại xe không được để trống" 
              })}
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
                required: "Biển số xe không được để trống",
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
              {...register("vin", { 
                required: "Số khung (VIN) không được để trống",
                minLength: { value: 1, message: "Số khung phải có ít nhất 1 ký tự" }
              })}
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
              {...register("currentKm", {
                min: { value: 0, message: "Km hiện tại phải >= 0" }
              })}
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
              {...register("lastMaintenanceKm", {
                min: { value: 0, message: "Km bảo trì phải >= 0" }
              })}
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
              {loading ? "Đang tạo..." : "Tạo hồ sơ"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

