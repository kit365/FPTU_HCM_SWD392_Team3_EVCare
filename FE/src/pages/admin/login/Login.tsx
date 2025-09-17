import { useAuth } from "../../../hooks/useAuth";
import type { LoginRequest } from "../../../type/login";
import { useForm } from "react-hook-form";
import {
    TextField,
    Button,
    Paper,
    Typography,
    Box,
    useMediaQuery,
    InputAdornment,
    IconButton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useState } from "react";

export const LoginPage = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginRequest>({ mode: "onBlur" });

    const { login, isLoading } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const theme = useTheme();
    const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

    const onSubmit = async (data: LoginRequest) => {
        await login(data);
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: isMdUp ? "row" : "column",
                alignItems: "stretch",
                justifyContent: "center",
                background: "#f5f6fa",
            }}
        >
            {/* Bên trái - Banner */}
            {isMdUp && (
                <Box
                    sx={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        background: "linear-gradient(135deg, #7f9cf5 0%, #5e72e4 100%)",
                        color: "white",
                        p: 8,
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", mb: 6 }}>
                        <Box
                            sx={{
                                width: 64,
                                height: 64,
                                borderRadius: "50%",
                                background: "white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                mr: 2,
                            }}
                        >
                            <Typography sx={{ fontSize: "2.4rem", color: "#5e72e4", fontWeight: 700 }}>
                                EV
                            </Typography>
                        </Box>
                        <Typography sx={{ fontSize: "2rem", fontWeight: 700 }}>Admin</Typography>
                    </Box>

                    <Typography sx={{ fontSize: "3rem", fontWeight: 800, mb: 2 }}>
                        Hey, Hello!
                    </Typography>
                    <Typography sx={{ fontSize: "1.6rem", mb: 2 }}>
                        Chào mừng bạn đến với hệ thống quản trị EVcare!
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: "1.4rem",
                            opacity: 0.85,
                            maxWidth: 360,
                            textAlign: "center",
                        }}
                    >
                        Quản lý mọi hoạt động dịch vụ, khách hàng và nhân viên một cách dễ
                        dàng, hiệu quả và hiện đại.
                    </Typography>
                </Box>
            )}

            {/* Bên phải - Form login */}
            <Box
                sx={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: isMdUp ? "white" : "transparent",
                    p: isMdUp ? 8 : 2,
                }}
            >
                <Paper
                    elevation={8}
                    sx={{
                        p: 6,
                        borderRadius: 5,
                        width: "100%",
                        maxWidth: 440,
                        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.13)",
                        background: "white",
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: "2.4rem",
                            fontWeight: 700,
                            color: "#222",
                            textAlign: "center",
                            mb: 2,
                        }}
                    >
                        Welcome Back
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: "1.6rem",
                            color: "text.secondary",
                            textAlign: "center",
                            mb: 5,
                        }}
                    >
                        Đăng nhập để tiếp tục quản trị hệ thống
                    </Typography>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        {/* Email */}
                        <Box mb={4}>
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
                                FormHelperTextProps={{
                                    sx: { fontSize: "1.4rem" }
                                }}
                                InputProps={{
                                    sx: {
                                        borderRadius: 99,
                                        background: "#f5f6fa",
                                        fontSize: "1.6rem",
                                        py: 1.2,
                                    },
                                }}
                                InputLabelProps={{
                                    sx: { fontWeight: 600, fontSize: "1.4rem" },
                                }}
                            />
                        </Box>

                        {/* Password */}
                        <Box mb={5}>
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
                                FormHelperTextProps={{
                                    sx: { fontSize: "1.4rem" }
                                }}
                                InputProps={{
                                    sx: {
                                        borderRadius: 99,
                                        background: "#f5f6fa",
                                        fontSize: "1.6rem",
                                        py: 1.2,
                                    },
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
                                InputLabelProps={{
                                    sx: { fontWeight: 600, fontSize: "1.4rem" },
                                }}
                            />
                        </Box>

                        {/* Submit button */}
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            size="large"
                            sx={{
                                py: 2,
                                borderRadius: 99,
                                fontWeight: 700,
                                fontSize: "1.6rem",
                                boxShadow: "0 4px 20px 0 rgba(94,114,228,0.15)",
                                textTransform: "none",
                                letterSpacing: 1,
                                transition: "all 0.2s",
                                "&:hover": {
                                    background: "linear-gradient(135deg, #5e72e4 0%, #7f9cf5 100%)",
                                    boxShadow: "0 6px 24px 0 rgba(94,114,228,0.25)",
                                },
                            }}
                            disabled={isLoading}
                        >
                            {isLoading ? "Đang đăng nhập..." : "Login"}
                        </Button>
                    </form>
                </Paper>
            </Box>
        </Box>
    );
};
