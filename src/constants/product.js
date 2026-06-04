export const PRODUCT_NAV_TABS = [
  { id: 'categories', label: 'Danh mục sản phẩm', icon: 'folder' },
  { id: 'products', label: 'Sản phẩm in', icon: 'image' },
];

// 🎯 Đã gỡ bỏ STATUS_LABELS vì sử dụng trực tiếp isactive (0 và 1) từ API để đồng bộ dữ liệu

export const CATALOG_TABLE_HEADERS = [
  "Mã DM", 
  "Tên danh mục", 
  "Mô tả", 
  "Số sản phẩm", 
  "Trạng thái", 
  "Thao tác"
];

export const PRODUCT_TABLE_HEADERS = [
  "Mã SP", 
  "Tên sản phẩm", 
  "Danh mục", 
  "Giá cơ bản (Standard)", 
  "Mô tả", 
  "Trạng thái", 
  "Thao tác"
];