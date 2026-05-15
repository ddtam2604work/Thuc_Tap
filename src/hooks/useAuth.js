// Logic xử lý input, state và validate đăng nhập
import { useState } from 'react';
import { LOGIN_TEXT } from '../constants/login';

export const useAuth = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errormessage, setErrorMessage] = useState('null');

    const handleUsernameChange = (e) => {
        setUsername(e.target.value);
        if(errormessage) setErrorMessage('null'); //xóa error khi nhập lại
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        if(errormessage) setErrorMessage('null'); //xóa error khi nhập lại
    };

    const handleLogin = (e) => {
        e.preventDefault();
        setErrorMessage('null'); //xóa error khi submit lại

        // Nên gọi API backend
        if (username === 'admin' && password === 'admin123') {
            console.log('Đăng nhập thành công!');
        // Xử lý chuyển trang/lưu token vào Store
        } else {
            // Đặt thông báo lỗi từ hằng số
            setErrorMessage(LOGIN_TEXT.INVALID_CREDENTIALS);
            console.error('[hooks/useAuth/handleLogin] Failed: Incorrect username or password');
        }
    };

    return {
        username,
        password,
        errormessage,
        handleUsernameChange,
        handlePasswordChange,
        handleLogin
    };
}