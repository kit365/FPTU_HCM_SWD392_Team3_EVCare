import type { RouteObject } from "react-router-dom";
import { DashboardPage } from "../pages/admin/dashboard/Dashboard";
import { SettingPage } from "../pages/admin/setting/Setting";
import { LoginPage } from "../pages/admin/login/Login";

export const AdminRoutes: RouteObject[] = [
    { path: "dashboard", element: <DashboardPage /> },
    { path: "login", element: <LoginPage /> },
    { path: "setting", element: <SettingPage /> },
];