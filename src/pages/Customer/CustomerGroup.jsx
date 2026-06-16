import { useState } from 'react';
import { useCustomerGroups } from '../../hooks/Customer/useCustomer_Group';
import CustomerGroupTable from '../../components/partials/table/customer/CustomerGroupTable';
import Modal from '../../components/skeleton/Modal';
import FormInsertCustomerGroup from '../../components/partials/forms/customer/customer-group/FormInsert-CustomerGroup';
import FormEditCustomerGroup from '../../components/partials/forms/customer/customer-group/FormEdit-CustomerGroup';
import Button from '../../components/skeleton/Button';
import FormInput from '../../components/skeleton/FormInput';

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
    <div className="flex flex-col">
      <main className="p-6 flex-1">
        {/* Banner thông báo - Đồng bộ thiết kế chuẩn AccountPage */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 flex items-start gap-3 rounded-r-lg">
          <span className="text-blue-500 mt-0.5">ⓘ</span>
          <p className="text-[13px] text-blue-800">
            Quy tắc quản lý: Phân loại nhóm khách hàng chuẩn xác giúp tối ưu hóa hệ thống chính sách giá, ưu đãi và phân khúc quản trị dữ liệu.
          </p>
        </div>

        {/* Toolbar hành động & Bộ lọc - Đồng bộ cấu trúc phẳng AccountPage */}
        <div className="flex flex-row items-center justify-between gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-wrap md:flex-nowrap">
          
          {/* Form tìm kiếm tích hợp FormInput chuẩn */}
          <form onSubmit={onSearchClick} className="flex-1 min-w-[280px] max-w-md relative">
            <FormInput 
              value={searchQuery}
              placeholder="Tìm kiếm theo tên hoặc mã nhóm..." 
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-50/50 border-gray-200 h-10 pr-10 focus:bg-white transition-all w-full"
            />
            {/* Icon kính lúp định vị tuyệt đối */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </form>

          {/* Nút thêm mới thiết kế theo khuôn mẫu AccountPage */}
          <div className="flex items-center gap-3 ml-auto flex-wrap sm:flex-nowrap justify-end w-full md:w-auto">
            <Button 
              type="button" 
              onClick={handleOpenAddModal} 
              className="w-fit px-12 h-10 shadow-md shrink-0 whitespace-nowrap"
            >
              <span className="text-xl font-light mr-2">+</span> Thêm nhóm
            </Button>
          </div>
        </div>

        {/* ĐÃ ĐIỀU CHỈNH: Bỏ wrapper bị dư style để đồng bộ với Table */}
        <div className="w-full">
          <CustomerGroupTable 
            groups={filteredGroups}
            isLoading={loading}
            onEdit={handleOpenEditModal} 
            onDelete={handleDeleteGroup} 
          />
        </div>
      </main>

      {/* Cấu trúc Modal Form Thêm / Sửa nhóm */}
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