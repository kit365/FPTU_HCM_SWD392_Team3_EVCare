import { useEffect } from "react";
import { Spin } from "antd";
import { useGoogleAuth } from "../../../hooks/useGoogleAuth";

/**
 * OAuth2 Callback Page
 * This page handles the redirect from Google after successful authentication.
 * It fetches user info and tokens from the backend, then redirects to the app.
 */
const GoogleCallback = () => {
  const { handleGoogleCallback } = useGoogleAuth();

  useEffect(() => {
    // Call the callback handler when component mounts
    handleGoogleCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <Spin size="large" />
        <p className="mt-4 text-gray-600">Đang xử lý đăng nhập Google...</p>
        <p className="text-sm text-gray-500 mt-2">Vui lòng đợi trong giây lát</p>
      </div>
    </div>
  );
};

export default GoogleCallback;


