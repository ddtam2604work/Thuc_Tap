import { useState, useCallback, useEffect, useMemo } from 'react';
import { productService } from '../../services/productService';

const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Hàm bảo vệ: Kiểm tra token trước khi gọi API
  const checkTokenGuard = () => {
    if (!localStorage.getItem('accessToken')) throw new Error('Phiên đăng nhập đã hết hạn.');
  };

  // Hàm xử lý lỗi chung cho các Response
  // Hàm xử lý lỗi chung cho các Response
  const handleBusinessError = (rawResponse) => {
    if (!rawResponse) throw new Error('Không nhận được phản hồi từ máy chủ.');
    
    // Bóc tách lấy data chứa errorCode
    const beData = rawResponse.errorCode !== undefined ? rawResponse : (rawResponse.data || rawResponse);
    
    // 🎯 ĐIỀU CHỈNH QUAN TRỌNG: 
    // Bỏ qua statusCode HTTP, chỉ xét duyệt dựa trên errorCode hệ thống.
    // Nếu errorCode KHÁC 1 -> Chắc chắn là lỗi từ Backend.
    if (beData.errorCode !== 1 && String(beData.errorCode) !== "1") {
      const errMsg = beData?.message || beData?.msg || beData?.error || 'Hệ thống từ chối thao tác.';
      throw new Error(errMsg); // Ném lỗi này ra để Form bắt được
    }
    
    return beData;
  };

  // 1. GỌI API SINH MÃ DANH MỤC MỚI
  const generateCategoryCode = async () => {
    checkTokenGuard();
    const response = await productService.genCategoryCode();
    const beData = handleBusinessError(response);
    return beData.data.code; 
  };

  // =========================================================
  // 2. LẤY VÀ MAP DỮ LIỆU DANH MỤC (/productcategories/get-all)
  // =========================================================
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      checkTokenGuard();
      const response = await productService.getCategories();
      const beData = handleBusinessError(response);

      const items = beData?.data || [];
      
      // 🎯 MAPPING: Đưa dữ liệu về đúng chuẩn để ProductCatalogTable đọc
      const mappedCategories = items.map(item => ({
        id: item.id || item.productcategory_id || item.categoryId,
        code: item.code,
        name: item.name,
        desc: item.description || '',        
        count: item.product_count || 0,
        // 🎯 Lấy trực tiếp isactive dạng số (1/0)
        isactive: item.isactive !== undefined ? Number(item.isactive) : 1
      }));

      setCategories(mappedCategories);
    } catch (err) {
      console.error("[useCategories] Fetch Error:", err);
      setError(err.message);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Tự động lấy danh sách khi component mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Bộ lọc tìm kiếm
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    const term = searchTerm.toLowerCase().trim();
    return categories.filter(c => 
      (c.name || '').toLowerCase().includes(term) || 
      (c.code || '').toLowerCase().includes(term)
    );
  }, [categories, searchTerm]);


  // =========================================================
  // 3. THÊM DANH MỤC MỚI (/productcategories/add)
  // =========================================================
  const addCategory = async (formData) => {
    checkTokenGuard();
    const payload = {
      code: formData.code,
      name: formData.name,
      description: formData.desc
      // Tuỳ thuộc BE của bạn, thường thêm mới mặc định là isactive: 1
    };
    
    await handleBusinessError(await productService.addCategory(payload));
    
    // Đợi 500ms cho DB ghi xong rồi fetch lại danh sách
    await new Promise(resolve => setTimeout(resolve, 500));
    setSearchTerm('');
    await fetchCategories();
  };


  // =========================================================
  // 4. SỬA DANH MỤC & CẬP NHẬT TRẠNG THÁI
  // =========================================================
  const updateCategory = async (id, formData) => {
    checkTokenGuard();
    
    try {
      // BƯỚC A: Gọi API cập nhật thông tin chữ (Tuyệt đối không gửi isactive)
      const infoPayload = { 
        id: id, 
        code: formData.code,
        name: formData.name,
        description: formData.desc
      };
      
      const responseEdit = await productService.editCategory(infoPayload);
      const beDataEdit = handleBusinessError(responseEdit);
      if (beDataEdit?.data?.accessToken) localStorage.setItem('accessToken', beDataEdit.data.accessToken);

      // BƯỚC B: Gọi API đổi trạng thái riêng (Gửi id và isactive)
      const activePayload = {
        id: id,
        isactive: Number(formData.isactive) 
      };

      const responseActive = await productService.setCategoryActive(activePayload);
      const beDataActive = handleBusinessError(responseActive);
      if (beDataActive?.data?.accessToken) localStorage.setItem('accessToken', beDataActive.data.accessToken);

      // BƯỚC C: Gọi lại danh sách mới nhất
      await new Promise(resolve => setTimeout(resolve, 500)); // Tránh Race Condition
      await fetchCategories();
      
    } catch (error) {
      console.error("❌ [updateCategory] Lỗi Cập nhật:", error);
      throw error; 
    }
  };


  // =========================================================
  // 5. XÓA DANH MỤC (/productcategories/delete)
  // =========================================================
  const deleteCategory = async (id) => {
    checkTokenGuard();
    await handleBusinessError(await productService.deleteCategory(id));
    
    // Gọi lại danh sách mới nhất sau khi xóa
    await fetchCategories();
  };

  return {
    categories: filteredCategories, loading, error, searchTerm, setSearchTerm,
    generateCategoryCode, addCategory, updateCategory, deleteCategory,
    fetchCategories
  };
};

export default useCategories;