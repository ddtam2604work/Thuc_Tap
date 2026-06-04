import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { authService } from '../../services/authService';
import { setUserInfo } from '../../redux/slices/authSlice';

export const useProfile = (currentUser) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const updateProfile = async (profileData) => {
        setLoading(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            // Dựa trên phân tích, API yêu cầu 'fullname'
            const updatePayload = {
                fullname: profileData.fullName,
                email: profileData.email,
                phone: profileData.phone,
            };

            await authService.updateProfile(updatePayload);

            // Cập nhật lại Redux store để UI đồng bộ ngay lập tức
            const updatedUser = { ...currentUser, ...updatePayload };
            dispatch(setUserInfo(updatedUser));

            setSuccessMessage('Cập nhật thông tin hồ sơ thành công!');
            return true; // Báo hiệu thành công để Page xử lý UI
        } catch (error) {
            const apiError = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật hồ sơ.';
            setErrorMessage(apiError);
            return false; // Báo hiệu thất bại
        } finally {
            setLoading(false);
        }
    };

    return { loading, errorMessage, successMessage, updateProfile };
};