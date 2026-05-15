import FormInput from '../../../skeleton/FormInput'; //

const CategoryFormInput = ({ label, required, note, id, isTextarea, ...props }) => {
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
      
      {/* Render Textarea hoặc Input tùy theo prop isTextarea */}
      {isTextarea ? (
        <textarea
          id={id}
          className="w-full min-h-[100px] p-3 bg-white border border-[#747686] rounded-[4px] text-[14px] text-[#191C1D] 
                     placeholder-[#C4C5D7] outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8]/20 transition-all resize-none"
          {...props}
        />
      ) : (
        <FormInput
          id={id}
          // Chiều cao h-[42px] và bo góc [4px] đồng bộ với Account
          className="h-[42px] bg-white border-[#747686] rounded-[4px] text-[14px] text-[#191C1D] 
                     placeholder-[#C4C5D7] focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8]/20"
          {...props}
        />
      )}
    </div>
  );
};

export default CategoryFormInput;