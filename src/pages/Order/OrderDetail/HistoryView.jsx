const HistoryView = ({ history = [], isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600 text-sm font-medium">Đang tải lịch sử cập nhật...</span>
        </div>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="text-center py-12">
          <span className="text-gray-500 text-sm">📭 Chưa có lịch sử cập nhật</span>
        </div>
      </div>
    );
  }

  // Group history by timestamp for better organization
  const groupedByDate = history.reduce((acc, item) => {
    const date = new Date(item.timestamp).toLocaleDateString('vi-VN');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">🔄 Timeline cập nhật</h3>
      
      <div className="space-y-8">
        {Object.entries(groupedByDate).map(([date, items]) => (
          <div key={date}>
            {/* Date header */}
            <div className="flex items-center gap-4 mb-4">
              <div className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                📅 {date}
              </div>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* Items for this date */}
            <div className="space-y-3 ml-4">
              {items.map((item, index) => (
                <div
                  key={item.id || index}
                  className="flex gap-4 pb-3 border-l-2 border-blue-300 pl-4 last:pb-0"
                >
                  {/* Change type badge */}
                  <div className="flex-shrink-0">
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded ${
                        item.changeType === 'DELETE'
                          ? 'bg-red-100 text-red-700'
                          : item.changeType === 'CREATE'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {item.changeType === 'DELETE'
                        ? '❌ XÓA'
                        : item.changeType === 'CREATE'
                        ? '✅ TẠO'
                        : '✏️ CẬP NHẬT'}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {item.fieldName}
                        </p>
                        
                        <div className="mt-2 space-y-1 text-xs">
                          <div className="flex items-start gap-2">
                            <span className="text-gray-500 flex-shrink-0">Cũ:</span>
                            <span className="text-gray-700 bg-red-50 px-2 py-1 rounded flex-1 break-all">
                              {item.oldValue || '(trống)'}
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-gray-500 flex-shrink-0">Mới:</span>
                            <span className="text-gray-700 bg-green-50 px-2 py-1 rounded flex-1 break-all">
                              {item.newValue || '(trống)'}
                            </span>
                          </div>
                        </div>

                        <div className="mt-2 text-xs text-gray-500">
                          👤 {item.user || 'Hệ thống'}
                        </div>
                      </div>

                      {/* Time */}
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs text-gray-500 whitespace-nowrap font-mono">
                          {new Date(item.timestamp).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryView;
