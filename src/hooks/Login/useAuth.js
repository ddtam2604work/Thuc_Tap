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

    // 🎯 LUỒNG XỬ LÝ ĐĂNG NHẬP NÂNG CẤP PHÒNG THỦ ĐA TẦNG
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

            localStorage.setItem('accessToken', token);
            if (rToken) localStorage.setItem('refreshToken', rToken);
            if (userInfo) localStorage.setItem('userInfo', JSON.stringify(userInfo));
            
            dispatch(loginSuccess({ token, user: userInfo }));
            setSuccessMessage('Đăng nhập thành công! Đang chuyển hướng...');

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
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userInfo');
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