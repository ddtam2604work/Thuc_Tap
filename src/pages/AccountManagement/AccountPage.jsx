import { useState } from 'react';
import Button from '../../components/skeleton/Button';
import FormInput from '../../components/skeleton/FormInput';
import AccountTable from '../../components/partials/table/account/AccountTable';
import { useAccounts } from '../../hooks/Account/useAccounts';
import InsertAccount from './InsertAccount';
import EditAccount from './EditAccount';
import LockAccount from './LockAccount';
import ResetPasswordModal from '../../context/ResetPasswordModal';
import { userService } from '../../services/accountService';
import { useNotification } from '../../context/NotificationContext';
import { useConfirm } from '../../context/ConfirmContext';

const AccountPage = () => {
  const { 
    accounts, loading, error, roles, rolesLoading, searchTerm, setSearchTerm, 
    filterRole, setFilterRole, filterStatus, setFilterStatus, currentPage, setCurrentPage, 
    totalPages, totalAccounts, addAccount, editAccount, toggleAccountStatus, deleteAccount
  } = useAccounts();

  const { showToast } = useNotification();
  const { confirm } = useConfirm();

  // Quản lý trạng thái modal tập trung của AccountPage (Rất tối ưu)
  const [modal, setModal] = useState({ type: null, data: null, isOpen: false });

  const closeModal = () => setModal({ type: null, data: null, isOpen: false });

  const getPaginationGroup = () => {
    let start = Math.max(currentPage - 2, 1);
    let end = Math.min(start + 4, totalPages);
    if (end - start < 4) {
      start = Math.max(end - 4, 1);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const handleAddSubmit = async (formData) => {
    try {
      await addAccount(formData);
      closeModal();
      showToast("Thêm tài khoản mới thành công!", "success");
    } catch (error) {
      console.error("Add account failed:", error);
      showToast("Lỗi khi thêm: " + (error.message || "Không thể kết nối đến máy chủ."), "error");
    }
  };

  const handleEditSubmit = async (formData) => {
    if (!formData.fullname) {
      showToast("Họ tên không được để trống!", "warning");
      return;
    }
    try {
      await editAccount(formData);
      closeModal();
      showToast("Cập nhật thông tin tài khoản thành công!", "success");
    } catch (error) {
      console.error("Edit account failed:", error);
      showToast("Lỗi cập nhật: " + error.message, "error");
    }
  };

  const handleConfirmLock = async () => {
    try {
      const { id, isactive, isActive } = modal.data;
      const currentStatus = isactive !== undefined ? isactive : isActive;
      await toggleAccountStatus(id, currentStatus);
      closeModal();
      const actionText = (currentStatus === 1 || currentStatus === true) ? "khóa" : "mở khóa";
      showToast(`Đã ${actionText} tài khoản hệ thống thành công!`, "success");
    } catch (error) {
      console.error("Toggle account status failed:", error);
      showToast("Lỗi thay đổi trạng thái: " + error.message, "error");
    }
  };

  // Mở modal đặt lại mật khẩu theo cấu trúc object chung
  const handleResetPassword = (account) => {
    setModal({ type: 'resetPassword', data: account, isOpen: true });
  };

  // Luồng xử lý Admin lưu mật khẩu mới của nhân viên
  const handleSetPasswordByAdmin = async (payload) => {
    try {
      // payload mang cấu trúc: { id, password }
      await userService.setPassword(payload.id, payload.password);
      showToast('Đặt lại mật khẩu người dùng thành công! 🎉', 'success');
      closeModal();
    } catch (error) {
      console.error("Admin reset password failed:", error);
      showToast(error?.message || 'Lỗi hệ thống khi đặt lại mật khẩu!', 'error');
    }
  };
  
  const handleDeleteAccount = async (account) => {
    const isConfirmed = await confirm({
      title: 'Xác nhận xóa tài khoản',
      message: `Bạn có chắc chắn muốn xóa tài khoản [${account.username}] không? Hành động này sẽ gỡ bỏ hoàn toàn tài khoản khỏi hệ thống và không thể hoàn tác.`,
      confirmText: 'Đồng ý xóa',
      cancelText: 'Hủy bỏ',
      type: 'danger'
    });

    if (isConfirmed) {
      try {
        await deleteAccount(account.id);
        showToast('Xóa tài khoản hệ thống thành công!', 'success');
      } catch (error) {
        console.error("Delete account failed:", error);
        showToast('Lỗi khi xóa: ' + error.message, 'error');
      }
    }
  };

  return (
    <div className="flex flex-col">
      <main className="p-6 flex-1">
        {/* Banner thông báo */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 flex items-start gap-3 rounded-r-lg">
          <span className="text-blue-500 mt-0.5">ⓘ</span>
          <p className="text-[13px] text-blue-800">
            Quy tắc quản lý: Mọi tài khoản cần có tên đăng nhập duy nhất. Hạn chế cấp quyền Admin để đảm bảo tính bảo mật hệ thống.
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-row items-center justify-between gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-wrap md:flex-nowrap">
          <div className="flex-1 min-w-[280px] max-w-md relative">
            <FormInput 
              value={searchTerm}
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

          <div className="flex items-center gap-3 ml-auto flex-wrap sm:flex-nowrap justify-end w-full md:w-auto">
            <div className="flex gap-2 shrink-0">
              <select 
                value={filterRole} 
                onChange={(e) => setFilterRole(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-[13px] bg-white outline-none focus:ring-2 focus:ring-blue-500/20 h-10 min-w-[140px] cursor-pointer"
                disabled={rolesLoading}
              >
                <option value="all">{rolesLoading ? "Đang tải..." : "Tất cả vai trò"}</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.code}>{role.name}</option>
                ))}
              </select>
              
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-[13px] bg-white outline-none focus:ring-2 focus:ring-blue-500/20 h-10 min-w-[140px] cursor-pointer"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Bị khóa</option>
              </select>
            </div>

            <Button onClick={() => setModal({ type: 'insert', data: null, isOpen: true })} className="w-fit px-12 h-10 shadow-md shrink-0 whitespace-nowrap">
              <span className="text-xl font-light mr-2">+</span> Thêm tài khoản
            </Button>
          </div>
        </div>

        {/* Table Render */}
        {loading && <div className="text-center py-10 text-gray-500">Đang tải dữ liệu...</div>}
        {error && !loading && <div className="text-center py-10 text-red-500">Lỗi: {error}</div>}
        
        {!loading && !error && (
          <div className="w-full">
            <AccountTable 
              accounts={accounts} 
              onEdit={(acc) => setModal({ type: 'edit', data: acc, isOpen: true })} 
              onLock={(acc) => setModal({ type: 'lock', data: acc, isOpen: true })} 
              onDelete={handleDeleteAccount}
            />
          </div>
        )}

        {/* --- KHỐI RENDER MODALS ĐỒNG BỘ --- */}
        <InsertAccount isOpen={modal.isOpen && modal.type === 'insert'} onClose={closeModal} onSave={handleAddSubmit} roles={roles} />
        
        <EditAccount 
          key={`edit-${modal.data?.id || 'modal'}`}
          isOpen={modal.isOpen && modal.type === 'edit'} 
          onClose={closeModal} 
          accountData={modal.data} 
          onSave={handleEditSubmit}
          onResetPassword={handleResetPassword} // Kích hoạt luồng mở ResetPasswordModal
          roles={roles}
        />

        <LockAccount
          key={`lock-${modal.data?.id || 'modal'}`}
          isOpen={modal.isOpen && modal.type === 'lock'} 
          onClose={closeModal} 
          onConfirm={handleConfirmLock}
          accountName={modal.data?.fullname || modal.data?.username}
          isActive={modal.data?.isactive ?? modal.data?.isActive}
        />

        {/* MODAL RESET PASSWORD TRONG QUẢN TRỊ VIÊN */}
        <ResetPasswordModal 
          isOpen={modal.isOpen && modal.type === 'resetPassword'}
          onClose={closeModal}
          accountData={modal.data}
          mode="set" 
          onConfirm={handleSetPasswordByAdmin}
        />

        {/* Phân trang (Giữ nguyên) */}
        {totalPages > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 px-2 gap-4">
            <div className="text-sm text-gray-500">
              Hiển thị <span className="font-semibold text-gray-900">{Math.min((currentPage - 1) * 10 + 1, totalAccounts)}</span> đến <span className="font-semibold text-gray-900">{Math.min(currentPage * 10, totalAccounts)}</span> trong tổng số <span className="font-semibold text-gray-900">{totalAccounts}</span> tài khoản
            </div>
            <div className="flex gap-1.5">
              <Button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className={`w-9 h-9 rounded-md border text-sm p-0 flex items-center justify-center ${currentPage === 1 ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'}`}>&lt;</Button>
              {getPaginationGroup().map(page => (
                <Button key={page} onClick={() => setCurrentPage(page)} className={`w-9 h-9 rounded-md border text-sm font-medium p-0 ${page === currentPage ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'}`}>{page}</Button>
              ))}
              <Button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className={`w-9 h-9 rounded-md border text-sm p-0 flex items-center justify-center ${currentPage === totalPages ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'}`}>&gt;</Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AccountPage;