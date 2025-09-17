import type { RouteObject } from "react-router-dom";
import { ServiceBookingPage } from "../pages/client/booking/ServiceBooking";
import { HomePage } from "../pages/client/home/Home";

export const ClientRoutes: RouteObject[] = [
    { path: "/", element: <HomePage /> },
    { path: "service-booking", element: <ServiceBookingPage /> },
];
