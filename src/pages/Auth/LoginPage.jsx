import FormInput from '../../components/FormInput';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../hooks/useAuth';
import { LOGIN_TEXT } from '../../constants/login';
import Background_Login from '../../assets/images/background_login.png';

const LoginPage = () => {
  const { username, password, handleUsernameChange, handlePasswordChange, handleLogin } = useAuth();

  return (
    <div className="relative flex items-center justify-center min-h-screen py-[45.5px] px-4 isolate">
      {/* Background & Overlay (Html -> Body Section) */}
      <div className="absolute inset-0 bg-[#111827] -z-20" />
      <div 
        className="absolute inset-0 bg-cover bg-center -z-10 opacity-60" 
        style={{ backgroundImage: `url(${Background_Login})` }} 
      />
      <div className="absolute inset-0 bg-black/40 -z-10" />

      {/* Main - Login Container */}
      <main className="relative flex flex-col items-start p-12 gap-8 w-full max-w-120 
                       bg-white/95 backdrop-blur-sm rounded-[32px] shadow-2xl 
                       z-10 font-inter animate-in fade-in zoom-in duration-500">
        
        {/* Header Section */}
        <header className="flex flex-col items-start gap-2 w-full">
          <h1 className="text-[32px] leading-10 font-bold text-black">
            {LOGIN_TEXT.TITLE}
          </h1>
          <p className="text-[20px] leading-7.5 font-normal text-black">
            {LOGIN_TEXT.SUBTITLE}
          </p>
        </header>

        {/* Form Section */}
        <form onSubmit={handleLogin} className="flex flex-col items-start gap-6 w-full pb-4">
          {/* Input Group */}
          <div className="flex flex-col gap-4 w-full">
            <FormInput
              placeholder={LOGIN_TEXT.USERNAME_PLACEHOLDER}
              value={username}
              onChange={handleUsernameChange}
            />
            <FormInput
              type="password"
              placeholder={LOGIN_TEXT.PASSWORD_PLACEHOLDER}
              value={password}
              onChange={handlePasswordChange}
            />
          </div>

          {/* Forgot Password Link */}
          <div className="w-full">
            <a href="#" className="text-[14px] leading-5.25 text-[#1F2937] hover:underline">
              {LOGIN_TEXT.FORGOT_PASSWORD}
            </a>
          </div>

          {/* Submit Button Section */}
          <div className="w-full pt-2">
            <PrimaryButton>{LOGIN_TEXT.LOGIN_BUTTON}</PrimaryButton>
          </div>
        </form>
      </main>
    </div>
  );
};

export default LoginPage;