// src/pages/Profile/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Button from '../../components/skeleton/Button';
import { useProfile } from '../../hooks/Profile/useProfile';
import { useChangePassword } from '../../hooks/Profile/useChangePassword';
import { useAuth } from '../../hooks/Login/useAuth'; // 🔑 BỔ SUNG: Import useAuth để lấy hàm logout

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  
  // 👉 MÓC DỮ LIỆU TỪ REDUX (Nguồn sự thật duy nhất)
  const currentUser = useSelector((state) => state.auth.user);
  
  // Lấy logic và state từ các hook
  const { loading, errorMessage, successMessage, updateProfile } = useProfile(currentUser);
  const { 
    loading: pwdLoading, 
    error: pwdError, 
    success: pwdSuccess, 
    changePassword, 
    setError: setPwdError, 
    setSuccess: setPwdSuccess 
  } = useChangePassword();
  
  const { logout } = useAuth(); // 🔑 Lấy hàm logout đồng bộ phiên làm việc

  // Khởi tạo state cho Form dựa trên dữ liệu Redux
  const [profile, setProfile] = useState({
    username: currentUser?.username || '',
    fullName: currentUser?.fullname || '', 
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    role: currentUser?.roles?.[0]?.name || 'Chưa phân quyền',
    status: currentUser?.isactive === 1 ? 'Hoạt động' : 'Đã khóa' // Đồng bộ động theo isactive backend
  });

  // Theo dõi nếu dữ liệu Redux thay đổi thì cập nhật lại Form UI
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
    }
  };

  const handleCancel = () => {
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
  
  const handleChangePassword = async () => {
    setPwdError(null);
    setPwdSuccess(null);

    // Sử dụng bộ prompt bọc lót sạch sẽ dữ liệu khoảng trắng thừa (.trim())
    const currentPassword = prompt("Nhập mật khẩu hiện tại:");
    if (!currentPassword) return;

    const newPassword = prompt("Nhập mật khẩu mới:\n(Yêu cầu: Tối thiểu 8 ký tự, có chữ hoa, chữ thường và số)");
    if (!newPassword) return;
    
    // BỘ VALIDATION MỚI: Kiểm tra mật khẩu mới theo nhiều quy tắc
    const passwordValidationError = ((password) => {
      if (password.length < 8) return "Mật khẩu phải có ít nhất 8 ký tự.";
      if (!/[A-Z]/.test(password)) return "Mật khẩu phải chứa ít nhất một chữ cái viết hoa (A-Z).";
      if (!/[a-z]/.test(password)) return "Mật khẩu phải chứa ít nhất một chữ cái viết thường (a-z).";
      if (!/\d/.test(password)) return "Mật khẩu phải chứa ít nhất một chữ số (0-9).";
      return null;
    })(newPassword.trim());

    if (passwordValidationError) {
      alert(`❌ Mật khẩu mới không hợp lệ:\n\n- ${passwordValidationError}`);
      return;
    }

    const confirmPassword = prompt("Xác nhận lại mật khẩu mới:");
    if (!confirmPassword) return;

    if (newPassword.trim() !== confirmPassword.trim()) {
      alert("❌ Mật khẩu xác nhận không trùng khớp.");
      return;
    }

    console.log("[ProfilePage] ========== ĐỔI MẬT KHẨU ==========");
    console.log("[ProfilePage] Mật khẩu hiện tại:", currentPassword ? "***" : "null");
    console.log("[ProfilePage] Mật khẩu mới:", newPassword ? `*** (${newPassword.length} ký tự)` : "null");

    // Tiến hành gọi API Đổi mật khẩu
    const success = await changePassword({ 
      currentPassword: currentPassword.trim(), 
      newPassword: newPassword.trim() 
    });

    console.log("[ProfilePage] Kết quả changePassword:", success, "pwdError:", pwdError, "pwdSuccess:", pwdSuccess);

    if (success) {
      alert("✅ Đổi mật khẩu thành công!\n\nVui lòng đăng nhập lại bằng mật khẩu mới.");
      // Logout để user đăng nhập lại với mật khẩu mới
      setTimeout(() => {
        logout();
      }, 1500);
    }
  };

  if (!currentUser) {
    return <div className="p-8 text-center text-red-500">Dữ liệu người dùng bị mất. Vui lòng đăng nhập lại.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto w-full pb-8">
      
      <div className="flex justify-between items-center mt-1 mb-4">
        <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">Thông tin cá nhân</h1>
        {!isEditing ? ( 
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleChangePassword} disabled={pwdLoading} className="h-8.5 px-4 rounded-lg text-[12px] font-medium border border-gray-300">
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

      {/* Thông báo cập nhật Hồ sơ thất bại */}
      {errorMessage && (
        <div className="w-full p-3 mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg animate-in fade-in zoom-in duration-300">
          {errorMessage}
        </div>
      )}

      {/* Thông báo cập nhật Hồ sơ thành công */}
      {successMessage && (
        <div className="w-full p-3 mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg font-medium animate-in fade-in zoom-in duration-300">
          {successMessage}
        </div>
      )}

      {/* Thông báo lỗi khi đổi mật khẩu */}
      {pwdError && (
        <div className="w-full p-3 mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg animate-in fade-in zoom-in duration-300">
          {pwdError}
        </div>
      )}

      {/* ĐÃ SỬA LỖI CHÍNH TẢ: Thay thế biến hiển thị sang chuẩn pwdSuccess */}
      {pwdSuccess && (
        <div className="w-full p-3 mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg font-medium animate-in fade-in zoom-in duration-300">
          {pwdSuccess || 'Thay đổi mật khẩu thành công!'}
        </div>
      )}

      {/* Main Card */}
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
    </div>
  );
};

export default ProfilePage;