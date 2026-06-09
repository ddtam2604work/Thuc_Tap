import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { loginSuccess, logout as logoutAction } from '../../redux/slices/authSlice';
import { getUserRoleFromToken } from '../../utils/auth';

export const useAuth = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    // Đóng gói State quản lý dữ liệu input nội bộ
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Hàm helper thay đổi dữ liệu và tự động xóa thông báo lỗi cũ
   
    const handleUsernameChange = (e) => {
        // Nếu e là Event Object thì lấy e.target.value, nếu e là chuỗi thuần túy (custom input) thì lấy luôn e
        const val = e?.target ? e.target.value : e;
        setUsername(val);
        if (errorMessage) setErrorMessage(null);
    };

    const handlePasswordChange = (e) => {
        // Nếu e là Event Object thì lấy e.target.value, nếu e là chuỗi thuần túy (custom input) thì lấy luôn e
        const val = e?.target ? e.target.value : e;
        setPassword(val);
        if (errorMessage) setErrorMessage(null);
    };

    const extractApiData = (response) => {
        if (!response) return null;
        return response.errorCode !== undefined ? response : response.data;
    };

    const handleLogin = async (e) => {
        if (e && e.preventDefault) e.preventDefault(); // Chặn reload trang chủ động
        
        setErrorMessage(null);
        setSuccessMessage(null);
        setLoading(true);

        try {
            // Đọc trực tiếp chuỗi thuần túy từ state nội bộ của hook gửi lên Server
            const rawResponse = await authService.login({ username, password });
            const beData = extractApiData(rawResponse);

            const payload = beData?.data || beData || {};
            const token = payload.accessToken || beData?.accessToken;
            const rToken = payload.refreshToken || beData?.refreshToken;
            const userInfo = payload.user || payload.userInfo || payload;

            if (!token) {
                throw new Error(beData?.message || 'Không nhận được Token xác thực từ hệ thống.');
            }

            // Lưu trữ cặp token đồng bộ phục vụ cơ chế vòng lặp gói đầu (Silent Refresh)
            localStorage.setItem('accessToken', token);
            if (rToken) localStorage.setItem('refreshToken', rToken);
            if (userInfo) localStorage.setItem('userInfo', JSON.stringify(userInfo));
            
            // Cập nhật Redux Global State
            dispatch(loginSuccess({ token, user: userInfo }));
            
            setSuccessMessage('Đăng nhập thành công! Đang chuyển hướng...');

            // Delay nhẹ 1 giây tại đây để người dùng kịp trải nghiệm UI thông báo xanh lá mượt mà
            setTimeout(() => {
                const role = getUserRoleFromToken();
                if (role === 'customer') {
                    navigate('/chat', { replace: true });
                } else {
                    navigate('/home', { replace: true });
                }
            }, 1000);

            return true;
        } catch (err) {
            const apiError = err.response?.data?.message || err.message || 'Tên đăng nhập hoặc mật khẩu không đúng.';
            console.error('[useAuth/handleLogin] Error:', apiError);
            setErrorMessage(apiError);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            // 1. Gọi API đăng xuất để xóa session/token trên Server (Nếu có)
            if (authService.logout) {
                await authService.logout();
            }
        } catch (err) {
            console.error('Lỗi gọi API đăng xuất phía Server:', err);
        } finally {
            // 2. XÓA SẠCH SẼ TOÀN BỘ STORAGE (Triệt tiêu token cũ)
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userInfo');
            localStorage.clear(); // Khóa an toàn bổ sung
            
            // 3. Reset Redux State về trạng thái ban đầu
            dispatch(logoutAction());
            
            // 4. Xóa trắng dữ liệu input trên form login để chặn trình duyệt tự điền pass cũ
            setUsername('');
            setPassword('');
            setErrorMessage(null);
            setSuccessMessage(null);

            // 5. Đẩy về trang đăng nhập và ép buộc tải lại trang (Force Reload) 
            // Bước này cực kỳ quan trọng để dọn sạch bộ nhớ tạm (Memory Cache) của Axios Client
            window.location.href = '/login';
        }
    };

    return {
        username,
        password,
        loading,
        errorMessage,
        successMessage,
        handleUsernameChange,
        handlePasswordChange,
        handleLogin,
        logout
    };
};