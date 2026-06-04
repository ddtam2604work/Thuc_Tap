//Danh mục & Sản phẩm
import { apiBackend } from '../config/axiosClient';

export const productService = {
  // Danh mục sản phẩm
  getCategories: () => apiBackend.post('/productcategories/get-all'),
  genCategoryCode: () => apiBackend.post('/productcategories/generate-code'),
  addCategory: (payload) => apiBackend.post('/productcategories/add', payload),
  editCategory: (payload) => apiBackend.post('/productcategories/edit', payload),
  deleteCategory: (id) => apiBackend.post('/productcategories/delete', { id }),
  setCategoryActive: (payload) => apiBackend.post('/productcategories/set-active', payload ),
  // Sản phẩm
  getUnits: () => apiBackend.post('/products/get-units'),
  getPaging: (payload) => apiBackend.post('/products/get-paging', payload),
  genProductCode: () => apiBackend.post('/products/generate-code'),
  addProduct: (payload) => apiBackend.post('/products/add', payload),
  editProduct: (payload) => apiBackend.post('/products/edit', payload),
  deleteProduct: (id) => apiBackend.post('/products/delete', { id }),
  setActive: (payload) => apiBackend.post('/products/set-active', payload),
  getDetail: (id) => apiBackend.post('/products/get-detail', { id }),
  
  // Lấy sản phẩm kèm giá riêng theo từng khách hàng đặc thù
  getWithCustomer: (customerId) => apiBackend.post('/products/get-all-with-customer', { customerId }),
};