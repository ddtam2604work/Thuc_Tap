import { useState, useEffect } from 'react';
import Button from '../components/skeleton/Button';
import FormInput from '../components/skeleton/FormInput';
import { useNotification } from './NotificationContext';

/**
 * ResetPasswordModal Component
 * @param {boolean} isOpen - Trạng thái đóng/mở
 * @param {function} onClose - Hàm xử lý đóng modal
 * @param {object} accountData - Dữ liệu tài khoản đang tương tác
 * @param {function} onConfirm - Hàm callback xử lý API ở component cha
 * @param {string} mode - 'change' (User tự đổi) hoặc 'set' (Admin đặt lại)
 */
const ResetPasswordModal = ({ isOpen, onClose, accountData, onConfirm, mode = 'change' }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const { showToast } = useNotification();

  // Reset form trạng thái mỗi khi đóng/mở modal
  useEffect(() => {
    if (!isOpen) {
      setCurrentPassword('');
      setPassword('');
      setConfirmPassword('');
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen || !accountData) return null;

  // Hàm kiểm tra tính hợp lệ của mật khẩu
  const validateForm = () => {
    const newErrors = {};

    // Chỉ validate mật khẩu hiện tại nếu đang ở chế độ 'change' (đổi mật khẩu cá nhân)
    if (mode === 'change' && !currentPassword) {
      newErrors.currentPassword = 'Mật khẩu hiện tại không được để trống';
    }

    if (!password) {
      newErrors.password = 'Mật khẩu mới không được để trống';
    } else if (password.length < 8) {
      newErrors.password = 'Mật khẩu phải từ 8 ký tự trở lên';
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = 'Mật khẩu phải chứa ít nhất 1 chữ cái hoa';
    } else if (!/[a-z]/.test(password)) {
      newErrors.password = 'Mật khẩu phải chứa ít nhất 1 chữ cái thường';
    } else if (!/\d/.test(password)) {
      newErrors.password = 'Mật khẩu phải chứa ít nhất 1 chữ số';
    } else if (!/[!@#$%^&*()_+=[\]{};':"\\|,.<>/?-]/.test(password)) {
      newErrors.password = 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận lại mật khẩu mới';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không trùng khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (isSaving) return;

    if (!validateForm()) {
      showToast('Vui lòng kiểm tra lại các điều kiện mật khẩu!', 'warning');
      return;
    }

    try {
      setIsSaving(true);
      
      // 🛠️ CHUẨN HÓA PAYLOAD THEO ĐÚNG ĐẦU RA CỦA 2 REQUEST API
      let payload = {};
      if (mode === 'change') {
        payload = {
          currentPassword: currentPassword,
          newPassword: password
        };
      } else {
        payload = {
          id: accountData.id || accountData.user_id, // Đảm bảo fallback key của Admin table
          password: password
        };
      }

      // Trả dữ liệu ra ngoài cho hàm onConfirm xử lý
      await onConfirm(payload);
      onClose(); 
    } catch (error) {
      console.error("[ResetPasswordModal] Xảy ra lỗi:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[2500] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white w-[460px] max-w-full rounded-2xl border border-gray-100 shadow-xl overflow-hidden flex flex-col animate-in zoom-in duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
          <div className="flex flex-col gap-0.5">
            <h2 className="font-inter font-semibold text-lg text-[#191C1D]">
              {mode === 'change' ? 'Đổi mật khẩu cá nhân' : 'Đặt lại mật khẩu người dùng'}
            </h2>
            <span className="text-xs text-gray-500">Tài khoản: <span className="font-semibold text-gray-700">{accountData?.username}</span></span>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            disabled={isSaving} 
            className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-gray-50"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 1L13 13M1 13L13 1"/>
            </svg>
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSave} className="flex flex-col font-inter bg-white text-[#191C1D] w-full">
          <div className="flex-1 px-6 py-5 flex flex-col gap-4">
            
            {/* Trường Mật khẩu hiện tại (Chỉ hiển thị khi tự đổi mật khẩu) */}
            {mode === 'change' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700">Mật khẩu hiện tại *</label>
                <FormInput 
                  type="password" 
                  placeholder="Nhập mật khẩu hiện tại..." 
                  value={currentPassword}
                  disabled={isSaving}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={`h-10 border rounded-xl text-sm bg-gray-50/30 focus:outline-none focus:border-[#0037B0] focus:bg-white transition-all shadow-3xs ${
                    errors.currentPassword ? 'border-red-400 focus:border-red-500 bg-red-50/10' : 'border-gray-200'
                  }`}
                />
                {errors.currentPassword && (
                  <span className="text-xs text-red-500 font-medium mt-0.5">{errors.currentPassword}</span>
                )}
              </div>
            )}

            {/* Mật khẩu mới */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-700">
                {mode === 'change' ? 'Mật khẩu mới *' : 'Mật khẩu đặt lại mới *'}
              </label>
              <FormInput 
                type="password" 
                placeholder="Nhập mật khẩu mới..." 
                value={password}
                disabled={isSaving}
                onChange={(e) => setPassword(e.target.value)}
                className={`h-10 border rounded-xl text-sm bg-gray-50/30 focus:outline-none focus:border-[#0037B0] focus:bg-white transition-all shadow-3xs ${
                  errors.password ? 'border-red-400 focus:border-red-500 bg-red-50/10' : 'border-gray-200'
                }`}
              />
              {errors.password ? (
                <span className="text-xs text-red-500 font-medium mt-0.5">{errors.password}</span>
              ) : (
                <span className="text-[11px] text-gray-400 leading-normal mt-0.5">
                  Yêu cầu: Từ 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
                </span>
              )}
            </div>

            {/* Xác nhận mật khẩu mới */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-700">Xác nhận mật khẩu mới *</label>
              <FormInput 
                type="password" 
                placeholder="Nhập lại mật khẩu mới..." 
                value={confirmPassword}
                disabled={isSaving}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`h-10 border rounded-xl text-sm bg-gray-50/30 focus:outline-none focus:border-[#0037B0] focus:bg-white transition-all shadow-3xs ${
                  errors.confirmPassword ? 'border-red-400 focus:border-red-500 bg-red-50/10' : 'border-gray-200'
                }`}
              />
              {errors.confirmPassword && (
                <span className="text-xs text-red-500 font-medium mt-0.5">{errors.confirmPassword}</span>
              )}
            </div>

          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end items-center gap-2.5 px-6 py-4 bg-gray-50/60 border-t border-gray-100 rounded-b-2xl">
            <Button 
              variant="outline-secondary" 
              type="button" 
              onClick={onClose} 
              disabled={isSaving}
              className="h-9 px-4 text-xs font-bold border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
            >
              Hủy bỏ
            </Button>
            <Button 
              type="submit" 
              disabled={isSaving}
              className="bg-[#0037B0] hover:bg-[#00267A] h-9 px-5 text-xs font-bold uppercase tracking-wider text-white rounded-xl shadow-xs transition-all"
            >
              {isSaving ? '⏳ Đang xử lý...' : 'Cập nhật mật khẩu'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordModal;