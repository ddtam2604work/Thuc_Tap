import { useAdditionalInfoCard } from '../../../hooks/Order/useAdditionalInfoCard';

const AdditionalInfoCard = ({ 
  shippingUnit, setShippingUnit, 
  shippingCode, setShippingCode, 
  generalNote, setGeneralNote,
  recordedAudioFile, setRecordedAudioFile
}) => {
  const {
    isRecording,
    recordedPreviewUrl,
    startRecording,
    stopRecording,
    removeRecordedAudio
  } = useAdditionalInfoCard({
    recordedAudioFile, 
    setRecordedAudioFile
  });

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-5 flex flex-col gap-3.5">
        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Ghi chú chung & Tệp đính kèm</h3>
        
        {/* KHÔNG GIAN THAO TÁC GHI ÂM TRỰC TIẾP */}
        <div className="min-h-[50px] flex flex-col justify-center bg-gray-50/40 p-2.5 rounded-xl border border-gray-100/60">
          <div className="flex flex-col gap-2 w-full animate-in fade-in duration-150">
            <button 
              type="button" 
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-full h-8 text-[11px] font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse shadow-xs border-transparent' : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-2xs'}`}
            >
              {isRecording ? '⏹ DỪNG THU (HỦY ĐÈN BÁO MICRO)' : '🎙️ BẮM ĐỂ GHI ÂM GIỌNG NÓI'}
            </button>
          </div>
        </div>

        {/* VÙNG HIỂN THỊ FILE AUDIO ĐÃ THU */}
        {recordedPreviewUrl && !isRecording && (
          <div className="bg-white border border-blue-100 p-1.5 rounded-lg flex items-center justify-between gap-2 shadow-3xs">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <span className="text-xs shrink-0 select-none text-blue-600 font-semibold">🔴 Record:</span>
              <audio src={recordedPreviewUrl} controls className="h-6 w-full max-w-[170px] text-xs outline-none" />
            </div>
            <button type="button" onClick={removeRecordedAudio} className="text-[10px] w-5 h-5 bg-red-50 text-red-500 font-bold rounded-full flex items-center justify-center hover:bg-red-100">✕</button>
          </div>
        )}

        {/* Nội dung text note */}
        <textarea 
          rows="3" 
          value={generalNote} 
          onChange={(e) => setGeneralNote(e.target.value)}
          placeholder="Lưu ý về thời gian giao hàng, đóng gói đặc biệt..."
          className="w-full p-2.5 border border-gray-200 rounded-lg text-[12px] placeholder-gray-400 bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-gray-700 mt-2"
        />
      </div>

      {/* Khối Vận chuyển */}
      <div className="bg-white border border-gray-100 shadow-xs rounded-xl p-5 flex flex-col gap-3">
        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Thông tin vận chuyển</h3>
        <div className="flex flex-col gap-2">
          <input 
            type="text" 
            value={shippingUnit} 
            onChange={(e) => setShippingUnit(e.target.value)}
            placeholder="Tên đơn vị (Grab, GHTK, Xe tải cty...)"
            className="w-full h-9 px-3 border border-gray-200 rounded-lg text-[12px] placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-gray-700"
          />
          <input 
            type="text" 
            value={shippingCode} 
            onChange={(e) => setShippingCode(e.target.value)}
            placeholder="Mã vận đơn / Số xe"
            className="w-full h-9 px-3 border border-gray-200 rounded-lg text-[12px] placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-gray-700"
          />
        </div>
      </div>
    </div>
  );
};

export default AdditionalInfoCard;