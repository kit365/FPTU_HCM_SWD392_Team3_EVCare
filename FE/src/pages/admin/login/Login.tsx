import { useAuth } from "../../../hooks/useAuth";
import type { LoginRequest } from "../../../type/login";
import { useForm } from "react-hook-form";
import { TextField, Button, Paper, Typography, Box, InputAdornment, IconButton, CircularProgress } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useState } from "react";
import { notify } from "../../../components/admin/common/Toast";

export const LoginPage = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginRequest>({ mode: 'onBlur' });

    const { login, isLoading } = useAuth();
    const [showPassword, setShowPassword] = useState(false);

    const onSubmit = async (data: LoginRequest) => {
        await login(data);
        // notify.success("Đăng nhập thành công!");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <Paper elevation={6} className="p-8 rounded-xl w-full max-w-md shadow-lg">
                <Typography variant="h4" className="!font-bold !mb-2 !text-center !text-blue-700" gutterBottom>
                    Đăng nhập quản trị
                </Typography>
                <Typography variant="body1" className="!mb-6 !text-center text-gray-500">
                    Vui lòng nhập thông tin để truy cập hệ thống quản trị
                </Typography>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Box className="mb-5">
                        <TextField
                            label="Email"
                            type="email"
                            fullWidth
                            variant="outlined"
                            size="medium"
                            autoComplete="email"
                            {...register("email", { required: "Email là bắt buộc" })}
                            error={!!errors.email}
                            helperText={errors.email?.message}
                            InputLabelProps={{ className: "!font-semibold" }}
                        />
                    </Box>
                    <Box className="mb-6">
                        <TextField
                            label="Mật khẩu"
                            type={showPassword ? "text" : "password"}
                            fullWidth
                            variant="outlined"
                            size="medium"
                            autoComplete="current-password"
                            {...register("password", { required: "Vui lòng nhập mật khẩu" })}
                            error={!!errors.password}
                            helperText={errors.password?.message}
                            InputLabelProps={{ className: "!font-semibold" }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={() => setShowPassword((show) => !show)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        size="large"
                        className="!py-3 !rounded-lg !font-bold !text-base !bg-blue-600 hover:!bg-blue-700 transition"
                        disabled={isLoading}
                        startIcon={isLoading ? <CircularProgress size={22} color="inherit" /> : null}
                    >
                        {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                    </Button>
                </form>
            </Paper>
        </div>
    );
};


