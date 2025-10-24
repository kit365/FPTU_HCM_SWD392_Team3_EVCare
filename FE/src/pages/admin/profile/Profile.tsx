import { useEffect, useState } from "react";
import { Card } from "@mui/material";
import { CardHeaderAdmin } from "../../../components/admin/ui/CardHeader";
import { LabelAdmin } from "../../../components/admin/ui/form/Label";
import { InputAdmin } from "../../../components/admin/ui/form/Input";
import { useAuthContext } from "../../../context/useAuthContext";
import { useForm } from "react-hook-form";

export const Profile = () => {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    if (user) {
      reset({
        username: user.username,
        email: user.email,
        numberPhone: user.numberPhone,
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      // TODO: Implement update profile API call
      console.log('Update profile:', data);
      // await updateProfile(data);
      // await refreshUser();
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1320px] px-[12px] mx-auto">
      <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
        <CardHeaderAdmin title="Thông tin cá nhân" />
        <form onSubmit={handleSubmit(onSubmit)} className="px-[2.4rem] pb-[2.4rem] grid grid-cols-2 gap-x-[24px] gap-y-[24px]">
          <div>
            <LabelAdmin htmlFor="username" content="Tên đăng nhập" />
            <InputAdmin 
              id="username" 
              placeholder="Nhập tên đăng nhập..." 
              {...register("username")} 
              error={errors.username?.message as string} 
            />
          </div>

          <div>
            <LabelAdmin htmlFor="email" content="Email" />
            <InputAdmin 
              id="email" 
              type="email" 
              placeholder="Nhập email..." 
              {...register("email")} 
              error={errors.email?.message as string} 
            />
          </div>

          <div>
            <LabelAdmin htmlFor="numberPhone" content="Số điện thoại" />
            <InputAdmin 
              id="numberPhone" 
              placeholder="Nhập số điện thoại..." 
              {...register("numberPhone")} 
              error={errors.numberPhone?.message as string} 
            />
          </div>

          <div>
            <LabelAdmin htmlFor="active" content="Trạng thái" />
            <InputAdmin 
              id="active" 
              name="active"
              value={user?.active ? "Hoạt động" : "Không hoạt động"}
              disabled
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
      </Card>
    </div>
  );
};
