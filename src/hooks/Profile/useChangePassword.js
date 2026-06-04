import { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import { useDispatch } from 'react-redux';
import { AxiosError } from 'axios'; // Import AxiosError để kiểm tra loại lỗi
import { loginSuccess } from '../../redux/slices/authSlice';

export const useChangePassword = () => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Auto-clear success message sau 3 giây
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                setSuccess(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    // Auto-clear error message sau 5 giây
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    // ĐỒNG BỘ: Ép nhận vào 1 Object chứa 2 thuộc tính (Destructuring)
    const changePassword = async ({ currentPassword, newPassword }) => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        // Kiểm tra phòng thủ đề phòng người dùng bấm Cancel ở prompt
        if (!currentPassword || !newPassword) {
            setError("Mật khẩu hiện tại và mật khẩu mới không được để trống.");
            setLoading(false);
            return false;
        }

        try {
            const cleanCurrentPassword = String(currentPassword).trim();
            const cleanNewPassword = String(newPassword).trim();

            // Đóng gói payload chuẩn theo đúng cấu trúc Request JSON của bạn
            const payload = {
                currentPassword: cleanCurrentPassword,
                newPassword: cleanNewPassword
            };

            console.log("[useChangePassword] Gửi payload:", { currentPassword: '***', newPassword: '***' });

            // Gọi API đổi mật khẩu
            const response = await authService.changePassword(payload);
            
            console.log("[useChangePassword] Full Response:", JSON.stringify(response, null, 2));

            // Bóc tách dữ liệu linh hoạt (Bất kể axiosClient có interceptor hay chưa)
            const beData = response?.errorCode !== undefined ? response : response?.data;

            console.log("[useChangePassword] beData:", JSON.stringify(beData, null, 2));
            console.log("[useChangePassword] errorCode:", beData?.errorCode, "statusCode:", beData?.statusCode);

            if (!beData) {
                throw new Error("Không nhận được phản hồi hợp lệ từ máy chủ.");
            }

            // ✅ FIX: Kiểm tra theo các trường hợp có thể xảy ra
            // Case 1: errorCode = 1 (success)
            // Case 2: code = 0 (success)
            // Case 3: Có accessToken mới trong data (thành công)
            // LOẠI BỎ: Không dùng statusCode === 200 làm điều kiện thành công cho logic nghiệp vụ.
            const isSuccess = beData.errorCode === 1 || beData.errorCode === "1" ||
                            beData.code === 0 || beData.code === "0" ||
                            (beData.data?.accessToken);

            if (isSuccess) {
                const newToken = beData.data?.accessToken;
                const newRefreshToken = beData.data?.refreshToken;

                console.log("[useChangePassword] Success! Token:", newToken ? '***' : 'null', "RefreshToken:", newRefreshToken ? '***' : 'null');

                if (newToken) {
                    // Cập nhật cả accessToken và refreshToken mới đè lên bộ nhớ
                    localStorage.setItem('accessToken', newToken);
                    if (newRefreshToken) {
                        localStorage.setItem('refreshToken', newRefreshToken);
                    }
                    
                    // Giữ user cũ từ localStorage (không gọi API fetch user vì endpoint có thể không tồn tại)
                    const savedUserInfo = localStorage.getItem('userInfo');
                    const currentUser = savedUserInfo ? JSON.parse(savedUserInfo) : null;
                    
                    dispatch(loginSuccess({ token: newToken, user: currentUser }));
                }

                setSuccess(beData.message || "Đổi mật khẩu thành công!");
                return true;
            } else {
                console.error("[useChangePassword] Fail - errorCode:", beData.errorCode, "message:", beData.message);
                throw new Error(beData.message || "Không thể cập nhật mật khẩu mới.");
            }
        } catch (err) {
            // Log chi tiết error từ backend
            console.error("[useChangePassword/Error] Full error object:", err);
            console.error("[useChangePassword/Error] Response status:", err.response?.status);
            console.error("[useChangePassword/Error] Response data:", err.response?.data);
            console.error("[useChangePassword/Error] Error message:", err.message, "Code:", err.code);
            
            let apiMessage = "Quá trình đổi mật khẩu gặp lỗi.";
            if (err instanceof AxiosError && err.code === AxiosError.ERR_CANCELED) {
                apiMessage = "Thao tác bị hủy. Có thể phiên đăng nhập đã hết hạn.";
            } else {
                apiMessage = err.response?.data?.message || err.message || apiMessage;
            }
            console.error("[useChangePassword/Error] Final message:", apiMessage);
            setError(apiMessage);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { loading, error, success, changePassword, setError, setSuccess };
};