import { useState, useCallback, useEffect } from 'react';
import { productService } from '../../services/productService'; 

const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State xử lý riêng cho việc Form (Thêm/Sửa/Xóa) tránh chặn đứng UI danh sách
  const [isSaving, setIsSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20; 

  const checkTokenGuard = () => {
    if (!localStorage.getItem('accessToken')) throw new Error('Phiên đăng nhập đã hết hạn.');
  };

  const handleBusinessError = (rawResponse) => {
    if (!rawResponse) throw new Error('Không nhận được phản hồi từ máy chủ.');
    const beData = rawResponse.errorCode !== undefined ? rawResponse : (rawResponse.data || rawResponse);
    if (beData.errorCode !== 1 && String(beData.errorCode) !== "1" && beData.statusCode !== 200) {
      const errMsg = beData?.message || beData?.msg || beData?.error || 'Hệ thống từ chối thao tác.';
      throw new Error(errMsg);
    }
    return beData; 
  };

  // LẤY DANH SÁCH ĐƠN VỊ TÍNH
  const fetchUnits = useCallback(async () => {
    try {
      checkTokenGuard();
      const res = await productService.getUnits();
      const beData = handleBusinessError(res);
      setUnits(Array.isArray(beData.data) ? beData.data : []);
    } catch (err) { 
      console.error("Lỗi lấy Units:", err); 
      setUnits([]); 
    }
  }, []);

  // TẠO MÃ SẢN PHẨM TỰ ĐỘNG
  const generateProductCode = async () => {
    checkTokenGuard();
    const response = await handleBusinessError(await productService.genProductCode());
    return response.data.code;
  };

  // 1. LẤY DANH SÁCH SẢN PHẨM (PAGING)
  // 1. LẤY DANH SÁCH SẢN PHẨM (PAGING) - FIX DẠNG STRING CHO ISACTIVE
  const fetchProducts = useCallback(async () => {
    setLoading(true); 
    setError(null);
    try {
      checkTokenGuard();
      
      const payload = {
        // CHUẨN HÓA DẠNG STRING: 
        // - Nếu chọn 'all', truyền undefined để Axios tự xóa trường này, Backend sẽ trả về tất cả.
        // - Nếu chọn cụ thể, ép về String bằng String(...) thay vì Number(...)
        isactive: filterStatus === 'all' ? undefined : String(filterStatus), 
        
        productcategory_id: filterCategory === 'all' ? undefined : filterCategory,
        units_id: undefined, 
        search: searchTerm.trim() || undefined, 
        page: Number(currentPage) || 1,
        pagesize: itemsPerPage
      };

      console.log("🔍 [API Request] Gửi payload với isactive dạng STRING:", payload);

      const response = await productService.getPaging(payload);
      const beData = handleBusinessError(response);
      const items = beData?.data?.items || [];
      
      const mappedItems = items.map(item => ({
        ...item,
        price: item.price !== undefined && item.price !== null ? Number(item.price) : 0, 
        desc: item.description || item.desc || ""
      }));

      setProducts(mappedItems);
      setTotalPages(Math.ceil((beData?.data?.total || items.length) / itemsPerPage) || 1);
    } catch (err) {
      console.error("❌ Lỗi tại fetchProducts:", err.message);
      setError(err.message); 
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, filterCategory, filterStatus, itemsPerPage]);
  useEffect(() => { fetchUnits(); fetchProducts(); }, [fetchUnits, fetchProducts]);
  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterCategory, filterStatus]);
 
  // LẤY CHI TIẾT SẢN PHẨM (KÈM GÓI ĐẦU)
  const getProductDetail = async (id) => {
    checkTokenGuard();
    const response = await productService.getDetail(id);
    const beData = handleBusinessError(response);
    
    if (beData?.data?.accessToken) {
      localStorage.setItem('accessToken', beData.data.accessToken);
    }
    return beData.data;
  };

  // 2. THÊM MỚI SẢN PHẨM
  const addProduct = async (formData) => {
    checkTokenGuard();
    setIsSaving(true);
    try {
      const payload = {
        code: formData.code,
        productcategory_id: formData.productcategory_id,
        units_id: formData.units_id || null,
        name: formData.name,
        price: Number(formData.price) || 0, // Nhận số nguyên sạch từ form
        thumbnail: formData.thumbnail || "",
        description: formData.desc || "",
        sortorder: 1,
        isactive: Number(formData.status) === 1 ? 1 : 0,
        attributes: {
          material: formData.material || "",
          size: formData.size || ""
        }
      };

      const response = await productService.addProduct(payload);
      const beData = handleBusinessError(response);

      if (beData?.data?.accessToken) {
        localStorage.setItem('accessToken', beData.data.accessToken);
      }

      await fetchProducts();
    } catch (err) {
      console.error("Lỗi khi thêm sản phẩm:", err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  // 3. CẬP NHẬT SẢN PHẨM - ĐỒNG BỘ ISACTIVE DẠNG STRING
  const updateProduct = async (id, formData) => {
    checkTokenGuard();
    if (!id) throw new Error("Lỗi hệ thống: Không tìm thấy ID sản phẩm để cập nhật!");
    setIsSaving(true);

    try {
      // formData.status từ FormEditProduct đang là số 1 hoặc 0
      const statusString = String(formData.status); // Biến thành "1" hoặc "0"

      const payload = { 
        id: id, 
        productcategory_id: formData.productcategory_id,
        units_id: formData.units_id || null,
        name: formData.name,
        price: Number(formData.price) || 0, 
        thumbnail: formData.thumbnail || "",
        description: formData.desc || "",
        sortorder: 1,
        isactive: statusString, // Gửi chuỗi "1" hoặc "0"
        status: statusString,   // Dự phòng trường phòng hờ Backend đọc field status
        attributes: {
          material: formData.material || "",
          size: formData.size || ""
        }
      };

      console.log("🚀 [API Request] Gộp payload sửa chuẩn STRING gửi lên editProduct:", payload);
      
      const responseDetails = await productService.editProduct(payload);
      const beData = handleBusinessError(responseDetails);

      if (beData?.data?.accessToken) {
          localStorage.setItem('accessToken', beData.data.accessToken);
      }

      await fetchProducts();
      console.log("✅ Cập nhật sản phẩm dạng String thành công!");
    } catch (err) {
      console.error("Lỗi khi cập nhật sản phẩm:", err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  // 4. XÓA SẢN PHẨM
  const deleteProduct = async (id) => {
    checkTokenGuard();
    setIsSaving(true);
    try {
      await handleBusinessError(await productService.deleteProduct(id));
      await fetchProducts();
    } catch (err) {
      console.error("Lỗi khi xóa sản phẩm:", err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    products, 
    units, 
    loading, 
    isSaving, 
    error, 
    searchTerm, 
    setSearchTerm, 
    filterCategory, 
    setFilterCategory, 
    filterStatus, 
    setFilterStatus,
    currentPage, 
    setCurrentPage, 
    totalPages, 
    getProductDetail, 
    generateProductCode, 
    addProduct, 
    updateProduct, 
    deleteProduct
  };
};

export default useProducts;