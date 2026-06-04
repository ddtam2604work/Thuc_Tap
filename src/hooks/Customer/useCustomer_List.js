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

      const response = await customerService.getPaging(payload);
      const apiResult = response?.data?.data || response?.data || response;

      if (apiResult && apiResult.items) {
        setCustomers(apiResult.items);
        setTotalPages(Math.ceil((apiResult.total || 0) / itemsPerPage) || 1);
      } else {
        setCustomers([]); setTotalPages(1);
      }
    } catch (error) {
      setCustomers([]); setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, customerSearch, portalFilter, statusFilter]);

  const handleAddCustomer = async (payload) => {
    setIsSaving(true);
    try {
      const response = await customerService.addCustomer(payload);
      if (response?.data?.errorCode === 0) throw new Error(response.data.message);
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
      // 1. Gọi API Sửa thông tin cơ bản & Portal
      const payload = { id, ...updatedPayload };
      const response = await customerService.editCustomer(payload);
      if (response?.data?.errorCode === 0) throw new Error(response.data.message);

      // 🎯 2. GỌI API SET-ACTIVE THEO ĐÚNG YÊU CẦU ĐỂ CẬP NHẬT TRẠNG THÁI
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
      if (response?.data?.errorCode === 0) throw new Error(response.data.message);
      await fetchCustomers();
    } catch (error) {
      alert(error.response?.data?.message || error.message || "Lỗi xóa khách hàng.");
    }
  };

  // 🎯 BỔ SUNG: Hàm lấy thông tin chi tiết khách hàng từ ID
  const getCustomerDetail = async (id) => {
    try {
      const response = await customerService.getDetail(id);
      return response?.data?.data || response?.data;
    } catch (error) {
      console.error("[useCustomerList/getCustomerDetail] Lỗi:", error);
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
    getCustomerDetail, // 🎯 Export hàm này ra để Component CustomerList sử dụng
    detailConfig, handleViewDetail, handleCloseDetail
  };
};