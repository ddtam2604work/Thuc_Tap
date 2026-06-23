import { useState, useMemo, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import Table from '../../../components/skeleton/Table';
import { useProductOrderList } from '../../../hooks/Order/useProductOrderList';

const ProductOrderList = ({ products = [], attachments = [], generalNote = '', audioNoteUrl = '', googleDriveLink = '' }) => {
  const formatPrice = (val) => new Intl.NumberFormat('en-US').format(val || 0);
  const { getAbsoluteUrl, handleDownloadFile, getFileIcon } = useProductOrderList();
  const [currentImageIndex, setCurrentImageIndex] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');

  const safeProducts = products || [];
  const safeAttachments = attachments || [];

  const isImageFile = useCallback((filename = '', url = '') => {
    const target = filename || url || '';
    const ext = String(target).split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext) || !String(target).includes('.');
  }, []);

  const isAudioFile = useCallback((filename = '', url = '') => {
    const target = filename || url || '';
    const ext = String(target).split('.').pop().toLowerCase();
    return ['mp3', 'wav', 'm4a', 'ogg', 'aac', 'flac'].includes(ext);
  }, []);

  // 🌟 KHỞI TẠO LUỒNG PHÁT NGUYÊN BẢN: Chuyển đổi dữ liệu Base64 từ trường đơn lẻ sang Blob tĩnh để nghe mượt mà
  useEffect(() => {
    let blobUrl = '';
    if (audioNoteUrl && typeof audioNoteUrl === 'string') {
      const cleanStr = audioNoteUrl.trim();
      
      if (cleanStr.startsWith('[') && cleanStr.endsWith(']')) {
        try {
          const parsed = JSON.parse(cleanStr);
          if (Array.isArray(parsed) && parsed[0]) {
            setAudioUrl(parsed[0]);
            return;
          }
        } catch(e){}
      }

      if (cleanStr.startsWith('http') || cleanStr.startsWith('blob:')) {
        setAudioUrl(cleanStr);
      } else {
        try {
          const parts = cleanStr.split(';base64,');
          const contentType = parts[0].split(':')[1] || 'audio/wav';
          const byteCharacters = atob(parts[1] || parts[0]);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: contentType });
          blobUrl = URL.createObjectURL(blob);
          setAudioUrl(blobUrl);
        } catch (e) {
          setAudioUrl(cleanStr);
        }
      }
    } else {
      setAudioUrl('');
    }

    return () => { if (blobUrl && blobUrl.startsWith('blob:')) URL.revokeObjectURL(blobUrl); };
  }, [audioNoteUrl]);

  const allImages = useMemo(() => {
    const imageList = [];
    const seenUrls = new Set();
    
    safeProducts.forEach(p => {
      (p.images || []).forEach(img => {
        const url = getAbsoluteUrl(img.previewUrl || img.url);
        const name = img.name || 'design-file';
        if (url && !seenUrls.has(url) && isImageFile(name, url)) {
          imageList.push({ url, name });
          seenUrls.add(url);
        }
      });
    });

    safeAttachments.forEach(img => {
      const url = getAbsoluteUrl(img.previewUrl || img.url);
      const name = img.name || 'general-file';
      if (url && !seenUrls.has(url) && isImageFile(name, url)) {
        imageList.push({ url, name });
        seenUrls.add(url);
      }
    });

    return imageList;
  }, [safeProducts, safeAttachments, getAbsoluteUrl, isImageFile]);

  const openLightbox = (fileObj) => {
    const url = getAbsoluteUrl(fileObj.previewUrl || fileObj.url);
    const index = allImages.findIndex(i => i.url === url);
    if (index !== -1) setCurrentImageIndex(index);
  };

  const showNextImage = useCallback((e) => {
    e.stopPropagation();
    setCurrentImageIndex(prevIndex => (prevIndex + 1) % allImages.length);
  }, [allImages.length]);

  const showPrevImage = useCallback((e) => {
    e.stopPropagation();
    setCurrentImageIndex(prevIndex => (prevIndex - 1 + allImages.length) % allImages.length);
  }, [allImages.length]);

  return (
    <div className="w-full bg-white border border-gray-100 shadow-xs rounded-xl p-5 flex flex-col gap-5">
      <div className="flex justify-between items-center bg-gray-50/60 px-3 py-2 rounded-lg border border-gray-100">
        <span className="font-bold text-blue-700 flex items-center gap-1.5 text-[12px]">
          📁 Chi tiết thông số & Sản phẩm in ấn
        </span>
      </div>

      <Table headers={['Thông tin hàng in', 'Nguồn File thiết kế', 'Số lượng', 'Đơn giá', 'Thành tiền', 'Ghi chú kỹ thuật']}>
        {safeProducts.length === 0 ? (
          <tr>
            <td colSpan={6} className="py-4 text-center text-xs text-gray-400 italic">Không có cấu hình sản phẩm nào</td>
          </tr>
        ) : (
          safeProducts.map((p, idx) => {
            const rowImages = (p.images || []).filter(img => isImageFile(img.name, img.previewUrl || img.url));
            const rowDocs = (p.images || []).filter(img => !isImageFile(img.name, img.previewUrl || img.url));

            // 🎯 KIỂM TRA TRẠNG THÁI KHÓA/ẨN CỦA SẢN PHẨM TRÊN GIAO DIỆN XEM CHI TIẾT ĐƠN HÀNG
            const isProductInactive = String(p.isactive) === '0' || p.isactive === false || p.status === 'Khóa' || p.status === 'NGỪNG KINH DOANH';

            return (
              <tr key={idx} className="text-center text-gray-700 text-[12px] border-b border-gray-50 last:border-0 hover:bg-gray-50/40 transition-colors">
                <td className="py-3 px-3 text-left font-bold text-gray-800">
                  <div className="flex flex-col gap-0.5">
                    <span>{p.name || 'Sản phẩm không tên'}</span>
                    {/* Render badge ghi chú đỏ cảnh báo sản phẩm ngưng hoạt động */}
                    {isProductInactive && (
                      <span className="text-[10px] text-red-500 font-bold bg-red-50 border border-red-100 px-1.5 py-0.5 rounded w-max mt-1 select-none">
                        Sản phẩm không hoạt động
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-3 text-left whitespace-normal">
                  <div className="flex flex-col items-start gap-2.5">
                    {p.driveLink && (
                      <a href={p.driveLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md hover:bg-amber-100 transition-colors">
                        🌐 Google Drive
                      </a>
                    )}
                    {rowImages.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {rowImages.map((img, i) => (
                          <div key={i} onClick={() => openLightbox(img)} className="w-12 h-12 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer overflow-hidden relative group shadow-xs">
                            <img src={getAbsoluteUrl(img.previewUrl || img.url)} alt={img.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          </div>
                        ))}
                      </div>
                    )}
                    {rowDocs.length > 0 && (
                      <div className="flex flex-col gap-1 w-full">
                        {rowDocs.map((doc, i) => (
                          <button key={i} type="button" onClick={() => handleDownloadFile(getAbsoluteUrl(doc.previewUrl || doc.url), doc.name)} className="inline-flex items-center gap-1.5 text-[11px] text-gray-700 bg-gray-50 border border-gray-200/80 px-2 py-1 rounded-md max-w-[180px]">
                            <span className="truncate flex-1" title={doc.name}>{doc.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-3 px-3 font-semibold text-gray-900">{p.quantity || 0}</td>
                <td className="py-3 px-3 text-gray-600">{formatPrice(p.price)} ₫</td>
                <td className="py-3 px-3 font-black text-blue-600">{formatPrice(p.total || (p.quantity * p.price))} ₫</td>
                <td className="py-3 px-3 text-left text-gray-600 whitespace-normal break-words max-w-[200px]">{p.note || '---'}</td>
              </tr>
            );
          })
        )}
      </Table>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
        <div className="bg-[#F8FAFC] rounded-xl p-3.5 border border-gray-200/50 flex flex-col gap-2.5">
          <div>
            <h4 className="font-bold text-gray-400 uppercase text-[10px] tracking-wide mb-1">📝 Ghi chú chung & File đính kèm tổng đơn</h4>
            <p className="text-gray-700 text-xs font-semibold whitespace-pre-wrap leading-relaxed mb-2">{generalNote || 'Không có ghi chú nào đi kèm.'}</p>
            {googleDriveLink && (
              <a href={googleDriveLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md hover:bg-amber-100 transition-colors mt-2">
                🌐 Google Drive (Tổng)
              </a>
            )}
          </div>
          {safeAttachments.length > 0 && (
            <div className="border-t border-gray-200/60 pt-2 flex flex-col gap-1.5">
              <div className="flex flex-wrap gap-2">
                {safeAttachments.map((file, i) => (
                  <div key={i} onClick={() => openLightbox(file)} className="w-10 h-10 bg-white border border-gray-200 rounded-md overflow-hidden cursor-pointer">
                    <img src={getAbsoluteUrl(file.previewUrl || file.url)} alt={file.name} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-[#F0F7FF] rounded-xl p-3.5 border border-blue-100 flex flex-col justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="text-base animate-pulse">🎙️</span>
            <div>
              <h4 className="font-bold text-blue-800 uppercase text-[10px] tracking-wide">File ghi âm chỉ dẫn gia công</h4>
              <p className="text-[11px] text-slate-500">Nghe yêu cầu bổ sung từ kinh doanh hoặc khách hàng</p>
            </div>
          </div>

          {audioUrl ? (
            <div className="flex items-center gap-2 w-full">
              <audio src={audioUrl} controls className="h-8 flex-1 accent-blue-600 rounded-lg bg-white shadow-3xs" />
              <button
                type="button" onClick={() => handleDownloadFile(audioUrl, `File_Chi_Dan_Ghi_Am_${Date.now()}.wav`)}
                className="h-8 w-8 shrink-0 bg-white hover:bg-blue-50 border border-gray-200 rounded-lg flex items-center justify-center shadow-3xs"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </button>
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic py-1 text-center bg-white/60 rounded-lg border border-dashed border-slate-200">
              Không có file ghi âm chỉ dẫn cho đơn hàng này
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ProductOrderList.propTypes = {
  products: PropTypes.array,
  attachments: PropTypes.array,
  generalNote: PropTypes.string,
  audioNoteUrl: PropTypes.string,
  googleDriveLink: PropTypes.string,
};

export default ProductOrderList;