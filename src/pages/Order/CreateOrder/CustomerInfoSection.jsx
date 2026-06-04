import { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import Button from '../../../components/skeleton/Button';
import { customerService } from '../../../services/customerService';

const removeVietnameseTones = (str) => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

// 🌟 NÂNG CẤP: Nhận thêm prop refreshKey từ cha để làm mới danh sách động
const CustomerInfoSection = ({ customer, setCustomer, onOpenCreateModal, refreshKey }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await customerService.getPaging({ page: 1, pagesize: 1000, search: '' });
      const apiResult = response?.data?.data || response?.data || response;
      if (apiResult && apiResult.items) {
        setCustomers(apiResult.items);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 🌟 SỬA TẠI ĐÂY: Thêm refreshKey vào dependency để tự động gọi lại API khi có phần tử mới được tạo từ Modal cha
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers, refreshKey]);

  const currentSelectedCustomer = customers.find(
    c => c.id === customer || c.id === Number(customer)
  );

  const selectedCustomerText = currentSelectedCustomer
    ? `${currentSelectedCustomer.fullname}${currentSelectedCustomer.phone ? ` - ${currentSelectedCustomer.phone}` : ''}`
    : '';

  useEffect(() => {
    if (customer) {
      if (currentSelectedCustomer) {
        setSearchTerm(selectedCustomerText);
      } else if (customers.length > 0 && !loading) {
        fetchCustomers();
      }
    } else {
      setSearchTerm('');
    }
  }, [customer, customers, fetchCustomers, loading, currentSelectedCustomer, selectedCustomerText]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCustomers = customers.filter(c => {
    if (customer && searchTerm === selectedCustomerText) {
      return true;
    }

    const searchClean = removeVietnameseTones(searchTerm.toLowerCase().trim());
    const nameClean = removeVietnameseTones((c.fullname || '').toLowerCase());
    const phoneClean = (c.phone || '').trim();

    return nameClean.includes(searchClean) || phoneClean.includes(searchClean);
  });

  const handleSelectCustomer = (c) => {
    setCustomer(c.id);
    setSearchTerm(`${c.fullname}${c.phone ? ` - ${c.phone}` : ''}`);
    setIsOpen(false);
  };

  const handleOpenAddModal = () => {
    onOpenCreateModal();
  };

  return (
    <div className="bg-white border border-gray-100 shadow-xs rounded-xl p-5 flex flex-col gap-3.5 transition-all duration-200 hover:shadow-sm">
      <div className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-gray-800">
        <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm select-none">👤</span>
        <h2>Thông tin khách hàng</h2>
        <span className="text-red-500 font-bold">*</span>
      </div>

      <div className="w-full flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full" ref={dropdownRef}>
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs z-10 select-none">🔍</span>
          
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
              if (e.target.value === '') {
                setCustomer(''); 
              }
            }}
            onFocus={(e) => {
              setIsOpen(true);
              e.target.select(); 
            }}
            placeholder="Tìm kiếm không dấu hoặc chọn khách hàng từ danh sách..."
            className="w-full pl-9 pr-8 h-9 border border-gray-200 rounded-lg text-[12px] bg-white text-gray-700 transition-all focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 cursor-text"
          />

          <span className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-[9px] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
            ▼
          </span>

          {isOpen && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150">
              {loading ? (
                <div className="p-3 text-xs text-gray-500 text-center flex items-center justify-center gap-2">
                  <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  Đang tải danh sách...
                </div>
              ) : filteredCustomers.length > 0 ? (
                filteredCustomers.map(c => {
                  const isCurrentActive = c.id === customer || c.id === Number(customer);
                  return (
                    <div
                      key={c.id}
                      onClick={() => handleSelectCustomer(c)}
                      className={`px-3 py-2 text-xs cursor-pointer border-b border-gray-50 last:border-0 transition-colors flex items-center justify-between
                        ${isCurrentActive ? 'bg-blue-50/80 hover:bg-blue-100/90 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      <div className="flex flex-col min-w-0">
                        <div className={`font-semibold ${isCurrentActive ? 'text-blue-700' : 'text-gray-800'}`}>
                          {c.fullname}
                        </div>
                        {c.phone && <div className="text-[10px] text-gray-400 mt-0.5">{c.phone}</div>}
                      </div>
                      
                      {isCurrentActive && (
                        <span className="text-blue-600 font-bold text-xs pl-2 select-none">✓ Đang chọn</span>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-3 text-xs text-gray-400 italic text-center">Không tìm thấy khách hàng phù hợp.</div>
              )}
            </div>
          )}
        </div>

        <Button
          type="button"
          variant="outline-secondary"
          onClick={handleOpenAddModal}
          className="h-9 px-4 rounded-lg text-[11px] font-bold border-gray-200 text-gray-600 bg-white hover:bg-gray-50 hover:text-blue-600 transition-all active:scale-[0.98] shrink-0"
        >
          + Tạo nhanh khách hàng
        </Button>
      </div>
    </div>
  );
};

CustomerInfoSection.propTypes = {
  customer: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  setCustomer: PropTypes.func.isRequired,
  onOpenCreateModal: PropTypes.func.isRequired,
  refreshKey: PropTypes.number, // 👉 Khai báo PropTypes cho prop mới phục vụ render ngầm
};

export default CustomerInfoSection;