import { useState, useRef, useCallback, useEffect } from 'react';

export const useAdditionalInfoCard = ({ 
  recordedAudioFile, setRecordedAudioFile
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedPreviewUrl, setRecordedPreviewUrl] = useState('');
  
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Đồng bộ URL preview từ dữ liệu bên ngoài đổ về (ví dụ luồng Sửa đơn hàng)
  useEffect(() => {
    if (recordedAudioFile) {
      if (typeof recordedAudioFile === 'string') {
        setRecordedPreviewUrl(recordedAudioFile);
      } else if (recordedAudioFile.previewUrl) {
        setRecordedPreviewUrl(recordedAudioFile.previewUrl);
      }
    } else {
      setRecordedPreviewUrl('');
    }
  }, [recordedAudioFile]);

  // 🎙️ LUỒNG GHI ÂM TRỰC TIẾP
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
        
        if (recordedPreviewUrl && recordedPreviewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(recordedPreviewUrl); 
        }
        
        setRecordedPreviewUrl(URL.createObjectURL(audioBlob));
        setRecordedAudioFile(file); 
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop()); 
          streamRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Lỗi Micro:', error);
      alert('⚠️ Không thể kết nối Micro. Vui lòng cấp quyền trong cài đặt trình duyệt.');
    }
  }, [recordedPreviewUrl, setRecordedAudioFile]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const removeRecordedAudio = useCallback(() => {
    if (recordedPreviewUrl && recordedPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(recordedPreviewUrl);
    }
    setRecordedPreviewUrl('');
    setRecordedAudioFile(null);
  }, [recordedPreviewUrl, setRecordedAudioFile]);

  return {
    isRecording,
    recordedPreviewUrl,
    startRecording,
    stopRecording,
    removeRecordedAudio
  };
};