import type { RouteObject } from "react-router-dom";
import { ServiceBookingPage } from "../pages/client/booking/ServiceBooking";
import { HomePage } from "../pages/client/home/Home";
import CarManagement from "../pages/client/car/CarManagement";
import ProtectedRoute from "../components/client/ProtectedRoute";

export const ClientRoutes: RouteObject[] = [
    { path: "/", element: <HomePage /> },
    { path: "service-booking", element: <ServiceBookingPage /> },
    { path: "car-profile", element: <ProtectedRoute><CarManagement/></ProtectedRoute> },
];
