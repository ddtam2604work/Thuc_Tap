import React, { useState } from 'react';
import apiClient from '../../../../services/apiClient';

export const ChangePasswordForm = () => {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      return setStatus({ type: 'error', message: 'Mật khẩu xác nhận không khớp' });
    }

    try {
      await apiClient.post('/profile/change-password', {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword
      });
      setStatus({ type: 'success', message: 'Đổi mật khẩu thành công!' });
      setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setStatus({ type: 'error', message: 'Có lỗi xảy ra, vui lòng thử lại.' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded shadow">
      <h3 className="text-lg font-bold">Đổi mật khẩu</h3>
      {status.message && (
        <div className={`p-2 text-sm ${status.type === 'error' ? 'text-red-500 bg-red-50' : 'text-green-500 bg-green-50'}`}>
          {status.message}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium">Mật khẩu hiện tại</label>
        <input type="password" value={formData.oldPassword} onChange={e => setFormData({...formData, oldPassword: e.target.value})} className="mt-1 w-full border rounded p-2" required />
      </div>
      <div>
        <label className="block text-sm font-medium">Mật khẩu mới</label>
        <input type="password" value={formData.newPassword} onChange={e => setFormData({...formData, newPassword: e.target.value})} className="mt-1 w-full border rounded p-2" required />
      </div>
      <div>
        <label className="block text-sm font-medium">Xác nhận mật khẩu mới</label>
        <input type="password" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} className="mt-1 w-full border rounded p-2" required />
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Cập nhật mật khẩu
      </button>
    </form>
  );
};