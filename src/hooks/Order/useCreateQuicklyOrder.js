import { useState } from 'react';

export const useCreateQuicklyOrder = () => {
  const [formData, setFormData] = useState({
    name: '',
    studioName: '',
    phone: '',
    email: '',
    address: '',
    group: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleFormSubmit = (e, onSuccess) => {
    e.preventDefault();

    // Áp dụng nguyên tắc Fail-Fast: Kiểm tra dữ liệu bắt buộc
    const clientErrors = {};
    if (!formData.name.trim()) clientErrors.name = 'Tên khách hàng bắt buộc';
    if (!formData.phone.trim()) clientErrors.phone = 'Số điện thoại bắt buộc';
    if (!formData.email.trim()) clientErrors.email = 'Email bắt buộc';

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    try {
      const cleanPayload = {
        ...formData,
        name: formData.name.trim(),
        studioName: formData.studioName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        group: formData.group,
        notes: formData.notes.trim()
      };

      console.log('[API/createQuicklyOrder] Dữ liệu gửi lên hệ thống:', cleanPayload);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('[useCreateQuicklyOrder/handleFormSubmit] Trục trặc:', err);
    }
  };

  return {
    formData,
    errors,
    handleInputChange,
    handleFormSubmit
  };
};