import { useState, useCallback } from 'react';
import { customerService } from '../../services/customerService';

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
      return response;
    } catch (error) {
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

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
      return response;
    } catch (error) {
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCustomer = async (id, customerName) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa khách hàng "${customerName || 'này'}" không?`)) return;
    try {
      const response = await customerService.deleteCustomer(id);
      const resBody = response?.data?.errorCode !== undefined ? response.data : response;

      if (resBody?.errorCode !== undefined && resBody?.errorCode !== 1) {
        throw new Error(resBody.message || "Lỗi xóa khách hàng.");
      }
      await fetchCustomers();
    } catch (error) {
      alert(error.response?.data?.message || error.message || "Lỗi xóa khách hàng.");
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