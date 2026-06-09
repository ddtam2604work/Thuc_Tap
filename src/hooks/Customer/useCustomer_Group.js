import { useState, useCallback, useEffect } from 'react';
import { customerService } from '../../services/customerService';

// --- IMPORT HOOK THÔNG BÁO DÙNG CHUNG ---
import { useNotification } from '../../context/NotificationContext';

export const useCustomerGroups = () => {
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Kích hoạt hook thông báo hệ thống (Sử dụng Destructuring chuẩn)
  const { showToast } = useNotification();

  // 1. Tải danh sách nhóm
  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const response = await customerService.getCategories();
      const apiResult = response?.data?.data || response?.data || response || [];
      const arrayData = Array.isArray(apiResult) ? apiResult : (apiResult?.data || []);
      
      setGroups(arrayData);
      setFilteredGroups(arrayData);
    } catch (error) {
      console.error("[fetchGroups] Lỗi:", error);
      showToast("Không thể tải danh sách nhóm khách hàng từ hệ thống", "error");
      setGroups([]); setFilteredGroups([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  // 🌟 GIỮ NGUYÊN LOGIC GỐC: Hàm xử lý tìm kiếm khi click nút submit
  const handleSearchSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!searchQuery.trim()) {
      setFilteredGroups(groups);
    } else {
      const matchText = searchQuery.toLowerCase().trim();
      setFilteredGroups(
        groups.filter(g => 
          (g.name && g.name.toLowerCase().includes(matchText)) || 
          (g.code && g.code.toLowerCase().includes(matchText))
        )
      );
    }
  };

  // 🌟 GIỮ NGUYÊN LOGIC GỐC: Kích hoạt tìm kiếm tức thời (Instant Search) khi gõ phím
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredGroups(groups);
    } else {
      const matchText = searchQuery.toLowerCase().trim();
      setFilteredGroups(
        groups.filter(g => 
          (g.name && g.name.toLowerCase().includes(matchText)) || 
          (g.code && g.code.toLowerCase().includes(matchText))
        )
      );
    }
  }, [searchQuery, groups]);

  // 2. Thêm mới nhóm (Payload trực tiếp)
  const handleAddGroup = async (payload) => {
    setIsSaving(true);
    try {
      const response = await customerService.addCategory(payload);
      if (response?.data?.errorCode === 0) throw new Error(response.data.message);
      await fetchGroups(); 
      
      // 🌟 BỔ SUNG: Thông báo Toast Success khi thêm mới nhóm thành công
      showToast("Thêm nhóm khách hàng mới thành công!", "success");
      
      return response;
    } catch (error) {
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // 3. Chỉnh sửa nhóm (Nhồi thêm 'id' vào payload)
  const handleEditGroup = async (id, payloadData) => {
    setIsSaving(true);
    try {
      const payload = { id, ...payloadData }; 
      const response = await customerService.editCategory(payload);
      if (response?.data?.errorCode === 0) throw new Error(response.data.message);
      await fetchGroups();
      
      // 🌟 BỔ SUNG: Thông báo Toast Success khi cập nhật nhóm thành công
      showToast("Cập nhật thông tin nhóm khách hàng thành công!", "success");
      
      return response;
    } catch (error) {
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // 4. Xóa nhóm
  const handleDeleteGroup = async (id) => {
    // 🛠️ ĐÃ XÓA: Bỏ hoàn toàn dòng window.confirm trùng lặp tại đây theo yêu cầu
    try {
      const response = await customerService.deleteCategory(id); 
      if (response?.data?.errorCode === 0) throw new Error(response.data.message);
      await fetchGroups();
      showToast("Đã xóa nhóm khách hàng thành công!", "success");
    } catch (error) {
      showToast(error.response?.data?.message || error.message || "Lỗi xóa nhóm.", "error");
    }
  };

  return {
    groups, filteredGroups, loading, isSaving,
    searchQuery, setSearchQuery,
    fetchGroups, handleSearchSubmit,
    handleAddGroup, handleEditGroup, handleDeleteGroup
  };
};