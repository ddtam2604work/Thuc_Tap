import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { authService } from '../../services/authService';
import { setUserInfo } from '../../redux/slices/authSlice';

export const useProfile = (currentUser) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Auto-clear success message sau 3 giây
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    // Auto-clear error message sau 5 giây
    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => {
                setErrorMessage(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [errorMessage]);

    const updateProfile = async (profileData) => {
        setLoading(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            const updatePayload = {
                fullname: profileData.fullName,
                email: profileData.email,
                phone: profileData.phone,
            };

            console.log("[useProfile] Gửi updatePayload:", updatePayload);

            const response = await authService.updateProfile(updatePayload);

            console.log("[useProfile] Response:", JSON.stringify(response, null, 2));

            // Cập nhật user theo payload đã gửi (không gọi API fetch user vì endpoint có thể không tồn tại)
            const updatedUser = { ...currentUser, ...updatePayload };
            dispatch(setUserInfo(updatedUser));

            setSuccessMessage('Cập nhật thông tin hồ sơ thành công!');
            return true; // Báo hiệu thành công để Page xử lý UI
        } catch (error) {
            console.error("[useProfile] Error:", error);
            const apiError = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi cập nhật hồ sơ.';
            setErrorMessage(apiError);
            return false; // Báo hiệu thất bại
        } finally {
            setLoading(false);
        }
    };

    return { loading, errorMessage, successMessage, updateProfile };
};