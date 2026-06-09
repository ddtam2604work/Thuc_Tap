import Table from '../../../skeleton/Table';
import { PRODUCT_TABLE_HEADERS } from '../../../../constants/product';
import Button from '../../../skeleton/Button';

const ProductManagementTable = ({ data = [], categories = [], onEdit, onDelete, isLoading = false }) => {
  
  // HÀM BỌC LÓT GIAO DIỆN: Xử lý màu sắc và chữ cho Trạng thái
  const getStatusLabel = (row) => {
    // Ưu tiên check biến isactive, nếu không có thì fallback sang check status
    const isActive = (String(row.isactive) === '1' || row.isactive === true) || 
                     (String(row.status) === '1' || row.status === 'ACTIVE');

    if (isActive) {
      return { class: 'bg-[#DCFCE7] text-[#15803D]', text: 'HOẠT ĐỘNG' };
    } else {
      return { class: 'bg-[#FEE2E2] text-[#B91C1C]', text: 'NGỪNG KINH DOANH' };
    }
  };

  // HÀM DỊCH UUID THÀNH TÊN DANH MỤC
  const getCategoryName = (row) => {
    // 1. Nếu API có trả kèm tên
    if (typeof row.category_name === 'string') return row.category_name;
    if (typeof row.category === 'string') return row.category;
    if (row.productCategoryName) return row.productCategoryName;

    // 2. Lấy UUID của sản phẩm
    const catIdFromProduct = 
      row.productcategory_id || 
      row.category_id || 
      row.productCategoryId || 
      row.categoryId;

    if (!catIdFromProduct) return "Thiếu ID (Check lại API)";

    // 3. DÒ TÌM ÉP KIỂU (KHÔNG PHÂN BIỆT HOA/THƯỜNG)
    if (categories && categories.length > 0) {
      const found = categories.find(c => {
        // Cắt khoảng trắng dư thừa và đưa hết về chữ thường để so sánh
        const catIdFromList = String(c.id || c.productcategory_id || c.categoryId).trim().toLowerCase();
        const catIdFromProd = String(catIdFromProduct).trim().toLowerCase();
        
        return catIdFromList === catIdFromProd;
      });
      return found ? found.name : "Không khớp mã";
    }
    
    return "Đang tải...";
  };

  return (
    <Table headers={PRODUCT_TABLE_HEADERS}>
      {/* {console.log("=== TRẠM KIỂM TRA DỮ LIỆU ===")}
      {console.log("📦 1 Object Sản phẩm (từ API về):", data[0])}
      {console.log("📂 1 Object Danh mục (từ API về):", categories[0])} */}
      {data.map((row, index) => {
        // Lấy thông tin màu sắc và text an toàn
        const statusObj = getStatusLabel(row);
        
        // Bọc lót Key an toàn đề phòng API đổi tên trường id
        const rowKey = row.id || row.product_id || `fallback-${index}`;

        return (
          <tr key={rowKey} className="hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors">
            {/* Cột 1: Mã sản phẩm */}
            <td className="p-4 text-center text-[#191C1D]">{row.code || row.id}</td>
            
            {/* Cột 2: Tên sản phẩm */}
            <td className="p-4 text-center font-medium text-[#191C1D]">{row.name}</td>
            
            {/* Cột 3: Tên Danh mục (Đã qua hàm xử lý UUID) */}
            <td className="p-4 text-center text-[#585F67]">{getCategoryName(row)}</td>
            
            {/* Cột 4: Giá bán - ĐÃ CĂN PHẢI VÀ ĐỊNH DẠNG ĐẸP */}
            <td className="p-4 text-right text-[#191C1D] font-semibold">
              {(Number(row.price) || 0).toLocaleString('vi-VN')} đ
            </td>
            
            {/* Cột 5: Mô tả */}
            <td className="p-4 text-center text-[#747686]">{row.desc || row.description}</td>
            
            {/* Cột 6: Trạng thái */}
            <td className="p-4 text-center">
              <span className={`inline-flex px-2 py-0.5 rounded-[2px] text-[12px] font-semibold uppercase tracking-wider ${statusObj.class}`}>
                {statusObj.text}
              </span>
            </td>
            
            {/* Cột 7: Thao tác (Sửa/Xoá) */}
            <td className="p-4 text-center">
              <div className="flex items-center justify-center gap-3 text-xs font-semibold">
                <Button variant="text" onClick={() => onEdit?.(row)} disabled={isLoading} className={isLoading ? 'opacity-50 cursor-not-allowed' : ''}>
                  {isLoading ? '⏳' : 'Sửa'}
                </Button>
                <span className="text-gray-300">|</span>
                <Button variant="text-danger" onClick={() => onDelete?.(row.id)} disabled={isLoading} className={isLoading ? 'opacity-50 cursor-not-allowed' : ''}>
                  Xoá
                </Button>
              </div>
            </td>
          </tr>
        );
      })}
    </Table>
  );
};

export default ProductManagementTable;