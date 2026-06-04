import React from 'react';
import FormInput from '../../components/skeleton/FormInput';
import Button from '../../components/skeleton/Button';
import { useAuth } from '../../hooks/Login/useAuth';
import { LOGIN_TEXT } from '../../constants/login';
import Background_Login from '../../assets/images/background_login.png';

const LoginPage = () => {
  // Lấy toàn bộ trạng thái dữ liệu đầu vào chuẩn hóa từ useAuth
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

  return (
    <div className="relative flex items-center justify-center min-h-screen py-[45.5px] px-4 isolate">
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

        {/* Form kích hoạt hàm đăng nhập tự động binding dữ liệu */}
        <form onSubmit={handleLogin} className="flex flex-col items-start gap-6 w-full pb-4">
          
          {/* Thông báo lỗi đỏ */}
          {errorMessage && (
            <div className="w-full p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {errorMessage}
            </div>
          )}

          {/* Thông báo thành công xanh */}
          {successMessage && (
            <div className="w-full p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg font-medium">
              {successMessage}
            </div>
          )}

          <div className="flex flex-col gap-4 w-full">
            <FormInput
              type="text"
              placeholder={LOGIN_TEXT.USERNAME_PLACEHOLDER}
              value={username}
              // Ép nhận dữ liệu trực tiếp từ thuộc tính e.target.value
              onChange={(e) => handleUsernameChange(e)} 
              disabled={loading}
            />
            <FormInput
              type="password"
              placeholder={LOGIN_TEXT.PASSWORD_PLACEHOLDER}
              value={password}
              // Ép nhận dữ liệu trực tiếp từ thuộc tính e.target.value
              onChange={(e) => handlePasswordChange(e)} 
              disabled={loading}
            />
          </div>

          <div className="w-full">
            <a href="#" className="text-[14px] leading-[21px] text-[#1F2937] hover:text-blue-600 hover:underline transition-colors">
              {LOGIN_TEXT.FORGOT_PASSWORD}
            </a>
          </div>

          <div className="w-full pt-2">
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