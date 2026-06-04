
import { useCreateQuicklyOrder } from '../../../../hooks/Order/useCreateQuicklyOrder';
import Button from '../../../skeleton/Button';

const FormInsertOrder = ({ onClose, onSubmit }) => {
  const { formData, errors, handleInputChange, handleFormSubmit } = useCreateQuicklyOrder();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFormSubmitWrapper = (e) => {
    handleFormSubmit(e, () => {
      if (onSubmit) onSubmit(formData);
      if (onClose) onClose();
    });
  };

  return (
    <form onSubmit={handleFormSubmitWrapper} className="flex flex-col font-inter bg-white text-[#191C1D]">
      {/* Container nội dung */}
      <div className="px-5 py-4 flex flex-col gap-3.5">
        {/* Lưới 2 cột tối ưu không gian chiều dọc */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-gray-700 tracking-wide uppercase">
              Tên khách hàng <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Nhập tên khách hàng"
              className="h-9 px-3 border border-[#747686] rounded-[4px] text-sm focus:outline-hidden focus:border-[#0037B0]"
            />
            {errors.name && <span className="text-xs text-red-500 mt-0.5">{errors.name}</span>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-gray-700 tracking-wide uppercase">Tên Studio</label>
            <input
              type="text"
              name="studioName"
              value={formData.studioName}
              onChange={handleInputChange}
              placeholder="Tên studio"
              className="h-9 px-3 border border-[#747686] rounded-[4px] text-sm focus:outline-hidden focus:border-[#0037B0]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-gray-700 tracking-wide uppercase">
              Số điện thoại <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Nhập số điện thoại"
              className="h-9 px-3 border border-[#747686] rounded-[4px] text-sm focus:outline-hidden focus:border-[#0037B0]"
            />
            {errors.phone && <span className="text-xs text-red-500 mt-0.5">{errors.phone}</span>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-gray-700 tracking-wide uppercase">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="abc@gmail.com"
              className="h-9 px-3 border border-[#747686] rounded-[4px] text-sm focus:outline-hidden focus:border-[#0037B0]"
            />
            {errors.email && <span className="text-xs text-red-500 mt-0.5">{errors.email}</span>}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold text-gray-700 tracking-wide uppercase">Địa chỉ</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Địa chỉ thường trú"
            className="w-full h-14 p-2 border border-[#747686] rounded-[4px] text-sm resize-none focus:outline-hidden focus:border-[#0037B0]"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold text-gray-700 tracking-wide uppercase">Nhóm khách hàng</label>
          <select
            name="group"
            value={formData.group}
            onChange={handleInputChange}
            className="h-9 px-2 border border-[#747686] rounded-[4px] text-sm bg-white focus:outline-hidden focus:border-[#0037B0] cursor-pointer"
          >
            <option value="">-- Chọn nhóm --</option>
            <option value="VIP">VIP</option>
            <option value="Đại lý">Đại lý</option>
            <option value="Lẻ">Khách lẻ</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold text-gray-700 tracking-wide uppercase">Ghi chú</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Nhập ghi chú..."
            className="w-full h-14 p-2 border border-[#747686] rounded-[4px] text-sm resize-none focus:outline-hidden focus:border-[#0037B0]"
          />
        </div>
        <div className="flex items-center gap-2.5 py-1">
          <input
            type="checkbox"
            id="portalInsList"
            name="createPortal"
            checked={formData.createPortal}
            onChange={handleChange}
            className="w-4 h-4 border border-[#747686] rounded-[2px] cursor-pointer accent-[#1D4ED8]"
          />
          <label htmlFor="portalInsList" className="text-xs font-semibold text-[#191C1D] cursor-pointer select-none">
            Tạo tài khoản portal
          </label>
        </div>
      </div>

      {/* Footer hành động */}
      <div className="flex justify-end items-center gap-2.5 px-5 py-3 bg-[#F3F4F5] border-t border-[#C4C5D7]">
        <Button
          type="button"
          variant="outline-secondary"
          className="h-9 px-4 text-xs font-bold border-[#C4C5D7] text-gray-600 rounded-[4px]"
          onClick={onClose}
        >
          Huỷ
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="bg-[#1D4ED8] hover:bg-blue-700 h-9 px-6 text-xs font-bold uppercase tracking-wider rounded-[4px]"
        >
          Lưu
        </Button>
      </div>
    </form>
  );
};

export default FormInsertOrder;