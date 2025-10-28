import { createContext, useState, useEffect } from 'react';
import { apiClient } from '../service/api.ts';
// Định nghĩa type cho user
type User = {
    userId: string,
    username?: string,
    email?: string,
    numberPhone?: string,
    fullName?: string,
    address?: string,
    avatarUrl?: string,
    isActive?: boolean,
    isDeleted?: boolean,
    roleName?: string[],
    isAdmin?: boolean, 
} | null;
// Định nghĩa type cho context
type AuthContextType = {
    user: User;
    setUser: (user: User) => void;
    isLoading: boolean;
    refreshUser: () => Promise<void>;
};
// Tạo context
const AuthContext = createContext<AuthContextType | undefined>(undefined);
// Tạo Provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User>(null);
    const [isLoading, setIsLoading] = useState(true);
    // Hàm refresh user từ API
    const refreshUser = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('access_token');
        if (!token) {
            setUser(null);
            setIsLoading(false);
            return;
        }
        try {
            console.log("Calling /auth/user/token with token:", token.substring(0, 20) + "...");
            const response = await apiClient.post('/auth/user/token', { token: token });
            console.log("User response from BE:", response.data);
            
            if (response?.data?.success && response.data.data) {
                const userData = response.data.data;
                console.log("Mapping user data:", userData);
                
                const mappedUser = {
                    userId: userData.userId || userData.userid || '',
                    username: userData.username || '',
                    email: userData.email || '',
                    numberPhone: userData.numberPhone || '',
                    fullName: userData.fullName || '',
                    address: userData.address || '',
                    avatarUrl: userData.avatarUrl || '',
                    isActive: userData.isActive,
                    isDeleted: userData.isDeleted,
                    roleName: userData.roleName || [],
                    isAdmin: userData.isAdmin || false, 
                };
                console.log("Mapped user:", mappedUser);
                setUser(mappedUser);
            } else {
                console.log("No user data in response");
                setUser(null);
            }
        } catch (error) {
            console.error("Error refreshing user:", error);
            setUser(null);
            // Clear tokens nếu có lỗi
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
        } finally {
            setIsLoading(false);
        }
    };
    // useEffect để refresh khi app khởi động và check F5
    useEffect(() => {
        refreshUser();
    }, []);
    const value = {
        user,
        setUser,
        isLoading,
        refreshUser,
    };
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
// Hook để sử dụng context
export { AuthContext };