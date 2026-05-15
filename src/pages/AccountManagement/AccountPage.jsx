import TopNavBar from '../../components/skeleton/TopNavBar';
import PrimaryButton from '../../components/skeleton/PrimaryButton';
import FormInput from '../../components/skeleton/FormInput';
import AccountTable from '../../components/partials/table/AccountTable';
import { useAccounts } from '../../hooks/useAccounts';
import InsertAccount from './InsertAccount';
import EditAccount from './EditAccount';
import LockAccount from './LockAccount';
import { useState } from 'react';

const AccountPage = () => {
  const { accounts, setSearchTerm } = useAccounts();

  // 1. Quản lý trạng thái đóng/mở riêng biệt cho Thêm và Sửa, khóa
  const [isInsertOpen, setIsInsertOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLockOpen, setIsLockOpen] = useState(false);

  // 2. Lưu dữ liệu tài khoản được chọn để sửa
  const [selectedAccount, setSelectedAccount] = useState(null);

  // 3. Hàm xử lý khi nhấn "Sửa" từ bảng
  const handleEditClick = (account) => {
    setSelectedAccount(account);
    setIsEditOpen(true);
  };

  const handleLockClick = (account) => {
    setSelectedAccount(account);
    setIsLockOpen(true);
  };

  const confirmLock = () => {
    console.log("Đã khóa tài khoản:", selectedAccount?.name);
    // Logic gọi API khóa tại đây
    setIsLockOpen(false);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopNavBar title="Quản lý Tài khoản" />
      
      <main className="p-6 flex-1">
        {/* Banner thông báo */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 flex items-start gap-3 rounded-r-lg">
          <span className="text-blue-500 mt-0.5">ⓘ</span>
          <p className="text-[13px] text-blue-800">
            Quy tắc quản lý: Mọi tài khoản cần có tên đăng nhập duy nhất. Hạn chế cấp quyền Admin để đảm bảo tính bảo mật hệ thống.
          </p>
        </div>

        {/* Toolbar: Giữ mọi thứ trên cùng 1 hàng ngang bằng cách bỏ w-full và dùng flex-1 hợp lý */}
        <div className="flex flex-row items-center justify-between gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-wrap md:flex-nowrap">
          
          {/* Khối 1: Ô tìm kiếm - Bỏ w-full để nó không chiếm hết dòng trên màn hình md trở lên */}
          <div className="flex-1 min-w-[280px] max-w-md relative">
            <FormInput 
              placeholder="Tìm kiếm theo tên, username hoặc email..." 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-50/50 border-gray-200 h-10 pr-10 focus:bg-white transition-all w-full"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Khối 2: Nhóm Filters và Button - Dùng ml-auto để đẩy cụm này về bên phải */}
          <div className="flex items-center gap-3 ml-auto flex-wrap sm:flex-nowrap justify-end w-full md:w-auto">
            <div className="flex gap-2 shrink-0">
              <select className="border border-gray-200 rounded-lg px-3 py-2 text-[13px] bg-white outline-none focus:ring-2 focus:ring-blue-500/20 h-10 min-w-[140px] cursor-pointer hover:border-blue-400 transition-colors">
                <option value="all">Tất cả vai trò</option>
              </select>
              
              <select className="border border-gray-200 rounded-lg px-3 py-2 text-[13px] bg-white outline-none focus:ring-2 focus:ring-blue-500/20 h-10 min-w-[140px] cursor-pointer hover:border-blue-400 transition-colors">
                <option value="all">Tất cả trạng thái</option>
              </select>
            </div>

            {/* Nút thêm tài khoản - Dùng w-auto để kích thước co theo nội dung */}
            <PrimaryButton 
              onClick={() => setIsInsertOpen(true)}
              className="w-auto px-[60px] h-10 shadow-md shrink-0"
              className="w-fit px-12 shrink-0 whitespace-nowrap">
              <span className="text-xl font-light mr-2">+</span>
              Thêm tài khoản
            </PrimaryButton>
          </div>
        </div>

        {/* Bảng dữ liệu: Đã truyền handleEditClick vào onEdit */}
        <AccountTable 
        accounts={accounts} 
        onEdit={handleEditClick} 
        onLock={handleLockClick} 
        />

        {/* Modal Thêm tài khoản */}
        <InsertAccount 
          isOpen={isInsertOpen} 
          onClose={() => setIsInsertOpen(false)} 
        />

        {/* Modal Sửa tài khoản: Dùng 'key' để tự động reset State khi đổi ID */}
        <EditAccount 
          key={selectedAccount?.id || 'edit-modal'} 
          isOpen={isEditOpen} 
          onClose={() => setIsEditOpen(false)} 
          accountData={selectedAccount} 
        />

        <LockAccount
        isOpen={isLockOpen} 
        onClose={() => setIsLockOpen(false)} 
        onConfirm={confirmLock}
        accountName={selectedAccount?.name}
        />

        {/* Phân trang */}
        <div className="flex justify-center mt-8 gap-1.5">
          {[1, 2, 3].map(page => (
            <button 
              key={page}
              className={`w-9 h-9 rounded-md border text-sm font-medium transition-all ${
                page === 1 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AccountPage;