const Table = ({ headers, children, className = "", minWidth = "min-w-full" }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 ${className}`}>
      {/* 🎯 1. BẢO VỆ LAYOUT: Vùng này sẽ sinh ra thanh cuộn ngang (scroll) nếu bảng bên trong phình to */}
      <div className="overflow-x-auto custom-scrollbar"> 
        {/* 🎯 2. LỖI CHÍNH LÀ ĐÂY: Xóa 'table-fixed', đổi thành 'table-auto' */}
        <table className={`w-full text-left text-sm border-collapse table-auto ${minWidth}`}>
          <thead className="bg-[#f8fafc] text-[#64748b] font-semibold border-b border-gray-100">
            <tr>
              {headers.map((header, index) => {
                // Hỗ trợ đồng thời dạng Object mới và dạng Chuỗi cũ
                const isObject = typeof header === 'object' && header !== null;
                
                const label = isObject ? header.label : header;
                
                // 🎯 3. XÓA HARDCODE: Bỏ đoạn (index === 0 ? 'w-16' : ''). 
                // Không ép cứng cột đầu tiên phải là w-16 (64px) nữa, vì nó đang đánh nhau với min-w-[260px] của cột Mã đơn/Mã SP.
                const widthClass = isObject && header.width ? header.width : '';
                const alignClass = isObject && header.align ? header.align : 'text-center';

                return (
                  <th 
                    key={index} 
                    // 🎯 4. BẢO VỆ HEADER: Thêm whitespace-nowrap để tên cột không bao giờ bị rớt làm 2 dòng
                    className={`p-4 text-[11px] uppercase tracking-wider whitespace-nowrap ${alignClass} ${widthClass}`}
                  >
                    {label}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {children}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;