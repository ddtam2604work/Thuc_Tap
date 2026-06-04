const Table = ({ headers, children, className = "", minWidth = "min-w-full" }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 ${className}`}>
      <div className="overflow-x-auto"> 
        {/* 🎯 TỐI ƯU HIỂN THỊ: Đổi thành min-w-full để ép bảng khít 100% màn hình, không sinh thanh cuộn ngang */}
        <table className={`w-full text-left text-sm border-collapse table-fixed ${minWidth}`}>
          <thead className="bg-[#f8fafc] text-[#64748b] font-semibold border-b border-gray-100">
            <tr>
              {headers.map((header, index) => {
                // Hỗ trợ đồng thời dạng Object mới và dạng Chuỗi cũ
                const isObject = typeof header === 'object' && header !== null;
                
                const label = isObject ? header.label : header;
                const widthClass = isObject && header.width ? header.width : (index === 0 ? 'w-16' : '');
                const alignClass = isObject && header.align ? header.align : 'text-center';

                return (
                  <th 
                    key={index} 
                    className={`p-4 text-[11px] uppercase tracking-wider ${alignClass} ${widthClass}`}
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