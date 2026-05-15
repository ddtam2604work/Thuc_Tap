import { useState } from 'react';
import useCategories from '../../hooks/useCategories';
import ProductCatalogTable from '../../components/partials/table/ProductCatalogTable';
import PrimaryButton from '../../components/skeleton/PrimaryButton';
import Modal from '../../components/skeleton/Modal';
// Đảm bảo đường dẫn import chính xác theo cấu trúc thư mục của bạn
import FormInsertCategory from '../../components/partials/forms/products/FormInsert-Category';
import FormEditCategory from '../../components/partials/forms/products/FormEdit-Category';

const ProductCatalogPage = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();
  
  // Quản lý trạng thái Modal tập trung: type ('insert' hoặc 'edit') và data cho trường hợp sửa
  const [modal, setModal] = useState({ isOpen: false, type: null, data: null });

  const handleOpenInsert = () => setModal({ isOpen: true, type: 'insert', data: null });
  
  const handleOpenEdit = (item) => setModal({ isOpen: true, type: 'edit', data: item });
  
  const handleClose = () => setModal({ isOpen: false, type: null, data: null });

  const handleSave = (formData) => {
    if (modal.type === 'edit') {
      updateCategory(modal.data.id, formData);
    } else {
      addCategory(formData);
    }
    handleClose();
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="bg-white border border-[#C4C5D7] rounded-xl overflow-hidden shadow-sm">
        {/* Toolbar điều phối hành động Thêm */}
        {/* Toolbar tại trang danh sách */}
        <div className="p-4 border-b border-[#C4C5D7] flex justify-between items-center bg-white">
          {/* Nhóm tìm kiếm bên trái */}
          <div className="flex flex-1 max-w-[600px] gap-2">
            <input type="text" placeholder="Tìm kiếm..." className="h-10 flex-1 border border-[#C4C5D7] px-4 rounded-md" />
            <button className="bg-[#2E478A] text-white px-6 h-10 rounded-md text-xs font-semibold">TÌM KIẾM</button>
          </div>

          {/* Nút thêm mới bên phải - Bây giờ sẽ rất cân đối */}
          <PrimaryButton onClick={handleOpenInsert}>
            + THÊM DANH MỤC
          </PrimaryButton>
        </div>

        {/* Table nhận sự kiện onEdit từ các hàng dữ liệu */}
        <ProductCatalogTable 
          data={categories} 
          onEdit={handleOpenEdit} 
          onDelete={deleteCategory} 
        />
      </div>

      {/* Modal dùng chung: Điều phối Form tương ứng dựa trên modal.type */}
      <Modal 
        isOpen={modal.isOpen} 
        onClose={handleClose}
        title={modal.type === 'insert' ? "Thêm danh mục mới" : "Chỉnh sửa danh mục"}
      >
        {modal.type === 'insert' ? (
          <FormInsertCategory 
            onSave={handleSave} 
            onCancel={handleClose} 
          />
        ) : (
          <FormEditCategory 
            initialData={modal.data} 
            onSave={handleSave} 
            onCancel={handleClose} 
          />
        )}
      </Modal>
    </div>
  );
};

export default ProductCatalogPage;