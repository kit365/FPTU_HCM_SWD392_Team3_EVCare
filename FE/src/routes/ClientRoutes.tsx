import type { RouteObject } from "react-router-dom";
import { ServiceBookingPage } from "../pages/client/booking/ServiceBooking";
import { BookingSearchPage } from "../pages/client/booking/BookingSearch";
import { HomePage } from "../pages/client/home/Home";
import CarManagement from "../pages/client/car/CarManagement";
import ProtectedRoute from "../components/client/ProtectedRoute";
import { MessagePage } from "../pages/message/MessagePage";
export const ClientRoutes: RouteObject[] = [
    { path: "", element: <HomePage /> }, 
    { path: "service-booking", element: <ServiceBookingPage /> }, // /client/service-booking
    { path: "booking-search", element: <BookingSearchPage /> }, // /client/booking-search
    { path: "car-profile", element: <ProtectedRoute><CarManagement/></ProtectedRoute> }, // /client/car-profile
    { path: "message", element: <ProtectedRoute><MessagePage /></ProtectedRoute> }, // /client/message
];
