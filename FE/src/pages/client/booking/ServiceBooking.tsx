import React, { useState, useEffect, useCallback } from "react";
import {
    Button,
    DatePicker,
    Form,
    Input,
    Select,
    TreeSelect,
    message,
    Modal,
    Alert,
    Card,
    List,
    Tag,
} from "antd";
import type { FormProps } from "antd";
import { Dayjs, isDayjs } from "dayjs";
import dayjs from "dayjs";
import { useSearchParams, useNavigate } from "react-router-dom";
import { bookingService } from "../../../service/bookingService";
import { useAuthContext } from "../../../context/useAuthContext";
import type { VehicleType, ServiceType } from "../../../types/booking.types";
import type { WarrantyEligibilityResponse } from "../../../types/appointment.types";
import ViewOldDataModal, { type VehicleProfileData } from "./ViewOldDataModal";

const { TextArea } = Input;
const { SHOW_PARENT } = TreeSelect;

export const ServiceBookingPage: React.FC = () => {
    const [form] = Form.useForm();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [serviceType, setServiceType] = useState<string>("");
    const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
    const [selectedVehicleTypeId, setSelectedVehicleTypeId] = useState<string>("");
    const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
    const [serviceModes, setServiceModes] = useState<string[]>([]);
    const [loadingVehicles, setLoadingVehicles] = useState<boolean>(false);
    const [loadingServices, setLoadingServices] = useState<boolean>(false);
    const [loadingServiceModes, setLoadingServiceModes] = useState<boolean>(false);
    const [isUseOldData, setIsUseOldData] = useState(false);
    
    // Edit mode states
    const [isEditMode, setIsEditMode] = useState(false);
    const [isWarrantyMode, setIsWarrantyMode] = useState(false);
    const [isGuestMode, setIsGuestMode] = useState(false);
    const [appointmentId, setAppointmentId] = useState<string | null>(null);
    const [loadingAppointment, setLoadingAppointment] = useState(false);
    const [guestOtpInfo, setGuestOtpInfo] = useState<{ email: string; otp: string } | null>(null);
    const [pendingAppointmentServices, setPendingAppointmentServices] = useState<string[] | null>(null);
    const [originalAppointmentData, setOriginalAppointmentData] = useState<any>(null); // Store original appointment data for price calculation
    const [originalServiceIds, setOriginalServiceIds] = useState<string[]>([]); // Store original service IDs for warranty coloring

    // Confirmation modal states
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);
    const [pendingAppointmentData, setPendingAppointmentData] = useState<any>(null);

    // Warranty eligibility states
    const [warrantyInfo, setWarrantyInfo] = useState<WarrantyEligibilityResponse | null>(null);
    const [checkingWarranty, setCheckingWarranty] = useState(false);
    const [warrantyChecked, setWarrantyChecked] = useState(false);

    // Watch form value để hiển thị đúng input khi serviceType thay đổi
    const formServiceType = Form.useWatch('serviceType', form);
    
    // Watch customer info for warranty check
    const customerName = Form.useWatch('customerName', form);
    const customerEmail = Form.useWatch('email', form);
    const customerPhone = Form.useWatch('phone', form);

    // Lấy thông tin user từ AuthContext
    const { user } = useAuthContext();

    // Check URL params for edit mode and warranty mode
    useEffect(() => {
        const appointmentIdParam = searchParams.get("appointmentId");
        const mode = searchParams.get("mode");
        const guest = searchParams.get("guest") === "true";
        
        if (appointmentIdParam && mode === "edit") {
            setIsEditMode(true);
            setIsWarrantyMode(false);
            setAppointmentId(appointmentIdParam);
            setIsGuestMode(guest);
            
            // Load guest OTP info from sessionStorage if guest mode
            let otpInfo: { email: string; otp: string } | null = null;
            if (guest) {
                try {
                    const guestEditInfo = sessionStorage.getItem("guestAppointmentEdit");
                    if (guestEditInfo) {
                        const parsed = JSON.parse(guestEditInfo);
                        otpInfo = { email: parsed.email, otp: parsed.otp };
                        setGuestOtpInfo(otpInfo);
                    }
                } catch (e) {
                    console.error("Error parsing guest appointment edit info:", e);
                }
            }
            
            // Load appointment data - pass guest mode and OTP info directly
            loadAppointmentForEdit(appointmentIdParam, guest, otpInfo);
        } else if (appointmentIdParam && mode === "warranty") {
            setIsWarrantyMode(true);
            setIsEditMode(false);
            setAppointmentId(appointmentIdParam);
            setIsGuestMode(guest);
            
            // Load warranty appointment data
            loadWarrantyAppointmentData(appointmentIdParam, guest);
        }
    }, [searchParams]);

    // Fetch vehicle types and service modes on mount
    useEffect(() => {
        fetchVehicleTypes();
        fetchServiceModes();
    }, []);

    // Fetch services when vehicle type changes
    useEffect(() => {
        if (selectedVehicleTypeId) {
            fetchServiceTypes(selectedVehicleTypeId);
        } else {
            setServiceTypes([]);
            form.setFieldValue("services", undefined);
        }
    }, [selectedVehicleTypeId]);

    // Set services into form when serviceTypes are loaded and we have pending services (edit mode or warranty mode)
    useEffect(() => {
        if ((isEditMode || isWarrantyMode) && pendingAppointmentServices !== null && serviceTypes.length > 0) {
            console.log("📋 Setting services from appointment:", pendingAppointmentServices);
            form.setFieldsValue({
                services: pendingAppointmentServices.length > 0 ? pendingAppointmentServices : undefined,
            });
            setPendingAppointmentServices(null); // Clear after setting
        }
    }, [serviceTypes, isEditMode, isWarrantyMode, pendingAppointmentServices]);

    // Check warranty eligibility when customer info changes (only in create mode)
    useEffect(() => {
        // Only check in create mode, not edit mode or warranty mode
        if (isEditMode || isWarrantyMode) {
            setWarrantyInfo(null);
            setWarrantyChecked(false);
            return;
        }

        // Need at least email or phone or fullName to check
        if (!customerEmail && !customerPhone && !customerName) {
            setWarrantyInfo(null);
            setWarrantyChecked(false);
            return;
        }

        // Debounce: wait 1 second after user stops typing
        const timeoutId = setTimeout(async () => {
            try {
                setCheckingWarranty(true);
                const requestData: any = {};
                
                // Add customerId if user is logged in
                if (user?.userId) {
                    requestData.customerId = user.userId;
                }
                
                // Add email, phone, fullName if available
                if (customerEmail) {
                    requestData.customerEmail = customerEmail;
                }
                if (customerPhone) {
                    requestData.customerPhoneNumber = customerPhone;
                }
                if (customerName) {
                    requestData.customerFullName = customerName;
                }

                // Only check if we have at least one identifier
                if (Object.keys(requestData).length === 0) {
                    setCheckingWarranty(false);
                    return;
                }

                const response = await bookingService.checkWarrantyEligibility(requestData);
                
                if (response.data?.success && response.data?.data) {
                    setWarrantyInfo(response.data.data);
                    setWarrantyChecked(true);
                    
                    if (response.data.data.hasWarrantyEligibleAppointments) {
                        console.log("✅ Found warranty appointments:", response.data.data.totalWarrantyEligibleAppointments);
                    }
                } else {
                    setWarrantyInfo(null);
                    setWarrantyChecked(true);
                }
            } catch (error: any) {
                console.error("Error checking warranty eligibility:", error);
                // Don't show error to user, just silently fail
                setWarrantyInfo(null);
                setWarrantyChecked(true);
            } finally {
                setCheckingWarranty(false);
            }
        }, 1000); // 1 second debounce

        return () => clearTimeout(timeoutId);
    }, [customerEmail, customerPhone, customerName, user?.userId, isEditMode, isWarrantyMode]);

    const handleOldData = () => {
        setIsUseOldData(true);
    };

    const handleCancelModal = () => {
        setIsUseOldData(false);
    };

    const handleCancelEdit = () => {
        if (isEditMode && appointmentId) {
            navigate(`/client/appointment/${appointmentId}`);
        } else {
            navigate(-1);
        }
    };


    const handleSelectVehicle = async (vehicleData: VehicleProfileData) => {
        try {
            // Fill thông tin cơ bản từ hồ sơ xe
            form.setFieldsValue({
                customerName: vehicleData.customerName,
                phone: vehicleData.phone,
                email: vehicleData.email,
                mileage: vehicleData.mileage,
                licensePlate: vehicleData.licensePlate,
                notes: vehicleData.notes || "",
                location: vehicleData.userAddress || "",
            });

            // Bước 1: Fill mẫu xe
            if (vehicleData.vehicleTypeId) {
                form.setFieldsValue({
                    vehicleType: vehicleData.vehicleTypeId,
                });
                setSelectedVehicleTypeId(vehicleData.vehicleTypeId);

                // Bước 2: Load service types cho vehicle type đã chọn (luôn load để user có thể chọn)
                try {
                    const serviceResponse = await bookingService.getServiceTypesByVehicleId(vehicleData.vehicleTypeId, {
                        page: 0,
                        pageSize: 100,
                    });

                    if (serviceResponse.data.success && serviceResponse.data.data.data) {
                        setServiceTypes(serviceResponse.data.data.data);

                        // Nếu có serviceTypeIds từ vehicle profile, fill vào form
                        if (vehicleData.serviceTypeIds && vehicleData.serviceTypeIds.length > 0) {
                            form.setFieldsValue({
                                services: vehicleData.serviceTypeIds,
                            });
                        }

                        // Bước 3: Fill loại hình dịch vụ (nếu có)
                        if (vehicleData.serviceMode) {
                            form.setFieldsValue({
                                serviceType: vehicleData.serviceMode,
                            });
                            setServiceType(vehicleData.serviceMode);
                        }

                        if (vehicleData.serviceTypeIds && vehicleData.serviceTypeIds.length > 0) {
                            message.success("Đã điền đầy đủ thông tin từ hồ sơ xe! Bạn có thể chỉnh sửa nếu cần.");
                        } else {
                            message.success("Đã điền thông tin cơ bản và mẫu xe. Vui lòng chọn dịch vụ.");
                        }
                    }
                } catch (error) {
                    console.error("Error loading service types:", error);
                    message.warning("Đã điền thông tin cơ bản và mẫu xe. Vui lòng chọn dịch vụ thủ công.");
                }
            } else {
                message.success("Đã điền thông tin cơ bản. Vui lòng chọn mẫu xe và dịch vụ.");
            }
        } catch (error) {
            console.error("Error in handleSelectVehicle:", error);
            message.error("Có lỗi khi điền thông tin từ hồ sơ xe.");
        }
    };

    const fetchVehicleTypes = async () => {
        setLoadingVehicles(true);
        try {
            const response = await bookingService.getVehicleTypes({
                page: 0,
                pageSize: 100,
            });
            if (response.data.success && response.data.data.data) {
                setVehicleTypes(response.data.data.data);
            }
        } catch (error) {
            message.error("Không thể tải danh sách mẫu xe");
            console.error("Error fetching vehicle types:", error);
        } finally {
            setLoadingVehicles(false);
        }
    };

    const fetchServiceTypes = async (vehicleTypeId: string) => {
        setLoadingServices(true);
        try {
            const response = await bookingService.getServiceTypesByVehicleId(vehicleTypeId, {
                page: 0,
                pageSize: 100,
            });
            if (response.data.success && response.data.data.data) {
                setServiceTypes(response.data.data.data);
            }
        } catch (error) {
            message.error("Không thể tải danh sách dịch vụ");
            console.error("Error fetching service types:", error);
        } finally {
            setLoadingServices(false);
        }
    };

    // Helper function to extract all service IDs from appointment response (including children)
    const extractServiceIdsFromAppointment = (serviceTypeResponses: any[]): string[] => {
        const serviceIds: string[] = [];
        
        if (!serviceTypeResponses || serviceTypeResponses.length === 0) {
            return serviceIds;
        }
        
        serviceTypeResponses.forEach((service: any) => {
            // Nếu service có children và có children được chọn
            if (service.children && Array.isArray(service.children) && service.children.length > 0) {
                // Chỉ thêm children IDs, không thêm parent ID
                service.children.forEach((child: any) => {
                    if (child.serviceTypeId) {
                        serviceIds.push(child.serviceTypeId);
                    }
                });
            } else {
                // Nếu không có children, thêm chính service đó
                if (service.serviceTypeId) {
                    serviceIds.push(service.serviceTypeId);
                }
            }
        });
        
        return serviceIds;
    };

    // Load warranty appointment data
    const loadWarrantyAppointmentData = async (id: string, guestMode: boolean = false) => {
        setLoadingAppointment(true);
        try {
            let appointmentData;
            if (guestMode) {
                // For guest, try to get from sessionStorage (from OTP verification)
                try {
                    const guestDataKey = `guestAppointment_${id}`;
                    const guestData = sessionStorage.getItem(guestDataKey);
                    if (guestData) {
                        const parsed = JSON.parse(guestData);
                        appointmentData = parsed.appointment;
                    } else {
                        // Try verifyOtpForGuestAppointment if we have OTP info
                        const guestEditInfo = sessionStorage.getItem("guestAppointmentEdit");
                        if (guestEditInfo) {
                            const parsed = JSON.parse(guestEditInfo);
                            appointmentData = await bookingService.verifyOtpForGuestAppointment(id, parsed.email, parsed.otp);
                            // Store in sessionStorage for future use
                            const guestDataKey = `guestAppointment_${id}`;
                            sessionStorage.setItem(guestDataKey, JSON.stringify({
                                appointment: appointmentData,
                                email: parsed.email,
                                verifiedAt: new Date().toISOString()
                            }));
                        } else {
                            throw new Error("Không tìm thấy thông tin cuộc hẹn. Vui lòng xác thực lại.");
                        }
                    }
                } catch (e) {
                    console.error("Error getting guest appointment data:", e);
                    throw e;
                }
            } else {
                // For authenticated users, use regular getById API
                const response = await bookingService.getAppointmentById(id);
                appointmentData = response.data.data;
            }
            
            if (appointmentData) {
                // Store original appointment data
                setOriginalAppointmentData(appointmentData);
                
                // Extract original service IDs for warranty coloring
                const serviceIds = extractServiceIdsFromAppointment(appointmentData.serviceTypeResponses);
                setOriginalServiceIds(serviceIds);
                
                // Fill basic form fields
                form.setFieldsValue({
                    customerName: appointmentData.customerFullName,
                    phone: appointmentData.customerPhoneNumber,
                    email: appointmentData.customerEmail,
                    vehicleType: appointmentData.vehicleTypeResponse?.vehicleTypeId,
                    licensePlate: appointmentData.vehicleNumberPlate,
                    mileage: appointmentData.vehicleKmDistances,
                    userAddress: appointmentData.userAddress || "",
                    location: appointmentData.userAddress || "",
                    serviceType: appointmentData.serviceMode,
                    dateTime: dayjs().add(1, 'day'), // Default to tomorrow
                    notes: `Yêu cầu bảo hành cho appointment ${id}`,
                });
                
                // Set vehicle type to load services
                if (appointmentData.vehicleTypeResponse?.vehicleTypeId) {
                    setSelectedVehicleTypeId(appointmentData.vehicleTypeResponse.vehicleTypeId);
                    // Fetch service types first, then set services via useEffect
                    await fetchServiceTypes(appointmentData.vehicleTypeResponse.vehicleTypeId);
                    // Store service IDs to be set after serviceTypes are loaded
                    setPendingAppointmentServices(serviceIds.length > 0 ? serviceIds : null);
                } else {
                    // If no vehicle type, just set services directly
                    form.setFieldsValue({
                        services: serviceIds.length > 0 ? serviceIds : undefined,
                    });
                }
                
                if (appointmentData.serviceMode) {
                    setServiceType(appointmentData.serviceMode);
                }
            }
        } catch (error: any) {
            console.error("Error loading warranty appointment data:", error);
            message.error(error?.response?.data?.message || "Không thể tải thông tin cuộc hẹn. Vui lòng thử lại.");
            // Redirect back if failed
            if (guestMode) {
                navigate("/client/lookup");
            } else {
                navigate("/client/lookup");
            }
        } finally {
            setLoadingAppointment(false);
        }
    };

    // Load appointment data for edit mode
    const loadAppointmentForEdit = async (id: string, guestMode: boolean = false, otpInfo: { email: string; otp: string } | null = null) => {
        setLoadingAppointment(true);
        try {
            let appointmentData;
            if (guestMode && otpInfo) {
                // For guest, use verify OTP API to get appointment details
                appointmentData = await bookingService.verifyOtpForGuestAppointment(id, otpInfo.email, otpInfo.otp);
            } else if (guestMode && !otpInfo) {
                // If guest mode but no OTP info, try to get from sessionStorage
                try {
                    const guestEditInfo = sessionStorage.getItem("guestAppointmentEdit");
                    if (guestEditInfo) {
                        const parsed = JSON.parse(guestEditInfo);
                        appointmentData = await bookingService.verifyOtpForGuestAppointment(id, parsed.email, parsed.otp);
                    } else {
                        throw new Error("Không tìm thấy thông tin OTP. Vui lòng xác thực lại.");
                    }
                } catch (e) {
                    console.error("Error getting OTP from sessionStorage:", e);
                    throw e;
                }
            } else {
                // For authenticated users, use regular getById API
                const response = await bookingService.getAppointmentById(id);
                appointmentData = response.data.data;
            }
            
            if (appointmentData) {
                // Store original appointment data for price calculation
                setOriginalAppointmentData(appointmentData);
                
                // Fill basic form fields first
                form.setFieldsValue({
                    customerName: appointmentData.customerFullName,
                    phone: appointmentData.customerPhoneNumber,
                    email: appointmentData.customerEmail,
                    vehicleType: appointmentData.vehicleTypeResponse?.vehicleTypeId,
                    licensePlate: appointmentData.vehicleNumberPlate,
                    mileage: appointmentData.vehicleKmDistances,
                    userAddress: appointmentData.userAddress || "",
                    location: appointmentData.userAddress || "",
                    serviceType: appointmentData.serviceMode,
                    dateTime: appointmentData.scheduledAt ? dayjs(appointmentData.scheduledAt) : null,
                    notes: appointmentData.notes || "",
                });
                
                // Extract service IDs from appointment
                const serviceIds = extractServiceIdsFromAppointment(appointmentData.serviceTypeResponses);
                
                // Set vehicle type to load services
                if (appointmentData.vehicleTypeResponse?.vehicleTypeId) {
                    setSelectedVehicleTypeId(appointmentData.vehicleTypeResponse.vehicleTypeId);
                    // Fetch service types first, then set services via useEffect
                    await fetchServiceTypes(appointmentData.vehicleTypeResponse.vehicleTypeId);
                    // Store service IDs to be set after serviceTypes are loaded
                    // Use null if empty to avoid unnecessary processing
                    setPendingAppointmentServices(serviceIds.length > 0 ? serviceIds : null);
                } else {
                    // If no vehicle type, just set services directly
                    form.setFieldsValue({
                        services: serviceIds.length > 0 ? serviceIds : undefined,
                    });
                }
                
                if (appointmentData.serviceMode) {
                    setServiceType(appointmentData.serviceMode);
                }
            }
        } catch (error: any) {
            console.error("Error loading appointment for edit:", error);
            message.error(error?.response?.data?.message || "Không thể tải thông tin cuộc hẹn. Vui lòng thử lại.");
            // Redirect back if failed
            if (guestMode) {
                navigate("/client/lookup");
            } else {
                navigate("/client/appointment-history");
            }
        } finally {
            setLoadingAppointment(false);
        }
    };

    const fetchServiceModes = async () => {
        setLoadingServiceModes(true);
        try {
            const response = await bookingService.getServiceModes();
            if (response.data.success && response.data.data) {
                setServiceModes(response.data.data);
            }
        } catch (error) {
            message.error("Không thể tải danh sách loại dịch vụ");
            console.error("Error fetching service modes:", error);
        } finally {
            setLoadingServiceModes(false);
        }
    };

    const handleVehicleTypeChange = (value: string) => {
        setSelectedVehicleTypeId(value);
        form.setFieldValue("services", undefined);
    };

    // Convert vehicle types to options
    const vehicleOptions = vehicleTypes.map((vt) => ({
        value: vt.vehicleTypeId,
        label: `${vt.vehicleTypeName} - ${vt.manufacturer} (${vt.modelYear})`,
    }));

    // Convert API response to TreeSelect format with warranty coloring
    const buildServiceTree = (services: ServiceType[]) => {
        return services.map((service) => {
            const isInOriginal = originalServiceIds.includes(service.serviceTypeId);
            return {
                title: isWarrantyMode ? (
                    <span style={{ 
                        color: isInOriginal ? "#10b981" : "#9ca3af",
                        fontWeight: isInOriginal ? 600 : 400,
                    }}>
                        {service.serviceName}
                        {isInOriginal && <span style={{ marginLeft: 8, fontSize: "0.9em" }}>✓ (Bảo hành)</span>}
                    </span>
                ) : service.serviceName,
                value: service.serviceTypeId,
                key: service.serviceTypeId,
                children: service.children && service.children.length > 0
                    ? service.children.map((child) => {
                        const childIsInOriginal = originalServiceIds.includes(child.serviceTypeId);
                        return {
                            title: isWarrantyMode ? (
                                <span style={{ 
                                    color: childIsInOriginal ? "#10b981" : "#9ca3af",
                                    fontWeight: childIsInOriginal ? 600 : 400,
                                }}>
                                    {child.serviceName}
                                    {childIsInOriginal && <span style={{ marginLeft: 8, fontSize: "0.9em" }}>✓ (Bảo hành)</span>}
                                </span>
                            ) : child.serviceName,
                            value: child.serviceTypeId,
                            key: child.serviceTypeId,
                        };
                    })
                    : undefined,
            };
        });
    };

    const serviceTreeData = buildServiceTree(serviceTypes);

    // Hàm xử lý service selection logic
    const processServiceSelection = (selectedServices: string[], serviceTreeData: any[]): string[] => {
        if (!selectedServices || selectedServices.length === 0) return [];

        const result: string[] = [];

        selectedServices.forEach(serviceId => {
            const selectedService = findServiceInTree(serviceTreeData, serviceId);

            if (selectedService) {
                if (selectedService.children && selectedService.children.length > 0) {
                    // Kiểm tra xem có children nào được chọn không
                    const selectedChildren = selectedServices.filter(id =>
                        selectedService.children?.some((child: any) => child.value === id)
                    );

                    if (selectedChildren.length === 0) {
                        // Chỉ chọn parent → gửi tất cả children IDs (không gửi parent ID)
                        selectedService.children?.forEach((child: any) => {
                            result.push(child.value);
                        });
                    } else {
                        // Có chọn children cụ thể → chỉ gửi những children được chọn
                        result.push(...selectedChildren);
                    }
                } else {
                    // Đây là leaf node → gửi trực tiếp
                    result.push(serviceId);
                }
            }
        });

        return [...new Set(result)];
    };

    // Hàm helper để tìm service trong tree
    const findServiceInTree = (treeData: any[], serviceId: string): any => {
        for (const service of treeData) {
            if (service.value === serviceId) return service;
            if (service.children) {
                const found = findServiceInTree(service.children, serviceId);
                if (found) return found;
            }
        }
        return null;
    };

    // Hàm tính giá tạm tính (quote price) dựa trên danh sách service IDs
    const calculateQuotePrice = (serviceIds: string[]): number => {
        if (!serviceIds || serviceIds.length === 0) {
            console.log("💰 calculateQuotePrice: No service IDs provided");
            return 0;
        }
        
        console.log("💰 calculateQuotePrice - Input serviceIds:", serviceIds);
        console.log("💰 calculateQuotePrice - Available serviceTypes:", serviceTypes.length);
        console.log("💰 calculateQuotePrice - Has originalAppointmentData:", !!originalAppointmentData);
        
        // Helper function để tìm service trong tree
        const findServiceInTree = (services: any[], id: string): any | null => {
            for (const service of services) {
                if (service.serviceTypeId === id) {
                    return service;
                }
                if (service.children && service.children.length > 0) {
                    const found = findServiceInTree(service.children, id);
                    if (found) return found;
                }
            }
            return null;
        };
        
        // Helper function để tìm service trong original appointment data
        const findServiceInOriginalAppointment = (serviceId: string): any | null => {
            if (!originalAppointmentData || !originalAppointmentData.serviceTypeResponses) {
                return null;
            }
            
            for (const service of originalAppointmentData.serviceTypeResponses) {
                if (service.serviceTypeId === serviceId) {
                    return service;
                }
                if (service.children && service.children.length > 0) {
                    for (const child of service.children) {
                        if (child.serviceTypeId === serviceId) {
                            return child;
                        }
                    }
                }
            }
            return null;
        };
        
        let totalPrice = 0;
        const notFoundServices: string[] = [];
        
        serviceIds.forEach(serviceId => {
            let service = findServiceInTree(serviceTypes, serviceId);
            let serviceName = service?.serviceName || 'Unknown';
            
            // If service not found in serviceTypes or has no vehicle parts, try to find in original appointment data
            if (!service || !service.serviceTypeVehiclePartResponses || service.serviceTypeVehiclePartResponses.length === 0) {
                if (isEditMode && originalAppointmentData) {
                    const originalService = findServiceInOriginalAppointment(serviceId);
                    if (originalService && originalService.serviceTypeVehiclePartResponses && originalService.serviceTypeVehiclePartResponses.length > 0) {
                        console.log(`💰 Using original appointment data for service: ${originalService.serviceName || serviceName} (${serviceId})`);
                        service = originalService;
                    }
                }
            }
            
            if (service && service.serviceTypeVehiclePartResponses && service.serviceTypeVehiclePartResponses.length > 0) {
                console.log(`💰 Found service: ${service.serviceName || serviceName} (${service.serviceTypeId || serviceId})`);
                service.serviceTypeVehiclePartResponses.forEach((stvp: any) => {
                    if (stvp.vehiclePart && stvp.vehiclePart.unitPrice) {
                        // Calculate price based on required quantity (default to 1 if not specified)
                        const quantity = stvp.requiredQuantity || 1;
                        const price = stvp.vehiclePart.unitPrice * quantity;
                        console.log(`💰   Part: ${stvp.vehiclePart.partName || 'N/A'}, UnitPrice: ${stvp.vehiclePart.unitPrice}, Quantity: ${quantity}, Price: ${price}`);
                        totalPrice += price;
                    }
                });
            } else {
                notFoundServices.push(serviceId);
                console.warn(`⚠️ Service ID ${serviceId} not found or has no vehicle parts`);
            }
        });
        
        if (notFoundServices.length > 0) {
            console.warn(`⚠️ calculateQuotePrice: Some services not found or have no parts:`, notFoundServices);
            if (serviceTypes.length > 0) {
                console.warn(`⚠️ Available service IDs:`, serviceTypes.flatMap(s => [
                    s.serviceTypeId,
                    ...(s.children || []).map((c: any) => c.serviceTypeId)
                ]));
            }
        }
        
        console.log("💰 calculateQuotePrice - Total price:", totalPrice);
        return totalPrice;
    };

    // Prepare appointment data for confirmation modal
    const onFinish: FormProps["onFinish"] = (values) => {
        const dateValue = values["dateTime"];
        const formattedDate = isDayjs(dateValue)
            ? (dateValue as Dayjs).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")
            : new Date().toISOString();

        // Xử lý service selection theo logic mới
        const processedServiceIds = processServiceSelection(values.services || [], serviceTreeData);
        
        console.log("📋 Form values.services:", values.services);
        console.log("📋 Processed service IDs:", processedServiceIds);
        console.log("📋 ServiceTypes loaded:", serviceTypes.length, "services");
        console.log("📋 ServiceTreeData:", serviceTreeData.length, "items");

        // Tính giá tạm tính (quote price)
        const quotePrice = calculateQuotePrice(processedServiceIds);
        
        console.log("💰 Calculated quote price:", quotePrice);

        // Map form values to API request
        // Determine if we should include customerId
        // Only include if user is logged in and it's not edit mode OR it's edit mode but not guest mode
        // Do NOT include customerId if user is STAFF (staff creating appointment for customer)
        const isStaff = user?.roleName?.includes('STAFF');
        const shouldIncludeCustomerId = user?.userId && (!isEditMode || !isGuestMode) && !isStaff;
        
        const appointmentData = {
            ...(shouldIncludeCustomerId && { customerId: user.userId }), // Chỉ thêm customerId nếu user tồn tại, không phải guest và không phải STAFF
            customerFullName: values.customerName,
            customerPhoneNumber: values.phone || "",
            customerEmail: values.email,
            vehicleTypeId: values.vehicleType,
            vehicleNumberPlate: values.licensePlate,
            vehicleKmDistances: values.mileage || "",
            userAddress: values.userAddress || values.location || "",
            serviceMode: values.serviceType,
            scheduledAt: formattedDate,
            notes: values.notes || "",
            serviceTypeIds: processedServiceIds,
            isWarrantyAppointment: isWarrantyMode, // Set to true if warranty mode
            // Store form values for display in modal
            _formValues: values,
            _formattedDate: formattedDate,
            _processedServiceIds: processedServiceIds,
            _quotePrice: quotePrice,
        };

        console.log("📝 Appointment data prepared:", appointmentData);
        console.log("👤 User info:", { userId: user?.userId, isEditMode, isGuestMode, isStaff, shouldIncludeCustomerId, roleName: user?.roleName });

        // Store the data and show confirmation modal
        setPendingAppointmentData(appointmentData);
        setConfirmModalVisible(true);
    };

    // Actually create or update the appointment
    const handleConfirmAppointment = async () => {
        if (!pendingAppointmentData) return;

        try {
            setLoadingAppointment(true);
            
            // Clean up the data before sending to API (remove display-only fields)
            const { _formValues, _formattedDate, _processedServiceIds, _quotePrice, ...cleanAppointmentData } = pendingAppointmentData;
            
            let response;
            
            // Edit mode: Update appointment
            if (isEditMode && appointmentId) {
                if (isGuestMode && guestOtpInfo) {
                    // Guest update with OTP
                    response = await bookingService.updateGuestAppointment(
                        appointmentId,
                        guestOtpInfo.email,
                        guestOtpInfo.otp,
                        cleanAppointmentData
                    );
                } else {
                    // Authenticated user update
                    response = await bookingService.updateAppointmentForCustomer(appointmentId, cleanAppointmentData);
                }
                
                if (response.data.success) {
                    message.success(response.data.message || "Cập nhật cuộc hẹn thành công!");
                    setConfirmModalVisible(false);
                    
                    // For guest mode: After successful update, we need to re-fetch appointment data
                    // But OTP is deleted after update, so we'll need to send a new OTP request
                    // For now, we'll keep guestAppointmentEdit in sessionStorage so user can re-verify if needed
                    // And update the appointment data in sessionStorage by fetching from API after reload
                    if (isGuestMode && appointmentId && guestOtpInfo) {
                        // Keep guestAppointmentEdit for future edits (even though OTP might be invalid)
                        // User will need to request new OTP if they want to edit again
                        // But we'll try to fetch updated data using the current OTP before it gets deleted
                        // Note: This might fail if OTP is already deleted, but we'll try anyway
                        try {
                            const updatedAppointmentData = await bookingService.verifyOtpForGuestAppointment(
                                appointmentId,
                                guestOtpInfo.email,
                                guestOtpInfo.otp
                            );
                            
                            // Update sessionStorage with fresh data
                            const guestDataKey = `guestAppointment_${appointmentId}`;
                            const updatedGuestData = {
                                appointment: updatedAppointmentData,
                                email: guestOtpInfo.email,
                                verifiedAt: new Date().toISOString()
                            };
                            sessionStorage.setItem(guestDataKey, JSON.stringify(updatedGuestData));
                            
                            console.log("✅ Updated guest appointment data in sessionStorage");
                        } catch (error) {
                            console.error("⚠️ Could not fetch updated appointment data (OTP may be deleted):", error);
                            // Remove old sessionStorage data so AppointmentDetailPage will fetch fresh data
                            const guestDataKey = `guestAppointment_${appointmentId}`;
                            sessionStorage.removeItem(guestDataKey);
                            // Also remove guestAppointmentEdit so user needs to verify again
                            sessionStorage.removeItem("guestAppointmentEdit");
                        }
                    }
                    
                    // Navigate back to appointment detail page with reload for both authenticated users and guests
                    if (appointmentId) {
                        // Use window.location.href to force full page reload and fetch fresh data
                        window.location.href = `/client/appointment/${appointmentId}`;
                    } else {
                        // Fallback: if no appointmentId, navigate based on mode
                        if (isGuestMode) {
                            navigate("/client/lookup-appointments");
                        } else {
                            navigate("/client/appointment-history");
                        }
                    }
                } else {
                    message.error(response.data.message || "Cập nhật cuộc hẹn thất bại!");
                }
            } else {
                // Create new appointment
                console.log("📤 Sending appointment data:", cleanAppointmentData);
                response = await bookingService.createAppointment(cleanAppointmentData);

                if (response.data.success) {
                    console.log("APPOINTMENT CREATED SUCCESSFULLY:", {
                        appointmentData: cleanAppointmentData,
                        response: response.data,
                        appointmentId: response.data.data,
                        message: response.data.message
                    });
                    message.success(response.data.message || (isWarrantyMode ? "Tạo yêu cầu bảo hành thành công!" : "Đặt lịch hẹn thành công!"));
                    setConfirmModalVisible(false);
                    form.resetFields();
                    setSelectedVehicleTypeId("");
                    setServiceType("");
                    setOriginalServiceIds([]);
                    // Navigate after successful creation
                    if (isWarrantyMode) {
                        navigate("/client/lookup");
                    }
                } else {
                    console.log("APPOINTMENT CREATION FAILED:", {
                        appointmentData: cleanAppointmentData,
                        response: response.data,
                        errorMessage: response.data.message
                    });
                    message.error(response.data.message || "Đặt lịch hẹn thất bại!");
                }
            }
        } catch (error: any) {
            console.error(`Error ${isEditMode ? "updating" : "creating"} appointment:`, {
                error: error,
                errorMessage: error?.response?.data?.message || "Đã có lỗi xảy ra. Vui lòng thử lại!"
            });
            const errorMessage = error?.response?.data?.message || "Đã có lỗi xảy ra. Vui lòng thử lại!";
            message.error(errorMessage);
        } finally {
            setLoadingAppointment(false);
        }
    };

    return (
        <>
            {!isEditMode && !isWarrantyMode && (
                <div className="w-full h-[560px]">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.610010397031!2d106.809883!3d10.841127599999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752731176b07b1%3A0xb752b24b379bae5e!2sFPT%20University%20HCMC!5e0!3m2!1sen!2s!4v1761944376322!5m2!1sen!2s"
                        loading="lazy"
                        className="w-full h-[560px] border-0"
                        style={{ width: '100%', height: '560px' }}
                    ></iframe>
                </div>
            )}
            <div className="w-[1170px] mx-auto mt-[50px] mb-[100px]">
                <h2 className="text-[#333] text-[3rem] uppercase font-[300] text-center relative booking-title">
                    {isWarrantyMode ? "Yêu cầu bảo hành cuộc hẹn" : isEditMode ? "Chỉnh sửa lịch hẹn" : "Đặt lịch dịch vụ"}
                </h2>
                <p className="mt-[34px] mb-[50px] text-[1.8rem] font-[300] text-center text-[#777777]">
                    {isWarrantyMode 
                        ? "Vui lòng kiểm tra và chỉnh sửa thông tin. Dịch vụ có màu xanh là những dịch vụ đã sử dụng trong cuộc hẹn trước và sẽ được bảo hành."
                        : isEditMode 
                        ? "Vui lòng cập nhật thông tin lịch hẹn của bạn. Thay đổi sẽ được gửi đến hệ thống để xử lý."
                        : "Chúng tôi là một trong những cửa hàng sửa chữa ô tô hàng đầu phục vụ khách hàng. Tất cả các dịch vụ sửa chữa đều được thực hiện bởi đội ngũ thợ máy có trình độ cao."
                    }
                </p>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    className="space-y-8"
                >
                    <div className="flex gap-[30px]">
                        {/* Thông tin khách hàng */}
                        <div className="w-[570px]">
                            <div className="text-[#333] pt-[11px] pb-[13px] px-[16px] font-[500] bg-[#F5F5F5] mb-[20px]">Thông tin khách hàng</div>
                            <Form.Item
                                name="customerName"
                                rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                                className="mb-[20px]"
                            >
                                <Input
                                    placeholder="Họ và tên"
                                    className="border border-[#E2E6E7] py-[12px] px-[15px] w-full font-[500] outline-none text-[#1a1a1a]"
                                />
                            </Form.Item>
                            <Form.Item
                                name="phone"
                                rules={[
                                    { required: true, message: "Vui lòng nhập số điện thoại" },
                                    { pattern: new RegExp(/\d+/g), message: "Cần nhập số!" },
                                    { min: 10, message: "Số điện thoại phải tối thiểu 10 số" },
                                ]}
                                className="mb-[20px]"
                            >
                                <Input
                                    placeholder="Số điện thoại"
                                    className="border border-[#E2E6E7] py-[12px] px-[15px] w-full font-[500] outline-none text-[#1a1a1a]"
                                />
                            </Form.Item>
                            <Form.Item
                                name="email"
                                rules={[
                                    { required: true, message: "Vui lòng nhập email" },
                                    { type: "email", message: "Email không hợp lệ" },
                                ]}
                            >
                                <Input
                                    placeholder="Email"
                                    className="border border-[#E2E6E7] py-[12px] px-[15px] w-full font-[500] outline-none text-[#1a1a1a]"
                                />
                            </Form.Item>
                        </div>

                        {/* Thông tin xe */}
                        <div className="w-[570px]">
                            <div className="text-[#333] pt-[11px] pb-[13px] px-[16px] font-[500] bg-[#F5F5F5] mb-[20px]">Thông tin xe</div>
                            <Form.Item
                                name="vehicleType"
                                rules={[{ required: true, message: "Vui lòng chọn mẫu xe" }]}
                                className="mb-[20px]"
                            >
                                <Select
                                    placeholder="Mẫu xe"
                                    options={vehicleOptions}
                                    loading={loadingVehicles}
                                    onChange={handleVehicleTypeChange}
                                    className="w-full"
                                    style={{ height: '48px' }}
                                />
                            </Form.Item>
                            <Form.Item
                                name="mileage"
                                className="mb-[20px]"
                            >
                                <Input
                                    placeholder="Số Km"
                                    className="border border-[#E2E6E7] py-[12px] px-[15px] w-full font-[500] outline-none text-[#1a1a1a]"
                                />
                            </Form.Item>
                            <Form.Item
                                name="licensePlate"
                                rules={[
                                    { required: true, message: "Vui lòng nhập biển số xe" },
                                    { min: 7, message: "Biển số xe phải có ít nhất 7 ký tự" },
                                    {
                                        pattern: /^(0[1-9]|[1-9][0-9])[A-Z]-\d{5}$/,
                                        message: "Biển số xe không đúng định dạng. Ví dụ: 30A-12345",
                                    },
                                ]}
                            >
                                <Input
                                    placeholder="Biển số xe"
                                    className="border border-[#E2E6E7] py-[12px] px-[15px] w-full font-[500] outline-none text-[#1a1a1a]"
                                />
                            </Form.Item>
                        </div>
                    </div>

                    {/* Warranty Information Alert - only show in create mode, not warranty or edit mode */}
                    {!isEditMode && !isWarrantyMode && warrantyChecked && warrantyInfo && warrantyInfo.hasWarrantyEligibleAppointments && (
                        <div className="mt-[30px]">
                            <Alert
                                message={
                                    <div>
                                        <strong className="text-[#52c41a]">Bạn có thể được hưởng chính sách bảo hành!</strong>
                                        <p className="mt-2 mb-0">
                                            Chúng tôi đã tìm thấy {warrantyInfo.totalWarrantyEligibleAppointments} cuộc hẹn đã hoàn thành của bạn. 
                                            Khi sử dụng lại dịch vụ tương tự, bạn sẽ được giảm giá hoặc miễn phí phụ tùng theo chính sách bảo hành.
                                        </p>
                                    </div>
                                }
                                type="success"
                                showIcon
                                closable
                                className="mb-4"
                            />
                            {warrantyInfo.warrantyAppointments && warrantyInfo.warrantyAppointments.length > 0 && (
                                <Card 
                                    title="Danh sách cuộc hẹn bảo hành" 
                                    size="small"
                                    className="mt-2"
                                >
                                    <List
                                        dataSource={warrantyInfo.warrantyAppointments.slice(0, 3)} // Chỉ hiển thị 3 cái đầu tiên
                                        renderItem={(item) => (
                                            <List.Item>
                                                <div className="w-full">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <strong>{item.customerFullName}</strong>
                                                        <Tag color="green">Đã hoàn thành</Tag>
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        <p className="mb-1">
                                                            <strong>Biển số:</strong> {item.vehicleNumberPlate} | 
                                                            <strong> Ngày:</strong> {item.scheduledAt ? new Date(item.scheduledAt).toLocaleDateString('vi-VN') : 'N/A'}
                                                        </p>
                                                        {item.serviceNames && item.serviceNames.length > 0 && (
                                                            <p className="mb-0">
                                                                <strong>Dịch vụ:</strong> {item.serviceNames.join(', ')}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </List.Item>
                                        )}
                                    />
                                    {warrantyInfo.totalWarrantyEligibleAppointments > 3 && (
                                        <p className="text-sm text-gray-500 mt-2 mb-0 text-center">
                                            Và {warrantyInfo.totalWarrantyEligibleAppointments - 3} cuộc hẹn bảo hành khác...
                                        </p>
                                    )}
                                </Card>
                            )}
                        </div>
                    )}

                    {/* Dịch vụ và Loại hình dịch vụ ngang hàng */}
                    <div className="flex gap-[30px] mt-[30px]">
                        {/* Dịch vụ */}
                        <div className="w-[570px]">
                            <div className="text-[#333] pt-[11px] pb-[13px] px-[16px] font-[500] bg-[#F5F5F5] mb-[20px]">Dịch vụ</div>
                            {isWarrantyMode && (
                                <Alert
                                    message={
                                        <div style={{ fontSize: "1.3rem" }}>
                                            <div style={{ marginBottom: "8px" }}>
                                                <span style={{ color: "#10b981", fontWeight: 600 }}>●</span>{" "}
                                                <strong style={{ color: "#10b981" }}>Màu xanh:</strong> Dịch vụ đang được bảo hành
                                            </div>
                                            <div>
                                                <span style={{ color: "#9ca3af", fontWeight: 600 }}>●</span>{" "}
                                                <strong style={{ color: "#9ca3af" }}>Màu xám:</strong> Dịch vụ không được bảo hành
                                            </div>
                                        </div>
                                    }
                                    type="info"
                                    showIcon={false}
                                    style={{ marginBottom: "16px", fontSize: "1.3rem" }}
                                />
                            )}
                            <Form.Item
                                name="services"
                                rules={[{ required: true, message: "Vui lòng chọn dịch vụ" }]}
                            >
                                <TreeSelect
                                    treeData={serviceTreeData}
                                    treeCheckable
                                    showCheckedStrategy={SHOW_PARENT}
                                    placeholder={selectedVehicleTypeId ? "Vui lòng chọn" : "Vui lòng chọn mẫu xe trước"}
                                    style={{ width: "100%", height: '48px' }}
                                    allowClear
                                    disabled={!selectedVehicleTypeId}
                                    loading={loadingServices}
                                />
                            </Form.Item>
                        </div>

                        {/* Loại hình dịch vụ */}
                        <div className="w-[570px]">
                            <div className="text-[#333] pt-[11px] pb-[13px] px-[16px] font-[500] bg-[#F5F5F5] mb-[20px]">Loại hình dịch vụ</div>
                            <Form.Item
                                name="serviceType"
                                rules={[{ required: true, message: "Vui lòng chọn thể loại" }]}
                                className="mb-[20px]"
                            >
                                <Select
                                    placeholder="Chọn loại dịch vụ"
                                    options={serviceModes.map((mode) => {
                                        const serviceModeMap: { [key: string]: string } = {
                                            'STATIONARY': 'Tại trung tâm',
                                            'MOBILE': 'Di động (Tận nơi)',
                                        };
                                        return {
                                            value: mode,
                                            label: serviceModeMap[mode] || mode,
                                        };
                                    })}
                                    loading={loadingServiceModes}
                                    onChange={(value) => {
                                        setServiceType(value);
                                        // Đảm bảo form value được cập nhật mà không reset các field khác
                                        form.setFieldValue("serviceType", value);
                                    }}
                                    className="w-full"
                                    style={{ height: '48px' }}
                                />
                            </Form.Item>

                            {/* Nếu STATIONARY → hiện địa điểm, MOBILE → hiện input */}
                            {formServiceType === "STATIONARY" && (
                                <Form.Item
                                    name="location"
                                >
                                    <Input
                                        value="Vũng Tàu"
                                        disabled
                                        placeholder="Vũng Tàu"
                                        className="border border-[#E2E6E7] py-[12px] px-[15px] w-full font-[500] outline-none text-[#1a1a1a] bg-gray-100"
                                    />
                                </Form.Item>
                            )}

                            {formServiceType === "MOBILE" && (
                                <Form.Item
                                    name="userAddress"
                                    rules={[
                                        { required: true, message: "Vui lòng nhập địa chỉ gặp nạn" },
                                    ]}
                                >
                                    <Input
                                        placeholder="Địa chỉ gặp nạn"
                                        className="border border-[#E2E6E7] py-[12px] px-[15px] w-full font-[500] outline-none text-[#1a1a1a]"
                                    />
                                </Form.Item>
                            )}
                        </div>
                    </div>

                    {/* Thời gian hẹn */}
                    <div className="mt-[30px]">
                        <Form.Item
                            label="Thời gian hẹn"
                            name="dateTime"
                            rules={[{ required: true, message: "Vui lòng chọn thời gian" }]}
                        >
                            <DatePicker
                                showTime
                                format="YYYY-MM-DD HH:mm:ss"
                                className="w-full"
                                placeholder="Chọn ngày và giờ"
                                style={{ height: '48px' }}
                            />
                        </Form.Item>
                    </div>

                    {/* Ghi chú */}
                    <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-100">
                        <h3 className="font-bold text-xl mb-6 text-gray-800 flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-r from-gray-500 to-slate-500 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-white font-bold text-sm">5</span>
                            </div>
                            Ghi chú
                        </h3>
                        <Form.Item name="notes">
                            <TextArea rows={4} placeholder="Nhập ghi chú (nếu có)" />
                        </Form.Item>
                    </div>

                    {/* Nút Submit */}
                    <style>{`
          .ant-select-selection-item,
          .ant-select-selection-placeholder {
            font-weight: 500 !important;
            color: #1a1a1a !important;
          }
          .ant-tree-select-selection-item,
          .ant-tree-select-selection-placeholder {
            font-weight: 500 !important;
            color: #1a1a1a !important;
          }
          .ant-picker-input > input {
            font-weight: 500 !important;
            color: #1a1a1a !important;
          }
          .booking-btn-primary {
            position: relative;
            overflow: hidden;
            background: #1E69B8 !important;
            border: 1px solid #1E69B8 !important;
            color: white !important;
            font-weight: 600;
            padding: 18px 50px !important;
            font-size: 1.8rem !important;
            transition: all 0.4s ease !important;
            z-index: 1;
          }
          .booking-btn-primary::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.2);
            transition: left 0.5s ease;
            z-index: -1;
          }
          .booking-btn-primary:hover::before {
            left: 100%;
          }
          .booking-btn-primary:hover {
            background: #155a9d !important;
            border-color: #155a9d !important;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(30, 105, 184, 0.4);
          }

          .booking-btn-secondary {
            position: relative;
            overflow: hidden;
            background: white !important;
            border: 2px solid #1E69B8 !important;
            color: #1E69B8 !important;
            font-weight: 600;
            padding: 18px 50px !important;
            font-size: 1.8rem !important;
            transition: all 0.4s ease !important;
            z-index: 1;
          }
          .booking-btn-secondary::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: rgba(30, 105, 184, 0.1);
            transition: left 0.5s ease;
            z-index: -1;
          }
          .booking-btn-secondary:hover::before {
            left: 100%;
          }
          .booking-btn-secondary:hover {
            background: #1E69B8 !important;
            border-color: #1E69B8 !important;
            color: white !important;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(30, 105, 184, 0.4);
          }
        `}</style>
                    {/* Nút Submit */}
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 border border-blue-200">
                        <div className="text-center space-x-4">
                            <Button
                                type="default"
                                htmlType="submit"
                                loading={loadingAppointment}
                                size="large"
                                className="bg-white border-2 border-white text-blue-700 font-semibold px-8 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:bg-gray-50"
                            >
                                {isWarrantyMode ? "Tạo yêu cầu bảo hành" : isEditMode ? "Cập nhật cuộc hẹn" : "Đặt lịch hẹn"}
                            </Button>
                            {isEditMode && (
                                <Button
                                    type="default"
                                    onClick={handleCancelEdit}
                                    size="large"
                                    className="bg-white border-2 border-white text-blue-700 font-semibold px-8 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:bg-gray-50"
                                >
                                    Hủy
                                </Button>
                            )}
                            {!isEditMode && (
                                <Button
                                    type="default"
                                    onClick={handleOldData}
                                    size="large"
                                    className="bg-white border-2 border-white text-blue-700 font-semibold px-8 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:bg-gray-50"
                                >
                                    Sử dụng hồ sơ xe
                                </Button>
                            )}
                        </div>
                    </div>
                </Form>

                {/* Modal for old data */}
                <ViewOldDataModal
                    open={isUseOldData}
                    onCancel={handleCancelModal}
                    onSelectVehicle={handleSelectVehicle}
                />

                {/* Confirmation Modal */}
                <Modal
                    title={isWarrantyMode ? "Xác nhận yêu cầu bảo hành" : isEditMode ? "Xác nhận cập nhật cuộc hẹn" : "Xác nhận đặt lịch hẹn"}
                    open={confirmModalVisible}
                    onCancel={() => setConfirmModalVisible(false)}
                    onOk={handleConfirmAppointment}
                    confirmLoading={loadingAppointment}
                    okText={isWarrantyMode ? "Xác nhận yêu cầu bảo hành" : isEditMode ? "Xác nhận cập nhật" : "Xác nhận đặt lịch"}
                    cancelText="Hủy"
                    width={900}
                    okButtonProps={{
                        className: "bg-blue-600 hover:bg-blue-700"
                    }}
                >
                    {pendingAppointmentData && (
                        <div className="space-y-4 mt-4">
                            {/* Thông tin khách hàng */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-lg mb-3 text-blue-700">Thông tin khách hàng</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <span className="text-gray-600">Họ và tên:</span>
                                        <p className="font-medium">{pendingAppointmentData.customerFullName}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Số điện thoại:</span>
                                        <p className="font-medium">{pendingAppointmentData.customerPhoneNumber}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Email:</span>
                                        <p className="font-medium">{pendingAppointmentData.customerEmail}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Thông tin xe */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-lg mb-3 text-blue-700">Thông tin xe</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <span className="text-gray-600">Mẫu xe:</span>
                                        <p className="font-medium">
                                            {vehicleTypes.find(vt => vt.vehicleTypeId === pendingAppointmentData.vehicleTypeId)?.vehicleTypeName || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Biển số xe:</span>
                                        <p className="font-medium">{pendingAppointmentData.vehicleNumberPlate}</p>
                                    </div>
                                    {pendingAppointmentData.vehicleKmDistances && (
                                        <div>
                                            <span className="text-gray-600">Số Km:</span>
                                            <p className="font-medium">{pendingAppointmentData.vehicleKmDistances}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Dịch vụ đã chọn */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-lg mb-3 text-blue-700">Dịch vụ đã chọn</h4>
                                <div className="space-y-2">
                                    {(() => {
                                        // Helper function để tìm service trong tree
                                        const findServiceInTree = (services: any[], id: string): any | null => {
                                            for (const service of services) {
                                                if (service.serviceTypeId === id) {
                                                    return service;
                                                }
                                                if (service.children && service.children.length > 0) {
                                                    const found = findServiceInTree(service.children, id);
                                                    if (found) return found;
                                                }
                                            }
                                            return null;
                                        };

                                        // Group services theo parent
                                        const selectedServices = pendingAppointmentData._processedServiceIds || [];
                                        if (selectedServices.length === 0) {
                                            return <p className="text-gray-500 italic">Chưa có dịch vụ nào được chọn</p>;
                                        }

                                        // Tìm các parent services có children được chọn
                                        const parentServices = new Map();
                                        const orphanServices: any[] = [];

                                        selectedServices.forEach((serviceId: string) => {
                                            const service = findServiceInTree(serviceTypes, serviceId);
                                            if (!service) return;

                                            // Nếu service này là child (có parentId), tìm parent
                                            if (service.parentId) {
                                                const parent = findServiceInTree(serviceTypes, service.parentId);
                                                if (parent) {
                                                    if (!parentServices.has(parent.serviceTypeId)) {
                                                        parentServices.set(parent.serviceTypeId, {
                                                            parent: parent,
                                                            children: []
                                                        });
                                                    }
                                                    parentServices.get(parent.serviceTypeId).children.push(service);
                                                } else {
                                                    orphanServices.push(service);
                                                }
                                            } else {
                                                // Nếu là parent, kiểm tra xem có children nào được chọn không
                                                const selectedChildren = selectedServices
                                                    .map((id: string) => findServiceInTree(serviceTypes, id))
                                                    .filter((s: any) => s && s.parentId === service.serviceTypeId);

                                                if (selectedChildren.length > 0) {
                                                    parentServices.set(service.serviceTypeId, {
                                                        parent: service,
                                                        children: selectedChildren
                                                    });
                                                } else {
                                                    orphanServices.push(service);
                                                }
                                            }
                                        });

                                        let index = 0;

                                        return (
                                            <>
                                                {/* Render parent services với children của chúng */}
                                                {Array.from(parentServices.values()).map((group: any) => {
                                                    const parentIndex = index++;
                                                    return (
                                                        <div key={group.parent.serviceTypeId} className="space-y-2">
                                                            {/* Parent Service */}
                                                            <div className="flex items-start gap-2 bg-blue-50 p-3 rounded border-l-4 border-blue-600">
                                                                <span className="font-bold text-blue-700">{parentIndex + 1}.</span>
                                                                <div className="flex-1">
                                                                    <p className="font-bold text-blue-800">{group.parent.serviceName}</p>
                                                                    {group.parent.estimatedDurationMinutes && (
                                                                        <p className="text-xs text-blue-600 mt-1">
                                                                            Thời gian ước tính: {group.parent.estimatedDurationMinutes} phút
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Children Services */}
                                                            {group.children.map((childService: any, childIndex: number) => (
                                                                <div key={childService.serviceTypeId} className="flex items-start gap-2 bg-white p-3 rounded border-l-4 border-green-400 ml-6">
                                                                    <span className="font-semibold text-green-600">{parentIndex + 1}.{childIndex + 1}</span>
                                                                    <div>
                                                                        <p className="font-medium">{childService.serviceName}</p>
                                                                        {childService.estimatedDurationMinutes && (
                                                                            <p className="text-sm text-gray-600">
                                                                                Thời gian ước tính: {childService.estimatedDurationMinutes} phút
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    );
                                                })}

                                                {/* Render orphan services (không có parent hoặc children) */}
                                                {orphanServices.map((service: any) => {
                                                    const currentIndex = index++;
                                                    return (
                                                        <div key={service.serviceTypeId} className="flex items-start gap-2 bg-white p-3 rounded border-l-4 border-blue-500">
                                                            <span className="font-semibold text-blue-600">{currentIndex + 1}.</span>
                                                            <div>
                                                                <p className="font-medium">{service.serviceName}</p>
                                                                {service.estimatedDurationMinutes && (
                                                                    <p className="text-sm text-gray-600">
                                                                        Thời gian ước tính: {service.estimatedDurationMinutes} phút
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>

                            {/* Thông tin cuộc hẹn */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-lg mb-3 text-blue-700">Thông tin cuộc hẹn</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <span className="text-gray-600">Thời gian hẹn:</span>
                                        <p className="font-medium">
                                            {pendingAppointmentData._formValues.dateTime ? (
                                                isDayjs(pendingAppointmentData._formValues.dateTime)
                                                    ? (pendingAppointmentData._formValues.dateTime as Dayjs).format("DD/MM/YYYY HH:mm")
                                                    : dayjs(pendingAppointmentData._formattedDate).format("DD/MM/YYYY HH:mm")
                                            ) : 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Loại hình dịch vụ:</span>
                                        <p className="font-medium">
                                            {pendingAppointmentData.serviceMode === 'STATIONARY' ? 'Tại cửa hàng' : 'Dịch vụ lưu động'}
                                        </p>
                                    </div>
                                    {pendingAppointmentData.userAddress && (
                                        <div className="col-span-2">
                                            <span className="text-gray-600">Địa chỉ:</span>
                                            <p className="font-medium">{pendingAppointmentData.userAddress}</p>
                                        </div>
                                    )}
                                    {pendingAppointmentData.notes && (
                                        <div className="col-span-2">
                                            <span className="text-gray-600">Ghi chú:</span>
                                            <p className="font-medium">{pendingAppointmentData.notes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Giá tạm tính */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-300 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-semibold text-lg mb-1 text-blue-800">Giá tạm tính</h4>
                                        <p className="text-sm text-gray-600">Tổng giá trị phụ tùng ước tính</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-3xl font-bold text-blue-700">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pendingAppointmentData._quotePrice || 0)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Thông báo */}
                            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
                                <p className="text-yellow-900">
                                    <strong>Lưu ý:</strong> Giá cuối cùng có thể thay đổi sau khi kỹ thuật viên kiểm tra xe thực tế.
                                </p>
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
        </>
    );
};
