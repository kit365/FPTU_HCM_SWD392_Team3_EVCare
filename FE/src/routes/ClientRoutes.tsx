import type { RouteObject } from "react-router-dom";
import { ServiceBookingPage } from "../pages/client/booking/ServiceBooking";
import { HomePage } from "../pages/client/home/Home";
import CarManagement from "../pages/client/car/CarManagement";
import ProtectedRoute from "../components/client/ProtectedRoute";
import { ClientMessagePage } from "../pages/client/message/ClientMessagePage";
import ClientProfile from "../pages/client/account/ClientProfile";
import LookupAppointmentsPage from "../pages/client/LookupAppointments";
import ClientAppointmentHistory from "../pages/client/ClientAppointmentHistory";
import { ClientInvoiceView } from "../pages/client/payment/ClientInvoiceView";
import { ClientPaymentSuccess } from "../pages/client/payment/PaymentSuccess";
import AppointmentDetailPage from "../pages/client/appointment/AppointmentDetailPage";
export const ClientRoutes: RouteObject[] = [
    { path: "", element: <HomePage /> }, 
    { path: "service-booking", element: <ServiceBookingPage /> }, // /client/service-booking
    { path: "booking", element: <ServiceBookingPage /> }, // /client/booking (for edit mode with query params)
    { path: "car-profile", element: <ProtectedRoute><CarManagement/></ProtectedRoute> }, // /client/car-profile
    { path: "lookup", element: <LookupAppointmentsPage /> }, // /client/lookup
    { path: "profile", element: <ProtectedRoute><ClientProfile/></ProtectedRoute> }, // /client/profile
    { path: "message", element: <ProtectedRoute><ClientMessagePage /></ProtectedRoute> }, // /client/message
    { path: "appointment-history", element: <ProtectedRoute><ClientAppointmentHistory /></ProtectedRoute> }, // /client/appointment-history
    { path: "appointment/:appointmentId", element: <AppointmentDetailPage /> }, // /client/appointment/:appointmentId (public - supports guest OTP verification)
    { path: "invoice/:appointmentId", element: <ClientInvoiceView /> }, // /client/invoice/:appointmentId (public - supports guest access)
    { path: "payment/success", element: <ProtectedRoute><ClientPaymentSuccess /></ProtectedRoute> }, // /client/payment/success
];
