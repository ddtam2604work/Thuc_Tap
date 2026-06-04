import { useState } from 'react';
import useCategories from '../../hooks/Product/useCategories';
import ProductCatalogTable from '../../components/partials/table/product/ProductCatalogTable';
import Button from '../../components/skeleton/Button';
import Modal from '../../components/skeleton/Modal';
import FormInsertCategory from '../../components/partials/forms/products/FormInsert-Category';
import FormEditCategory from '../../components/partials/forms/products/FormEdit-Category';

const ProductCatalogPage = () => {
  const { 
    categories, loading, error, searchTerm, setSearchTerm, 
    generateCategoryCode, addCategory, updateCategory, deleteCategory 
  } = useCategories();
  
  const [modal, setModal] = useState({ isOpen: false, type: null, data: null });
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false); // State chống double-click khi sinh mã

  // LUỒNG MỚI: Lấy mã từ Backend TRƯỚC KHI mở Form Thêm
  const handleOpenInsert = async () => {
    try {
      setIsGenerating(true);
      const newCode = await generateCategoryCode();
      // Truyền mã vừa lấy được vào data để FormInsert hứng
      setModal({ isOpen: true, type: 'insert', data: { code: newCode } });
    } catch (error) {
      alert("Lỗi khi tạo mã danh mục: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleOpenEdit = (item) => setModal({ isOpen: true, type: 'edit', data: item });
  
  const handleClose = () => {
    if (!isSaving) setModal({ isOpen: false, type: null, data: null });
  };

  const handleSave = async (formData) => {
    try {
      setIsSaving(true);
      if (modal.type === 'edit') {
        await updateCategory(modal.data.id, formData);
        alert("Cập nhật danh mục thành công!");
      } else {
        await addCategory(formData);
        alert("Thêm danh mục mới thành công!");
      }
      handleClose();
    } catch (err) {
      alert("Lỗi thao tác: " + (err.message || "Không thể kết nối máy chủ."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này không?')) {
      try {
        await deleteCategory(id);
        alert("Đã xóa danh mục!");
      } catch(err) {
        alert("Lỗi khi xóa: " + err.message);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="bg-white border border-[#C4C5D7] rounded-xl overflow-hidden shadow-sm">
        
        <div className="p-4 border-b border-[#C4C5D7] flex justify-between items-center bg-white flex-wrap gap-4">
          <div className="flex flex-1 max-w-[600px] gap-2">
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo mã hoặc tên danh mục..." 
              className="h-10 flex-1 border border-[#C4C5D7] px-4 rounded-md outline-none focus:border-[#0037B0] transition-colors" 
            />
            <Button variant="search">TÌM KIẾM</Button>
          </div>

          {/* Hiển thị trạng thái đang lấy mã */}
          <Button onClick={handleOpenInsert} disabled={isGenerating} className={`!bg-[#1D4ED8] ${isGenerating ? 'opacity-70' : ''}`}>
            {isGenerating ? '⏳ ĐANG TẠO MÃ...' : '+ THÊM DANH MỤC'}
          </Button>
        </div>

        {loading ? (
           <div className="p-10 text-center text-gray-500 font-medium">⏳ Đang tải dữ liệu danh mục...</div>
        ) : error ? (
           <div className="p-10 text-center text-red-500 font-medium">❌ {error}</div>
        ) : (
          <ProductCatalogTable data={categories} onEdit={handleOpenEdit} onDelete={handleDelete} />
        )}
      </div>

      <Modal 
        isOpen={modal.isOpen} 
        onClose={handleClose}
        title={modal.type === 'insert' ? "Thêm danh mục mới" : "Chỉnh sửa danh mục"}
      >
        {modal.type === 'insert' ? (
          <FormInsertCategory initialData={modal.data} onSave={handleSave} onCancel={handleClose} isSaving={isSaving} />
        ) : (
          <FormEditCategory initialData={modal.data} onSave={handleSave} onCancel={handleClose} isSaving={isSaving} />
        )}
      </Modal>
    </div>
  );
};

export default ProductCatalogPage;