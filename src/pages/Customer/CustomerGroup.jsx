import { useState } from 'react';
import { useCustomerGroups } from '../../hooks/Customer/useCustomer_Group';
import CustomerGroupTable from '../../components/partials/table/customer/CustomerGroupTable';
import Modal from '../../components/skeleton/Modal';
import FormInsertCustomerGroup from '../../components/partials/forms/customer/customer-group/FormInsert-CustomerGroup';
import FormEditCustomerGroup from '../../components/partials/forms/customer/customer-group/FormEdit-CustomerGroup';
import Button from '../../components/skeleton/Button';

const CustomerGroup = () => {
  const {
    filteredGroups,
    loading,
    isSaving,
    searchQuery,
    setSearchQuery,
    handleSearchSubmit,
    handleAddGroup,
    handleEditGroup,
    handleDeleteGroup
  } = useCustomerGroups();

  const [modalConfig, setModalConfig] = useState({ isOpen: false, mode: 'add', targetId: null });

  const handleOpenAddModal = () => {
    setModalConfig({ isOpen: true, mode: 'add', targetId: null });
  };

  const handleOpenEditModal = (id) => {
    setModalConfig({ isOpen: true, mode: 'edit', targetId: id });
  };

  const handleCloseModal = () => {
    setModalConfig({ isOpen: false, mode: 'add', targetId: null });
  };

  // Luồng xử lý submit tập trung chuyển tiếp dữ liệu payload xuống Hook
  const handleFormSubmit = async (payload) => {
    try {
      if (modalConfig.mode === 'add') {
        await handleAddGroup(payload);
      } else {
        // Truyền cả targetId và payload thuần từ Form để Hook tự nhồi { id } vào
        await handleEditGroup(modalConfig.targetId, payload);
      }
      handleCloseModal();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Thao tác danh mục thất bại';
      alert(errorMsg);
    }
  };

  const onSearchClick = (e) => {
    e.preventDefault();
    handleSearchSubmit(e);
  };

  // Tìm đối tượng dữ liệu cũ đổ vào Form Chỉnh sửa
  const activeInitialData = filteredGroups.find(g => g.id === modalConfig.targetId);

  return (
    <div className="flex flex-col gap-5 w-full text-[#191C1D] animate-fade-in">
      
      {/* Thanh Action: Tìm kiếm & Nút thêm mới - Đồng bộ UI phẳng */}
      <form 
        onSubmit={onSearchClick} 
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-4 bg-white border border-slate-100 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] gap-4"
      >
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-80 h-10">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm select-none">🔍</span>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc mã nhóm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-full pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-[#0037B0] transition-colors shadow-2xs"
            />
          </div>
          
          <Button 
            type="submit" 
            variant="primary" 
            className="h-10 px-6 text-xs font-semibold rounded-xl shadow-xs bg-slate-800 text-white hover:bg-slate-900 transition-all"
          >
            Tìm kiếm
          </Button>
        </div>

        <Button 
          type="button" 
          variant="primary"
          onClick={handleOpenAddModal}
          className="bg-[#0037B0] hover:bg-[#00267A] h-10 px-5 text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm transition-all text-white flex items-center gap-2" 
        >
          <span>➕</span> Thêm nhóm
        </Button>
      </form>

      {/* Bảng hiển thị dữ liệu */}
      <div className="w-full bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden transition-all">
        {loading ? (
          <div className="p-10 text-center text-slate-400 text-xs animate-pulse">
            ⏳ Đang đồng bộ danh mục nhóm từ máy chủ...
          </div>
        ) : (
          <CustomerGroupTable 
            groups={filteredGroups} 
            onEdit={handleOpenEditModal} 
            onDelete={handleDeleteGroup} 
          />
        )}
      </div>

      {/* Modal Form Thêm / Sửa nhóm */}
      <Modal 
        isOpen={modalConfig.isOpen} 
        onClose={handleCloseModal} 
        title={modalConfig.mode === 'add' ? 'Thêm mới nhóm khách hàng' : 'Cập nhật thông tin nhóm'}
      >
        {modalConfig.mode === 'add' ? (
          <FormInsertCustomerGroup 
            onClose={handleCloseModal} 
            onSubmit={handleFormSubmit} 
            isSaving={isSaving} 
          />
        ) : (
          <FormEditCustomerGroup 
            initialData={activeInitialData} 
            onClose={handleCloseModal} 
            onSubmit={handleFormSubmit} 
            isSaving={isSaving} 
          />
        )}
      </Modal>
    </div>
  );
};

export default CustomerGroup;