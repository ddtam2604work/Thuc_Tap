import { useState, useCallback } from 'react';
import { customerService } from '../../services/customerService';

// --- IMPORT CÁC HOOK DÙNG CHUNG ---
import { useConfirm } from '../../context/ConfirmContext';
import { useNotification } from '../../context/NotificationContext';

export const useCustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [customerSearch, setCustomerSearch] = useState('');
  const [portalFilter, setPortalFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Kích hoạt các công cụ điều khiển từ Context dùng chung
  const { confirm } = useConfirm();
  const { showToast } = useNotification();

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const payload = {
        isactive: statusFilter === 'all' ? null : (statusFilter === 'active' ? 1 : 0),
        isportal: portalFilter === 'all' ? null : (portalFilter === 'portal' ? 1 : 0),
        search: customerSearch.trim(),
        page: currentPage,
        pagesize: itemsPerPage
      };

      console.log("🔌 [Hook/useCustomerList] -> Gọi fetchCustomers() với Payload:", payload);

      const response = await customerService.getPaging(payload);
      console.log("📩 [Hook/useCustomerList] -> Phản hồi từ API Paging:", response);

      const apiResult = response?.data?.data || response?.data || response;
      console.log("🔍 [Hook/useCustomerList] -> Dữ liệu bóc tách được (apiResult):", apiResult);

      if (apiResult && apiResult.items) {
        setCustomers(apiResult.items);
        setTotalPages(Math.ceil((apiResult.total || 0) / itemsPerPage) || 1);
      } else {
        console.warn("⚠️ [Hook/useCustomerList] -> API không trả về thuộc tính '.items'.");
        setCustomers([]); 
        setTotalPages(1);
      }
    } catch (error) {
      console.error("❌ [Hook/useCustomerList] -> Xảy ra lỗi nghiêm trọng khi tải danh sách:", error);
      setCustomers([]); 
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, customerSearch, portalFilter, statusFilter]);

  // 🎯 TÍCH HỢP TOAST THÀNH CÔNG CHO HÀM THÊM MỚI KHÁCH HÀNG
  const handleAddCustomer = async (payload) => {
    setIsSaving(true);
    console.log("🚀 [Hook/useCustomerList] -> Bắt đầu gọi API addCustomer với tham số:", payload);
    try {
      const response = await customerService.addCustomer(payload);
      const resBody = response?.data?.errorCode !== undefined ? response.data : response;
      
      if (resBody?.errorCode !== undefined && resBody?.errorCode !== 1) {
        throw new Error(resBody.message || 'Thêm khách hàng không thành công');
      }
      
      await fetchCustomers();
      
      // Bắn thông báo Toast Success trực tiếp tại đầu đầu API thành công
      showToast('Thêm khách hàng thành công!', 'success');
      
      return response;
    } catch (error) {
      // Tự động bắn thông báo lỗi nếu API thất bại
      showToast(error.response?.data?.message || error.message || 'Thao tác thêm khách hàng thất bại', 'error');
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // 🎯 TÍCH HỢP TOAST THÀNH CÔNG CHO HÀM CẬP NHẬT KHÁCH HÀNG
  const handleEditCustomer = async (id, updatedPayload) => {
    setIsSaving(true);
    try {
      const payload = { id, ...updatedPayload };
      const response = await customerService.editCustomer(payload);
      const resBody = response?.data?.errorCode !== undefined ? response.data : response;

      if (resBody?.errorCode !== undefined && resBody?.errorCode !== 1) {
        throw new Error(resBody.message || 'Cập nhật khách hàng không thành công');
      }

      if (updatedPayload.isactive !== undefined) {
        await customerService.setActive(id, updatedPayload.isactive);
      }

      await fetchCustomers();
      
      // Bắn thông báo Toast Success trực tiếp tại đầu đầu API thành công
      showToast('Cập nhật khách hàng thành công!', 'success');
      
      return response;
    } catch (error) {
      showToast(error.response?.data?.message || error.message || 'Thao tác cập nhật khách hàng thất bại', 'error');
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCustomer = async (id, customerName) => {
    const isConfirmed = await confirm({
      title: 'Xác nhận xóa khách hàng',
      message: `Bạn có chắc chắn muốn xóa khách hàng "${customerName || 'này'}" không? Thao tác này không thể hoàn tác.`,
      confirmText: 'Đồng ý xóa',
      cancelText: 'Hủy bỏ',
      type: 'danger'
    });

    if (!isConfirmed) return;

    try {
      const response = await customerService.deleteCustomer(id);
      const resBody = response?.data?.errorCode !== undefined ? response.data : response;

      if (resBody?.errorCode !== undefined && resBody?.errorCode !== 1) {
        throw new Error(resBody.message || "Lỗi xóa khách hàng.");
      }
      await fetchCustomers();
      showToast("Đã xóa khách hàng thành công!", "success");
    } catch (error) {
      showToast(error.response?.data?.message || error.message || "Lỗi xóa khách hàng.", "error");
    }
  };

  const getCustomerDetail = async (id) => {
    try {
      const response = await customerService.getDetail(id);
      return response?.data?.data || response?.data;
    } catch (error) {
      throw error;
    }
  };

  const [detailConfig, setDetailConfig] = useState({ isOpen: false, data: null });

  const handleViewDetail = (row) => {
    const data = row;
    setDetailConfig({
      isOpen: true,
      data: {
        id: data.id,
        name: data.fullname || data.customer_user_fullname || data.name || '',
        phone: data.phone || data.customer_user_phone || '',
        email: data.email || data.customer_user_email || '',
        address: data.address || data.customer_address || '',
        status: data.isactive === 1 || data.isactive === true ? 'ACTIVE' : 'INACTIVE',
        studioname: data.studioname || data.customer_studioname || '',
      }
    });
  };

  const handleCloseDetail = () => {
    setDetailConfig({ isOpen: false, data: null });
  };

  return {
    customers, loading, isSaving,
    customerSearch, setCustomerSearch, portalFilter, setPortalFilter,
    statusFilter, setStatusFilter, currentPage, setCurrentPage, totalPages,
    fetchCustomers, handleAddCustomer, handleEditCustomer, handleDeleteCustomer,
    getCustomerDetail, detailConfig, handleViewDetail, handleCloseDetail
  };
};