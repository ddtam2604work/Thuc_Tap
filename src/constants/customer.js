/**
 * 🎯 CONSTANTS QUẢN LÝ PHÂN HỆ KHÁCH HÀNG
 * Đường dẫn: src/constants/customer.js
 */

export const CUSTOMER_TABLE_HEADERS = [
  { label: 'STT', width: 'w-[45px]', align: 'text-center' },
  { label: 'Tên khách hàng', width: 'w-[18%]', align: 'text-left' }, // Tăng % cho tên
  { label: 'Số điện thoại', width: 'w-[100px]', align: 'text-center' },
  { label: 'Email', width: 'w-[16%]', align: 'text-left' }, // Tăng % cho email
  { label: 'Địa chỉ', width: 'w-[14%]', align: 'text-left' }, 
  { label: 'Nhóm Khách Hàng', width: 'w-[100px]', align: 'text-center' }, 
  { label: 'Ghi chú', width: 'w-[12%]', align: 'text-left' },
  { label: 'Portal', width: 'w-[65px]', align: 'text-center' }, 
  { label: 'Trạng thái', width: 'w-[120px]', align: 'text-center' },
  { label: 'Thao tác', width: 'w-[110px]', align: 'text-center' } 
];

export const CUSTOMER_GROUP_TABLE_HEADERS = [
  { label: 'STT', width: 'w-[70px]', align: 'text-center' },
  { label: 'Tên nhóm', width: 'w-[30%]', align: 'text-left' },
  { label: 'Ghi chú', width: 'w-[50%]', align: 'text-left' },
  { label: 'Thao tác', width: 'w-[140px]', align: 'text-center' }
];

export const CUSTOMER_TABS = {
  GROUP: 'GROUP',
  CUSTOMER: 'CUSTOMER'
};