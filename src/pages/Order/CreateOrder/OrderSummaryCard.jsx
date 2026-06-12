import { useEffect, useState } from 'react';
import Button from '../../../components/skeleton/Button';
import { useOrderSummaryCard } from '../../../hooks/Order/useOrderSummaryCard';

const OrderSummaryCard = ({ 
  products, subtotal, vat, total, customer, shippingUnit, shippingCode, generalNote, generalImages, 
  recordedAudioFile, 
  onSaveDraft, onCreateAndAwait, onSubmit, submitLabel, isSubmitting: parentSubmitting 
}) => {
  const formatCurrency = (value) => new Intl.NumberFormat('en-US').format(value || 0);
  const [recordedUrl, setRecordedUrl] = useState('');

  useEffect(() => {
    let rBlobUrl = '';
    if (!recordedAudioFile) {
      setRecordedUrl('');
      return;
    }
    if (typeof recordedAudioFile === 'string') {
      setRecordedUrl(recordedAudioFile);
    } else if (recordedAudioFile.previewUrl) {
      setRecordedUrl(recordedAudioFile.previewUrl);
    } else if (recordedAudioFile instanceof Blob || recordedAudioFile instanceof File) {
      try {
        rBlobUrl = URL.createObjectURL(recordedAudioFile);
        setRecordedUrl(rBlobUrl);
      } catch (e) { setRecordedUrl(''); }
    }
    return () => { if (rBlobUrl && rBlobUrl.startsWith('blob:')) URL.revokeObjectURL(rBlobUrl); };
  }, [recordedAudioFile]);

  const { isSubmitting, handleCreateOrderSubmit, handleSaveDraftSubmit } = useOrderSummaryCard({
    customer, products, shippingUnit, shippingCode, generalNote, generalImages, recordedAudioFile
  });

  const activeSubmitting = parentSubmitting || isSubmitting;

  return (
    <div className="w-full bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden transition-all duration-200">
      <div className="bg-gradient-to-r from-gray-50 to-slate-50/50 px-5 py-3.5 border-b border-gray-100">
        <h3 className="text-[13px] font-bold uppercase tracking-wider text-gray-700">Tóm tắt đơn hàng</h3>
      </div>
      
      <div className="p-5 flex flex-col gap-3.5 text-[12px]">
        <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
          {products?.map((p, i) => (
            <div key={p.id || i} className="flex justify-between items-start pb-2.5 border-b border-gray-100/60 last:border-0 last:pb-0">
              <div className="flex flex-col gap-0.5 max-w-[210px]">
                <span className="font-bold text-[11px] uppercase tracking-tight text-gray-800 truncate">{p.name || 'SẢN PHẨM MỚI'}</span>
                <span className="text-gray-400 text-[11px] font-medium">{p.quantity || 1} × {formatCurrency(p.appliedPrice || p.applied_price)} ₫</span>
              </div>
              <span className="font-bold text-gray-700">{formatCurrency((p.quantity || 1) * (p.appliedPrice || p.applied_price || 0))} ₫</span>
            </div>
          ))}
        </div>

        {/* HIỂN THỊ FILE AUDIO CHỈ DẪN */}
        {recordedUrl && (
          <div className="flex flex-col gap-2 pt-2 border-t border-gray-100/80">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Tệp âm thanh đính kèm:</span>
            <div className="flex items-center gap-2 bg-gray-50/60 p-1 rounded-lg border border-gray-100">
              <span className="text-xs text-blue-600 font-bold whitespace-nowrap px-1">🎙️ Ghi âm:</span>
              <audio src={recordedUrl} controls className="h-6 w-full text-xs outline-none" />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 pt-2 border-t border-gray-100/80 text-gray-500 font-medium">
          <div className="flex justify-between items-center">
            <span>Tạm tính hệ thống:</span>
            <span className="text-gray-800 font-semibold">{formatCurrency(subtotal)} ₫</span>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-3 mt-1 flex flex-col gap-0.5">
          <div className="flex justify-between items-baseline">
            <span className="font-bold text-[11px] uppercase tracking-wider text-gray-500">Tổng thanh toán</span>
            <span className="text-xl font-black text-blue-600 tracking-tight">{formatCurrency(total)} ₫</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <Button 
            type="button" variant="primary" onClick={onSubmit || handleCreateOrderSubmit} disabled={activeSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 h-9 rounded-lg text-[12px] font-bold"
          >
            {activeSubmitting ? '⏳ ĐANG XỬ LÝ...' : (submitLabel || 'Tạo đơn hàng')}
          </Button>
          
          {(onCreateAndAwait || onSaveDraft) && (
            <Button 
              type="button" variant="secondary" disabled={activeSubmitting}
              onClick={(e) => {
                e.preventDefault(); e.stopPropagation();
                if (onSaveDraft) onSaveDraft(); else handleSaveDraftSubmit();
              }}
              className="w-full bg-amber-100 text-amber-700 hover:bg-amber-200 h-9 rounded-lg text-[12px] font-bold"
            >
              {activeSubmitting ? '⏳ ĐANG LƯU...' : 'Lưu nháp'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderSummaryCard;