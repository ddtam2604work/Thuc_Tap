import React, { useState } from 'react';
import FormInput from '../../components/skeleton/FormInput';
import Button from '../../components/skeleton/Button';
import { useAuth } from '../../hooks/Login/useAuth';
import { LOGIN_TEXT } from '../../constants/login';
import Background_Login from '../../assets/images/background_login.png';

const LoginPage = () => {
  const { 
    username, 
    password, 
    errorMessage, 
    successMessage, 
    loading, 
    handleUsernameChange, 
    handlePasswordChange, 
    handleLogin 
  } = useAuth();

  const [showPassword, setShowPassword] = useState(false);

  // 🎯 KIỂM SOÁT LUỒNG ĐĂNG NHẬP Ở TẦNG GIAO DIỆN (INTERCEPTOR FORM SUBMIT)
  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();

    // Kịch bản 1: Nếu chưa nhập tài khoản -> Focus vào ô username
    if (!username || !username.trim()) {
      const usernameField = document.querySelector('input[name="username"]');
      if (usernameField) usernameField.focus();
      return; 
    }

    // Kịch bản 2: Nếu chưa nhập mật khẩu -> Focus vào ô password
    if (!password || !password.trim()) {
      const passwordField = document.querySelector('input[name="password"]');
      if (passwordField) passwordField.focus();
      return; 
    }

    // Kịch bản 3: Đã điền đầy đủ -> Thực thi luồng gọi API login
    handleLogin(e);
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen py-[45.5px] px-4 isolate">
      <style>{`
        input::-ms-reveal, input::-ms-clear { display: none !important; }
      `}</style>

      <div className="absolute inset-0 bg-[#111827] -z-20" />
      <div 
        className="absolute inset-0 bg-cover bg-center -z-10 opacity-60" 
        style={{ backgroundImage: `url(${Background_Login})` }} 
      />
      <div className="absolute inset-0 bg-black/40 -z-10" />

      <main className="relative flex flex-col items-start p-12 gap-8 w-full max-w-[480px] 
                       bg-white/95 backdrop-blur-sm rounded-[32px] shadow-2xl 
                       z-10 font-inter animate-in fade-in zoom-in duration-500">
        
        <header className="flex flex-col items-start gap-2 w-full">
          <h1 className="text-[32px] leading-10 font-bold text-black">
            {LOGIN_TEXT.TITLE}
          </h1>
          <p className="text-[20px] leading-[30px] font-normal text-gray-600">
            {LOGIN_TEXT.SUBTITLE}
          </p>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col items-start gap-6 w-full pb-4">
          
          {errorMessage && (
            <div className="w-full p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg animate-in fade-in duration-200">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="w-full p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg font-medium animate-in fade-in duration-200">
              {successMessage}
            </div>
          )}

          <div className="flex flex-col gap-4 w-full">
            {/* 🎯 BỔ SUNG: name và autoComplete tài khoản */}
            <FormInput
              name="username"
              autoComplete="username"
              type="text"
              placeholder={LOGIN_TEXT.USERNAME_PLACEHOLDER}
              value={username}
              onChange={(e) => handleUsernameChange(e)} 
              disabled={loading}
            />
            
            <div className="relative w-full flex items-center">
              {/* 🎯 BỔ SUNG: name và autoComplete mật khẩu */}
              <FormInput
                name="password"
                autoComplete="current-password"
                type={showPassword ? "text" : "password"}
                placeholder={LOGIN_TEXT.PASSWORD_PLACEHOLDER}
                value={password}
                onChange={(e) => handlePasswordChange(e)} 
                disabled={loading}
              />
              
              {password && password.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-4 text-gray-400 hover:text-gray-600 transition-colors select-none focus:outline-none disabled:opacity-50 z-20"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="w-full pt-2">
            {/* 🎯 ĐIỀU CHỈNH: Gỡ bỏ sự kiện onClick, chỉ giữ type="submit" để form lo phần còn lại */}
            <Button 
              type="submit" 
              disabled={loading}
              className={`w-full ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Đang xử lý...' : LOGIN_TEXT.LOGIN_BUTTON}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default LoginPage;