import { useState, useRef, useCallback } from 'react';

export const useAdditionalInfoCard = ({ 
  recordedAudioFile, setRecordedAudioFile, // 🌟 Tuyến dữ liệu 1: Ghi âm trực tiếp
  uploadedAudioFile, setUploadedAudioFile  // 🌟 Tuyến dữ liệu 2: File upload có sẵn
}) => {
  const [activeTab, setActiveTab] = useState('RECORD'); 
  const [isRecording, setIsRecording] = useState(false);
  
  // Quản lý 2 URL preview độc lập để hiển thị song song nếu cần
  const [recordedPreviewUrl, setRecordedPreviewUrl] = useState('');
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState('');
  
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioChunksRef = useRef([]);

  // 🎙️ LUỒNG GHI ÂM TRỰC TIẾP (Microphone Stream Pipeline)
  const startRecording = useCallback(async () => {
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const file = new File([audioBlob], `MicRecord_${Date.now()}.wav`, { type: 'audio/wav' });
        
        if (recordedPreviewUrl) URL.revokeObjectURL(recordedPreviewUrl); 
        
        setRecordedPreviewUrl(URL.createObjectURL(audioBlob));
        setRecordedAudioFile(file); // Đẩy về tuyến dữ liệu ghi âm của cha
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop()); // Thu hồi quyền micro ngay lập tức
          streamRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Lỗi Micro:', error);
      alert('⚠️ Không thể kết nối Micro. Vui lòng cấp quyền trong cài đặt trình duyệt.');
    }
  }, [recordedPreviewUrl, setRecordedAudioFile]); // ✅ SỬA TẠI ĐÂY: setAudioFile -> setRecordedAudioFile

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const removeRecordedAudio = useCallback(() => {
    if (recordedPreviewUrl) URL.revokeObjectURL(recordedPreviewUrl);
    setRecordedPreviewUrl('');
    setRecordedAudioFile(null);
  }, [recordedPreviewUrl, setRecordedAudioFile]); // ✅ SỬA TẠI ĐÂY: setAudioFile -> setRecordedAudioFile


  // 📤 LUỒNG TẢI FILE GHI ÂM SẴN CÓ (File Binary Pipeline)
  const handleAudioUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      alert('⚠️ Vui lòng chọn tệp tin âm thanh hợp lệ (MP3, WAV, M4A, OGG).');
      return;
    }

    if (uploadedPreviewUrl) URL.revokeObjectURL(uploadedPreviewUrl);

    setUploadedPreviewUrl(URL.createObjectURL(file));
    setUploadedAudioFile(file); // Đẩy về tuyến dữ liệu tệp tải lên của cha
    e.target.value = null; 
  }, [uploadedPreviewUrl, setUploadedAudioFile]);

  const removeUploadedAudio = useCallback(() => {
    if (uploadedPreviewUrl) URL.revokeObjectURL(uploadedPreviewUrl);
    setUploadedPreviewUrl('');
    setUploadedAudioFile(null);
  }, [uploadedPreviewUrl, setUploadedAudioFile]);

  return {
    activeTab,
    setActiveTab,
    isRecording,
    recordedPreviewUrl,
    uploadedPreviewUrl,
    startRecording,
    stopRecording,
    handleAudioUpload,
    removeRecordedAudio,
    removeUploadedAudio
  };
};