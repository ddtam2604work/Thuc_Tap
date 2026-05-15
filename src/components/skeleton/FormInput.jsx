// Component input dùng chung

const FormInput = ({ id, type, placeholder, value, onChange}) => {
    return (
        <div className="w-full flex flex-col items-start">
        <input
            id={id}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            // border-[#E5E7EB] và rounded-[12px] khớp chính xác CSS
            className="w-full h-14 px-4 bg-gray-50 border border-gray-200 rounded-[12px] text-[15px] 
                   font-inter outline-none transition-all duration-200
                   focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 
                   placeholder-gray-400 text-gray-900"
        />
        </div>
    )
};

export default FormInput;