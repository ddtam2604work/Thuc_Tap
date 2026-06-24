import { useState } from 'react';
import { useAdditionalInfoCard } from '../../../hooks/Order/useAdditionalInfoCard';

const AdditionalInfoCard = ({ 
  shippingUnit, setShippingUnit, 
  shippingCode, setShippingCode, 
  generalNote, setGeneralNote,
  generalImages, setGeneralImages,
  recordedAudioFile, setRecordedAudioFile,
  uploadGeneralImages
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
  
  const [isUploading, setIsUploading] = useState(false);

  // const handleFileChange = async (e) => {
  //   const files = Array.from(e.target.files || []);
  //   if (!files.length) return;
    
  //   setIsUploading(true);
  //   await uploadGeneralImages(files);
  //   setIsUploading(false);
    
  //   e.target.value = null;
  // };

  const handleRemoveImage = (indexToRemove) => {
    const targetImg = generalImages?.[indexToRemove];
    if (targetImg?.previewUrl) {
      URL.revokeObjectURL(targetImg.previewUrl);
    }
    const updatedImages = generalImages?.filter((_, idx) => idx !== indexToRemove) || [];
    setGeneralImages(updatedImages);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-5 flex flex-col gap-3.5 relative">
        {isUploading && (
          <div className="absolute inset-0 bg-white/80 z-20 flex flex-col items-center justify-center rounded-xl">
            <span className="text-sm font-bold text-blue-600">Đang tải lên...</span>
            <span className="text-xs text-gray-500">Vui lòng chờ trong giây lát.</span>
          </div>
        )}
        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Ghi chú chung & Tệp đính kèm</h3>
        
        {/* General Attachments Upload */}
        <div className="flex flex-wrap gap-2 mt-1">
          {(generalImages || []).map((imgObj, i) => (
            <div key={i} className="w-[82px] h-[82px] bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center overflow-hidden relative group shadow-2xs">
              {imgObj.isImage ? (
                <img src={imgObj.previewUrl} alt={imgObj.name} className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-1">
                  <span className="text-2xl">📄</span>
                  <span className="text-[9px] font-bold text-gray-500 truncate w-full">{imgObj.name}</span>
                </div>
              )}
              <button 
                type="button" 
                onClick={() => handleRemoveImage(i)} 
                className="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150"
              >
                ✕
              </button>
            </div>
          ))}
          
          {/* <label className="w-[82px] h-[82px] border-2 border-dashed border-gray-200 hover:border-blue-500/40 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer bg-gray-50/50 hover:bg-blue-50/20 transition-all duration-200 active:scale-95">
            <span className="text-gray-400 text-sm">📎</span>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Đính kèm</span>
            <input 
              type="file" 
              multiple 
              onChange={handleFileChange} 
              className="hidden" 
            />
          </label> */}
        </div>
        
        {/* KHÔNG GIAN THAO TÁC GHI ÂM TRỰC TIẾP */}
        <div className="min-h-[50px] flex flex-col justify-center bg-gray-50/40 p-2.5 rounded-xl border border-gray-100/60 mt-2">
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