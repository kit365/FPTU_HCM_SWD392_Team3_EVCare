import type { RouteObject } from "react-router-dom";
import { DashboardPage } from "../pages/admin/dashboard/Dashboard";
import { SettingPage } from "../pages/admin/setting/Setting";
import { LoginPage } from "../pages/admin/login/Login";
import { StaffPage } from "../pages/admin/staff/Staff";
import { StaffCreatePage } from "../pages/admin/staff/StaffCreate";
import { Vehicle } from "../pages/admin/vehicle/Vehicle";
import { VehicleCreate } from "../pages/admin/vehicle/VehicleCreate";
import { VehicleDetail } from "../pages/admin/vehicle/VehicleDetail";
import CarFileManagement from "../pages/admin/car file/CarFileManagement";
import CarFileCreate from "../pages/admin/car file/CarFileCreate";
import CarFileEdit from "../pages/admin/car file/CarFileEdit";

export const AdminRoutes: RouteObject[] = [
    { path: "dashboard", element: <DashboardPage /> },
    { path: "setting", element: <SettingPage /> },
    { path: "staff", element: <StaffPage /> },
    { path: "staff/create", element: <StaffCreatePage /> },
    { path: "vehicle", element: <Vehicle/> },    
    { path: "vehicle/create", element: <VehicleCreate/> },
    { path: "vehicle/edit/:id", element: <VehicleDetail/> },
    { path: "vehicle/view/:id", element: <VehicleDetail/> },
    { path: "car-file-management", element: <CarFileManagement/> },
    { path: "car-file-create", element: <CarFileCreate/> },
    { path: "car-file-edit/:id", element: <CarFileEdit/> },
    { path: "car-file-view/:id", element: <CarFileEdit/> },
];

export const AuthAdminRoutes = [
    { path: "login", element: <LoginPage /> },
];