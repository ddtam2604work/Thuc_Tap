export const ORDER_STATUS_TABS = [
  { id: 'ALL', label: 'Tất cả' },
  { id: 'DRAFT', label: 'Lưu nháp' },
  { id: 'NEW', label: 'Mới' },
  { id: 'AWAIT', label: 'Chờ duyệt' },
  { id: 'CONFIRMED', label: 'Đã duyệt' },
  { id: 'IN_PROGRESS', label: 'Đang sản xuất' },
  { id: 'SHIPPING', label: 'Đang giao' },
  { id: 'DONE', label: 'Hoàn thành' },
  { id: 'REJECTED', label: 'Từ chối' },
  { id: 'CANCELED', label: 'Huỷ' },
];

export const ORDER_TABLE_HEADERS = [
  'Mã đơn',
  'Khách hàng',
  'Số sản phẩm',
  'Số file ảnh',
  'GDrive',
  'Giá trị',
  'Trạng thái',
  'Ngày tạo',
  'Nhân viên',
  'Thao tác'
];

export const STATUS_MAPPING = {
  DRAFT: { label: 'Lưu nháp', className: 'bg-gray-100 text-gray-600' },
  NEW: { label: 'Chờ xác nhận', className: 'bg-blue-50 text-blue-600 border border-blue-200' },
  AWAIT: { label: 'Chờ duyệt', className: 'bg-amber-50 text-amber-600 border border-amber-200' },
  CONFIRMED: { label: 'Đã duyệt', className: 'bg-purple-50 text-purple-600 border border-purple-200' },
  IN_PROGRESS: { label: 'Đang sản xuất', className: 'bg-cyan-50 text-cyan-600 border border-cyan-200' },
  SHIPPING: { label: 'Đang giao', className: 'bg-orange-50 text-orange-600 border border-orange-200' },
  DONE: { label: 'Hoàn thành', className: 'bg-emerald-50 text-emerald-600 border border-emerald-200' },
  REJECTED: { label: 'Từ chối', className: 'bg-rose-50 text-rose-600 border border-rose-200' },
  CANCELED: { label: 'Huỷ đơn', className: 'bg-red-100 text-red-700 line-through' },
};