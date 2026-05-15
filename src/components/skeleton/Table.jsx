const Table = ({ headers, children, className = "" }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 ${className}`}>
      <div className="overflow-x-auto"> 
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-[#f8fafc] text-[#64748b] font-semibold border-b border-gray-100">
            <tr>
              {headers.map((header, index) => (
                <th 
                  key={index} 
                  className={`p-4 text-[11px] uppercase tracking-wider text-center ${index === 0 ? 'w-16' : ''}`}
                >
                  {header}
                </th>
              ))}
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