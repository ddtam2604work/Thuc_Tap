import FormInput from '../../../skeleton/FormInput';

const AccountFormInput = ({ label, required, id, ...props }) => {
  return (
    // 🛠️ ĐỒNG BỘ UI: Chuyển gap về gap-1.5 chuẩn theo form mẫu khách hàng
    <div className="w-full flex flex-col items-start gap-1.5">
      
      {/* 🛠️ ĐỒNG BỘ UI: Đổi label từ UPPERCASE thô cứng sang dạng text-xs font-semibold text-gray-700 */}
      {label && (
        <label 
          htmlFor={id} 
          className="font-inter font-semibold text-xs text-gray-700"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      {/* 🛠️ ĐỒNG BỘ UI: Bo góc rounded-xl, cao h-10, nền gray-50/30 và bóng mờ shadow-3xs chuẩn mẫu */}
      <FormInput
        id={id}
        className="h-10 border border-gray-200 rounded-xl text-sm bg-gray-50/30 text-[#191C1D] 
                   placeholder-[#C4C5D7] focus:outline-none focus:border-[#0037B0] focus:bg-white transition-all shadow-3xs"
        {...props}
      />
    </div>
  );
};

export default AccountFormInput;