import FormInput from '../../../skeleton/FormInput'; 

const CategoryFormInput = ({ label, required, note, id, isTextarea, isSelect, options, children, className = '', ...props }) => {
  // 🌟 Hệ thống Class chuẩn hóa chung cho toàn bộ các loại ô nhập liệu (Input, Select, Textarea)
  const baseInputStyles = `w-full bg-white border border-gray-200 rounded-xl text-[14px] text-[#191C1D] 
                           placeholder-[#C4C5D7] outline-none focus:border-[#1D4ED8] focus:ring-1 
                           focus:ring-[#1D4ED8]/20 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed`;

  return (
    <div className="w-full flex flex-col items-start gap-[6px]">
      {/* Label chuẩn: 12px, Semibold, Uppercase, màu #434655 */}
      {label && (
        <label 
          htmlFor={id} 
          className="font-inter font-semibold text-[12px] leading-[16px] text-[#434655] tracking-[0.6px] uppercase"
        >
          {label} {required && <span className="text-red-500">*</span>}
          {note && <span className="text-[11px] font-normal text-gray-400 ml-2 lowercase italic">{note}</span>}
        </label>
      )}
      
      {/* Thứ tự ưu tiên render: Children -> Select Dropdown -> Textarea -> FormInput mặc định */}
      {children ? (
        children
      ) : isSelect ? (
        <div className="relative w-full">
          <select
            id={id}
            className={`${baseInputStyles} h-[57px] pl-4 pr-10 cursor-pointer appearance-none ${className}`}
            {...props}
          >
            {options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {/* Mũi tên Chevron thanh mảnh */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
            <svg className="h-4 w-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      ) : isTextarea ? (
        <textarea
          id={id}
          className={`${baseInputStyles} min-h-[100px] p-4 resize-none ${className}`}
          {...props}
        />
      ) : (
        <FormInput
          id={id}
          // Đồng bộ chiều cao h-[46px], bo góc rounded-xl và viền border-gray-200 cho cả ô thường và ô chỉ đọc
          className={`${baseInputStyles} h-[46px] px-4 ${className}`}
          {...props}
        />
      )}
    </div>
  );
};

export default CategoryFormInput;