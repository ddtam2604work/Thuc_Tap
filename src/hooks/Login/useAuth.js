import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { loginSuccess, logout as logoutAction } from '../../redux/slices/authSlice';
import { getUserRoleFromToken } from '../../utils/auth';

export const useAuth = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const handleUsernameChange = (e) => {
        const val = e?.target ? e.target.value : e;
        setUsername(val);
        if (errorMessage) setErrorMessage(null);
    };

    const handlePasswordChange = (e) => {
        const val = e?.target ? e.target.value : e;
        setPassword(val);
        if (errorMessage) setErrorMessage(null);
    };

    // 🎯 LUỒNG XỬ LÝ ĐĂNG NHẬP NÂNG CẤP PHÒNG THỦ ĐA TẦNG & TRÍCH XUẤT ROLE
    const handleLogin = async (e) => {
        if (e && e.preventDefault) e.preventDefault(); 
        
        setErrorMessage(null);
        setSuccessMessage(null);
        
        const trimmedUsername = username.trim();
        if (!trimmedUsername || !password) {
            setErrorMessage('Vui lòng nhập đầy đủ số điện thoại và mật khẩu.');
            return false;
        }

        try {
            setLoading(true);
            const rawResponse = await authService.login({ username: trimmedUsername, password });
            
            const token = rawResponse?.accessToken || rawResponse?.data?.accessToken || rawResponse?.token || rawResponse?.data?.token;
            const rToken = rawResponse?.refreshToken || rawResponse?.data?.refreshToken;
            
            const rootData = rawResponse?.data || rawResponse || {};
            const userInfo = rawResponse?.user || rawResponse?.data?.user || rawResponse?.userInfo || rawResponse?.data?.userInfo || rootData;

            if (!token) {
                throw new Error(rawResponse?.message || rawResponse?.msg || 'Không nhận được Token xác thực hợp lệ từ hệ thống.');
            }

            // ==========================================
            // LÕI XỬ LÝ QUYỀN (ROLE EXTRACTION)
            // ==========================================
            let extractedRole = null;
            
            // Lấy role từ mảng roles (dựa theo cấu trúc JSON backend trả về)
            if (userInfo?.roles && Array.isArray(userInfo.roles) && userInfo.roles.length > 0) {
                extractedRole = userInfo.roles[0].code; // Kết quả ví dụ: "ADMIN"
            } 
            // Fallback: nếu Backend trả về dạng chuỗi role đơn lẻ
            else if (userInfo?.role) {
                extractedRole = userInfo.role;
            }

            // ==========================================
            // LƯU TRỮ VÀO BỘ NHỚ TRÌNH DUYỆT
            // ==========================================
            localStorage.setItem('accessToken', token);
            if (rToken) localStorage.setItem('refreshToken', rToken);
            if (userInfo) localStorage.setItem('userInfo', JSON.stringify(userInfo));
            
            // LƯU ROLE TRỰC TIẾP (Ép kiểu về string an toàn)
            if (extractedRole) {
                localStorage.setItem('userRole', String(extractedRole));
            } else {
                // Fallback an toàn nếu không tìm thấy quyền, mặc định cho làm customer
                localStorage.setItem('userRole', 'customer'); 
            }
            
            dispatch(loginSuccess({ token, user: userInfo }));
            setSuccessMessage('Đăng nhập thành công! Đang chuyển hướng...');

            // Điều hướng dựa trên quyền vừa lưu
            setTimeout(() => {
                // Đọc lại từ hàm tiện ích (Lúc này hàm getUserRoleFromToken phải đọc từ localStorage('userRole'))
                const currentRole = (getUserRoleFromToken() || '').toLowerCase();
                
                if (currentRole === 'customer') {
                    navigate('/chat', { replace: true });
                } else {
                    navigate('/dashboard', { replace: true });
                }
            }, 1000);

            return true;
        } catch (err) {
            console.error('[useAuth/handleLogin] Error:', err);
            const apiError = err?.message || err?.msg || err?.response?.data?.message || 'Số điện thoại hoặc mật khẩu không chính xác.';
            setErrorMessage(apiError);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            if (authService.logout) {
                await authService.logout();
            }
        } catch (err) {
            console.error('Lỗi gọi API đăng xuất phía Server:', err);
        } finally {
            // Dọn dẹp TOÀN BỘ rác trong LocalStorage
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userInfo');
            localStorage.removeItem('userRole'); // <--- QUAN TRỌNG: Xóa Role
            localStorage.clear(); 
            
            dispatch(logoutAction());
            
            setUsername('');
            setPassword('');
            setErrorMessage(null);
            setSuccessMessage(null);

            window.location.href = '/login';
        }
    };

    return {
        username, password, loading, errorMessage, successMessage,
        handleUsernameChange, handlePasswordChange, handleLogin, logout
    };
};