const LogsView = ({ logs = [], isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600 text-sm font-medium">Đang tải lịch sử hoạt động...</span>
        </div>
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="text-center py-12">
          <span className="text-gray-500 text-sm">📭 Chưa có lịch sử hoạt động</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">📝 Lịch sử hoạt động</h3>
      
      <div className="space-y-4">
        {logs.map((log, index) => (
          <div key={log.id || index} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0">
            {/* Timeline indicator */}
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5"></div>
              {index !== logs.length - 1 && (
                <div className="w-0.5 h-12 bg-gray-200 mt-2"></div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-900">{log.user || 'Hệ thống'}</span>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {log.action || 'Thao tác'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">
                    {log.description || log.action}
                  </p>
                  {log.details && (
                    <p className="text-xs text-gray-500 mt-1 bg-gray-50 p-2 rounded italic">
                      {log.details}
                    </p>
                  )}
                </div>

                {/* Timestamp */}
                <div className="text-right flex-shrink-0">
                  <div className="text-xs text-gray-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleDateString('vi-VN')}
                  </div>
                  <div className="text-xs text-gray-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogsView;
