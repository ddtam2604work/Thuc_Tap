import React, { useState } from 'react';
import Button from '../../components/skeleton/Button';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('appearance');

  // State quản lý config hệ thống
  const [settings, setSettings] = useState({
    theme: 'light', // light, dark, system
    fontSize: 'medium', // small, medium, large
    density: 'comfortable', // compact, comfortable
    emailNoti: true,
    orderNoti: true,
    twoFactorAuth: false
  });

  // Dữ liệu Sidebar Tabs
  const tabs = [
    { id: 'appearance', label: 'Giao diện & Hiển thị', icon: '🎨' },
    { id: 'notifications', label: 'Thông báo', icon: '🔔' },
    { id: 'security', label: 'Bảo mật & Đăng nhập', icon: '🛡️' },
  ];

  return (
    <div className="w-full pb-8">
      {/* Header */}
      <div className="flex justify-between items-center mt-1 mb-4">
        <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">Cài đặt hệ thống</h1>
        <Button variant="primary" className="bg-[#0037B0] hover:bg-blue-800 h-8.5 px-5 rounded-lg text-[12px] font-semibold shadow-xs">
          Lưu cài đặt
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-2 flex flex-col gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left text-[13px] font-medium transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-[#F0F5FF] text-[#0037B0]' 
                    : 'text-[#4F5E71] hover:bg-gray-50'
                }`}
              >
                <span className="text-[16px]">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-xl shadow-xs border border-gray-100 p-6 min-h-[400px]">
          
          {/* TAB 1: GIAO DIỆN */}
          {activeTab === 'appearance' && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-[16px] font-bold text-[#1E293B] mb-1">Giao diện & Hiển thị</h2>
              <p className="text-[12px] text-gray-500 mb-6">Tùy chỉnh cách hệ thống Labs Flow hiển thị trên thiết bị của bạn.</p>

              <div className="flex flex-col gap-6 max-w-2xl">
                {/* Chủ đề màu sắc */}
                <div>
                  <label className="block text-[13px] font-semibold text-[#1E293B] mb-2">Chủ đề (Theme)</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['light', 'dark', 'system'].map((t) => (
                      <div 
                        key={t}
                        onClick={() => setSettings({...settings, theme: t})}
                        className={`cursor-pointer border rounded-lg p-3 flex flex-col items-center gap-2 transition-all ${settings.theme === t ? 'border-[#0052FF] bg-[#F0F5FF] ring-1 ring-[#0052FF]' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                        <div className={`w-full h-10 rounded block ${t === 'dark' ? 'bg-gray-800' : t === 'light' ? 'bg-gray-100' : 'bg-gradient-to-r from-gray-100 to-gray-800'}`}></div>
                        <span className="text-[12px] font-medium capitalize text-gray-700">
                          {t === 'light' ? 'Sáng' : t === 'dark' ? 'Tối' : 'Theo Hệ Thống'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Kích thước chữ */}
                <div>
                  <label className="block text-[13px] font-semibold text-[#1E293B] mb-2">Kích thước chữ (Font Size)</label>
                  <select 
                    value={settings.fontSize}
                    onChange={(e) => setSettings({...settings, fontSize: e.target.value})}
                    className="w-full sm:w-1/2 h-9 px-3 border border-gray-200 rounded-lg text-[13px] text-[#1E293B] focus:outline-none focus:border-[#0052FF]"
                  >
                    <option value="small">Nhỏ (11px)</option>
                    <option value="medium">Tiêu chuẩn (12px - 14px)</option>
                    <option value="large">Lớn (16px)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: THÔNG BÁO */}
          {activeTab === 'notifications' && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-[16px] font-bold text-[#1E293B] mb-1">Quản lý Thông báo</h2>
              <p className="text-[12px] text-gray-500 mb-6">Chọn các luồng thông tin bạn muốn nhận từ hệ thống.</p>

              <div className="flex flex-col gap-4 max-w-2xl">
                <label className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div>
                    <p className="text-[13px] font-semibold text-[#1E293B]">Thông báo Email</p>
                    <p className="text-[11px] text-gray-500">Nhận báo cáo tổng hợp hàng tuần qua Email.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={settings.emailNoti}
                    onChange={(e) => setSettings({...settings, emailNoti: e.target.checked})}
                    className="w-4 h-4 text-[#0052FF] rounded focus:ring-[#0052FF] cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div>
                    <p className="text-[13px] font-semibold text-[#1E293B]">Biến động Đơn hàng</p>
                    <p className="text-[11px] text-gray-500">Đẩy thông báo popup khi có đơn hàng mới hoặc thay đổi trạng thái.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={settings.orderNoti}
                    onChange={(e) => setSettings({...settings, orderNoti: e.target.checked})}
                    className="w-4 h-4 text-[#0052FF] rounded focus:ring-[#0052FF] cursor-pointer"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 3: BẢO MẬT */}
          {activeTab === 'security' && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-[16px] font-bold text-[#1E293B] mb-1">Bảo mật & Đăng nhập</h2>
              <p className="text-[12px] text-gray-500 mb-6">Bảo vệ tài khoản quản trị của bạn khỏi các truy cập trái phép.</p>

              <div className="flex flex-col gap-4 max-w-2xl">
                {/* Đổi mật khẩu khu vực */}
                <div className="p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                  <p className="text-[13px] font-semibold text-[#1E293B]">Mật khẩu đăng nhập</p>
                  <p className="text-[11px] text-gray-500 mb-3">Lần đổi mật khẩu gần nhất: 30 ngày trước</p>
                  <Button variant="outline" className="h-8 px-4 border-gray-300 bg-white text-[12px] rounded-lg">
                    Đổi mật khẩu mới
                  </Button>
                </div>

                {/* 2FA */}
                <div className="p-4 border border-blue-100 rounded-xl bg-blue-50/30 flex justify-between items-center">
                  <div>
                    <p className="text-[13px] font-semibold text-[#0037B0]">Xác thực 2 bước (2FA)</p>
                    <p className="text-[11px] text-gray-600 mt-1">Sử dụng Google Authenticator để tăng cường bảo mật.</p>
                  </div>
                  <Button variant="primary" className="bg-[#0037B0] h-8 px-4 text-[12px] rounded-lg text-white">
                    Thiết lập
                  </Button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SettingsPage;