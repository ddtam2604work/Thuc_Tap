import { useMemo } from 'react';

// 1. ĐỊNH NGHĨA CONSTANTS CHO ROLES (Tránh hardcode string)
export const ROLES = {
  ADMIN: 'ADMIN',         // Admin (Owner)
  MANAGER: 'QUAN_LY',     // Quản lý
  SALE: 'SALE',           // Nhân viên Sale
  PRODUCTION: 'SAN_XUAT', // NV Sản xuất
  CUSTOMER: 'CUSTOMER'    // Khách Portal
};

// 2. ĐỊNH NGHĨA CÁC MỨC ĐỘ TRUY CẬP (Access Levels)
export const ACCESS = {
  ALL: 'ALL',                         // Toàn quyền
  VIEW: 'VIEW',                       // Chỉ xem
  OWN: 'OWN',                         // Chỉ xem/thao tác trên dữ liệu của mình
  NONE: 'NONE',                       // Không có quyền (X)
  NO_PRICE: 'NO_PRICE',               // Đơn hàng không giá (NV Sản xuất)
  VIEW_ON_CREATE: 'VIEW_ON_CREATE',   // Được xem danh sách sản phẩm khi tạo đơn
  REQUIRES_CANCEL: 'REQUIRES_CANCEL'  // Phải hủy đơn mới được đổi file
};

// 3. MA TRẬN PHÂN QUYỀN (PERMISSION MATRIX)
// Được thiết kế theo dạng Module -> Action -> Role mang lại O(1) lookup performance
const PERMISSION_MATRIX = {
  // I. Quản lý tài khoản & Phân quyền
  ACCOUNT: {
    LOGIN_LOGOUT: {
      [ROLES.ADMIN]: ACCESS.ALL, [ROLES.MANAGER]: ACCESS.ALL, [ROLES.SALE]: ACCESS.ALL, [ROLES.PRODUCTION]: ACCESS.ALL, [ROLES.CUSTOMER]: ACCESS.ALL
    },
    MANAGE_STAFF: {
      [ROLES.ADMIN]: ACCESS.ALL, [ROLES.MANAGER]: ACCESS.VIEW, [ROLES.SALE]: ACCESS.NONE, [ROLES.PRODUCTION]: ACCESS.NONE, [ROLES.CUSTOMER]: ACCESS.NONE
    },
    MANAGE_ROLE: {
      [ROLES.ADMIN]: ACCESS.ALL, [ROLES.MANAGER]: ACCESS.NONE, [ROLES.SALE]: ACCESS.NONE, [ROLES.PRODUCTION]: ACCESS.NONE, [ROLES.CUSTOMER]: ACCESS.NONE
    },
    CHANGE_PASSWORD: {
      [ROLES.ADMIN]: ACCESS.ALL, [ROLES.MANAGER]: ACCESS.ALL, [ROLES.SALE]: ACCESS.ALL, [ROLES.PRODUCTION]: ACCESS.ALL, [ROLES.CUSTOMER]: ACCESS.ALL
    }
  },

  // II. Danh mục & Sản phẩm
  PRODUCT: {
    MANAGE_CATEGORY: {
      [ROLES.ADMIN]: ACCESS.ALL, [ROLES.MANAGER]: ACCESS.ALL, [ROLES.SALE]: ACCESS.NONE, [ROLES.PRODUCTION]: ACCESS.NONE, [ROLES.CUSTOMER]: ACCESS.VIEW_ON_CREATE
    },
    MANAGE_PRICE_GROUP: {
      [ROLES.ADMIN]: ACCESS.ALL, [ROLES.MANAGER]: ACCESS.VIEW, [ROLES.SALE]: ACCESS.NONE, [ROLES.PRODUCTION]: ACCESS.NONE, [ROLES.CUSTOMER]: ACCESS.NONE
    },
    VIEW_PRODUCT: {
      [ROLES.ADMIN]: ACCESS.ALL, [ROLES.MANAGER]: ACCESS.ALL, [ROLES.SALE]: ACCESS.ALL, [ROLES.PRODUCTION]: ACCESS.ALL, [ROLES.CUSTOMER]: ACCESS.OWN
    }
  },

  // III. Quản lý khách hàng
  CUSTOMER_MGMT: {
    CREATE: {
      [ROLES.ADMIN]: ACCESS.ALL, [ROLES.MANAGER]: ACCESS.ALL, [ROLES.SALE]: ACCESS.ALL, [ROLES.PRODUCTION]: ACCESS.NONE, [ROLES.CUSTOMER]: ACCESS.NONE
    },
    EDIT: {
      [ROLES.ADMIN]: ACCESS.ALL, [ROLES.MANAGER]: ACCESS.ALL, [ROLES.SALE]: ACCESS.ALL, [ROLES.PRODUCTION]: ACCESS.NONE, [ROLES.CUSTOMER]: ACCESS.NONE
    },
    VIEW_LIST: {
      [ROLES.ADMIN]: ACCESS.ALL, [ROLES.MANAGER]: ACCESS.ALL, [ROLES.SALE]: ACCESS.ALL, [ROLES.PRODUCTION]: ACCESS.NONE, [ROLES.CUSTOMER]: ACCESS.NONE
    },
    ORDER_HISTORY: {
      [ROLES.ADMIN]: ACCESS.ALL, [ROLES.MANAGER]: ACCESS.ALL, [ROLES.SALE]: ACCESS.ALL, [ROLES.PRODUCTION]: ACCESS.NONE, [ROLES.CUSTOMER]: ACCESS.OWN
    }
  },

  // IV. Quản lý đơn hàng
  ORDER: {
    VIEW_LIST: {
      [ROLES.ADMIN]: ACCESS.ALL, [ROLES.MANAGER]: ACCESS.ALL, [ROLES.SALE]: ACCESS.ALL, [ROLES.PRODUCTION]: ACCESS.NO_PRICE, [ROLES.CUSTOMER]: ACCESS.OWN
    },
    CREATE: {
      [ROLES.ADMIN]: ACCESS.ALL, [ROLES.MANAGER]: ACCESS.ALL, [ROLES.SALE]: ACCESS.ALL, [ROLES.PRODUCTION]: ACCESS.NONE, [ROLES.CUSTOMER]: ACCESS.ALL
    },
    RECEIVE: {
      [ROLES.ADMIN]: ACCESS.ALL, [ROLES.MANAGER]: ACCESS.ALL, [ROLES.SALE]: ACCESS.ALL, [ROLES.PRODUCTION]: ACCESS.NONE, [ROLES.CUSTOMER]: ACCESS.NONE
    },
    CONFIRM: {
      [ROLES.ADMIN]: ACCESS.ALL, [ROLES.MANAGER]: ACCESS.ALL, [ROLES.SALE]: ACCESS.ALL, [ROLES.PRODUCTION]: ACCESS.NONE, [ROLES.CUSTOMER]: ACCESS.NONE
    },
    APPROVE_DEBT: {
      [ROLES.ADMIN]: ACCESS.ALL, [ROLES.MANAGER]: ACCESS.ALL, [ROLES.SALE]: ACCESS.NONE, [ROLES.PRODUCTION]: ACCESS.NONE, [ROLES.CUSTOMER]: ACCESS.NONE
    },
    UPDATE_STATUS: {
      [ROLES.ADMIN]: ACCESS.ALL, [ROLES.MANAGER]: ACCESS.ALL, [ROLES.SALE]: ACCESS.ALL, [ROLES.PRODUCTION]: ACCESS.ALL, [ROLES.CUSTOMER]: ACCESS.NONE
    },
    EDIT_BEFORE_CONFIRM: {
      [ROLES.ADMIN]: ACCESS.ALL, [ROLES.MANAGER]: ACCESS.ALL, [ROLES.SALE]: ACCESS.ALL, [ROLES.PRODUCTION]: ACCESS.NONE, [ROLES.CUSTOMER]: ACCESS.ALL
    },
    EDIT_AFTER_CONFIRM_BEFORE_APPROVE: {
      [ROLES.ADMIN]: ACCESS.ALL, [ROLES.MANAGER]: ACCESS.ALL, [ROLES.SALE]: ACCESS.ALL, [ROLES.PRODUCTION]: ACCESS.NONE, [ROLES.CUSTOMER]: ACCESS.NONE
    },
    EDIT_AFTER_APPROVE: {
      [ROLES.ADMIN]: ACCESS.ALL, [ROLES.MANAGER]: ACCESS.ALL, [ROLES.SALE]: ACCESS.NONE, [ROLES.PRODUCTION]: ACCESS.NONE, [ROLES.CUSTOMER]: ACCESS.NONE
    },
    CANCEL: {
      [ROLES.ADMIN]: ACCESS.ALL, [ROLES.MANAGER]: ACCESS.ALL, [ROLES.SALE]: ACCESS.NONE, [ROLES.PRODUCTION]: ACCESS.NONE, [ROLES.CUSTOMER]: ACCESS.NONE
    }
  },

  // V. Portal Khách hàng
  PORTAL: {
    CREATE_ONLINE: {
      [ROLES.ADMIN]: ACCESS.NONE, [ROLES.MANAGER]: ACCESS.NONE, [ROLES.SALE]: ACCESS.NONE, [ROLES.PRODUCTION]: ACCESS.NONE, [ROLES.CUSTOMER]: ACCESS.ALL
    },
    EDIT_OWN_BEFORE_CONFIRM: {
      [ROLES.ADMIN]: ACCESS.NONE, [ROLES.MANAGER]: ACCESS.NONE, [ROLES.SALE]: ACCESS.NONE, [ROLES.PRODUCTION]: ACCESS.NONE, [ROLES.CUSTOMER]: ACCESS.ALL
    },
    VIEW_OWN_DEBT: {
      [ROLES.ADMIN]: ACCESS.NONE, [ROLES.MANAGER]: ACCESS.NONE, [ROLES.SALE]: ACCESS.NONE, [ROLES.PRODUCTION]: ACCESS.NONE, [ROLES.CUSTOMER]: ACCESS.ALL
    }
  },

  // VI. Quản lý Công nợ
  DEBT: {
    VIEW_CUSTOMER_DEBT: {
      [ROLES.ADMIN]: ACCESS.ALL, [ROLES.MANAGER]: ACCESS.ALL, [ROLES.SALE]: ACCESS.ALL, [ROLES.PRODUCTION]: ACCESS.NONE, [ROLES.CUSTOMER]: ACCESS.OWN
    },
    RECORD_PAYMENT: {
      [ROLES.ADMIN]: ACCESS.ALL, [ROLES.MANAGER]: ACCESS.ALL, [ROLES.SALE]: ACCESS.ALL, [ROLES.PRODUCTION]: ACCESS.NONE, [ROLES.CUSTOMER]: ACCESS.NONE
    },
    EDIT_RECEIPT_DAILY: {
      [ROLES.ADMIN]: ACCESS.ALL, [ROLES.MANAGER]: ACCESS.ALL, [ROLES.SALE]: ACCESS.ALL, [ROLES.PRODUCTION]: ACCESS.NONE, [ROLES.CUSTOMER]: ACCESS.NONE
    }
  },

  // VII. Quản lý File & Upload
  FILE: {
    IMPORT_DRIVE_LINK: {
      [ROLES.ADMIN]: ACCESS.ALL, [ROLES.MANAGER]: ACCESS.ALL, [ROLES.SALE]: ACCESS.ALL, [ROLES.PRODUCTION]: ACCESS.NONE, [ROLES.CUSTOMER]: ACCESS.ALL
    },
    VIEW_IMAGE_LINK: {
      [ROLES.ADMIN]: ACCESS.ALL, [ROLES.MANAGER]: ACCESS.ALL, [ROLES.SALE]: ACCESS.ALL, [ROLES.PRODUCTION]: ACCESS.NONE, [ROLES.CUSTOMER]: ACCESS.VIEW
    },
    CHANGE_FILE_AFTER_APPROVE: {
      [ROLES.ADMIN]: ACCESS.REQUIRES_CANCEL, [ROLES.MANAGER]: ACCESS.REQUIRES_CANCEL, [ROLES.SALE]: ACCESS.NONE, [ROLES.PRODUCTION]: ACCESS.NONE, [ROLES.CUSTOMER]: ACCESS.NONE
    }
  },

  // VIII. Báo cáo & Logs
  REPORT: {
    DASHBOARD: {
      [ROLES.ADMIN]: ACCESS.ALL, [ROLES.MANAGER]: ACCESS.NONE, [ROLES.SALE]: ACCESS.NONE, [ROLES.PRODUCTION]: ACCESS.NONE, [ROLES.CUSTOMER]: ACCESS.NONE
    },
    VIEW_LOGS: {
      [ROLES.ADMIN]: ACCESS.ALL, [ROLES.MANAGER]: ACCESS.VIEW, [ROLES.SALE]: ACCESS.NONE, [ROLES.PRODUCTION]: ACCESS.NONE, [ROLES.CUSTOMER]: ACCESS.NONE
    }
  }
};

// 4. CUSTOM HOOK ĐỂ SỬ DỤNG TRONG COMPONENT UI
// 4. CUSTOM HOOK ĐỂ SỬ DỤNG TRONG COMPONENT UI (ĐÃ NÂNG CẤP HỖ TRỢ ĐA QUYỀN)
export function useRole(userRoles) {
  // 1. Chuẩn hóa linh hoạt: Dù truyền vào chuỗi đơn hay mảng thì đều biến thành mảng IN HOA
  const normalizedRoles = useMemo(() => {
    if (!userRoles) return [];
    if (Array.isArray(userRoles)) {
      return userRoles.map(r => String(r).toUpperCase());
    }
    return [String(userRoles).toUpperCase()];
  }, [userRoles]);

  return useMemo(() => {
    /**
     * Lấy ra mức độ truy cập cao nhất nếu user có nhiều quyền
     */
    const getAccessLevel = (moduleName, actionName) => {
      // Nếu Module hoặc Action không tồn tại trong hệ thống, khóa quyền ngay
      if (!PERMISSION_MATRIX[moduleName] || !PERMISSION_MATRIX[moduleName][actionName]) {
        return ACCESS.NONE;
      }

      let bestAccess = ACCESS.NONE;
      const actionRoles = PERMISSION_MATRIX[moduleName][actionName];

      // Quét qua tất cả các vai trò của người dùng hiện tại
      for (const role of normalizedRoles) {
        const roleAccess = actionRoles[role];
        
        // Cấp bậc 1: Toàn quyền - Trả về ngay không cần quét tiếp
        if (roleAccess === ACCESS.ALL) return ACCESS.ALL; 
        
        // Cấp bậc 2: Các quyền đặc biệt (VIEW, OWN, NO_PRICE, REQUIRES_CANCEL...)
        if (roleAccess && roleAccess !== ACCESS.NONE) {
          bestAccess = roleAccess; // Ghi nhận quyền hợp lệ cao nhất (Khác X)
        }
      }
      return bestAccess;
    };

    /**
     * Trả về Boolean: True nếu có bất kỳ quyền nào can thiệp được vào Action
     */
    const can = (moduleName, actionName) => {
      return getAccessLevel(moduleName, actionName) !== ACCESS.NONE;
    };

    /**
     * Check xem có phải là quyền giới hạn dữ liệu cá nhân hay không
     */
    const isOwnOnly = (moduleName, actionName) => {
      return getAccessLevel(moduleName, actionName) === ACCESS.OWN;
    };

    return {
      getAccessLevel,
      can,
      isOwnOnly,
      // Helper kiểm tra mảng hiện tại có chứa vai trò tương ứng không
      isAdmin: normalizedRoles.includes(ROLES.ADMIN),
      isManager: normalizedRoles.includes(ROLES.MANAGER),
      isSale: normalizedRoles.includes(ROLES.SALE),
      isProduction: normalizedRoles.includes(ROLES.PRODUCTION),
      isCustomer: normalizedRoles.includes(ROLES.CUSTOMER),
    };
  }, [normalizedRoles]);
}