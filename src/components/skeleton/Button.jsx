import { twMerge } from 'tailwind-merge';

/**
 * Centralized Button component supporting multiple variants.
 * Single source of truth for all button styles in the application.
 * When button styling needs updates, modify only this file.
 */
const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  ...props
}) => {
  const baseStyles =
    'flex items-center justify-center gap-2 font-semibold font-inter transition-all duration-200 ' +
    'active:scale-[0.95] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap';

  const sizeStyles = {
    sm: 'h-10 px-5 text-[12px]',
    md: 'h-11 px-6 text-[14px] leading-6',
    lg: 'h-12 px-8 text-[16px]',
  };

  const variants = {
    primary:
      'bg-[#0037B0] text-white shadow-md hover:bg-blue-700 hover:shadow-lg rounded-[8px]',
    secondary:
      'bg-[#F3F4F6] text-[#434655] hover:bg-gray-200 rounded-[8px]',
    danger:
      'bg-red-600 text-white hover:bg-red-700 rounded-[8px]',
    text: 'text-blue-600 hover:text-blue-800 font-bold text-[13px] transition-colors',
    'text-danger': 'text-gray-500 hover:text-red-500 font-bold text-[13px] transition-colors',
    'text-ghost': 'text-gray-400 hover:text-gray-600 text-[10px] leading-tight font-medium',
    search:
      'bg-[#2E478A] text-white px-6 h-10 rounded-md text-[12px] font-semibold uppercase tracking-wider hover:bg-[#1e3261] transition-colors',
    ghost:
      'text-gray-400 hover:opacity-60',
    pagination:
      'rounded-md border text-sm font-medium transition-all w-9 h-9',
    feature:
      'bg-blue-50/50 border border-blue-100 rounded-xl text-blue-700 hover:bg-blue-100 h-auto px-5 py-3 transition-all active:scale-[0.98]',
    icon: 
      'flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors p-2',
    'icon-dark': 
      'p-2 hover:bg-gray-100 rounded-full transition-all text-[#434655]',
    outline: 
      'border border-[#747686] rounded-[4px] text-[12px] font-semibold text-[#191C1D] uppercase tracking-[0.6px] hover:bg-gray-100 transition-all',
    'outline-secondary': 
      'bg-white border border-[#C4C5D7] rounded-[2px] text-[12px] font-semibold text-[#585F67] uppercase tracking-[0.6px] hover:bg-gray-50 shadow-sm transition-all',
    fab: 
      'fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-xl bg-[#0037B0] text-white shadow-xl hover:scale-110 transition-all z-50',
  };

  const variantStyle = variants[variant] || variants.primary;
  const sizeStyle = sizeStyles[size] || sizeStyles.md;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={twMerge(baseStyles, sizeStyle, variantStyle, className)}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
