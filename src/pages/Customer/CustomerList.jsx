import { useEffect, useState, useCallback } from 'react';
import { useCustomerList } from '../../hooks/Customer/useCustomer_List';
import { useCustomerGroups } from '../../hooks/Customer/useCustomer_Group';
import CustomerListTable from '../../components/partials/table/customer/CustomerListTable'; 
import FormInsertCustomerList from '../../components/partials/forms/customer/customer-list/FormInsert-CustomerList';
import FormEditCustomerList from '../../components/partials/forms/customer/customer-list/FormEdit-CustomerList';
import Modal from '../../components/skeleton/Modal';
import Button from '../../components/skeleton/Button';
import CustomerDetail from './CustomerDetail';

const CustomerList = () => {
  const {
    customers, loading, isSaving, customerSearch, setCustomerSearch, // Giữ lại setCustomerSearch để hook hoạt động
    portalFilter, setPortalFilter, statusFilter, setStatusFilter,
    currentPage, setCurrentPage, totalPages, fetchCustomers,
    handleAddCustomer, handleEditCustomer, handleDeleteCustomer,
    getCustomerDetail, detailConfig, handleViewDetail, handleCloseDetail // 🎯 BƯỚC 1: LẤY HÀM NÀY TỪ HOOK RA ĐỂ SỬ DỤNG
  } = useCustomerList();

  const { filteredGroups, fetchGroups } = useCustomerGroups();

  const [modalConfig, setModalConfig] = useState({ isOpen: false, mode: 'add', data: null });

  // State cục bộ cho ô tìm kiếm để kiểm soát khi nào thực sự trigger search
  const [localSearch, setLocalSearch] = useState(customerSearch || '');

  // Hàm trigger tìm kiếm, được bọc trong useCallback để tối ưu
  const handleSearch = useCallback(() => {
    setCustomerSearch(localSearch);
    setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
  }, [localSearch, setCustomerSearch, setCurrentPage]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const handleOpenAddModal = () => {
    if (typeof fetchGroups === 'function') fetchGroups();
    setModalConfig({ isOpen: true, mode: 'add', data: null });
  };

  // 🎯 BƯỚC 2: CHUYỂN HÀM NÀY THÀNH ASYNC ĐỂ GỌI API THEO ID
  const handleOpenEditModal = async (row) => {
    try {
      if (typeof fetchGroups === 'function') fetchGroups(); // Tải danh sách nhóm (phục vụ cho select box)
      
      // 1. Gọi API lấy thông tin chi tiết nhất của khách hàng từ ID
      const fullDetail = await getCustomerDetail(row.id);
      
      // 2. Fallback: Nếu API detail lỗi/trống, dùng tạm dữ liệu của row trên bảng
      const data = fullDetail || row; 

      // 3. Đổ dữ liệu Full lên Form
      setModalConfig({
        isOpen: true,
        mode: 'edit',
        data: {
          id: data.id,
          fullname: data.fullname || data.customer_user_fullname || '',
          studioname: data.studioname || data.customer_studioname || '',
          phone: data.phone || data.customer_user_phone || '',
          email: data.email || data.customer_user_email || '',
          address: data.address || data.customer_address || '',
          // Đảm bảo lấy đúng ID nhóm
          customercategories_id: data.customercategories_id || data.category_id || '',
          description: data.description || '',
          isportal: data.isportal === 1 || data.isportal === true,
          isactive: data.isactive === 1 ? 1 : 0
        }
      });
    } catch (error) {
      console.error("Lỗi lấy thông tin chi tiết:", error);
      alert("Không thể lấy thông tin chi tiết khách hàng. Vui lòng thử lại!");
    }
  };

  const handleCloseModal = () => {
    setModalConfig({ isOpen: false, mode: 'add', data: null });
  };

  const handleFormSubmit = async (payload) => {
    try {
      if (modalConfig.mode === 'add') {
        // BƯỚC 1: Chuẩn hóa payload trước khi gửi đi để đảm bảo đúng định dạng API yêu cầu
        const finalPayload = {
          ...payload,
          // Ép kiểu isactive và isportal về dạng số (1/0) mà backend thường yêu cầu
          isactive: (payload.isactive === true || payload.isactive === 1 || String(payload.isactive) === '1') ? 1 : 0,
          isportal: (payload.isportal === true || payload.isportal === 1 || String(payload.isportal) === '1') ? 1 : 0,
        };
        await handleAddCustomer(finalPayload);
      } else {
        await handleEditCustomer(modalConfig.data.id, payload);
      }
      handleCloseModal();
      alert(modalConfig.mode === 'add' ? 'Thêm khách hàng thành công!' : 'Cập nhật khách hàng thành công!');
    } catch (error) {
      alert(error.response?.data?.message || error.message || 'Thao tác lưu khách hàng thất bại');
    }
  };

  return (
    <div className="p-6 font-inter bg-gray-50 min-h-screen text-[#191C1D]">
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Danh sách khách hàng</h1>
          <p className="text-xs text-gray-500 mt-1">Quản lý thông tin và phân loại khách hàng trong hệ thống</p>
        </div>
        <Button 
          variant="primary" 
          onClick={handleOpenAddModal}
          className="bg-[#0037B0] hover:bg-[#00267A] text-white px-4 h-10 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all"
        >
          <span>➕</span> Thêm khách hàng
        </Button>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-3xs mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[300px] w-full sm:w-auto">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Tìm theo tên, số điện thoại, email..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0037B0] transition-colors bg-gray-50/50"
            />
          </div>
           <Button type="submit" variant="primary" className="h-10 px-6 text-xs font-semibold rounded-xl shadow-xs bg-slate-800 text-white hover:bg-slate-900 transition-all">
            Tìm kiếm
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={portalFilter}
            onChange={(e) => { setPortalFilter(e.target.value); setCurrentPage(1); }}
            className="h-10 px-3 border border-gray-200 rounded-xl text-xs font-medium bg-white focus:outline-none cursor-pointer"
          >
            <option value="all">Tất cả tài khoản</option>
            <option value="portal">Có tài khoản Portal</option>
            <option value="non-portal">Chưa tạo tài khoản</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="h-10 px-3 border border-gray-200 rounded-xl text-xs font-medium bg-white focus:outline-none cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Ngừng hoạt động</option>
          </select>
        </div>
      </form>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-3xs overflow-hidden transition-all">
        <CustomerListTable 
          customers={customers} 
          isLoading={loading} 
          onViewDetail={handleViewDetail}
          onEdit={handleOpenEditModal} 
          onDelete={handleDeleteCustomer} 
        />

        {totalPages > 1 && (
          <div className="px-4 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
            <div className="text-xs text-gray-500 font-medium">
              Trang <span className="text-gray-800 font-bold">{currentPage}</span> / {totalPages}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1 || loading}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="h-8 px-3 rounded-lg border border-gray-200 text-xs font-semibold bg-white hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                Trước
              </button>
              <button
                disabled={currentPage === totalPages || loading}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="h-8 px-3 rounded-lg border border-gray-200 text-xs font-semibold bg-white hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={modalConfig.isOpen} onClose={handleCloseModal} title={modalConfig.mode === 'add' ? "Thêm mới khách hàng" : "Cập nhật thông tin khách hàng"}>
        {modalConfig.mode === 'add' ? (
          <FormInsertCustomerList
            onClose={handleCloseModal}
            onSubmit={handleFormSubmit}
            isSaving={isSaving}
            categories={filteredGroups?.data || filteredGroups || []} 
          />
        ) : (
          <FormEditCustomerList
            onClose={handleCloseModal}
            onSubmit={handleFormSubmit}
            isSaving={isSaving}
            categories={filteredGroups?.data || filteredGroups || []} 
            initialData={modalConfig.data} 
          />
        )}
      </Modal>

      <CustomerDetail 
        isOpen={detailConfig.isOpen} 
        customer={detailConfig.data} 
        onClose={handleCloseDetail} 
      />
    </div>
  );
};

export default CustomerList;