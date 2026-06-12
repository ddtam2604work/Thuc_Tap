import PropTypes from 'prop-types';

const OrderFinancialSummary = ({ summary = {}, liability = {} }) => {
  // 🌟 LỚP PHÒNG THỦ TOÀN DIỆN: Ép kiểu dữ liệu an toàn, chống crash khi dữ liệu là null/undefined
  const safeSummary = summary || {};
  const safeItems = safeSummary.items || [];
  const safeLiability = liability || {};

  // Hàm định dạng tiền tệ bọc thêm fallback (val || 0) tránh lỗi hiển thị NaN
  const formatPrice = (val) => new Intl.NumberFormat('en-US').format(val || 0);

  return (
    <div className="w-full flex flex-col gap-4 text-[12px]">
      {/* Khối Tổng kết đơn */}
      <div className="bg-white border border-gray-100 shadow-xs rounded-xl p-5 flex flex-col gap-3">
        <div className="flex justify-between items-baseline border-b border-gray-50 pb-2">
          <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Tổng kết đơn hàng</h3>
          <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-1.5 py-0.2 rounded border">
            {safeSummary.totalFolders || 0} folders
          </span>
        </div>
        
        {/* Khu vực hiển thị danh sách vật tư / items */}
        <div className="flex flex-col gap-2.5 py-1">
          {safeItems.length === 0 ? (
            <div className="text-[11px] text-gray-400 italic text-center py-2 select-none">
              Chưa có thông tin sản phẩm tài chính
            </div>
          ) : (
            safeItems.map((item, idx) => (
              <div key={idx} className="flex justify-between items-baseline text-gray-500 font-medium">
                <span className="truncate max-w-[180px]">
                  {item.name || 'Sản phẩm in'} <strong className="text-gray-400 font-bold">x{item.qty || 0}</strong>
                </span>
                <span className="font-semibold text-gray-700">{formatPrice(item.price)}</span>
              </div>
            ))
          )}
        </div>
        
        <div className="border-t border-gray-100 pt-2.5 flex justify-between items-baseline mt-1">
          <span className="font-bold text-gray-700 text-[11px] uppercase tracking-wide">Tổng cộng</span>
          <span className="text-base font-black text-blue-600 tracking-tight">
            {formatPrice(safeSummary.totalAmount)} đ
          </span>
        </div>
      </div>

      {/* Khối Công nợ khách hàng (Đỏ đậm độc quyền) */}
      <div className="bg-white border border-red-100 shadow-xs rounded-xl overflow-hidden flex flex-col transition-all duration-200 hover:shadow-sm">
        <div className="bg-red-50/40 border-b border-red-100 px-5 py-2.5">
          <h3 className="text-[11px] font-black text-red-700 uppercase tracking-wider flex items-center gap-1">
            ⚠️ Công nợ khách hàng
          </h3>
        </div>
        <div className="p-5 flex flex-col gap-2.5 font-medium text-gray-500">
          <div className="flex justify-between items-center">
            <span>Dư nợ tồn đọng:</span>
            <span className="text-gray-800 font-semibold">{formatPrice(safeLiability.outstanding)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>+ Đơn này:</span>
            <span className="text-gray-800 font-semibold">{formatPrice(safeLiability.currentOrder)}</span>
          </div>
          <div className="border-t border-dashed border-red-100 pt-2.5 flex justify-between items-center mt-1">
            <span className="font-bold text-red-600 text-[11px] uppercase">Dư nợ sau đơn:</span>
            <span className="font-black text-red-600 text-[15px] tracking-tight">
              {formatPrice(safeLiability.postOrderTotal)} đ
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Nới lỏng kiểm tra kiểu dữ liệu để nhận diện an toàn ở mọi trạng thái vòng đời Component
OrderFinancialSummary.propTypes = {
  summary: PropTypes.object,
  liability: PropTypes.object,
};

export default OrderFinancialSummary;