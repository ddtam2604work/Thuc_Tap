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
  
  const {
    customer, setCustomer,
    shippingUnit, setShippingUnit,
    shippingCode, setShippingCode,
    generalNote, setGeneralNote,
    products, catalog, isLoadingCatalog,
    generalImages, setGeneralImages,
    recordedAudioFile, setRecordedAudioFile, // Chỉ nhận biến ghi âm
    handleAddProduct, handleRemoveProduct, handleUpdateProduct,
    subtotal, vat, total,
    handleCreateOrderSubmit, handleSaveDraft, handleCreateAndAwait,
    isSubmitting
  } = useCreateOrder();

  const { filteredGroups, fetchGroups } = useCustomerGroups();

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const [modalConfig, setModalConfig] = useState({ isOpen: false, mode: 'add', data: null });
  const [isSavingCustomer, setIsSavingCustomer] = useState(false);
  const [customerRefreshKey, setCustomerRefreshKey] = useState(0);

  const handleOpenCreateModal = () => {
    setModalConfig({ isOpen: true, mode: 'add', data: null });
  };

  const handleCloseModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  const handleQuickAddCustomer = async (payload) => {
    setIsSavingCustomer(true);
    try {
      const response = await customerService.addCustomer(payload);
      if (response?.data?.errorCode === 0) throw new Error(response.data.message);
      
      const newCustomer = response?.data?.data || response?.data;
      if (newCustomer?.id) setCustomer(newCustomer.id);
      
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
        <div className="flex items-center gap-2.5 py-1.5 whitespace-nowrap">
          <Button 
            type="button" variant="icon-dark" onClick={() => navigate('/orders')} disabled={isSubmitting}
            className="p-0 h-7.5 w-7.5 rounded-lg bg-white border border-gray-200/80 hover:bg-gray-50 flex items-center justify-center transition-all shadow-2xs"
          >
            <span className="text-xs font-bold text-gray-500">←</span>
          </Button>
          <h1 className="text-lg font-bold tracking-tight text-gray-800">Tạo đơn hàng mới</h1>
        </div>

        <div className="w-full flex flex-col lg:flex-row items-start gap-4.5">
          <div className="flex-1 w-full flex flex-col gap-4.5">
            <CustomerInfoSection customer={customer} setCustomer={setCustomer} onOpenCreateModal={handleOpenCreateModal} refreshKey={customerRefreshKey} />
            <ProductListSection products={products} catalog={catalog} isLoadingCatalog={isLoadingCatalog} onAddProduct={handleAddProduct} onRemoveProduct={handleRemoveProduct} onUpdateProduct={handleUpdateProduct} />
          </div>

          <div className="w-full lg:w-[380px] flex flex-col gap-4.5 shrink-0">
            <OrderSummaryCard 
              products={products} subtotal={subtotal} vat={vat} total={total} customer={customer}
              shippingUnit={shippingUnit} shippingCode={shippingCode} generalNote={generalNote} generalImages={generalImages}
              recordedAudioFile={recordedAudioFile}
              onSaveDraft={handleSaveDraft} onCreateAndAwait={handleCreateAndAwait} isSubmitting={isSubmitting}
            />
            
            <AdditionalInfoCard 
              shippingUnit={shippingUnit} setShippingUnit={setShippingUnit}
              shippingCode={shippingCode} setShippingCode={setShippingCode}
              generalNote={generalNote} setGeneralNote={setGeneralNote}
              generalImages={generalImages} setGeneralImages={setGeneralImages}
              recordedAudioFile={recordedAudioFile} setRecordedAudioFile={setRecordedAudioFile}
            />
          </div>
        </div>
      </form>

      <Modal isOpen={modalConfig.isOpen} onClose={handleCloseModal} title="Tạo nhanh khách hàng" size="md">
        <FormInsertCustomerList onClose={handleCloseModal} onSubmit={handleQuickAddCustomer} isSaving={isSavingCustomer} categories={filteredGroups?.data || filteredGroups || []} />
      </Modal>
    </>
  );
};

export default CreateOrder;