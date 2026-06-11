import DetailTwoColumnLayout from '../../components/partials/layout/DetailTwoColumnLayout';
import { useOrderDetail } from '../../hooks/Order/useOrderDetail';
import CustomerInfoCard from './OrderDetail/CustomerInfoCard';
import ProductOrderList from './OrderDetail/ProductOrderList';
import OrderTimeline from './OrderDetail/OrderTimeline';
import OrderActionCard from './OrderDetail/OrderActionCard';
import OrderFinancialSummary from './OrderDetail/OrderFinancialSummary';
import LogsView from './OrderDetail/LogsView';
import HistoryView from './OrderDetail/HistoryView';
import { useState, useEffect } from 'react';

const OrderDetail = () => {
  const { 
    isLoading, 
    orderStatus,
    handleStartProduction,
    order, 
    timeline,
    refreshKey,
    audioNoteUrl, // 🌟 KỸ THUẬT: Bóc tách URL luồng stream file ghi âm từ Custom Hook
    logs, history, logsLoading, historyLoading, fetchLogs, fetchHistory,
    handleConfirmOrder, 
    handleApproveAndDebit, 
    handleCompleteStage, 
    handleHandoverShipping,
    handleCompleteOrder, 
    handleCancelInvoice, 
    handleRejectOrder, 
    handleEditOrder, 
    handlePrintInvoice, 
    handlePrintJobTicket, 
    handleBack 
  } = useOrderDetail();

  const [activeDetailTab, setActiveDetailTab] = useState('INFO');

  useEffect(() => {
    if (activeDetailTab === 'LOGS' && logs.length === 0) fetchLogs();
    if (activeDetailTab === 'HISTORY' && history.length === 0) fetchHistory();
  }, [activeDetailTab, fetchLogs, fetchHistory, logs.length, history.length]);

  if (isLoading || !order || Object.keys(order).length === 0) {
    return (
      <div className="w-full min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-2">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-semibold text-gray-500 tracking-wide animate-pulse">
          Đang truy xuất thông tin tiến trình đơn hàng...
        </span>
      </div>
    );
  }

  return (
    <div key={refreshKey} className="w-full animate-in fade-in duration-200">
      <DetailTwoColumnLayout
        backLabel="Quay lại danh sách đơn hàng"
        onBackClick={handleBack}
        
        mainContent={
          <div className="flex flex-col gap-4.5 w-full">
            {/* Hệ thống Tabs chuyển đổi thông tin */}
            <div className="flex gap-2 border-b border-gray-200">
              <button 
                onClick={() => setActiveDetailTab('INFO')} 
                className={`px-4 py-2 font-medium transition-all text-xs lg:text-sm ${activeDetailTab === 'INFO' ? 'border-b-2 border-blue-600 text-blue-600 font-bold' : 'text-gray-600 hover:text-gray-900'}`}
              >
                📋 Thông tin đơn
              </button>
            </div>

            {/* Nội dung chi tiết theo Tab được chọn */}
            {activeDetailTab === 'INFO' && (
              <>
                <CustomerInfoCard customer={order?.customer || {}} />
                
                {/* 🌟 CẢI TIẾN: Gắn kết prop audioNoteUrl vào để render cụm Player nghe nhạc/tải file đính kèm */}
                <ProductOrderList 
                  products={order?.products || []} 
                  generalNote={order?.generalNote || ''} 
                  audioNoteUrl={audioNoteUrl} 
                />
              </>
            )}
            
            {activeDetailTab === 'LOGS' && <LogsView logs={logs} isLoading={logsLoading} />}
            {activeDetailTab === 'HISTORY' && <HistoryView history={history} isLoading={historyLoading} />}
          </div>
        }

        sidebarContent={
          <div className="flex flex-col gap-4.5 w-full">
            {/* Tiến trình phân đoạn Workflow trực quan */}
            <OrderTimeline timeline={timeline} />
            
            {/* Bộ điều hướng hành động tương thích theo Role và Trạng thái */}
            <OrderActionCard 
              status={orderStatus}
              onConfirm={handleConfirmOrder}
              onReject={handleRejectOrder}
              onEdit={handleEditOrder} 
              onApprove={handleApproveAndDebit}
              onPrint={handlePrintInvoice}
              onCompleteStage={handleCompleteStage}
              onStartProduction={handleStartProduction}
              onHandoverShipping={handleHandoverShipping}
              onCompleteOrder={handleCompleteOrder} 
              onCancelInvoice={handleCancelInvoice}
              onPrintJobTicket={handlePrintJobTicket}
            />
            
            {/* Tóm tắt tài chính công nợ khách hàng */}
            <OrderFinancialSummary summary={order?.summary || { items: [] }} liability={order?.liability || {}} />
          </div>
        }
      />
    </div>
  );
};

export default OrderDetail;