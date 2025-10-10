import { createContext, useState, useEffect } from 'react';
import { apiClient } from '../service/api.ts';

// Định nghĩa type cho user
type User = {
    userId: string,
    username: string,
    email: string,
    numberPhone: string,
    isDeleted: boolean,
    active: boolean,
} | null;

// Định nghĩa type cho context
type AuthContextType = {
    user: User;
    setUser: (user: User) => void;
    isLoading: boolean;
    refreshUser: () => Promise<void>;

    //   logout: () => void;
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
            const response = await apiClient.post('/auth/user/token', { token: token });
            setUser(response?.data?.success ? response.data.data : null);
        } catch {
            setUser(null);
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