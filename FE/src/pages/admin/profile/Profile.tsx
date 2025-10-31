import { useEffect, useState } from "react";
import { Card } from "@mui/material";
import { CardHeaderAdmin } from "../../../components/admin/ui/CardHeader";
import { LabelAdmin } from "../../../components/admin/ui/form/Label";
import { InputAdmin } from "../../../components/admin/ui/form/Input";
import { useAuthContext } from "../../../context/useAuthContext";
import { useForm } from "react-hook-form";
import { ImageUpload } from "../../../components/admin/common/ImageUpload";
import { userService } from "../../../service/userService";
import { notify } from "../../../components/admin/common/Toast";
import { handleApiError } from "../../../utils/handleApiError";

interface ProfileFormData {
  username: string;
  email: string;
  fullName: string;
  numberPhone: string;
  address: string;
  avatarUrl: string;
}

export const Profile = () => {
  const { user, refreshUser } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<ProfileFormData>();

  useEffect(() => {
    if (user) {
      const profileData = {
        username: user.username || "",
        email: user.email || "",
        fullName: user.fullName || "",
        numberPhone: user.numberPhone || "",
        address: user.address || "",
        avatarUrl: user.avatarUrl || "",
      };
      reset(profileData);
      setAvatarUrl(user.avatarUrl || "");
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user?.userId) {
      notify.error("Không tìm thấy thông tin người dùng");
      return;
    }

    setLoading(true);
    try {
      // Use updateProfile - dedicated endpoint for profile updates
      await userService.updateProfile(user.userId, {
        email: data.email,
        fullName: data.fullName || undefined,
        numberPhone: data.numberPhone || undefined,
        address: data.address || undefined,
        avatarUrl: avatarUrl || undefined,
      });

      notify.success("Cập nhật thông tin thành công!");
      
      // Refresh user context to get updated data
      await refreshUser();
    } catch (error: any) {
      handleApiError(error, "Có lỗi xảy ra khi cập nhật thông tin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1320px] px-[12px] mx-auto">
      <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
        <CardHeaderAdmin title="Thông tin cá nhân" />
        <form onSubmit={handleSubmit(onSubmit)} className="px-[2.4rem] pb-[2.4rem]">
          <div className="grid grid-cols-2 gap-x-[24px] gap-y-[24px]">
            {/* Username - Read only */}
            <div>
              <LabelAdmin htmlFor="username" content="Tên đăng nhập" />
              <InputAdmin 
                id="username" 
                placeholder="Tên đăng nhập..." 
                {...register("username")} 
                disabled
                error={errors.username?.message as string} 
              />
              <p className="text-[1.1rem] text-gray-500 mt-1">Không thể thay đổi</p>
            </div>

            {/* Email */}
            <div>
              <LabelAdmin htmlFor="email" content="Email" />
              <InputAdmin 
                id="email" 
                type="email" 
                placeholder="Nhập email..." 
                {...register("email", {
                  required: "Email không được để trống",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Email không hợp lệ"
                  }
                })} 
                error={errors.email?.message} 
              />
            </div>

            {/* Full Name */}
            <div>
              <LabelAdmin htmlFor="fullName" content="Họ và tên" />
              <InputAdmin 
                id="fullName" 
                placeholder="Nhập họ và tên..." 
                {...register("fullName")} 
                error={errors.fullName?.message} 
              />
            </div>

            {/* Phone */}
            <div>
              <LabelAdmin htmlFor="numberPhone" content="Số điện thoại" />
              <InputAdmin 
                id="numberPhone" 
                placeholder="Nhập số điện thoại..." 
                maxLength={10}
                {...register("numberPhone", {
                  pattern: {
                    value: /^\d{10}$/,
                    message: "Số điện thoại phải là 10 chữ số"
                  }
                })} 
                error={errors.numberPhone?.message} 
              />
            </div>

            {/* Address */}
            <div className="col-span-2">
              <LabelAdmin htmlFor="address" content="Địa chỉ" />
              <textarea 
                id="address"
                rows={3}
                placeholder="Nhập địa chỉ..."
                {...register("address")}
                className="w-full px-[1.2rem] py-[0.82rem] text-[1.3rem] border border-[#e2e8f0] rounded-[0.64rem] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status - Read only */}
            <div>
              <LabelAdmin htmlFor="isActive" content="Trạng thái" />
              <InputAdmin 
                id="isActive" 
                name="isActive"
                value={user?.isActive ? "Hoạt động" : "Không hoạt động"}
                disabled
              />
            </div>

            {/* Role - Read only */}
            <div>
              <LabelAdmin htmlFor="role" content="Vai trò" />
              <InputAdmin 
                id="role" 
                name="role"
                value={user?.roleName?.join(", ") || "N/A"}
                disabled
              />
            </div>
          </div>

          {/* Avatar Upload */}
          <div className="mt-[24px]">
            <ImageUpload
              value={avatarUrl}
              onChange={(url) => setAvatarUrl(url)}
              label="Ảnh đại diện"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-[6px] justify-end mt-[24px] pt-[24px] border-t">
            <button 
              type="submit" 
              disabled={loading} 
              className="flex items-center cursor-pointer text-white text-[1.3rem] font-[500] py-[0.82rem] px-[1.52rem] leading-[1.5] border rounded-[0.64rem] hover:opacity-90 transition-opacity duration-150 ease-in-out bg-[#22c55e] border-[#22c55e] shadow-[0_1px_2px_0_rgba(34,197,94,0.35)] disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "Đang cập nhật..." : "Cập nhật thông tin"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};
