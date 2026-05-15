import { useState } from 'react';
import useProducts from '../../hooks/useProducts';
import ProductManagementTable from '../../components/partials/table/ProductManagementTable';
import PrimaryButton from '../../components/skeleton/PrimaryButton';
import Modal from '../../components/skeleton/Modal';
import FormInsertProduct from '../../components/partials/forms/products/FormInsert-Product';
import FormEditProduct from '../../components/partials/forms/products/FormEdit-Product';

const ProductManagementPage = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  
  // Quản lý trạng thái Modal tập trung: type ('insert' hoặc 'edit') và data cho trường hợp sửa
  const [modal, setModal] = useState({ isOpen: false, type: null, data: null });

  const handleOpenInsert = () => setModal({ isOpen: true, type: 'insert', data: null });
  
  const handleOpenEdit = (item) => setModal({ isOpen: true, type: 'edit', data: item });
  
  const handleClose = () => setModal({ isOpen: false, type: null, data: null });

  const handleSave = (formData) => {
    if (modal.type === 'edit') {
      updateProduct(modal.data.id, formData);
    } else {
      addProduct(formData);
    }
    handleClose();
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Banner thông tin đặc thù */}
      <div className="bg-[#E0F2FE] border-l-4 border-[#0037B0] p-4 flex gap-3 rounded shadow-sm">
        <span className="text-[#0037B0] font-bold">ⓘ</span>
        <p className="text-sm font-bold text-[#0037B0] leading-5">
          Đây là Bảng giá gốc (Standard Price) – dùng làm mức giá tham chiếu ban đầu khi tạo đơn cho khách hàng lần đầu. Admin có thể điều chỉnh giá theo thỏa thuận với từng khách hàng khi tạo đơn.
        </p>
      </div>

      <div className="bg-white border border-[#C4C5D7] rounded-xl overflow-hidden shadow-sm">
        {/* Toolbar điều phối hành động Thêm */}
        <div className="p-4 border-b border-[#C4C5D7] flex justify-between items-center bg-white gap-4">
          {/* Nhóm tìm kiếm bên trái */}
          <div className="flex flex-1 max-w-[700px] gap-2">
            <input 
              type="text" 
              placeholder="Tìm kiếm theo mã sản phẩm hoặc tên sản phẩm..." 
              className="h-10 flex-1 border border-[#C4C5D7] px-4 rounded-md text-sm outline-none focus:border-[#0037B0] transition-all" 
            />
            <button className="bg-[#2E478A] text-white px-6 h-10 rounded-md text-[12px] font-semibold uppercase tracking-wider hover:bg-[#1e3261] transition-colors">
              🔍 TÌM KIẾM
            </button>
          </div>
          
          {/* Nhóm dropdown và nút thêm bên phải */}
          <div className="flex gap-4">
             <select className="border border-[#C4C5D7] px-4 h-10 rounded-md text-sm bg-white outline-none focus:border-[#0037B0]">
                <option>Tất cả danh mục</option>
                <option>Album ảnh</option>
                <option>Photobook</option>
                <option>Ảnh gỗ</option>
                <option>Backdrop & Decor</option>
             </select>
             <select className="border border-[#C4C5D7] px-4 h-10 rounded-md text-sm bg-white outline-none focus:border-[#0037B0]">
                <option>Tất cả trạng thái</option>
                <option>Hoạt động</option>
                <option>Ngừng kinh doanh</option>
             </select>
             <PrimaryButton onClick={handleOpenInsert} className="!bg-[#1D4ED8]">
               + THÊM SẢN PHẨM
             </PrimaryButton>
          </div>
        </div>
        
        {/* Table nhận sự kiện onEdit từ các hàng dữ liệu */}
        <ProductManagementTable 
          data={products}
          onEdit={handleOpenEdit}
          onDelete={deleteProduct}
        />
      </div>

      {/* Modal dùng chung: Điều phối Form tương ứng dựa trên modal.type */}
      <Modal 
        isOpen={modal.isOpen} 
        onClose={handleClose}
        title={modal.type === 'insert' ? "Thêm sản phẩm" : "Chỉnh sửa sản phẩm"}
      >
        {modal.type === 'insert' ? (
          <FormInsertProduct onSave={handleSave} onCancel={handleClose} />
        ) : (
          <FormEditProduct initialData={modal.data} onSave={handleSave} onCancel={handleClose} />
        )}
      </Modal>
    </div>
  );
};

export default ProductManagementPage;