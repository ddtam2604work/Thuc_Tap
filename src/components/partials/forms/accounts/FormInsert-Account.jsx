import FormInput from '../../../skeleton/FormInput';

const AccountFormInput = ({ label, required, id, ...props }) => {
  return (
    <div className="w-full flex flex-col items-start gap-[6px]">
      {/* Label chuẩn theo CSS: 12px, Semibold, Uppercase, màu #434655 */}
      {label && (
        <label 
          htmlFor={id} 
          className="font-inter font-semibold text-[12px] leading-[16px] text-[#434655] tracking-[0.6px] uppercase"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      {/* Sử dụng Skeleton và truyền vào CSS chuyên biệt cho Account Form */}
      <FormInput
        id={id}
        className="h-[42px] bg-white border-[#747686] rounded-[4px] text-[14px] text-[#191C1D] 
                   placeholder-[#C4C5D7] focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8]/20"
        {...props}
      />
    </div>
  );
};

export default AccountFormInput;