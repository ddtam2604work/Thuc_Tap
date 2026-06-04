import PropTypes from 'prop-types';

const CustomerInfoCard = ({ customer }) => {
  // 🌟 LỚP PHÒNG THỦ 1: Chặn đứng tình trạng dữ liệu undefined hoặc null gây crash trang
  if (!customer) {
    return (
      <div className="bg-white border border-gray-100 shadow-xs rounded-xl p-5 animate-pulse text-xs text-gray-400">
        🔄 Đang tải thông tin khách hàng...
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 shadow-xs rounded-xl p-5 flex flex-col gap-4 border-l-4 border-l-blue-600">
      <h2 className="text-[13px] font-bold uppercase tracking-wider text-gray-800 flex items-center gap-2">
        <span className="p-1 bg-blue-50 text-blue-600 rounded">👤</span> Thông tin khách hàng
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-y-3.5 gap-x-4 text-[12px]">
        <div>
          <span className="text-gray-400 font-medium block uppercase text-[10px] tracking-wide">Tên khách hàng</span>
          {/* Sử dụng fallback '---' nếu trường dữ liệu bị rỗng */}
          <span className="font-bold text-gray-800 text-[13px]">{customer.name || '---'}</span>
        </div>
        <div>
          <span className="text-gray-400 font-medium block uppercase text-[10px] tracking-wide">Số điện thoại</span>
          <span className="font-semibold text-gray-700">{customer.phone || '---'}</span>
        </div>
        <div>
          <span className="text-gray-400 font-medium block uppercase text-[10px] tracking-wide">Ngày tạo</span>
          <span className="text-gray-600 font-medium">{customer.createdAt || '---'}</span>
        </div>
        <div>
          <span className="text-gray-400 font-medium block uppercase text-[10px] tracking-wide">Nhân viên lập</span>
          <span className="font-semibold text-gray-700">{customer.employee || '---'}</span>
        </div>
        <div className="md:col-span-2">
          <span className="text-gray-400 font-medium block uppercase text-[10px] tracking-wide">Địa chỉ giao hàng</span>
          <span className="text-gray-700 font-medium">{customer.address || '---'}</span>
        </div>
      </div>
    </div>
  );
};

// Nới lỏng kiểm tra shape hoặc cho phép nhận null/undefined tạm thời
CustomerInfoCard.propTypes = {
  customer: PropTypes.shape({
    name: PropTypes.string,
    phone: PropTypes.string,
    createdAt: PropTypes.string,
    employee: PropTypes.string,
    address: PropTypes.string,
  }),
};

export default CustomerInfoCard;