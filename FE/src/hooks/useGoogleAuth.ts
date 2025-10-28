import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { notify } from "../components/admin/common/Toast";
import { apiClient } from "../service/api";
import { API_BASE_URL } from "../constants/apiConstants";

const BACKEND_URL = "http://localhost:8080";
const GOOGLE_AUTH_URL = `${BACKEND_URL}/oauth2/authorization/google`;

export function useGoogleAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  /**
   * Redirect user to Google OAuth2 login page
   */
  const loginWithGoogle = () => {
    setIsLoading(true);
    // Save current location to redirect back after login
    sessionStorage.setItem("redirectAfterLogin", window.location.pathname);
    
    // Redirect to backend Google OAuth2 endpoint
    window.location.href = GOOGLE_AUTH_URL;
  };

  /**
   * Handle OAuth2 callback and extract tokens from URL params
   * This should be called on the callback page after backend redirects with tokens
   */
  const handleGoogleCallback = async () => {
    setIsLoading(true);
    try {
      // Extract tokens from URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const accessToken = urlParams.get("accessToken");
      const refreshToken = urlParams.get("refreshToken");
      const email = urlParams.get("email");
      const encodedName = urlParams.get("name");
      
      // Decode name (may contain Unicode characters like Vietnamese)
      const name = encodedName ? decodeURIComponent(encodedName) : "";
      
      if (!accessToken || !refreshToken) {
        throw new Error("Không nhận được tokens từ server");
      }
      
      // Save tokens to localStorage (same keys as normal login)
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
      
      notify.success(`Đăng nhập Google thành công! Xin chào ${name || email}`);
      
      // Clean URL params
      window.history.replaceState({}, document.title, "/oauth2/callback");
      
      // Redirect to saved location or home
      const redirectPath = sessionStorage.getItem("redirectAfterLogin") || "/";
      sessionStorage.removeItem("redirectAfterLogin");
      
      // Wait a bit to ensure localStorage is written
      setTimeout(() => {
        window.location.href = redirectPath;
      }, 100);
      
      return { accessToken, refreshToken };
    } catch (error: any) {
      console.error("Google OAuth2 callback error:", error);
      const errorMessage = error?.message || "Đăng nhập Google thất bại";
      notify.error(errorMessage);
      navigate("/client/login");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    loginWithGoogle,
    handleGoogleCallback,
  };
}

