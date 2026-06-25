// =========================================================================
// FILE: src/pages/Customer/CustomerList.jsx
// =========================================================================
import { useEffect, useState, useCallback } from 'react';
import { useCustomerList } from '../../hooks/Customer/useCustomer_List';
import { useCustomerGroups } from '../../hooks/Customer/useCustomer_Group';
import CustomerListTable from '../../components/partials/table/customer/CustomerListTable'; 
import FormInsertCustomerList from '../../components/partials/forms/customer/customer-list/FormInsert-CustomerList';
import FormEditCustomerList from '../../components/partials/forms/customer/customer-list/FormEdit-CustomerList';
import Modal from '../../components/skeleton/Modal';
import Button from '../../components/skeleton/Button';
import FormInput from '../../components/skeleton/FormInput';
import CustomerDetail from './CustomerDetail';

import { useNotification } from '../../context/NotificationContext';
import { useLocation, useNavigate } from 'react-router-dom';

const CustomerList = () => {
  const {
    customers, loading, isSaving, customerSearch, setCustomerSearch,
    portalFilter, setPortalFilter, statusFilter, setStatusFilter,
    currentPage, setCurrentPage, totalPages, fetchCustomers,
    handleAddCustomer, handleEditCustomer, handleDeleteCustomer,
    getCustomerDetail, detailConfig, handleViewDetail, handleCloseDetail
  } = useCustomerList();

  const { filteredGroups, fetchGroups } = useCustomerGroups();
  const [modalConfig, setModalConfig] = useState({ isOpen: false, mode: 'add', data: null });
  const [localSearch, setLocalSearch] = useState(customerSearch || '');

  const { showToast } = useNotification();
  
  const location = useLocation();
  const navigate = useNavigate();

  // Logic UI cho phân trang số hoàn chỉnh
  const getPaginationGroup = () => {
    let start = Math.max(currentPage - 2, 1);
    let end = Math.min(start + 4, totalPages);
    if (end - start < 4) {
      start = Math.max(end - 4, 1);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const handleSearch = useCallback(() => {
    setCustomerSearch(localSearch);
    setCurrentPage(1);
  }, [localSearch, setCustomerSearch, setCurrentPage]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const handleOpenAddModal = useCallback(() => {
    if (typeof fetchGroups === 'function') fetchGroups();
    setModalConfig({ isOpen: true, mode: 'add', data: null });
  }, [fetchGroups]);

  // Effect tự động kiểm tra trạng thái nhảy từ trang chủ sang để tự bật Modal
  useEffect(() => {
    if (location.state?.openAddModal) {
      handleOpenAddModal();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, handleOpenAddModal, navigate, location.pathname]);

  const handleOpenEditModal = async (row) => {
    try {
      if (typeof fetchGroups === 'function') fetchGroups();
      
      const fullDetail = await getCustomerDetail(row.id);
      const data = fullDetail || row; 

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
          customercategories_id: data.customercategories_id || data.category_id || '',
          description: data.description || '',
          isportal: data.isportal === 1 || data.isportal === true,
          isactive: data.isactive === 1 ? 1 : 0
        }
      });
    } catch (error) {
      console.error("❌ [Component/CustomerList] Lỗi lấy thông tin chi tiết:", error);
      showToast("Không thể lấy thông tin chi tiết khách hàng. Vui lòng thử lại!", "error");
    }
  };

  const handleCloseModal = () => {
    setModalConfig({ isOpen: false, mode: 'add', data: null });
  };

  const handleFormSubmit = async (payload) => {
    try {
      if (modalConfig.mode === 'add') {
        const finalPayload = {
          ...payload,
          fullname: payload.fullname?.trim(),
          phone: payload.phone?.trim(),
          email: payload.email?.trim(),
          username: payload.phone?.trim(), 
          isactive: (payload.isactive === true || payload.isactive === 1 || String(payload.isactive) === '1') ? 1 : 0,
          isportal: (payload.isportal === true || payload.isportal === 1 || String(payload.isportal) === '1') ? 1 : 0,
        };

        await handleAddCustomer(finalPayload);
        
        setCurrentPage(1);
        setCustomerSearch('');
        setLocalSearch('');
        setPortalFilter('all');
        setStatusFilter('all');
      } else {
        await handleEditCustomer(modalConfig.data.id, payload);
      }
      handleCloseModal();
    } catch (error) {
      console.error("🔒 [Component/CustomerList] Huỷ đóng modal do API trả lỗi:", error.message);
    }
  };

  return (
    <div className="flex flex-col">
      <main className="p-6 flex-1">
        {/* Banner thông báo hệ thống */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 flex items-start gap-3 rounded-r-lg">
          <span className="text-blue-500 mt-0.5">ⓘ</span>
          <p className="text-[13px] text-blue-800">
            Quản lý danh sách khách hàng: Đảm bảo tính hợp lệ của số điện thoại và email khi phân loại danh mục.
          </p>
        </div>

        {/* Toolbar & Filter bộ lọc hợp nhất */}
        <div className="flex flex-row items-center justify-between gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-wrap md:flex-nowrap">
          
          <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex-1 min-w-[280px] max-w-md relative">
            <FormInput 
              value={localSearch}
              placeholder="Tìm theo tên, số điện thoại, email..." 
              onChange={(e) => {
                setLocalSearch(e.target.value);
                setCustomerSearch(e.target.value); 
              }}
              className="bg-gray-50/50 border-gray-200 h-10 pr-10 focus:bg-white transition-all w-full"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </form>

          <div className="flex items-center gap-3 ml-auto flex-wrap sm:flex-nowrap justify-end w-full md:w-auto">
            <div className="flex gap-2 shrink-0">
              <select
                value={portalFilter}
                onChange={(e) => { setPortalFilter(e.target.value); setCurrentPage(1); }}
                className="border border-gray-200 rounded-lg px-3 py-2 text-[13px] bg-white outline-none focus:ring-2 focus:ring-blue-500/20 h-10 min-w-[140px] cursor-pointer"
              >
                <option value="all">Tất cả tài khoản</option>
                <option value="portal">Có tài khoản Portal</option>
                <option value="non-portal">Chưa tạo tài khoản</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="border border-gray-200 rounded-lg px-3 py-2 text-[13px] bg-white outline-none focus:ring-2 focus:ring-blue-500/20 h-10 min-w-[140px] cursor-pointer"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Ngừng hoạt động</option>
              </select>
            </div>

            <Button 
              onClick={handleOpenAddModal} 
              className="w-fit px-12 h-10 shadow-md shrink-0 whitespace-nowrap"
            >
              <span className="text-xl font-light mr-2">+</span> Thêm khách hàng
            </Button>
          </div>
        </div>

        {/* Bảng dữ liệu */}
        <div className="w-full">
          <CustomerListTable 
            customers={customers} 
            isLoading={loading} 
            onViewDetail={handleViewDetail}
            onEdit={handleOpenEditModal} 
            onDelete={handleDeleteCustomer} 
          />
        </div>

        {/* Hệ thống Phân trang số trực quan */}
        {!loading && totalPages > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 px-2 gap-4">
            <div className="text-sm text-gray-500">
              Hiển thị trang <span className="font-semibold text-gray-900">{currentPage}</span> trong tổng số <span className="font-semibold text-gray-900">{totalPages}</span> trang khách hàng
            </div>

            <div className="flex gap-1.5">
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
      </main>

      {/* Quản lý Modals */}
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