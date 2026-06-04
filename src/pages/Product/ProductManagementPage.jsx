import { useState } from 'react';
import useProducts from '../../hooks/Product/useProducts';
import useCategories from '../../hooks/Product/useCategories';
import ProductManagementTable from '../../components/partials/table/product/ProductManagementTable';
import Button from '../../components/skeleton/Button';
import Modal from '../../components/skeleton/Modal';
import FormInsertProduct from '../../components/partials/forms/products/FormInsert-Product';
import FormEditProduct from '../../components/partials/forms/products/FormEdit-Product';

const ProductManagementPage = () => {
  // Hook chính lấy dữ liệu sản phẩm và các hàm xử lý
  const { 
    products, loading, error,
    searchTerm, setSearchTerm, 
    filterCategory, setFilterCategory, 
    filterStatus, setFilterStatus,
    currentPage, setCurrentPage, totalPages, units,
    generateProductCode, getProductDetail, addProduct, updateProduct, deleteProduct 
  } = useProducts();
  
  // 🌟 GỘP CHUNG HOOK: Lấy cả danh sách danh mục và hàm fetchCategories ở cùng 1 nơi
  const { categories, fetchCategories } = useCategories(); 
  
  const [searchInput, setSearchInput] = useState(searchTerm);
  const [modal, setModal] = useState({ isOpen: false, type: null, data: null });
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false); 

  // Xử lý Tìm kiếm
  const handleTriggerSearch = () => setSearchTerm(searchInput);
  const handleKeyDown = (e) => { if (e.key === 'Enter') handleTriggerSearch(); };

  // Xử lý Lưu sản phẩm (Thêm/Sửa)
  const handleSave = async (formData) => {
    try {
      setIsSaving(true);
      if (modal.type === 'edit') {
        const targetId = modal.data.id || modal.data.product_id;
        await updateProduct(targetId, formData);
        alert("Cập nhật sản phẩm thành công!");
      } else {
        await addProduct(formData);
        
        // 🌟 ÉP HỆ THỐNG CẬP NHẬT LẠI DANH MỤC MỚI NHẤT TRƯỚC KHI BẢNG RENDER
        await fetchCategories(); 
        
        alert("Thêm sản phẩm mới thành công!");
      }
      handleClose();
    } catch (err) {
      alert("Lỗi thao tác: " + (err.message || "Không thể kết nối máy chủ."));
    } finally {
      setIsSaving(false);
    }
  };

  // LUỒNG CHAINING: Lấy mã tự động + Lấy data mặc định từ sản phẩm cũ nhất
  const handleOpenInsert = async () => {
    let newCode = ""; 

    try {
      setIsGenerating(true);
      
      // 1. Lấy mã sản phẩm mới
      newCode = await generateProductCode();
      
      let defaultData = { 
        code: newCode, 
        productcategory_id: "", 
        units_id: "",
        isactive: 1 
      };
      
      // 2. Lấy dữ liệu gợi ý từ sản phẩm mẫu (sản phẩm đầu tiên trong danh sách)
      if (products && products.length > 0) {
        const sampleProductId = products[0].id || products[0].product_id;
        
        const detailData = await getProductDetail(sampleProductId);

        if (detailData) {
          defaultData.productcategory_id = detailData.productcategory_id || "";
          defaultData.units_id = detailData.units_id || "";
        }
      }

      setModal({ isOpen: true, type: 'insert', data: defaultData });
    } catch (error) {
      console.error("Lỗi chuẩn bị form:", error);
      // Vẫn mở form an toàn dù không lấy được dữ liệu gợi ý
      setModal({ isOpen: true, type: 'insert', data: { code: newCode, isactive: 1 } });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenEdit = async (item) => {
    try {
      setIsGenerating(true);
      const targetId = item.id || item.product_id;
      console.log('🔧 handleOpenEdit - item:', item, 'targetId:', targetId);
      
      if (!targetId) {
        console.warn('⚠️ Không tìm thấy ID');
        alert('Lỗi: Không tìm thấy ID sản phẩm');
        return;
      }

      // 🌟 FETCH DỮ LIỆU CHI TIẾT ĐẦY ĐỦ TỪ SERVER
      let detailData = await getProductDetail(targetId);
      console.log('🔧 detailData từ API:', detailData);
      
      if (!detailData) {
        console.error('❌ detailData trống');
        alert('Lỗi: Không lấy được dữ liệu sản phẩm từ server');
        return;
      }
      
      // 🌟 FALLBACK: Merge table data + API detail
      // Table row sẽ có những field đã format (như price)
      // API sẽ có những field chi tiết (description)
      const mergedData = {
        ...item,  // Giữ những field từ bảng (code, category_name, etc.)
        ...detailData,  // Override/thêm field chi tiết từ API
        // Explicit fallback cho fields quan trọng
        name: detailData.name || item.name || '',
        code: detailData.code || item.code || '',
        price: detailData.price || item.price || '',
        description: detailData.description || detailData.desc || item.description || item.desc || '',
      };
      
      console.log('🔧 mergedData (table + API):', mergedData);
      setModal({ isOpen: true, type: 'edit', data: mergedData });
    } catch (error) {
      console.error("❌ Lỗi lấy chi tiết:", error);
      alert("Lỗi: " + (error.message || "Không thể lấy dữ liệu sản phẩm"));
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleClose = () => { 
    if(!isSaving) setModal({ isOpen: false, type: null, data: null }); 
  };

  const handleDelete = async (id) => {
    if(window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?')) {
      try {
        await deleteProduct(id);
        alert("Đã xóa sản phẩm!");
      } catch(err) {
        alert("Lỗi khi xóa: " + err.message);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Banner */}
      <div className="bg-[#E0F2FE] border-l-4 border-[#0037B0] p-4 flex gap-3 rounded shadow-sm">
        <span className="text-[#0037B0] font-bold">ⓘ</span>
        <p className="text-sm font-bold text-[#0037B0] leading-5">
          Quản lý sản phẩm hệ thống. Hệ thống tự động áp dụng giá gốc (Standard Price) khi tạo đơn.
        </p>
      </div>

      {/* Toolbar & Filter */}
      <div className="bg-white border border-[#C4C5D7] rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#C4C5D7] flex justify-between items-center bg-white gap-4 flex-wrap">
          <div className="flex flex-1 min-w-[300px] max-w-[700px] gap-2">
            <input 
              type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyDown={handleKeyDown}
              placeholder="Tìm kiếm theo mã sản phẩm hoặc tên sản phẩm..." 
              className="h-10 flex-1 border border-[#C4C5D7] px-4 rounded-md text-sm outline-none focus:border-[#0037B0] transition-all" 
            />
            <Button variant="search" onClick={handleTriggerSearch}>TÌM KIẾM</Button>
          </div>
          
          <div className="flex gap-3 flex-wrap">
             <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="border border-[#C4C5D7] px-4 h-10 rounded-md text-sm bg-white cursor-pointer">
                <option value="all">Tất cả danh mục</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
             </select>

             <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border border-[#C4C5D7] px-4 h-10 rounded-md text-sm bg-white cursor-pointer">
                <option value="all">Tất cả trạng thái</option>
                <option value="1">Hoạt động</option>
                <option value="0">Ngừng kinh doanh</option>
             </select>

             <Button onClick={handleOpenInsert} disabled={isGenerating} className={`!bg-[#1D4ED8] ${isGenerating ? 'opacity-70' : ''}`}>
               {isGenerating ? '⏳ ĐANG XỬ LÝ...' : '+ THÊM SẢN PHẨM'}
             </Button>
          </div>
        </div>
        
        {/* Table & Pagination */}
        {loading ? (
           <div className="p-10 text-center text-gray-500">Đang tải...</div>
        ) : error ? (
           <div className="p-10 text-center text-red-500">{error}</div>
        ) : (
           <>
             <ProductManagementTable data={products} categories={categories} onEdit={handleOpenEdit} onDelete={handleDelete} isLoading={isGenerating} />
             {totalPages > 1 && (
               <div className="p-4 border-t flex items-center justify-between bg-gray-50">
                 <span className="text-sm text-gray-600">Trang <strong>{currentPage}</strong> / <strong>{totalPages}</strong></span>
                 <div className="flex gap-2">
                   <Button variant="secondary" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>Trước</Button>
                   <Button variant="secondary" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>Sau</Button>
                 </div>
               </div>
             )}
           </>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={modal.isOpen} onClose={handleClose} title={modal.type === 'insert' ? "Thêm sản phẩm" : "Chỉnh sửa sản phẩm"}>
        {modal.type === 'insert' ? (
          <FormInsertProduct key={`insert_${modal.data?.code}`} categories={categories} units={units} initialData={modal.data} onSave={handleSave} onCancel={handleClose} isSaving={isSaving} />
        ) : (
          <FormEditProduct key={`edit_${modal.data?.id || modal.data?.product_id}`} categories={categories} units={units} initialData={modal.data} onSave={handleSave} onCancel={handleClose} isSaving={isSaving} />
        )}
      </Modal>
    </div>
  );
};

export default ProductManagementPage;