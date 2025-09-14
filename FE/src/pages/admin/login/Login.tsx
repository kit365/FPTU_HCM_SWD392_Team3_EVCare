import { useAuth } from "../../../hooks/useAuth";
import { authService } from "../../../service/authService";
import type { LoginRequest } from "../../../type/login";
import { useForm } from "react-hook-form";

export const LoginPage = () => {
    
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginRequest>({ mode: 'onBlur' });

    const { login } = useAuth();

    const onSubmit = async (data: LoginRequest) => {
        await login(data);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">Đăng nhập quản trị</h1>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="email">
                            Email
                        </label>

                        <input
                            type="email"
                            id="email"
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Nhập email"
                            {...register("email", { required: "Email là bắt buộc" })}
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}

    
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2" htmlFor="password">
                            Mật khẩu
                        </label>
                        <input
                            type="password"
                            id="password"
                            className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.password ? "border-red-500" : ""}`}
                            placeholder="Nhập mật khẩu"
                            {...register("password", { required: "Vui lòng nhập mật khẩu" })}
                        />
                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                    >
                        Đăng nhập
                    </button>
                </form>
            </div>
        </div>
    );
};


