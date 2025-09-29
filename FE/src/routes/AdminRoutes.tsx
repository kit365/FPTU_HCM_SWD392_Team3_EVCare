import type { RouteObject } from "react-router-dom";
import { DashboardPage } from "../pages/admin/dashboard/Dashboard";
import { SettingPage } from "../pages/admin/setting/Setting";
import { LoginPage } from "../pages/admin/login/Login";
import { StaffPage } from "../pages/admin/staff/Staff";
import { StaffCreatePage } from "../pages/admin/staff/StaffCreate";
import { Vehicle } from "../pages/admin/vehicle/Vehicle";
import { VehicleCreate } from "../pages/admin/vehicle/VehicleCreate";

export const AdminRoutes: RouteObject[] = [
    { path: "dashboard", element: <DashboardPage /> },
    { path: "setting", element: <SettingPage /> },
    { path: "staff", element: <StaffPage /> },
    { path: "staff/create", element: <StaffCreatePage /> },
    { path: "vehicle", element: <Vehicle/> },    
    { path: "vehicle/create", element: <VehicleCreate/> },
];

export const AuthAdminRoutes = [
    { path: "login", element: <LoginPage /> },
];