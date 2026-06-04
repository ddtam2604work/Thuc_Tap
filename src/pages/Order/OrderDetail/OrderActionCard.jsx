import PropTypes from 'prop-types';
import Button from '../../../components/skeleton/Button';

const OrderActionCard = ({ 
  status, 
  onConfirm, 
  onReject, 
  onEdit, // ✏️ Nhận đúng prop sự kiện từ cha truyền xuống
  onApprove, 
  onPrint, 
  onCompleteStage, 
  onStartProduction, 
  onHandoverShipping, 
  onCompleteOrder, 
  onCancelInvoice,
  onPrintJobTicket 
}) => {
  
  const currentStatus = status ? status.toUpperCase() : '';
  if (currentStatus === 'CANCELED') return null;

  return (
    <div className="bg-white border border-gray-100 shadow-xs rounded-xl p-5 flex flex-col gap-3.5 transition-all duration-300">
      <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Thao tác nghiệp vụ</h3>
      <div className="flex flex-col gap-2">

        {/* ================= NÚT SỬA 1 & 2: GIAI ĐOẠN LƯU NHÁP / MỚI TẠO ================= */}
        {(currentStatus === 'DRAFT' || currentStatus === 'NEW') && (
          <>
            <Button onClick={onConfirm} className="w-full h-9.5 bg-[#00875A] text-white rounded-lg font-bold text-xs uppercase">✓ Xác nhận đơn</Button>
            <div className="grid grid-cols-2 gap-2">
              {/* ✏️ Đã gán onClick={onEdit} thành công */}
              <Button onClick={onEdit} className="h-9 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold text-xs">✏️ Chỉnh sửa</Button>
              <Button onClick={onReject} className="h-9 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-semibold text-xs">✕ Xóa đơn</Button>
            </div>
            <Button onClick={onPrint} className="w-full h-9 bg-blue-50 text-blue-700 rounded-lg font-semibold text-xs mt-1">🖨️ In hóa đơn khách hàng</Button>
          </>
        )}

        {/* ================= NÚT SỬA 3: GIAI ĐOẠN CHỜ DUYỆT (AWAIT) ================= */}
        {currentStatus === 'AWAIT' && (
          <>
            <Button onClick={onApprove} className="w-full h-9.5 bg-[#1EA854] text-white rounded-lg font-bold text-xs uppercase">✓ Duyệt đơn & Ghi nợ</Button>
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={onCompleteStage} className="h-9 bg-orange-50 text-orange-700 rounded-lg font-semibold text-xs">✕ Từ chối duyệt</Button>
              {/* ✏️ Đã gán onClick={onEdit} thành công */}
              <Button onClick={onEdit} className="h-9 bg-gray-100 text-gray-700 rounded-lg font-semibold text-xs">✏️ Sửa đơn</Button>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <Button onClick={onReject} className="h-9 bg-red-50 text-red-600 rounded-lg font-semibold text-xs">✕ Xóa đơn</Button>
              <Button onClick={onPrint} className="h-9 bg-blue-50 text-blue-700 rounded-lg font-semibold text-xs">🖨️ In hóa đơn</Button>
            </div>
          </>
        )}

        {/* ================= NÚT SỬA 4: GIAI ĐOẠN ĐÃ DUYỆT (CONFIRMED) ================= */}
        {currentStatus === 'CONFIRMED' && (
          <div className="flex flex-col gap-2">
            <Button onClick={onStartProduction} className="w-full h-9.5 bg-blue-600 text-white rounded-lg font-bold text-xs uppercase">⚙ Đưa vào sản xuất</Button>
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={onHandoverShipping} className="h-9 bg-gray-100 text-gray-700 rounded-lg font-semibold text-[11px]">🚚 Bàn giao vận chuyển</Button>
              <Button onClick={onCompleteOrder} className="h-9 bg-emerald-50 text-emerald-700 rounded-lg font-semibold text-[11px]">✓ Hoàn thành đơn</Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {/* ✏️ Đã gán onClick={onEdit} thành công */}
              <Button onClick={onEdit} className="h-9 bg-gray-50 text-gray-600 rounded-lg font-medium text-[11px]">✏️ Chỉnh sửa đơn</Button>
              <Button onClick={onCancelInvoice} className="h-9 bg-black text-white rounded-lg font-semibold text-[11px]">🛇 Hủy đơn hàng</Button>
            </div>
            <div className="grid grid-cols-2 gap-2 border-t pt-2 mt-1 border-gray-100">
              <Button onClick={onPrint} className="h-9 bg-blue-50 text-blue-700 rounded-lg font-medium text-[11px]">🖨️ In HĐ Khách</Button>
              <Button onClick={onPrintJobTicket} className="h-9 bg-purple-50 text-purple-700 rounded-lg font-medium text-[11px]">🖨️ In HĐ Sản xuất</Button>
            </div>
          </div>
        )}

        {/* ================= NÚT SỬA 5: GIAI ĐOẠN BỊ TỪ CHỐI (REJECTED) ================= */}
        {currentStatus === 'REJECTED' && (
          <>
            <Button onClick={onApprove} className="w-full h-9.5 bg-[#1EA854] text-white rounded-lg font-bold text-xs uppercase">✓ Duyệt đơn & Ghi nợ</Button>
            <div className="grid grid-cols-2 gap-2 mt-0.5">
              <Button onClick={onReject} className="h-9 bg-red-50 text-red-600 rounded-lg font-semibold text-xs">✕ Xóa đơn hàng</Button>
              {/* ✏️ Đã gán onClick={onEdit} thành công */}
              <Button onClick={onEdit} className="h-9 bg-gray-100 text-gray-700 rounded-lg font-semibold text-xs">✏️ Chỉnh sửa đơn</Button>
            </div>
          </>
        )}

        {/* ================= NÚT SỬA 6: GIAI ĐOẠN ĐANG SẢN XUẤT (IN_PROGRESS) ================= */}
        {currentStatus === 'IN_PROGRESS' && (
          <div className="flex flex-col gap-2">
            <Button onClick={onHandoverShipping} className="w-full h-9.5 bg-orange-500 text-white rounded-lg font-bold text-xs uppercase">🚚 Bàn giao vận chuyển</Button>
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={onCompleteOrder} className="h-9 bg-emerald-50 text-emerald-700 rounded-lg font-semibold text-[11px]">✓ Hoàn thành đơn</Button>
              <Button onClick={onCancelInvoice} className="h-9 bg-black text-white rounded-lg font-semibold text-[11px]">🛇 Hủy đơn hàng</Button>
            </div>
            {/* ✏️ Đã gán onClick={onEdit} thành công */}
            <Button onClick={onEdit} className="w-full h-9 bg-gray-100 text-gray-700 rounded-lg font-medium text-xs">✏️ Chỉnh sửa đơn</Button>
            <div className="grid grid-cols-2 gap-2 border-t pt-2 mt-1 border-gray-100">
              <Button onClick={onPrint} className="h-9 bg-blue-50 text-blue-700 rounded-lg font-medium text-[11px]">🖨️ In HĐ Khách</Button>
              <Button onClick={onPrintJobTicket} className="h-9 bg-purple-50 text-purple-700 rounded-lg font-medium text-[11px]">🖨️ In HĐ Sản xuất</Button>
            </div>
          </div>
        )}

        {/* ================= CÁC GIAI ĐOẠN KHÓA SỬA THEO KHAI BÁO API (SHIPPING, DONE) ================= */}
        {currentStatus === 'SHIPPING' && (
          <div className="flex flex-col gap-2">
            <Button onClick={onCompleteOrder} className="w-full h-9.5 bg-[#1EA854] text-white rounded-lg font-bold text-xs uppercase">✓ Hoàn thành đơn hàng</Button>
            <Button onClick={onCancelInvoice} className="w-full h-9 bg-black text-white rounded-lg font-semibold text-xs">🛇 Hủy đơn hàng</Button>
            <div className="grid grid-cols-2 gap-2 border-t pt-2 mt-1 border-gray-100">
              <Button onClick={onPrint} className="h-9 bg-blue-50 text-blue-700 rounded-lg font-medium text-[11px]">🖨️ In HĐ Khách</Button>
              <Button onClick={onPrintJobTicket} className="h-9 bg-purple-50 text-purple-700 rounded-lg font-medium text-[11px]">🖨️ In HĐ Sản xuất</Button>
            </div>
          </div>
        )}

        {currentStatus === 'DONE' && (
          <div className="flex flex-col gap-2">
            <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-[11px] text-emerald-800 font-medium mb-1">🎉 Đơn hàng đã được quyết toán doanh thu và lưu kho tĩnh.</div>
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={onPrint} className="h-9 bg-blue-50 text-blue-700 rounded-lg font-medium text-[11px]">🖨️ HĐ Khách</Button>
              <Button onClick={onPrintJobTicket} className="h-9 bg-purple-50 text-purple-700 rounded-lg font-medium text-[11px]">🖨️ HĐ Sản xuất</Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

OrderActionCard.propTypes = {
  status: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired, // Cấu hình ràng buộc chuẩn xác
  onApprove: PropTypes.func.isRequired,
  onPrint: PropTypes.func.isRequired,
  onCompleteStage: PropTypes.func.isRequired,
  onPrintJobTicket: PropTypes.func.isRequired,
  onStartProduction: PropTypes.func.isRequired,
  onHandoverShipping: PropTypes.func.isRequired,
  onCompleteOrder: PropTypes.func.isRequired, 
  onCancelInvoice: PropTypes.func.isRequired,
};

export default OrderActionCard;