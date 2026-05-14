// Button chính màu xanh, style cơ bản

const PrimaryButton = ({ children, onClick, type = 'submit' }) => {
    return (
        <button
            type={type}
            onClick={onClick}
            className="w-full h-14 flex items-center justify-center bg-[#0014FF] rounded-[12px] 
                 text-white font-semibold text-[16px] leading-6 font-inter
                 shadow-md hover:shadow-lg hover:bg-blue-700 active:scale-[0.98] 
                 transition-all duration-200"
            >
            {children}
        </button>
    );
};

export default PrimaryButton;