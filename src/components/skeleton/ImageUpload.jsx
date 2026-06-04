// src/components/skeleton/ImageUpload.jsx
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { MEDIA_URL } from '../../config/env';

/**
 * Component Upload Ảnh chuẩn API Labs Flow
 * @param {string} value - URL ảnh hiện tại
 * @param {function} onChange - Callback nhận URL sau khi upload thành công
 * @param {string} type - 'avatar' | 'product'
 */
const ImageUpload = ({ value, onChange, className = '', type = 'avatar' }) => {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(value || '');
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setPreviewUrl(value || '');
  }, [value]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file định dạng hình ảnh!');
      return;
    }

    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append('files', file); 
    formData.append('ispublic', '1'); 
    formData.append('type', type); 

    try {
      const uploadUrl = `${MEDIA_URL}/api/v1/upload/image/multi-draft`;
      
      const response = await axios.post(uploadUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      // Bóc tách dữ liệu theo chuẩn tài liệu API: response.data.data là một mảng object { url: '...' }
      const responseData = response.data;
      let uploadedUrl = '';

      if (responseData?.data) {
        const dataArr = Array.isArray(responseData.data) ? responseData.data : [responseData.data];
        uploadedUrl = dataArr[0]?.url;
      }

      if (uploadedUrl) {
        setPreviewUrl(uploadedUrl);
        if (onChange) onChange(uploadedUrl); 
      } else {
        throw new Error('Không nhận được URL ảnh từ máy chủ');
      }
    } catch (err) {
      console.error('[ImageUpload Error]:', err);
      setError(err.response?.data?.message || 'Lỗi upload ảnh. Vui lòng kiểm tra lại kết nối.');
    } finally {
      setLoading(false);
    }
  };

  const triggerSelectFile = () => { if (!loading) fileInputRef.current.click(); };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setPreviewUrl('');
    if (onChange) onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const placeholderText = type === 'avatar' ? 'Bấm để chọn ảnh đại diện' : 'Bấm để chọn ảnh sản phẩm';

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      <div 
        onClick={triggerSelectFile}
        className={`relative w-full min-h-[140px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 text-center transition-all cursor-pointer bg-[#FCFCFC]
          ${previewUrl ? 'border-gray-200 hover:border-gray-300' : 'border-gray-300 hover:border-[#0052FF] hover:bg-blue-50/20'}
          ${loading ? 'opacity-60 cursor-not-allowed' : ''}
        `}
      >
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" disabled={loading} />

        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-[#0052FF] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[12px] font-medium text-gray-500">Đang xử lý...</span>
          </div>
        ) : previewUrl ? (
          <div className="relative w-full h-full max-h-[200px] flex items-center justify-center overflow-hidden rounded-lg">
            <img src={previewUrl} alt="Preview" className="object-contain max-w-full max-h-[180px] rounded" />
            <button type="button" onClick={handleRemoveImage} className="absolute top-1 right-1 w-6 h-6 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full flex items-center justify-center text-[11px] shadow-md">✕</button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5 select-none">
            <span className="text-2xl text-gray-400">📷</span>
            <p className="text-[12px] font-semibold text-[#1E293B]">{placeholderText}</p>
          </div>
        )}
      </div>
      {error && <span className="text-[11px] font-medium text-red-600 animate-in fade-in">⚠️ {error}</span>}
    </div>
  );
};

export default ImageUpload;