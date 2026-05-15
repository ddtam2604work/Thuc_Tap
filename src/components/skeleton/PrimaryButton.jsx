import { twMerge } from 'tailwind-merge';

const PrimaryButton = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', // Thêm variant để dùng cho nhiều loại nút
  className = '', 
  ...props 
}) => {
  // Styles nền tảng đảm bảo sự cân đối và hiệu ứng
  const baseStyles = "h-11 flex items-center justify-center gap-2 px-6 rounded-[8px] " +
                     "font-semibold text-[14px] leading-6 font-inter transition-all duration-200 " +
                     "active:scale-[0.95] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap";

  // Định nghĩa các biến thể màu sắc
  const variants = {
    primary: "bg-[#0037B0] text-white shadow-md hover:bg-blue-700 hover:shadow-lg",
    secondary: "bg-[#F3F4F6] text-[#434655] hover:bg-gray-200",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={twMerge(baseStyles, variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
};

export default PrimaryButton;