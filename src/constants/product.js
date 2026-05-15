export const PRODUCT_NAV_TABS = [
  { id: 'categories', label: 'Danh mục sản phẩm', icon: 'folder' },
  { id: 'products', label: 'Sản phẩm in', icon: 'image' },
];

export const STATUS_LABELS = {
  ACTIVE: { text: 'HOẠT ĐỘNG', class: 'bg-green-100 text-green-700' },
  INACTIVE: { text: 'KHOÁ', class: 'bg-red-100 text-red-700' },
  STOP_BUSINESS: { text: 'NGỪNG KINH DOANH', class: 'bg-red-100 text-red-700' },
};

// Bổ sung Headers cho 2 loại bảng
export const CATALOG_TABLE_HEADERS = ["Mã DM", "Tên danh mục", "Mô tả", "Số sản phẩm", "Trạng thái", "Thao tác"];
export const PRODUCT_TABLE_HEADERS = ["Mã SP", "Tên sản phẩm", "Danh mục", "Giá cơ bản (Standard)", "Mô tả", "Trạng thái", "Thao tác"];