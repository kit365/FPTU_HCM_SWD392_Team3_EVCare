import { Button } from "antd";
import { GoogleOutlined } from "@ant-design/icons";
import { useGoogleAuth } from "../../hooks/useGoogleAuth";

interface GoogleLoginButtonProps {
  fullWidth?: boolean;
  size?: "small" | "middle" | "large";
  text?: string;
}

export const GoogleLoginButton = ({ 
  fullWidth = true, 
  size = "large",
  text = "Đăng nhập với Google" 
}: GoogleLoginButtonProps) => {
  const { loginWithGoogle, isLoading } = useGoogleAuth();

  return (
    <Button
      type="default"
      size={size}
      icon={<GoogleOutlined />}
      onClick={loginWithGoogle}
      loading={isLoading}
      className={fullWidth ? "w-full" : ""}
      style={{
        borderColor: "#db4437",
        color: "#db4437",
      }}
    >
      {isLoading ? "Đang chuyển hướng..." : text}
    </Button>
  );
};


