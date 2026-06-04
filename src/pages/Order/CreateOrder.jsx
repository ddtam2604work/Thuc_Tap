import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/skeleton/Button';
import { useCreateOrder } from '../../hooks/Order/useCreateOrder';
import Modal from '../../components/skeleton/Modal';
import FormInsertCustomerList from '../../components/partials/forms/customer/customer-list/FormInsert-CustomerList';
import { useCustomerGroups } from '../../hooks/Customer/useCustomer_Group';
import { customerService } from '../../services/customerService';

import CustomerInfoSection from './CreateOrder/CustomerInfoSection';
import ProductListSection from './CreateOrder/ProductListSection';
import OrderSummaryCard from './CreateOrder/OrderSummaryCard';
import AdditionalInfoCard from './CreateOrder/AdditionalInfoCard';

const CreateOrder = () => {
  const navigate = useNavigate();
  
  // 👉 Giải cấu trúc hệ thống Hook lõi quản lý trạng thái và tệp tin đa phương tiện
  const {
    customer, setCustomer,
    shippingUnit, setShippingUnit,
    shippingCode, setShippingCode,
    generalNote, setGeneralNote,
    products,
    catalog,
    isLoadingCatalog,
    generalImages, setGeneralImages,
    audioFile, setAudioFile,
    handleAddProduct,
    handleRemoveProduct,
    handleUpdateProduct,
    subtotal, vat, total,
    handleCreateOrderSubmit,
    handleSaveDraft,
    handleCreateAndAwait,
    isSubmitting
  } = useCreateOrder();

  const { filteredGroups, fetchGroups } = useCustomerGroups();

  // Nạp danh sách nhóm khách hàng phục vụ cho biểu mẫu tạo nhanh
  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const [modalConfig, setModalConfig] = useState({ isOpen: false, mode: 'add', data: null });
  const [isSavingCustomer, setIsSavingCustomer] = useState(false);

  // 🌟 NÂNG CẤP CHUYÊN NGHIỆP: Tạo khóa xoay vòng tín hiệu để đồng bộ dữ liệu ngầm cho component con
  const [customerRefreshKey, setCustomerRefreshKey] = useState(0);

  const handleOpenCreateModal = () => {
    setModalConfig({ isOpen: true, mode: 'add', data: null });
  };

  const handleCloseModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  // Xử lý tạo nhanh hồ sơ đối tác khách hàng trực tiếp tại form lập đơn
  const handleQuickAddCustomer = async (payload) => {
    setIsSavingCustomer(true);
    try {
      const response = await customerService.addCustomer(payload);
      if (response?.data?.errorCode === 0) throw new Error(response.data.message);
      
      const newCustomer = response?.data?.data || response?.data;
      if (newCustomer?.id) {
        setCustomer(newCustomer.id);
      }
      
      // 🌟 KÍCH HOẠT TẠI ĐÂY: Tăng giá trị key để kích hoạt component con tự động nạp lại danh sách mới ngầm
      setCustomerRefreshKey(prev => prev + 1);
      
      alert('Tạo nhanh khách hàng thành công!');
      handleCloseModal();
    } catch (error) {
      alert(error.response?.data?.message || error.message || 'Lỗi khi thêm khách hàng.');
    } finally {
      setIsSavingCustomer(false);
    }
  };

  return (
    <>
      <form onSubmit={handleCreateOrderSubmit} className="w-full flex flex-col gap-4.5 text-[#191C1D]">
        
        {/* ================= HEADER BAR ACTION ================= */}
        <div className="flex items-center gap-2.5 py-1.5 whitespace-nowrap">
          <Button 
            type="button" 
            variant="icon-dark" 
            onClick={() => navigate('/orders')} 
            disabled={isSubmitting}
            className="p-0 h-7.5 w-7.5 rounded-lg bg-white border border-gray-200/80 hover:bg-gray-50 flex items-center justify-center transition-all shadow-2xs disabled:opacity-50"
          >
            <span className="text-xs font-bold text-gray-500">←</span>
          </Button>
          <h1 className="text-lg font-bold tracking-tight text-gray-800">Tạo đơn hàng mới</h1>
        </div>

        {/* ================= MAIN CONTAINER WORKSPACE ================= */}
        <div className="w-full flex flex-col lg:flex-row items-start gap-4.5">
          
          {/* KHỐI BIỂU MẪU ĐIỀN THÔNG TIN (TRÁI) */}
          <div className="flex-1 w-full flex flex-col gap-4.5">
            {/* 🌟 NÂNG CẤP: Truyền refreshKey xuống ô thông tin khách hàng */}
            <CustomerInfoSection 
              customer={customer} 
              setCustomer={setCustomer} 
              onOpenCreateModal={handleOpenCreateModal} 
              refreshKey={customerRefreshKey}
            />
            
            <ProductListSection 
              products={products}
              catalog={catalog}
              isLoadingCatalog={isLoadingCatalog}
              onAddProduct={handleAddProduct}
              onRemoveProduct={handleRemoveProduct}
              onUpdateProduct={handleUpdateProduct}
            />
          </div>

          {/* KHỐI HOÁ ĐƠN VÀ TÍNH TOÁN (PHẢI) */}
          <div className="w-full lg:w-[380px] flex flex-col gap-4.5 shrink-0">
            <OrderSummaryCard 
              products={products}
              subtotal={subtotal}
              vat={vat}
              total={total}
              customer={customer}
              shippingUnit={shippingUnit}
              shippingCode={shippingCode}
              generalNote={generalNote}
              generalImages={generalImages}
              onSaveDraft={handleSaveDraft}
              onCreateAndAwait={handleCreateAndAwait}
              isSubmitting={isSubmitting}
            />
            
            <AdditionalInfoCard 
              shippingUnit={shippingUnit} 
              setShippingUnit={setShippingUnit}
              shippingCode={shippingCode} 
              setShippingCode={setShippingCode}
              generalNote={generalNote} 
              setGeneralNote={setGeneralNote}
              generalImages={generalImages}
              setGeneralImages={setGeneralImages}
              audioFile={audioFile}      
              setAudioFile={setAudioFile}
            />
          </div>

        </div>

        {/* Floating Action Button (FAB) */}
        <div className="fixed bottom-5 right-5 z-50">
          <button type="button" className="w-11 h-11 bg-gradient-to-tr from-blue-700 to-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center relative">
            <span className="text-base">💬</span>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border-2 border-white">3</span>
          </button>
        </div>
      </form>

      <Modal isOpen={modalConfig.isOpen} onClose={handleCloseModal} title="Tạo nhanh khách hàng" size="md">
        <FormInsertCustomerList onClose={handleCloseModal} onSubmit={handleQuickAddCustomer} isSaving={isSavingCustomer} categories={filteredGroups?.data || filteredGroups || []} />
      </Modal>
    </>
  );
};

export default CreateOrder;