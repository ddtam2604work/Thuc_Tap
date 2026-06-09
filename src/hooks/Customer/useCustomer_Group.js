import { useState, useCallback, useEffect } from 'react';
import { customerService } from '../../services/customerService';

export const useCustomerGroups = () => {
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
      setGroups([]); setFilteredGroups([]);
    } finally {
      setLoading(false);
    }
  }, []);

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

  // 🌟 BỔ SUNG HIỆU ỨNG TỰ ĐỘNG: Kích hoạt tìm kiếm tức thời (Instant Search) giống AccountPage khi gõ phím
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
      const payload = { id, ...payloadData }; // 🎯 BẮT BUỘC CÓ ID ĐỂ BACKEND NHẬN DIỆN
      const response = await customerService.editCategory(payload);
      if (response?.data?.errorCode === 0) throw new Error(response.data.message);
      await fetchGroups();
      return response;
    } catch (error) {
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // 4. Xóa nhóm
  const handleDeleteGroup = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa nhóm khách hàng này không?")) return;
    try {
      const response = await customerService.deleteCategory(id); 
      if (response?.data?.errorCode === 0) throw new Error(response.data.message);
      await fetchGroups();
    } catch (error) {
      alert(error.response?.data?.message || error.message || "Lỗi xóa nhóm.");
    }
  };

  return {
    groups, filteredGroups, loading, isSaving,
    searchQuery, setSearchQuery,
    fetchGroups, handleSearchSubmit,
    handleAddGroup, handleEditGroup, handleDeleteGroup
  };
};