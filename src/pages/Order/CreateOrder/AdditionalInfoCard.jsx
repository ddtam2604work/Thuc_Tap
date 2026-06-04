import { useRef } from 'react';
import { useAdditionalInfoCard } from '../../../hooks/Order/useAdditionalInfoCard';

const AdditionalInfoCard = ({ 
  shippingUnit, setShippingUnit, 
  shippingCode, setShippingCode, 
  generalNote, setGeneralNote,
  audioFile, setAudioFile
}) => {
  const imageInputRef = useRef(null);
  const audioInputRef = useRef(null);

  const {
    activeTab,
    setActiveTab,
    isRecording,
    recordedPreviewUrl,
    uploadedPreviewUrl,
    startRecording,
    stopRecording,
    handleAudioUpload,
    removeRecordedAudio,
    removeUploadedAudio,
    handleImageUpload,
    handleRemoveImage
  } = useAdditionalInfoCard({
    recordedAudioFile: audioFile, 
    setRecordedAudioFile: setAudioFile, 
    uploadedAudioFile: audioFile, 
    setUploadedAudioFile: setAudioFile
  });

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-5 flex flex-col gap-3.5">
        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Ghi chú chung & Tệp đính kèm</h3>
        
        {/* THANH CHUYỂN TABS CHUẨN UX */}
        <div className="flex p-1 bg-gray-100 rounded-xl w-full">
          <button
            type="button"
            onClick={() => setActiveTab('RECORD')}
            className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all duration-200 ${activeTab === 'RECORD' ? 'bg-white text-blue-600 shadow-xs' : 'text-gray-500 hover:text-gray-800'}`}
          >
            🎙️ Ghi trực tiếp
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('AUDIO_FILE')}
            className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all duration-200 ${activeTab === 'AUDIO_FILE' ? 'bg-white text-blue-600 shadow-xs' : 'text-gray-500 hover:text-gray-800'}`}
          >
            📤 Tải file âm
          </button>
        </div>

        {/* KHÔNG GIAN HIỂN THỊ ĐỘC LẬP THEO TỪNG TAB */}
        <div className="min-h-[50px] flex flex-col justify-center bg-gray-50/40 p-2.5 rounded-xl border border-gray-100/60">
          
          {/* TAB 1: GHI ÂM TRỰC TIẾP */}
          {activeTab === 'RECORD' && (
            <div className="flex flex-col gap-2 w-full animate-in fade-in duration-150">
              <button 
                type="button" 
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-full h-8 text-[11px] font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse shadow-xs border-transparent' : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-2xs'}`}
              >
                {isRecording ? '⏹ DỪNG THU (HỦY ĐÈN BÁO MICRO)' : '🎙️ BẮM ĐỂ GHI ÂM GIỌNG NÓI'}
              </button>

              {recordedPreviewUrl && !isRecording && (
                <div className="bg-white border border-gray-100 p-1.5 rounded-lg flex items-center justify-between gap-2 shadow-3xs">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <span className="text-xs shrink-0 select-none">🔴 Record:</span>
                    <audio src={recordedPreviewUrl} controls className="h-6 w-full max-w-[170px] text-xs outline-none" />
                  </div>
                  <button type="button" onClick={removeRecordedAudio} className="text-[10px] w-5 h-5 bg-red-50 text-red-500 font-bold rounded-full flex items-center justify-center hover:bg-red-100">✕</button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TẢI FILE GHI ÂM SẴN CÓ */}
          {activeTab === 'AUDIO_FILE' && (
            <div className="flex flex-col gap-2 w-full animate-in fade-in duration-150">
              <button 
                type="button" 
                onClick={() => audioInputRef.current?.click()}
                className="w-full h-8 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-2xs text-[11px] font-bold rounded-lg flex items-center justify-center gap-1.5"
              >
                📂 Chọn tệp âm thanh (.mp3, .wav, .m4a)
              </button>
              <input type="file" ref={audioInputRef} accept="audio/*" onChange={handleAudioUpload} className="hidden" />

              {uploadedPreviewUrl && (
                <div className="bg-white border border-gray-100 p-1.5 rounded-lg flex items-center justify-between gap-2 shadow-3xs">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <span className="text-xs shrink-0 select-none">📁 File:</span>
                    <audio src={uploadedPreviewUrl} controls className="h-6 w-full max-w-[170px] text-xs outline-none" />
                  </div>
                  <button type="button" onClick={removeUploadedAudio} className="text-[10px] w-5 h-5 bg-red-50 text-red-500 font-bold rounded-full flex items-center justify-center hover:bg-red-100">✕</button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Nội dung text note */}
        <textarea 
          rows="3" 
          value={generalNote} 
          onChange={(e) => setGeneralNote(e.target.value)}
          placeholder="Lưu ý về thời gian giao hàng, đóng gói đặc biệt..."
          className="w-full p-2.5 border border-gray-200 rounded-lg text-[12px] placeholder-gray-400 bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-gray-700"
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