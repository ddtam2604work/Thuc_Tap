import { useNavigate } from 'react-router-dom';
import FormInsertOrder from '../../../components/partials/forms/order/FormInsert_Order';

const CreateQuickly = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/orders/create');
  };

  const handleSubmit = (formData) => {
    // Logic to save form data
    console.log('[CreateQuickly/handleSubmit] Dữ liệu gửi lên hệ thống:', formData);
    navigate('/orders/create');
  };

  return (
    <div className="w-full min-h-screen bg-[#F5F5F5] p-8 font-inter">
      <div className="w-full max-w-[1400px] mx-auto bg-white rounded-lg border border-gray-200 shadow-sm p-8">
        <FormInsertOrder onClose={handleClose} onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default CreateQuickly;
