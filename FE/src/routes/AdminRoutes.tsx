import type { RouteObject } from "react-router-dom";
import { DashboardPage } from "../pages/admin/dashboard/Dashboard";
import { SettingPage } from "../pages/admin/setting/Setting";
import { LoginPage } from "../pages/admin/login/Login";
import { StaffPage } from "../pages/admin/staff/Staff";
import { StaffCreatePage } from "../pages/admin/staff/StaffCreate";
import { Vehicle } from "../pages/admin/vehicle/Vehicle";
import { VehicleCreate } from "../pages/admin/vehicle/VehicleCreate";
import { VehicleEdit } from "../pages/admin/vehicle/VehicleEdit";
import CarFileManagement from "../pages/admin/car file/CarFileManagement";
import CarFileCreate from "../pages/admin/car file/CarFileCreate";
import CarFileEdit from "../pages/admin/car file/CarFileEdit";
import { VehicleDetail } from "../pages/admin/vehicle/VehicleDetail";
import { VehiclePartList } from "../pages/admin/vehicle-part/VehiclePartList";
import { VehiclePartCreate } from "../pages/admin/vehicle-part/VehiclePartCreate";
import { VehiclePartEdit } from "../pages/admin/vehicle-part/VehiclePartEdit";
import { VehiclePartDetail } from "../pages/admin/vehicle-part/VehiclePartDetail";
import { VehiclePartCategoryList } from "../pages/admin/vehicle-part-category/VehiclePartCategoryList";
import { VehiclePartCategoryCreate } from "../pages/admin/vehicle-part-category/VehiclePartCategoryCreate";
import { VehiclePartCategoryEdit } from "../pages/admin/vehicle-part-category/VehiclePartCategoryEdit";
import { VehiclePartCategoryDetail } from "../pages/admin/vehicle-part-category/VehiclePartCategoryDetail";
import { ServiceTypeList } from "../pages/admin/service-type/ServiceTypeList";
import { ServiceTypeCreate } from "../pages/admin/service-type/ServiceTypeCreate";
import { ServiceTypeEdit } from "../pages/admin/service-type/ServiceTypeEdit";
import { ServiceTypeDetail } from "../pages/admin/service-type/ServiceTypeDetail";
import { Profile } from "../pages/admin/profile/Profile";
import { VehicleService } from "../pages/admin/vehicle/VehicleService";
import AppointmentManage from "../pages/admin/appointment/AppointmentManage";
import { VehicleProfileList } from "../pages/admin/vehicle-profile/VehicleProfileList";
import { VehicleProfileCreate } from "../pages/admin/vehicle-profile/VehicleProfileCreate";
import { VehicleProfileEdit } from "../pages/admin/vehicle-profile/VehicleProfileEdit";
import { VehicleProfileDetail } from "../pages/admin/vehicle-profile/VehicleProfileDetail";
import Shift from "../pages/admin/warranty_and_shift/Shift";
import Warranty from "../pages/admin/warranty_and_shift/Warranty";
import { MessagePage } from "../pages/message/MessagePage";
export const AdminRoutes: RouteObject[] = [
    { path: "dashboard", element: <DashboardPage /> },
    { path: "setting", element: <SettingPage /> },
    { path: "staff", element: <StaffPage /> },
    { path: "staff/create", element: <StaffCreatePage /> },
    { path: "vehicle", element: <Vehicle /> },
    { path: "vehicle/create", element: <VehicleCreate /> },
    { path: "vehicle/edit/:id", element: <VehicleEdit /> },
    { path: "vehicle/view/:id", element: <VehicleDetail /> },
    { path: "vehicle/service/:id", element: <VehicleService /> },
    { path: "vehicle-profile", element: <VehicleProfileList /> },
    { path: "vehicle-profile/create", element: <VehicleProfileCreate /> },
    { path: "vehicle-profile/edit/:id", element: <VehicleProfileEdit /> },
    { path: "vehicle-profile/view/:id", element: <VehicleProfileDetail /> },
    { path: "car-file-management", element: <CarFileManagement /> },
    { path: "car-file-create", element: <CarFileCreate /> },
    { path: "car-file-edit/:id", element: <CarFileEdit /> },
    { path: "car-file-view/:id", element: <CarFileEdit /> },
    { path: "vehicle-part", element: <VehiclePartList /> },
    { path: "vehicle-part/create", element: <VehiclePartCreate /> },
    { path: "vehicle-part/edit/:id", element: <VehiclePartEdit /> },
    { path: "vehicle-part/view/:id", element: <VehiclePartDetail /> },
    { path: "vehicle-part-category", element: <VehiclePartCategoryList /> },
    { path: "vehicle-part-category/create", element: <VehiclePartCategoryCreate /> },
    { path: "vehicle-part-category/edit/:id", element: <VehiclePartCategoryEdit /> },
    { path: "vehicle-part-category/view/:id", element: <VehiclePartCategoryDetail /> },
    { path: "service-type", element: <ServiceTypeList /> },
    { path: "service-type/create", element: <ServiceTypeCreate /> },
    { path: "service-type/edit/:id", element: <ServiceTypeEdit /> },
    { path: "service-type/view/:id", element: <ServiceTypeDetail /> },
    { path: "profile", element: <Profile /> },
    { path: "appointment-manage", element: <AppointmentManage/> },
    { path: "shift", element: <Shift/> },
    { path: "warranty", element: <Warranty/> },
    { path: "message", element: <MessagePage /> },
];
export const AuthAdminRoutes = [
    { path: "login", element: <LoginPage /> },
];