import type { RouteObject } from "react-router-dom";
import { ServiceBookingPage } from "../pages/client/booking/ServiceBooking";
import { HomePage } from "../pages/client/home/Home";
import CarManagement from "../pages/client/car/CarManagement";
import ProtectedRoute from "../components/client/ProtectedRoute";
import { ClientMessagePage } from "../pages/client/message/ClientMessagePage";
export const ClientRoutes: RouteObject[] = [
    { path: "", element: <HomePage /> }, 
    { path: "service-booking", element: <ServiceBookingPage /> }, // /client/service-booking
    { path: "car-profile", element: <ProtectedRoute><CarManagement/></ProtectedRoute> }, // /client/car-profile
    { path: "message", element: <ProtectedRoute><ClientMessagePage /></ProtectedRoute> }, // /client/message
];
