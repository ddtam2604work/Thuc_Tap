import React, { createContext, useContext, useState, useRef } from 'react';

const ConfirmContext = createContext(null);

export const ConfirmProvider = ({ children }) => {
  const [show, setShow] = useState(false);
  const [options, setOptions] = useState(null);
  const resolver = useRef(() => {});

  const confirm = (opts) => {
    setOptions(opts);
    setShow(true);
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  };

  const handleCancel = () => {
    setShow(false);
    resolver.current(false);
  };

  const handleConfirm = () => {
    setShow(false);
    resolver.current(true);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      
      {/* Giao diện Modal */}
      {show && options && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden bg-white rounded-2xl shadow-xl border border-gray-100">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900">
                {options.title}
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {options.message}
              </p>
            </div>

            <div className="flex justify-end gap-2 px-6 py-4 bg-gray-50">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={handleCancel}
              >
                {options.cancelText || 'Hủy'}
              </button>
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                  options.type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
                onClick={handleConfirm}
              >
                {options.confirmText || 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error('useConfirm must be used within a ConfirmProvider');
  return context;
};