import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import { userService } from "../service/userService";
import type {
  UserResponse,
  CreationUserRequest,
  UpdationUserRequest,
  UserSearchParams
} from "../types/user.types";

export const useUser = () => {
  const [list, setList] = useState<UserResponse[]>([]);
  const [detail, setDetail] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Danh sách user options cho dropdown (fullName hoặc username)
  const [userOptions, setUserOptions] = useState<Array<{ value: string; label: string }>>([]);

  // Search/List with pagination
  const search = useCallback(async (params: UserSearchParams) => {
    setLoading(true);
    try {
      const response = await userService.search(params);
      if (response?.success) {
        const data = response.data;
        setList(data.data);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      } else {
        toast.error(response?.message || "Không thể tải danh sách người dùng!");
        setList([]);
      }
    } catch (error: any) {
      console.error('User search error:', error);
      toast.error(error?.response?.data?.message || "Không thể tải danh sách người dùng!");
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user options for dropdown (lấy tất cả user, không phân trang)
  const fetchUserOptions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await userService.search({ page: 0, pageSize: 1000 }); // Lấy nhiều để có đủ cho dropdown
      if (response?.success) {
        const users = response.data.data;
        const options = users.map((user: UserResponse) => ({
          value: user.userId,
          label: user.fullName || user.username || user.email
        }));
        setUserOptions(options);
        return options;
      }
      return [];
    } catch (error: any) {
      console.error('Fetch user options error:', error);
      toast.error("Không thể tải danh sách người dùng!");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user options by role for dropdown
  const fetchUserOptionsByRole = useCallback(async (roleName: string) => {
    setLoading(true);
    try {
      const users = await userService.getUsersByRole(roleName);
      const options = users.map((user: UserResponse) => ({
        value: user.userId,
        label: user.fullName || user.username || user.email
      }));
      return options;
    } catch (error: any) {
      console.error('Fetch user options by role error:', error);
      toast.error(`Không thể tải danh sách ${roleName}!`);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get by ID
  const getById = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      const data = await userService.getById(userId);
      setDetail(data);
      return data;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể tải thông tin người dùng!");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new user
  const create = useCallback(async (data: CreationUserRequest) => {
    setLoading(true);
    try {
      const success = await userService.create(data);
      if (success) {
        toast.success("Tạo người dùng thành công!");
      }
      return success;
    } catch (error: any) {
      console.error('Create user error:', error);
      toast.error(error?.response?.data?.message || "Không thể tạo người dùng!");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update user
  const update = useCallback(async (userId: string, data: UpdationUserRequest) => {
    setLoading(true);
    try {
      const success = await userService.update(userId, data);
      if (success) {
        toast.success("Cập nhật người dùng thành công!");
      }
      return success;
    } catch (error: any) {
      console.error('Update user error:', error);
      toast.error(error?.response?.data?.message || "Không thể cập nhật người dùng!");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete (soft delete)
  const remove = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      const success = await userService.remove(userId);
      if (success) {
        toast.success("Xóa người dùng thành công!");
      }
      return success;
    } catch (error: any) {
      console.error('Delete user error:', error);
      toast.error(error?.response?.data?.message || "Không thể xóa người dùng!");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Restore deleted user
  const restore = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      const success = await userService.restore(userId);
      if (success) {
        toast.success("Khôi phục người dùng thành công!");
      }
      return success;
    } catch (error: any) {
      console.error('Restore user error:', error);
      toast.error(error?.response?.data?.message || "Không thể khôi phục người dùng!");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Search user by email/username/phone
  const searchUserProfile = useCallback(async (userInformation: string) => {
    setLoading(true);
    try {
      const data = await userService.getUserProfile(userInformation);
      setDetail(data);
      return data;
    } catch (error: any) {
      console.error('Search user profile error:', error);
      // Không hiển thị toast, để UI tự xử lý (user không tìm thấy là trường hợp bình thường)
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    list,
    detail,
    loading,
    totalPages,
    totalElements,
    userOptions,
    search,
    fetchUserOptions,
    fetchUserOptionsByRole,
    searchUserProfile,
    getById,
    create,
    update,
    remove,
    restore,
  };
};

