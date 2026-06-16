import { useState } from 'react';
import useProducts from '../../hooks/Product/useProducts';
import useCategories from '../../hooks/Product/useCategories';
import ProductManagementTable from '../../components/partials/table/product/ProductManagementTable';
import Button from '../../components/skeleton/Button';
import Modal from '../../components/skeleton/Modal';
import FormInput from '../../components/skeleton/FormInput';
import FormInsertProduct from '../../components/partials/forms/products/FormInsert-Product';
import FormEditProduct from '../../components/partials/forms/products/FormEdit-Product';

// --- IMPORT CÁC HOOK TOAST & CONFIRM DÙNG CHUNG ---
import { useConfirm } from '../../context/ConfirmContext';
import { useNotification } from '../../context/NotificationContext';

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
  
  // Lấy cả danh sách danh mục và hàm fetchCategories ở cùng 1 nơi
  const { categories, fetchCategories } = useCategories(); 
  
  // Khởi tạo các hàm điều khiển từ Context (Sử dụng Destructuring chuẩn)
  const { confirm } = useConfirm();
  const { showToast } = useNotification();
  
  const [searchInput, setSearchInput] = useState(searchTerm);
  const [modal, setModal] = useState({ isOpen: false, type: null, data: null });
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false); 

  // Logic UI cho phân trang (Đồng bộ cấu trúc từ AccountPage)
  const getPaginationGroup = () => {
    let start = Math.max(currentPage - 2, 1);
    let end = Math.min(start + 4, totalPages);
    if (end - start < 4) {
      start = Math.max(end - 4, 1);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  // Xử lý Tìm kiếm (Giữ logic gốc để tránh mất mát code, đồng thời gộp cơ chế Instant)
  const handleTriggerSearch = () => setSearchTerm(searchInput);
  const handleKeyDown = (e) => { if (e.key === 'Enter') handleTriggerSearch(); };

  // Xử lý Lưu sản phẩm (Thêm/Sửa)
  const handleSave = async (formData) => {
    try {
      setIsSaving(true);
      if (modal.type === 'edit') {
        const targetId = modal.data.id || modal.data.product_id;
        await updateProduct(targetId, formData);
        // Thay bằng Toast Success
        showToast("Cập nhật sản phẩm thành công!", "success");
      } else {
        await addProduct(formData);
        
        // ÉP HỆ THỐNG CẬP NHẬT LẠI DANH MỤC MỚI NHẤT TRƯỚC KHI BẢNG RENDER
        await fetchCategories(); 
        
        // Thay bằng Toast Success
        showToast("Thêm sản phẩm mới thành công!", "success");
      }
      handleClose();
    } catch (err) {
      // Thay bằng Toast Error
      showToast("Lỗi thao tác: " + (err.message || "Không thể kết nối máy chủ."), "error");
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
        // Thay bằng Toast Error
        showToast('Lỗi: Không tìm thấy ID sản phẩm', 'error');
        return;
      }

      // FETCH DỮ LIỆU CHI TIẾT ĐẦY ĐỦ TỪ SERVER
      let detailData = await getProductDetail(targetId);
      console.log('🔧 detailData từ API:', detailData);
      
      if (!detailData) {
        console.error('❌ detailData trống');
        // Thay bằng Toast Error
        showToast('Lỗi: Không lấy được dữ liệu sản phẩm từ server', 'error');
        return;
      }
      
      // FALLBACK: Merge table data + API detail
      const mergedData = {
        ...item,  // Giữ những field từ bảng (code, category_name, etc.)
        ...detailData,  // Override/thêm field chi tiết từ API
        name: detailData.name || item.name || '',
        code: detailData.code || item.code || '',
        price: detailData.price || item.price || '',
        description: detailData.description || detailData.desc || item.description || item.desc || '',
      };
      
      console.log('🔧 mergedData (table + API):', mergedData);
      setModal({ isOpen: true, type: 'edit', data: mergedData });
    } catch (error) {
      console.error("❌ Lỗi lấy chi tiết:", error);
      // Thay bằng Toast Error
      showToast("Lỗi: " + (error.message || "Không thể lấy dữ liệu sản phẩm"), "error");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleClose = () => { 
    if(!isSaving) setModal({ isOpen: false, type: null, data: null }); 
  };

  const handleDelete = async (id) => {
    // Thay đổi hoàn toàn cơ chế window.confirm sang Promise Modal mượt mà
    const isConfirmed = await confirm({
      title: 'Xác nhận xóa sản phẩm',
      message: 'Bạn có chắc chắn muốn xóa sản phẩm này không? Thao tác này sẽ gỡ bỏ sản phẩm khỏi danh sách hiển thị hệ thống.',
      confirmText: 'Đồng ý xóa',
      cancelText: 'Hủy bỏ',
      type: 'danger'
    });

    if (isConfirmed) {
      try {
        await deleteProduct(id);
        // Thay bằng Toast Success
        showToast("Đã xóa sản phẩm thành công!", "success");
      } catch(err) {
        // Thay bằng Toast Error
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
            Quản lý sản phẩm hệ thống. Hệ thống tự động áp dụng giá gốc (Standard Price) khi tạo đơn.
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-row items-center justify-between gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-wrap md:flex-nowrap">
          
          {/* Tìm kiếm tức thời kết hợp đồng bộ hóa state cũ */}
          <div className="flex-1 min-w-[280px] max-w-md relative">
            <FormInput 
              value={searchTerm}
              placeholder="Tìm kiếm theo mã sản phẩm hoặc tên sản phẩm..." 
              onChange={(e) => {
                setSearchInput(e.target.value); // Giữ đồng bộ cho state gốc
                setSearchTerm(e.target.value); // Kích hoạt Tìm kiếm tức thời của AccountPage
              }}
              onKeyDown={handleKeyDown}
              className="bg-gray-50/50 border-gray-200 h-10 pr-10 focus:bg-white transition-all w-full"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Bộ lọc Dropdowns và Button thêm */}
          <div className="flex items-center gap-3 ml-auto flex-wrap sm:flex-nowrap justify-end w-full md:w-auto">
            <div className="flex gap-2 shrink-0">
              <select 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)} 
                className="border border-gray-200 rounded-lg px-3 py-2 text-[13px] bg-white outline-none focus:ring-2 focus:ring-blue-500/20 h-10 min-w-[140px] cursor-pointer"
              >
                <option value="all">Tất cả danh mục</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>

              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)} 
                className="border border-gray-200 rounded-lg px-3 py-2 text-[13px] bg-white outline-none focus:ring-2 focus:ring-blue-500/20 h-10 min-w-[140px] cursor-pointer"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="1">Hoạt động</option>
                <option value="0">Ngừng kinh doanh</option>
              </select>
            </div>

            <Button 
              onClick={handleOpenInsert} 
              disabled={isGenerating} 
              className={`w-fit px-12 h-10 shadow-md shrink-0 whitespace-nowrap ${isGenerating ? 'opacity-70' : ''}`}
            >
              {isGenerating ? '⏳ ĐANG XỬ LÝ...' : <><span className="text-xl font-light mr-2">+</span> Thêm sản phẩm</>}
            </Button>
          </div>
        </div>

        {/* Trạng thái Loading và Error */}
        {loading && <div className="text-center py-10 text-gray-500">Đang tải dữ liệu sản phẩm...</div>}
        {error && !loading && <div className="text-center py-10 text-red-500">Lỗi: {error}</div>}
        
        {/* Table & Phân trang số hoàn chỉnh của AccountPage */}
        {!loading && !error && (
          <>
            <div className="w-full">
              <ProductManagementTable data={products} categories={categories} onEdit={handleOpenEdit} onDelete={handleDelete} isLoading={isGenerating} />
            </div>
            
            {totalPages > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center mt-6 px-2 gap-4">
                {/* Bộ đếm thống kê bên trái */}
                <div className="text-sm text-gray-500">
                  Hiển thị trang <span className="font-semibold text-gray-900">{currentPage}</span> trong tổng số <span className="font-semibold text-gray-900">{totalPages}</span> trang sản phẩm
                </div>

                {/* Các nút phân trang số dạng nút bấm chuẩn xác */}
                <div className="flex gap-1.5">
                  {/* Nút Trước */}
                  <Button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`w-9 h-9 rounded-md border text-sm font-medium transition-all p-0 flex items-center justify-center ${
                      currentPage === 1 
                      ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed' 
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    &lt;
                  </Button>

                  {/* Vòng lặp xuất dãy số trang */}
                  {getPaginationGroup().map(page => (
                    <Button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 rounded-md border text-sm font-medium transition-all p-0 ${
                        page === currentPage 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </Button>
                  ))}

                  {/* Nút Tiếp Theo */}
                  <Button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`w-9 h-9 rounded-md border text-sm font-medium transition-all p-0 flex items-center justify-center ${
                      currentPage === totalPages 
                      ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed' 
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    &gt;
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Cấu trúc Modals */}
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