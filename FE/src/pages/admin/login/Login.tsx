import { useAuth } from "../../../hooks/useAuth";
import type { LoginRequest } from "../../../types/admin/auth";
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
    Chip,
    Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { 
    Visibility, 
    VisibilityOff, 
    AdminPanelSettings,
    Person,
} from "@mui/icons-material";
import { useState } from "react";
import { Link } from "react-router-dom";
import logoImage from "../../../assets/logo.jpg";

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
                background: "#f5f7fb",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Animated Background Decorations */}
            <Box
                sx={{
                    position: "absolute",
                    width: "500px",
                    height: "500px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, rgba(127, 156, 245, 0.1) 0%, rgba(94, 114, 228, 0.05) 100%)",
                    top: "-250px",
                    right: "-250px",
                    animation: "float 6s ease-in-out infinite",
                    "@keyframes float": {
                        "0%, 100%": { transform: "translateY(0px)" },
                        "50%": { transform: "translateY(30px)" },
                    },
                }}
            />
            <Box
                sx={{
                    position: "absolute",
                    width: "400px",
                    height: "400px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, rgba(94, 114, 228, 0.08) 0%, rgba(127, 156, 245, 0.03) 100%)",
                    bottom: "-200px",
                    left: "-200px",
                    animation: "float 8s ease-in-out infinite",
                    animationDelay: "1s",
                }}
            />

            {/* Bên trái - Premium Banner */}
            {isMdUp && (
                <Box
                    sx={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
                        backgroundSize: "400% 400%",
                        animation: "gradient 15s ease infinite",
                        color: "white",
                        p: 6,
                        position: "relative",
                        overflow: "hidden",
                        "@keyframes gradient": {
                            "0%, 100%": { backgroundPosition: "0% 50%" },
                            "50%": { backgroundPosition: "100% 50%" },
                        },
                    }}
                >
                    {/* Decorative Circles */}
                    <Box sx={{ 
                        position: "absolute", 
                        width: "300px", 
                        height: "300px", 
                        borderRadius: "50%",
                        border: "2px solid rgba(255,255,255,0.1)",
                        top: "10%",
                        right: "10%",
                        animation: "pulse 4s ease-in-out infinite",
                        "@keyframes pulse": {
                            "0%, 100%": { transform: "scale(1)", opacity: 0.3 },
                            "50%": { transform: "scale(1.1)", opacity: 0.5 },
                        },
                    }} />
                    <Box sx={{ 
                        position: "absolute", 
                        width: "200px", 
                        height: "200px", 
                        borderRadius: "50%",
                        border: "2px solid rgba(255,255,255,0.1)",
                        bottom: "15%",
                        left: "15%",
                        animation: "pulse 5s ease-in-out infinite",
                        animationDelay: "1s",
                    }} />

                    {/* Logo & Title */}
                    <Box sx={{ 
                        display: "flex", 
                        alignItems: "center", 
                        mb: 4,
                        position: "relative",
                        zIndex: 1,
                    }}>
                        <Box
                            sx={{
                                width: 64,
                                height: 64,
                                borderRadius: "16px",
                                background: "white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                mr: 2,
                                p: 1,
                                boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                                transition: "transform 0.3s",
                                "&:hover": {
                                    transform: "scale(1.05) rotate(5deg)",
                                },
                            }}
                        >
                            <img 
                                src={logoImage} 
                                alt="EVCare Logo" 
                                style={{ 
                                    width: "100%", 
                                    height: "100%", 
                                    objectFit: "contain" 
                                }}
                                onError={(e) => {
                                    // Fallback if image not found
                                    e.currentTarget.style.display = 'none';
                                    const parent = e.currentTarget.parentElement;
                                    if (parent) {
                                        parent.innerHTML = '<svg style="width: 100%; height: 100%; color: #667eea;" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>';
                                    }
                                }}
                            />
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: "1.8rem", fontWeight: 700, lineHeight: 1.2 }}>EVCare</Typography>
                            <Chip 
                                label="ADMIN PANEL" 
                                size="small" 
                                sx={{ 
                                    background: "rgba(255,255,255,0.2)",
                                    color: "white",
                                    fontWeight: 600,
                                    fontSize: "0.7rem",
                                    height: "20px",
                                    letterSpacing: 1,
                                }} 
                            />
                        </Box>
                    </Box>

                    <Typography sx={{ 
                        fontSize: "2.5rem", 
                        fontWeight: 800, 
                        mb: 2,
                        textShadow: "0 2px 10px rgba(0,0,0,0.1)",
                        position: "relative",
                        zIndex: 1,
                        lineHeight: 1.2,
                    }}>
                        Welcome Back! 👋
                    </Typography>
                    
                    <Typography sx={{ 
                        fontSize: "1.05rem", 
                        opacity: 0.95,
                        maxWidth: 400,
                        textAlign: "center",
                        lineHeight: 1.6,
                        position: "relative",
                        zIndex: 1,
                    }}>
                        Quản lý hệ thống EVCare một cách chuyên nghiệp và hiệu quả
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
                    position: "relative",
                    zIndex: 1,
                }}
            >
                <Paper
                    elevation={12}
                    sx={{
                        p: 6,
                        borderRadius: 3,
                        width: "100%",
                        maxWidth: 500,
                        boxShadow: "0 10px 40px rgba(0,0,0,0.06)",
                        background: "white",
                        border: "1px solid rgba(0,0,0,0.06)",
                        transition: "all 0.3s",
                        "&:hover": {
                            boxShadow: "0 15px 50px rgba(0,0,0,0.08)",
                        },
                    }}
                >
                    {/* Header with Icon */}
                    <Box sx={{ 
                        display: "flex", 
                        justifyContent: "center", 
                        mb: 3,
                    }}>
                        <Box
                            sx={{
                                width: 64,
                                height: 64,
                                borderRadius: "16px",
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 6px 16px rgba(102, 126, 234, 0.25)",
                            }}
                        >
                            <AdminPanelSettings sx={{ fontSize: "2.2rem", color: "white" }} />
                        </Box>
                    </Box>

                    <Typography
                        sx={{
                            fontSize: "2rem",
                            fontWeight: 700,
                            color: "#1a1a1a",
                            textAlign: "center",
                            mb: 0.5,
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        Admin Login
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: "0.95rem",
                            color: "#999",
                            textAlign: "center",
                            mb: 4,
                        }}
                    >
                        Sign in to your admin account
                    </Typography>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        {/* Email */}
                        <Box mb={3}>
                            <TextField
                                label="Email"
                                type="email"
                                fullWidth
                                variant="outlined"
                                autoComplete="email"
                                placeholder="admin@evcare.com"
                                {...register("email", { required: "Email là bắt buộc" })}
                                error={!!errors.email}
                                helperText={errors.email?.message}
                                FormHelperTextProps={{
                                    sx: { fontSize: "0.8rem", mt: 0.5 }
                                }}
                                InputProps={{
                                    sx: {
                                        fontSize: "1rem",
                                        py: 0.5,
                                        "& .MuiOutlinedInput-notchedOutline": {
                                            borderColor: "#e0e0e0",
                                        },
                                        "&:hover .MuiOutlinedInput-notchedOutline": {
                                            borderColor: "#667eea",
                                        },
                                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                            borderColor: "#667eea",
                                            borderWidth: "2px",
                                        },
                                    },
                                }}
                                InputLabelProps={{
                                    sx: { fontSize: "1rem" },
                                }}
                            />
                        </Box>

                        {/* Password */}
                        <Box mb={3.5}>
                            <TextField
                                label="Password"
                                type={showPassword ? "text" : "password"}
                                fullWidth
                                variant="outlined"
                                autoComplete="current-password"
                                placeholder="••••••••"
                                {...register("password", { required: "Vui lòng nhập mật khẩu" })}
                                error={!!errors.password}
                                helperText={errors.password?.message}
                                FormHelperTextProps={{
                                    sx: { fontSize: "0.8rem", mt: 0.5 }
                                }}
                                InputProps={{
                                    sx: {
                                        fontSize: "1rem",
                                        py: 0.5,
                                        "& .MuiOutlinedInput-notchedOutline": {
                                            borderColor: "#e0e0e0",
                                        },
                                        "&:hover .MuiOutlinedInput-notchedOutline": {
                                            borderColor: "#667eea",
                                        },
                                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                            borderColor: "#667eea",
                                            borderWidth: "2px",
                                        },
                                    },
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={() => setShowPassword((show) => !show)}
                                                edge="end"
                                                sx={{
                                                    color: "#999",
                                                    "&:hover": {
                                                        color: "#667eea",
                                                    },
                                                }}
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                InputLabelProps={{
                                    sx: { fontSize: "1rem" },
                                }}
                            />
                        </Box>

                        {/* Submit button */}
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            sx={{
                                py: 1.8,
                                fontWeight: 600,
                                fontSize: "1rem",
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                boxShadow: "0 4px 14px rgba(102, 126, 234, 0.25)",
                                textTransform: "none",
                                transition: "all 0.3s",
                                "&:hover": {
                                    background: "linear-gradient(135deg, #5568d3 0%, #653993 100%)",
                                    boxShadow: "0 6px 20px rgba(102, 126, 234, 0.35)",
                                    transform: "translateY(-1px)",
                                },
                                "&:active": {
                                    transform: "translateY(0)",
                                },
                                "&:disabled": {
                                    background: "#ddd",
                                },
                            }}
                            disabled={isLoading}
                        >
                            {isLoading ? "Logging in..." : "Sign In"}
                        </Button>

                        {/* Divider */}
                        <Divider sx={{ my: 3.5 }}>
                            <Typography sx={{ color: "#999", fontSize: "0.85rem" }}>
                                OR
                            </Typography>
                        </Divider>

                        {/* Link to Client Login */}
                        <Box sx={{ textAlign: "center" }}>
                            <Link to="/client/login" style={{ textDecoration: "none" }}>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    startIcon={<Person />}
                                    sx={{
                                        py: 1.5,
                                        fontSize: "0.95rem",
                                        fontWeight: 500,
                                        borderColor: "#ddd",
                                        color: "#666",
                                        textTransform: "none",
                                        transition: "all 0.3s",
                                        "&:hover": {
                                            borderColor: "#667eea",
                                            color: "#667eea",
                                            background: "rgba(102, 126, 234, 0.03)",
                                        },
                                    }}
                                >
                                    Login as Customer
                                </Button>
                            </Link>
                        </Box>
                    </form>
                </Paper>
            </Box>
        </Box>
    );
};
