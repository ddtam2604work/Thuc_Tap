import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEditOrder } from '../../hooks/Order/useEditOrder';
import Button from '../../components/skeleton/Button';
import CustomerInfoSection from './CreateOrder/CustomerInfoSection';
import ProductListSection from './CreateOrder/ProductListSection';
import OrderSummaryCard from './CreateOrder/OrderSummaryCard';
import AdditionalInfoCard from './CreateOrder/AdditionalInfoCard';

// --- IMPORT CÁC HOOK ĐIỀU KHIỂN DÙNG CHUNG ---
import { useConfirm } from '../../context/ConfirmContext';
import { useNotification } from '../../context/NotificationContext';

const EditOrder = () => {
  const navigate = useNavigate();
  const {
    customer, setCustomer,
    shippingUnit, setShippingUnit,
    shippingCode, setShippingCode,
    generalNote, setGeneralNote,
    products, catalog, isLoadingCatalog,
    generalImages, setGeneralImages,
    recordedAudioFile, setRecordedAudioFile,
    uploadedAudioFile, setUploadedAudioFile,
    handleAddProduct, handleRemoveProduct, handleUpdateProduct,
    subtotal, vat, total, handleUpdateOrderSubmit, handleSaveDraft,
    isSubmitting, isLoading, orderStatus
  } = useEditOrder();

  // Kích hoạt các công cụ thông báo và xác nhận dùng chung toàn cục
  const { confirm } = useConfirm();
  const { showToast } = useNotification();

  // Biến đổi nhãn chữ động trên nút hành động dựa trên tiến trình workflow của đơn hàng gốc
  const saveButtonLabel = useMemo(() => {
    if (isSubmitting) return '⏳ Đang ghi nhận thay đổi...';
    switch (orderStatus?.toUpperCase()) {
      case 'DRAFT': return 'Lưu bản nháp';
      case 'NEW': return 'Lưu thay đổi'; 
      case 'AWAIT': return 'Lưu thay đổi'; 
      case 'CONFIRMED': return 'Lưu thay đổi';
      case 'IN_PROGRESS': return 'Lưu thay đổi';
      default: return 'Lưu thay đổi';
    }
  }, [orderStatus, isSubmitting]);

  // 🌟 BỔ SUNG LUỒNG ĐÁNH CHẶN: Đợi người dùng phản hồi trên Custom Confirm Modal trước khi cho phép lùi trang
  const handleBackClick = async () => {
    const isConfirmed = await confirm({
      title: 'Hủy bỏ chỉnh sửa đơn hàng?',
      message: 'Bạn có chắc chắn muốn rời khỏi trang chỉnh sửa này không? Mọi thông tin vừa thay đổi cấu hình sẽ không được lưu lại.',
      confirmText: 'Đồng ý thoát',
      cancelText: 'Ở lại kiểm tra',
      type: 'danger'
    });

    if (isConfirmed) {
      navigate(-1);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-2">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-semibold text-gray-500 tracking-wide animate-pulse">
          Đang cấu trúc lại dữ liệu và tệp đính thiết kế đơn hàng...
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={handleUpdateOrderSubmit} className="w-full flex flex-col gap-4.5 text-[#191C1D] animate-in fade-in duration-200">
      
      {/* ================= HEADER BAR ACTION ================= */}
      <div className="flex items-center gap-2.5 py-1.5 whitespace-nowrap">
        <Button 
          type="button" 
          variant="icon-dark" 
          onClick={handleBackClick} // 🛠️ ĐÃ ĐIỀU CHỈNH: Thay thế hàm nội tuyến cũ bằng handleBackClick đã bọc Confirm guard
          disabled={isSubmitting}
          className="p-0 h-7.5 w-7.5 rounded-lg bg-white border border-gray-200/80 hover:bg-gray-50 flex items-center justify-center transition-all shadow-2xs disabled:opacity-50"
        >
          <span className="text-xs font-bold text-gray-500">←</span>
        </Button>
        <h1 className="text-lg font-bold tracking-tight text-gray-800">Chỉnh sửa đơn hàng</h1>
      </div>

      {/* ================= MAIN CONTAINER WORKSPACE ================= */}
      <div className="w-full flex flex-col lg:flex-row items-start gap-4.5">
        
        {/* KHỐI BIỂU MẪU ĐIỀN THÔNG TIN (TRÁI) */}
        <div className="flex-1 w-full flex flex-col gap-4.5">
          <CustomerInfoSection 
            customer={customer} 
            setCustomer={setCustomer} 
            onOpenCreateModal={() => {}} 
            refreshKey={0}
            disabled={true} // Khóa thông tin đối tác ở trang sửa đơn nhằm bảo mật luồng kế toán
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
            onSubmit={handleUpdateOrderSubmit}
            submitLabel={saveButtonLabel}
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
            audioFile={recordedAudioFile || uploadedAudioFile}      
            setAudioFile={(file) => {
              // Nếu đối tác tải file ghi âm mới lên hoặc ghi âm đè, cập nhật state luồng ghi âm mới
              if (file instanceof File || (file && file.file)) {
                setRecordedAudioFile(file);
                setUploadedAudioFile(null);
              } else {
                // Nếu file bị xóa hoặc reset về null
                setRecordedAudioFile(null);
                setUploadedAudioFile(file);
              }
            }}
          />
        </div>

      </div>
    </form>
  );
};

export default EditOrder;