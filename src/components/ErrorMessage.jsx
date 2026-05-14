// Thông báo lỗi

const ErrorMessage = ({ message }) => {
    if (!message) return null;

    return (
        <div className="w-full p-2.5 my-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-md text-center">
        {message}
        </div>
    );
};

export default ErrorMessage;