import { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import Table from '../../../components/skeleton/Table';
import { useProductOrderList } from '../../../hooks/Order/useProductOrderList';

const ProductOrderList = ({ products = [], attachments = [], generalNote = '', audioNoteUrl = '' }) => {
  const formatPrice = (val) => new Intl.NumberFormat('vi-VN').format(val || 0);
  const { getAbsoluteUrl, handleDownloadFile, getFileIcon } = useProductOrderList();
  const [currentImageIndex, setCurrentImageIndex] = useState(null);

  const safeProducts = products || [];
  const safeAttachments = attachments || [];

  const isImageFile = useCallback((filename = '', url = '') => {
    const target = filename || url || '';
    const ext = String(target).split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext) || !String(target).includes('.');
  }, []);

  // 🌟 ĐỒNG BỘ LIGHTBOX: Gom toàn bộ ảnh từ dòng sản phẩm VÀ ảnh đính kèm chung tổng đơn vào slider
  const allImages = useMemo(() => {
    const imageList = [];
    const seenUrls = new Set();
    
    // Thu thập từ sản phẩm
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

    // Thu thập từ ảnh tổng đơn chung
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

            return (
              <tr key={idx} className="text-center text-gray-700 text-[12px] border-b border-gray-50 last:border-0 hover:bg-gray-50/40 transition-colors">
                <td className="py-3 px-3 text-left font-bold text-gray-800">{p.name || 'Sản phẩm không tên'}</td>
                
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
                          <div 
                            key={i} 
                            onClick={() => openLightbox(img)}
                            className="w-12 h-12 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer overflow-hidden relative group shadow-xs" 
                            title="Bấm để xem ảnh phóng lớn"
                          >
                            <img src={getAbsoluteUrl(img.previewUrl || img.url)} alt={img.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {rowDocs.length > 0 && (
                      <div className="flex flex-col gap-1 w-full">
                        {rowDocs.map((doc, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleDownloadFile(getAbsoluteUrl(doc.previewUrl || doc.url), doc.name)}
                            className="inline-flex items-center gap-1.5 text-[11px] text-gray-700 bg-gray-50 border border-gray-200/80 px-2 py-1 rounded-md hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all shadow-3xs text-left max-w-[180px]"
                          >
                            <span className="shrink-0">{getFileIcon(doc.name)}</span>
                            <span className="truncate flex-1" title={doc.name}>{doc.name}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {!p.driveLink && rowImages.length === 0 && rowDocs.length === 0 && (
                      <span className="text-gray-400 italic text-[11px]">Nhận vật lý trực tiếp</span>
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

      {/* ================= KHỐI PHÁT FILE GHI ÂM VÀ FILE ĐÍNH KÈM CHUNG ================= */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
        
        {/* Khối chữ ghi chú chung & File đính kèm tổng hợp */}
        <div className="bg-[#F8FAFC] rounded-xl p-3.5 border border-gray-200/50 flex flex-col gap-2.5">
          <div>
            <h4 className="font-bold text-gray-400 uppercase text-[10px] tracking-wide mb-1">
              📝 Ghi chú chung & File đính kèm tổng đơn
            </h4>
            <p className="text-gray-700 text-xs font-semibold whitespace-pre-wrap leading-relaxed mb-2">
              {generalNote || 'Không có ghi chú nào đi kèm.'}
            </p>
          </div>

          {/* 🌟 HIỂN THỊ FILE CHUNG TẠI ĐÂY (Nếu có tệp đính kèm cấp tổng đơn) */}
          {safeAttachments.length > 0 && (
            <div className="border-t border-gray-200/60 pt-2 flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-slate-500">📎 Tệp tài liệu chung đơn:</span>
              <div className="flex flex-wrap gap-2">
                {safeAttachments.map((file, i) => {
                  const isImg = isImageFile(file.name, file.previewUrl || file.url);
                  if (isImg) {
                    return (
                      <div 
                        key={i} 
                        onClick={() => openLightbox(file)}
                        className="w-10 h-10 bg-white border border-gray-200 rounded-md overflow-hidden cursor-pointer shadow-3xs"
                        title="Bấm để mở ảnh chung lớn"
                      >
                        <img src={getAbsoluteUrl(file.previewUrl || file.url)} alt={file.name} className="w-full h-full object-cover" />
                      </div>
                    );
                  }
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleDownloadFile(getAbsoluteUrl(file.previewUrl || file.url), file.name)}
                      className="inline-flex items-center gap-1 text-[11px] bg-white border border-gray-200 px-2 py-1 rounded shadow-3xs text-gray-700 hover:text-blue-600"
                    >
                      {getFileIcon(file.name)} Tải về
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Khối phát Audio */}
        <div className="bg-[#F0F7FF] rounded-xl p-3.5 border border-blue-100 flex flex-col justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="text-base animate-pulse">🎙️</span>
            <div>
              <h4 className="font-bold text-blue-800 uppercase text-[10px] tracking-wide">File âm thanh chỉ dẫn gia công</h4>
              <p className="text-[11px] text-slate-500">Nghe yêu cầu bổ sung từ kinh doanh hoặc khách hàng</p>
            </div>
          </div>

          {audioNoteUrl ? (
            <div className="flex items-center gap-2 w-full">
              <audio src={audioNoteUrl} controls className="h-8 flex-1 accent-blue-600 rounded-lg bg-white shadow-3xs" />
              <button
                type="button"
                onClick={() => handleDownloadFile(audioNoteUrl, `Huong_Dan_Ghi_Am_${Date.now()}.mp3`)}
                className="h-8 w-8 shrink-0 bg-white hover:bg-blue-50 text-gray-600 hover:text-blue-600 border border-gray-200 rounded-lg flex items-center justify-center transition-colors shadow-3xs"
                title="Tải tệp âm thanh về máy"
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

      {/* ================= LIGHTBOX MODAL XEM ẢNH LỚN ================= */}
      {currentImageIndex !== null && (() => {
        const selectedImage = allImages[currentImageIndex];
        return (
          <div className="fixed inset-0 bg-black/80 z-[999] flex items-center justify-center p-4 animate-in fade-in duration-150" onClick={() => setCurrentImageIndex(null)}>
            {allImages.length > 1 && (
              <button onClick={showPrevImage} className="absolute left-4 top-1/2 -translate-y-1/2 z-[1000] w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center border border-white/10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </button>
            )}
            <div className="relative max-w-5xl w-full max-h-[90vh] bg-gray-900 rounded-xl shadow-2xl overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="flex-1 min-h-0 flex items-center justify-center p-3">
                <img src={selectedImage.url} alt="Xem chi tiết thiết kế" className="max-w-full max-h-[75vh] object-contain rounded-lg" />
              </div>
              <div className="flex-shrink-0 bg-black/40 backdrop-blur-md p-3.5 flex items-center justify-between gap-4 border-t border-white/5">
                <span className="text-xs font-medium text-gray-200 truncate max-w-sm" title={selectedImage.name}>🎯 {selectedImage.name}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleDownloadFile(selectedImage.url, selectedImage.name)} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Tải ảnh gốc
                  </button>
                  <button onClick={() => setCurrentImageIndex(null)} className="w-7 h-7 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center justify-center text-md">&times;</button>
                </div>
              </div>
            </div>
            {allImages.length > 1 && (
              <button onClick={showNextImage} className="absolute right-4 top-1/2 -translate-y-1/2 z-[1000] w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center border border-white/10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            )}
          </div>
        );
      })()}
    </div>
  );
};

ProductOrderList.propTypes = {
  products: PropTypes.array,
  attachments: PropTypes.array, // Khai báo thêm prop tệp đính kèm
  generalNote: PropTypes.string,
  audioNoteUrl: PropTypes.string,
};

export default ProductOrderList;