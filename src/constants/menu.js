// src/constants/menu.js
export const SIDEBAR_MENU = [
  {
    path: '/home',
    label: 'Tổng quan',
    // Khách hàng tuyệt đối không được thấy trang này
    checkPermission: (can, isCustomer) => !isCustomer 
  },
  {
    path: '/orders',
    label: 'Đơn hàng',
    // Khớp ma trận: Ai có quyền Xem danh sách đơn hàng thì mới thấy
    checkPermission: (can) => can('ORDER', 'VIEW_LIST') 
  },
  {
    path: '/customers',
    label: 'Khách hàng',
    // Khớp ma trận: Ai có quyền Xem danh sách KH thì mới thấy
    checkPermission: (can) => can('CUSTOMER_MGMT', 'VIEW_LIST') 
  },
  {
    path: '/products',
    label: 'Sản phẩm',
    // Khớp ma trận: Ai có quyền Xem sản phẩm thì mới thấy
    checkPermission: (can) => can('PRODUCT', 'VIEW_PRODUCT') 
  },
  {
    path: '/account-management',
    label: 'Quản lý tài khoản',
    // Khớp ma trận: Phải có quyền Quản lý nhân sự hoặc Role mới thấy
    checkPermission: (can) => can('ACCOUNT', 'MANAGE_STAFF') || can('ACCOUNT', 'MANAGE_ROLE') 
  }
];