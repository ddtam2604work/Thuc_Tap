//Data cứng
export const ACCOUNT_STATUS = {
  ACTIVE: { label: 'Hoạt động', color: 'bg-green-100 text-green-700' },
  INACTIVE: { label: 'Ngừng hoạt động', color: 'bg-red-100 text-red-700' },
};

export const ACCOUNT_ROLES = {
  ADMIN: { label: 'Admin', color: 'bg-blue-100 text-blue-700' },
  MANAGER: { label: 'Quản lý', color: 'bg-orange-100 text-orange-700' },
  STAFF: { label: 'Nhân viên', color: 'bg-gray-100 text-gray-700' },
  CUSTOMER: { label: 'Khách hàng', color: 'bg-yellow-100 text-yellow-700' },
};

export const MOCK_ACCOUNTS = [
  { id: 1, name: 'Nguyễn Thị Nhàn', username: 'nhan.nguyen', email: 'nhan@printms.vn', phone: '0912345678', role: 'ADMIN', status: 'ACTIVE', lastLogin: '10/04/2026 14:30' },
  { id: 2, name: 'Lê Hoàng Anh', username: 'lehoang', email: 'hoang@printms.vn', phone: '0923456789', role: 'MANAGER', status: 'ACTIVE', lastLogin: '10/04/2026 09:15' },
  // ... Thêm các user khác từ hình 3 vào đây
];