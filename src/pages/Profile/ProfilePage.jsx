import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Button from '../../components/skeleton/Button';
import { useProfile } from '../../hooks/Profile/useProfile';
import { useChangePassword } from '../../hooks/Profile/useChangePassword';
import { useAuth } from '../../hooks/Login/useAuth'; 
import ResetPasswordModal from '../../context/ResetPasswordModal'; 
import { authService } from '../../services/authService';
import { useConfirm } from '../../context/ConfirmContext';
import { useNotification } from '../../context/NotificationContext';

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false); 
  
  const currentUser = useSelector((state) => state.auth.user);
  
  const { loading, errorMessage, successMessage, updateProfile } = useProfile(currentUser);
  const { 
    loading: pwdLoading, 
    error: pwdError, 
    success: pwdSuccess, 
    setError: setPwdError, 
    setSuccess: setPwdSuccess 
  } = useChangePassword();
  
  const { logout } = useAuth(); 
  const { confirm } = useConfirm();
  const { showToast } = useNotification();

  const [profile, setProfile] = useState({
    username: currentUser?.username || '',
    fullName: currentUser?.fullname || '', 
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    role: currentUser?.roles?.[0]?.name || 'Chưa phân quyền',
    status: currentUser?.isactive === 1 ? 'Hoạt động' : 'Đã khóa' 
  });

  useEffect(() => {
    if (currentUser) {
      setProfile({
        username: currentUser.username || '',
        fullName: currentUser.fullname || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        role: currentUser.roles?.[0]?.name || 'Chưa phân quyền',
        status: currentUser.isactive === 1 ? 'Hoạt động' : 'Đã khóa'
      });
    }
  }, [currentUser]);

  const handleSave = async () => {
    const success = await updateProfile(profile);
    if (success) {
      setIsEditing(false);
      showToast('Cập nhật hồ sơ cá nhân thành công! 🎉', 'success');
    } else {
      showToast('Cập nhật hồ sơ thất bại. Vui lòng kiểm tra lại!', 'error');
    }
  };

  const handleCancel = async () => {
    const isConfirmed = await confirm({
      title: 'Hủy bỏ chỉnh sửa?',
      message: 'Bạn có chắc chắn muốn hủy bỏ? Mọi thông tin vừa thay đổi cấu hình trên hồ sơ sẽ không được lưu lại.',
      confirmText: 'Xác nhận hủy',
      cancelText: 'Tiếp tục sửa',
      type: 'warning'
    });

    if (!isConfirmed) return;

    if (currentUser) {
      setProfile({
        ...profile,
        fullName: currentUser.fullname || '',
        email: currentUser.email || '',
        phone: currentUser.phone || ''
      });
    }
    setIsEditing(false);
  };
  
  // 🎯 LUỒNG XỬ LÝ ĐỔI MẬT KHẨU KHỚP INTERCEPTOR ĐĂNG NHẬP
  const handleChangePasswordSubmit = async (payload) => {
    setPwdError(null);
    setPwdSuccess(null);

    try {
      // Gọi thông qua authService để được đính kèm Access Token tự động
      await authService.changePassword(payload);
      
      setPwdSuccess('Thay đổi mật khẩu thành công!');
      showToast('Đổi mật khẩu thành công! Hệ thống đang tự động đăng xuất...', 'success');
      
      setTimeout(() => {
        logout(); // Đăng xuất để yêu cầu đăng nhập lại bằng mật khẩu mới
      }, 1500);
    } catch (error) {
      console.error("[ProfilePage] Đổi mật khẩu thất bại:", error);
      const msg = error?.message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại.';
      setPwdError(msg);
      showToast(msg, 'error');
    }
  };

  if (!currentUser) {
    return <div className="p-8 text-center text-red-500 font-medium">Dữ liệu người dùng bị mất. Vui lòng đăng nhập lại.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto w-full pb-8">
      <div className="flex justify-between items-center mt-1 mb-4">
        <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">Thông tin cá nhân</h1>
        {!isEditing ? ( 
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsResetPasswordOpen(true)} disabled={pwdLoading} className="h-8.5 px-4 rounded-lg text-[12px] font-medium border border-gray-300">
              {pwdLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
            </Button>
            <Button variant="primary" onClick={() => setIsEditing(true)} className="bg-[#0037B0] hover:bg-blue-800 h-8.5 px-4 rounded-lg text-[12px] font-medium shadow-xs">
              Chỉnh sửa hồ sơ
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} className="h-8.5 px-4 rounded-lg text-[12px] font-medium border border-gray-300">
              Hủy
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={loading} className="bg-[#166534] hover:bg-green-800 h-8.5 px-4 rounded-lg text-[12px] font-medium shadow-xs text-white">
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        )}
      </div>

      {errorMessage && <div className="w-full p-3 mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">{errorMessage}</div>}
      {successMessage && <div className="w-full p-3 mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg font-medium">{successMessage}</div>}
      {pwdError && <div className="w-full p-3 mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">{pwdError}</div>}
      {pwdSuccess && <div className="w-full p-3 mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg font-medium">{pwdSuccess}</div>}

      {/* Main Card UI (Giữ nguyên cấu trúc của bạn) */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-[#0037B0] to-[#0052FF]"></div>
        <div className="px-6 sm:px-8 pb-8 flex flex-col sm:flex-row gap-6">
          <div className="-mt-12 relative flex-shrink-0">
            <div className="w-24 h-24 bg-white rounded-full p-1 shadow-md">
              <div className="w-full h-full rounded-full bg-[#E2E8F0] flex items-center justify-center text-3xl font-bold text-[#4F5E71]">
                {profile.fullName?.charAt(0)?.toUpperCase() || profile.username.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>

          <div className="flex-1 mt-4 sm:mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Tên đăng nhập</label>
                <input type="text" value={profile.username} disabled className="w-full h-8.5 px-3 border border-gray-200 rounded-lg text-[13px] bg-gray-50 text-gray-500 cursor-not-allowed"/>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Vai trò hệ thống</label>
                <div className="w-full h-8.5 px-3 border border-gray-200 rounded-lg flex items-center bg-blue-50/50">
                  <span className="text-[12px] font-bold text-[#0037B0]">{profile.role}</span>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Họ và tên</label>
                <input type="text" value={profile.fullName} onChange={(e) => setProfile({...profile, fullName: e.target.value})} disabled={!isEditing} className={`w-full h-8.5 px-3 border border-gray-200 rounded-lg text-[13px] text-[#1E293B] focus:outline-none focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF] transition-all ${!isEditing ? 'bg-gray-50' : 'bg-white'}`}/>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Trạng thái</label>
                <div className="w-full h-8.5 flex items-center">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${profile.status === 'Hoạt động' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${profile.status === 'Hoạt động' ? 'bg-green-600' : 'bg-red-600'}`}></span>
                    {profile.status}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email liên hệ</label>
                <input type="email" value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} disabled={!isEditing} className={`w-full h-8.5 px-3 border border-gray-200 rounded-lg text-[13px] text-[#1E293B] focus:outline-none focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF] transition-all ${!isEditing ? 'bg-gray-50' : 'bg-white'}`}/>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Số điện thoại</label>
                <input type="text" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} disabled={!isEditing} className={`w-full h-8.5 px-3 border border-gray-200 rounded-lg text-[13px] text-[#1E293B] focus:outline-none focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF] transition-all ${!isEditing ? 'bg-gray-50' : 'bg-white'}`}/>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RENDER MODAL ĐỔI MẬT KHẨU CHÍNH XÁC THEO TRẠNG THÁI */}
      <ResetPasswordModal 
        isOpen={isResetPasswordOpen}
        onClose={() => setIsResetPasswordOpen(false)}
        accountData={currentUser}
        mode="change" 
        onConfirm={handleChangePasswordSubmit}
      />
    </div>
  );
};

export default ProfilePage;