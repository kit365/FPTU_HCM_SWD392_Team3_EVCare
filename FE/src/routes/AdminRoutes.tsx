import type { RouteObject } from "react-router-dom";
import { DashboardPage } from "../pages/admin/dashboard/Dashboard";
import { SettingPage } from "../pages/admin/setting/Setting";
import { LoginPage } from "../pages/admin/login/Login";
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
// ServiceTypeList removed - không được sử dụng (dùng VehicleService thay thế)
import { ServiceTypeCreate } from "../pages/admin/service-type/ServiceTypeCreate";
import { ServiceTypeEdit } from "../pages/admin/service-type/ServiceTypeEdit";
import { ServiceTypeDetail } from "../pages/admin/service-type/ServiceTypeDetail";
import { Profile } from "../pages/admin/profile/Profile";
import { VehicleService } from "../pages/admin/vehicle/VehicleService";
import AppointmentManage from "../pages/admin/appointment/AppointmentManage";
import AppointmentView from "../pages/admin/appointment/AppointmentView";
import { VehicleProfileList } from "../pages/admin/vehicle-profile/VehicleProfileList";
import { VehicleProfileCreate } from "../pages/admin/vehicle-profile/VehicleProfileCreate";
import { VehicleProfileEdit } from "../pages/admin/vehicle-profile/VehicleProfileEdit";
import { VehicleProfileDetail } from "../pages/admin/vehicle-profile/VehicleProfileDetail";
import ShiftList from "../pages/admin/shift/ShiftList";
import { ShiftAssign } from "../pages/admin/shift/ShiftAssign";
import { ShiftCreate } from "../pages/admin/shift/ShiftCreate";
import ShiftEdit from "../pages/admin/shift/ShiftEdit";
import ShiftDetail from "../pages/admin/shift/ShiftDetail";
import MyShifts from "../pages/admin/shift/MyShifts";
import MaintenanceManagementDetail from "../pages/admin/maintenance/MaintenanceManagementDetail";
import MyMaintenanceManagement from "../pages/admin/maintenance/MyMaintenanceManagement";
import Warranty from "../pages/admin/warranty_and_shift/Warranty";
import { MessagePage } from "../pages/message/MessagePage";
import { AdminCustomerManagement } from "../pages/admin/user/AdminCustomerManagement";
import { AdminStaffManagement } from "../pages/admin/user/AdminStaffManagement";
import { UserEdit } from "../pages/admin/user/UserEdit";
import CustomerEdit from "../pages/admin/user/CustomerEdit";
import CustomerCreate from "../pages/admin/user/CustomerCreate";
import UserCreate from "../pages/admin/user/UserCreate";
import { InvoiceView } from "../pages/admin/payment/InvoiceView";
export const AdminRoutes: RouteObject[] = [
    { path: "dashboard", element: <DashboardPage /> },
    { path: "setting", element: <SettingPage /> },
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
    // { path: "service-type", element: <ServiceTypeList /> }, // Removed - không được sử dụng
    { path: "service-type/create", element: <ServiceTypeCreate /> },
    { path: "service-type/edit/:id", element: <ServiceTypeEdit /> },
    { path: "service-type/view/:id", element: <ServiceTypeDetail /> },
    { path: "profile", element: <Profile /> },
    { path: "appointment-manage", element: <AppointmentManage/> },
    { path: "appointment/view/:id", element: <AppointmentView/> },
    { path: "invoice/:appointmentId", element: <InvoiceView/> },
    { path: "shift", element: <ShiftList/> },
    { path: "schedule", element: <MyShifts/> },
    { path: "my-maintenance", element: <MyMaintenanceManagement/> },
    { path: "maintenance/:id", element: <MaintenanceManagementDetail/> },
    { path: "shift/assign/:id", element: <ShiftAssign/> },
    { path: "shift/create", element: <ShiftCreate/> },
    { path: "shift/edit/:id", element: <ShiftEdit/> },
    { path: "shift/view/:id", element: <ShiftDetail/> },
    { path: "warranty", element: <Warranty/> },
    { path: "message", element: <MessagePage /> },
    { path: "users/customers", element: <AdminCustomerManagement /> },
    { path: "customers/create", element: <CustomerCreate /> },
    { path: "customers/edit/:id", element: <CustomerEdit /> },
    { path: "users/staff", element: <AdminStaffManagement /> },
    { path: "users/create", element: <UserCreate /> },
    { path: "users/edit/:id", element: <UserEdit /> },
];
export const AuthAdminRoutes = [
    { path: "login", element: <LoginPage /> },
];