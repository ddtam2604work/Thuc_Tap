import { useState } from 'react';
import useCategories from '../../hooks/Product/useCategories';
import ProductCatalogTable from '../../components/partials/table/product/ProductCatalogTable';
import Button from '../../components/skeleton/Button';
import Modal from '../../components/skeleton/Modal';
import FormInput from '../../components/skeleton/FormInput';
import FormInsertCategory from '../../components/partials/forms/products/FormInsert-Category';
import FormEditCategory from '../../components/partials/forms/products/FormEdit-Category';

// --- ĐÃ SỬA CÚ PHÁP IMPORT CHUẨN Ở ĐÂY ---
import { useConfirm } from '../../context/ConfirmContext';
import { useNotification } from '../../context/NotificationContext';

const ProductCatalogPage = () => {
  const { 
    categories, loading, error, searchTerm, setSearchTerm, 
    generateCategoryCode, addCategory, updateCategory, deleteCategory 
  } = useCategories();
  
  // SỬA TẠI ĐÂY: Thêm dấu { } vào để lấy chính xác hàm confirm từ Context Object
  const { confirm } = useConfirm();
  const { showToast } = useNotification();
  
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
      showToast("Lỗi khi tạo mã danh mục: " + error.message, "error");
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
        showToast("Cập nhật danh mục thành công!", "success");
      } else {
        await addCategory(formData);
        showToast("Thêm danh mục mới thành công!", "success");
      }
      handleClose();
    } catch (err) {
      showToast("Lỗi thao tác: " + (err.message || "Không thể kết nối máy chủ."), "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    // Bây giờ hàm confirm() này đã hoạt động chuẩn xác nhờ có dấu destructuring rước đó
    const isConfirmed = await confirm({
      title: 'Xác nhận xóa danh mục',
      message: 'Bạn có chắc chắn muốn xóa danh mục này không? Hành động này không thể hoàn tác.',
      confirmText: 'Đồng ý xóa',
      cancelText: 'Hủy bỏ',
      type: 'danger'
    });

    if (isConfirmed) {
      try {
        await deleteCategory(id);
        showToast("Đã xóa danh mục thành công!", "success");
      } catch(err) {
        showToast("Lỗi khi xóa: " + err.message, "error");
      }
    }
  };

  return (
    <div className="flex flex-col">
      <main className="p-6 flex-1">
        {/* Banner thông báo */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 flex items-start gap-3 rounded-r-lg">
          <span className="text-blue-500 mt-0.5">ⓘ</span>
          <p className="text-[13px] text-blue-800">
            Quy tắc quản lý danh mục: Mọi danh mục cần được gán mã hệ thống duy nhất. Hãy kiểm tra kỹ thông tin liên kết trước khi thực hiện thao tác xóa.
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-row items-center justify-between gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-wrap md:flex-nowrap">
          
          {/* Tìm kiếm tức thời chuẩn AccountPage */}
          <div className="flex-1 min-w-[280px] max-w-md relative">
            <FormInput 
              value={searchTerm}
              placeholder="Tìm kiếm theo mã hoặc tên danh mục..." 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-50/50 border-gray-200 h-10 pr-10 focus:bg-white transition-all w-full"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Nhóm Button hành động bên phải */}
          <div className="flex items-center gap-3 ml-auto flex-wrap sm:flex-nowrap justify-end w-full md:w-auto">
            <Button 
              onClick={handleOpenInsert} 
              disabled={isGenerating} 
              className={`w-fit px-12 h-10 shadow-md shrink-0 whitespace-nowrap ${isGenerating ? 'opacity-70' : ''}`}
            >
              {isGenerating ? (
                '⏳ ĐANG TẠO MÃ...'
              ) : (
                <>
                  <span className="text-xl font-light mr-2">+</span> Thêm danh mục
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Trạng thái Loading và Error */}
        {loading && <div className="text-center py-10 text-gray-500">Đang tải dữ liệu danh mục...</div>}
        {error && !loading && <div className="text-center py-10 text-red-500">❌ Lỗi: {error}</div>}
        
        {/* Bảng dữ liệu */}
        {!loading && !error && (
          <div className="w-full overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-100">
            <ProductCatalogTable data={categories} onEdit={handleOpenEdit} onDelete={handleDelete} />
          </div>
        )}
      </main>

      {/* Cấu trúc Modal gốc */}
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