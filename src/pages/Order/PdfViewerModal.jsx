import PropTypes from 'prop-types';
import Button from '../../components/skeleton/Button';

const PdfViewerModal = ({ isOpen, onClose, pdfUrl, fileName, title }) => {
  if (!isOpen) {
    return null;
  }

  // 🎯 KỸ THUẬT: Kích hoạt cơ chế tải xuống giả lập (a-tag trick)
  const handleDownload = () => {
    if (!pdfUrl) return;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = fileName || 'document.pdf'; // Fallback name an toàn
    
    // Append -> Click -> Remove để qua mặt cơ chế chặn pop-up của trình duyệt
    document.body.appendChild(link);
    link.click();
    
    // Dọn dẹp DOM ngay lập tức
    setTimeout(() => {
      document.body.removeChild(link);
    }, 100);
  };

  // Ngăn việc click vào nội dung modal làm đóng modal
  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    // Lớp phủ backdrop - làm mờ nền phía sau
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-all duration-300 animate-in fade-in"
      onClick={onClose}
    >
      {/* Khung Modal */}
      <div
        className="bg-white rounded-xl shadow-2xl flex flex-col w-full max-w-5xl h-[85vh] lg:h-[90vh] overflow-hidden transform transition-all duration-300 animate-in zoom-in-95"
        onClick={handleContentClick}
      >
        {/* Header - Thanh tiêu đề */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 flex-shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <div>
              <h3 className="text-base lg:text-lg font-bold text-gray-800 tracking-tight">{title}</h3>
              <p className="text-[11px] text-gray-500 font-mono mt-0.5">{fileName}</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-100"
            aria-label="Đóng cửa sổ"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Body - Vùng trình chiếu PDF */}
        <div className="flex-grow bg-slate-100/50 relative">
          {pdfUrl ? (
            <div className="w-full h-full relative">
              {/* 🎯 SỬ DỤNG OBJECT THAY VÌ IFRAME CHO PDF (Độ tương thích cao hơn trên Webkit/Chromium) */}
              <object 
                data={pdfUrl} 
                type="application/pdf" 
                width="100%" 
                height="100%" 
                className="w-full h-full border-none absolute inset-0 z-10 bg-transparent"
              >
                {/* Fallback khi trình duyệt không hỗ trợ xem PDF trực tiếp (Mobile/Safari cũ) */}
                <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-slate-600 font-medium mb-2 text-sm">Trình duyệt của bạn không hỗ trợ xem trước PDF.</p>
                  <p className="text-slate-500 mb-6 text-xs max-w-md">Vui lòng sử dụng nút bên dưới để tải tệp về máy và xem bằng phần mềm đọc PDF chuyên dụng.</p>
                  <Button onClick={handleDownload} className="bg-blue-600 text-white shadow-md shadow-blue-500/20">
                    Tải tệp PDF xuống ngay
                  </Button>
                </div>
              </object>
              
              {/* Overlay Loader chạy ngầm mỏng nhẹ phía sau */}
              <div className="absolute inset-0 flex flex-col items-center justify-center z-0">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-3 text-sm text-gray-500 font-medium animate-pulse">Đang tải và dựng khối tài liệu...</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium">Lỗi đường dẫn: Không tìm thấy dữ liệu nguồn của tài liệu.</p>
            </div>
          )}
        </div>

        {/* Footer - Vùng Thao tác */}
        <div className="flex justify-end items-center gap-3 p-4 border-t border-gray-100 bg-white flex-shrink-0">
          <Button 
            variant="text" 
            onClick={onClose} 
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-semibold px-5 py-2 h-auto"
          >
            Hủy / Đóng
          </Button>
          <Button 
            onClick={handleDownload} 
            disabled={!pdfUrl}
            className={`px-5 py-2 h-auto font-bold flex items-center gap-2 ${!pdfUrl ? 'opacity-50 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Lưu máy tính
          </Button>
        </div>
      </div>
    </div>
  );
};

PdfViewerModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  pdfUrl: PropTypes.string,
  fileName: PropTypes.string,
  title: PropTypes.string,
};

PdfViewerModal.defaultProps = {
  pdfUrl: null,
  fileName: 'document.pdf',
  title: 'Xem trước tài liệu',
};

export default PdfViewerModal;