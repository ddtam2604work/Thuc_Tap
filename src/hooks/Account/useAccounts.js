import { useState, useCallback, useMemo, useEffect } from 'react';
import { userService } from '../../services/accountService';

export const useAccounts = () => {
    const [roles, setRoles] = useState([]); // State lưu danh sách roles
    const [rolesLoading, setRolesLoading] = useState(false);

    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all'); 

    const checkTokenGuard = () => {
        if (!localStorage.getItem('accessToken')) {
            throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng tải lại trang.');
        }
    };

    const fetchAccounts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            checkTokenGuard();
            const response = await userService.getUsers({}); 
            if (response && (response.errorCode === 1 || response.errorCode === "1" || response.statusCode === 200)) {
                
                const rawList = response.data?.list || response.list || (Array.isArray(response.data) ? response.data : []);
                const accountsList = Array.isArray(rawList) ? rawList : [];
                
                // 👉 FIX BẪY PHÂN TRANG: Đảo ngược mảng để tài khoản mới nhất luôn trồi lên trên cùng!
                setAccounts([...accountsList].reverse()); 
                
            } else {
                throw new Error(response?.message || 'Không thể lấy danh sách tài khoản.');
            }
        } catch (err) {
            setError(err.message);
            setAccounts([]); 
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const fetchRoles = async () => {
            setRolesLoading(true);
            try {
                // Gọi API với method POST và body rỗng {} như trong Postman
                const response = await userService.getRoles({});
                
                // Bắt đúng cấu trúc: errorCode === 1 và lấy mảng từ 'data'
                if (response && (response.errorCode === 1 || response.errorCode === "1")) {
                    const roleList = response.data || [];
                    setRoles(Array.isArray(roleList) ? roleList : []);
                } else {
                    throw new Error(response?.message || 'Không thể lấy danh sách vai trò.');
                }
            } catch (error) {
                console.error("Lỗi khi tải vai trò:", error);
                setRoles([]); // Fallback về mảng rỗng để không bị lỗi UI
            } finally {
                setRolesLoading(false);
            }
        };

        fetchRoles();
    }, []);

    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterRole, filterStatus]);

    // LOGIC LỌC TÌM KIẾM ĐÃ ĐƯỢC BỌC LÓT CHỐNG CRASH KHI DỮ LIỆU NULL
    const filteredAccounts = useMemo(() => {
        return accounts
            .filter(acc => {
                // LOGIC LỌC TRẠNG THÁI (Khóa/Mở khóa)
                const isActiveUser = String(acc.isactive) === "1" || acc.isactive === true || acc.isActive === true;
                if (filterStatus === 'active') return isActiveUser;
                if (filterStatus === 'inactive') return !isActiveUser;
                return true;
            })
            .filter(acc => {
                // LOGIC LỌC THEO VAI TRÒ (Dựa trên role.code từ API)
                if (filterRole !== 'all') {
                    // 1. Nếu acc.roles là mảng (vd: [{ code: 'MANAGER', name: '...' }])
                    if (Array.isArray(acc.roles)) {
                        return acc.roles.some(role => 
                            role.code === filterRole || role.id === filterRole || String(role) === filterRole
                        );
                    }
                    
                    // 2. Nếu acc.role là object hoặc chuỗi (vd: 'MANAGER')
                    if (acc.role) {
                        const roleVal = acc.role.code || acc.role;
                        return String(roleVal) === filterRole;
                    }

                    return false; // Nếu không có thông tin role, loại khỏi kết quả lọc
                }
                return true;
            })
            .filter(acc => {
                // LOGIC TÌM KIẾM TEXT
                const term = searchTerm.toLowerCase().trim();
                if (!term) return true;
                
                const safeFullname = (acc.fullname || '').toLowerCase();
                const safeUsername = (acc.username || '').toLowerCase();
                const safeEmail = (acc.email || '').toLowerCase();
                const safePhone = (acc.phone || '').toLowerCase();

                return (
                    safeFullname.includes(term) ||
                    safeUsername.includes(term) ||
                    safeEmail.includes(term) ||
                    safePhone.includes(term)
                );
            });
    }, [accounts, searchTerm, filterRole, filterStatus]);

    const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
    const safeCurrentPage = currentPage > totalPages && totalPages > 0 ? totalPages : currentPage;
    const paginatedAccounts = filteredAccounts.slice((safeCurrentPage - 1) * itemsPerPage, safeCurrentPage * itemsPerPage);

    // Sửa lỗi bóc tách dữ liệu: Chống chui nhầm vào trường "data" bên trong
    const handleBusinessError = (rawResponse) => {
        if (!rawResponse) {
            throw new Error('Không nhận được phản hồi từ máy chủ.');
        }

        // LỚP PHÒNG THỦ MỚI: Ưu tiên kiểm tra errorCode ở cấp ngoài cùng
        // Nếu đã có errorCode thì đây chính là root object.
        const beData = rawResponse.errorCode !== undefined 
            ? rawResponse 
            : (rawResponse.data || rawResponse);

        if (beData.errorCode !== 1 && String(beData.errorCode) !== "1" && beData.statusCode !== 200) {
            let errMsg = beData?.message || beData?.msg || beData?.error;
            if (!errMsg && typeof beData === 'string') errMsg = beData;
            
            throw new Error(errMsg || 'Dữ liệu không hợp lệ hoặc hệ thống từ chối thao tác.');
        }
        
        return beData; // Trả về nguyên gốc để các hàm CRUD có thể lấy Token bên trong
    };

    // =========================================================================
    // CÁC HÀM CRUD BÊN DƯỚI ĐẢM BẢO CHỈ KHAI BÁO 1 LẦN DUY NHẤT TRONG FILE NÀY
    // =========================================================================

    const toggleAccountStatus = async (id, currentStatus) => {
        checkTokenGuard();
        const newStatus = (String(currentStatus) === "1" || currentStatus === true) ? 0 : 1;
        await handleBusinessError(await userService.setActive(id, newStatus));
        await fetchAccounts(); 
    };

    const addAccount = async (formData) => {
        // 1. Chuẩn hóa Tên đăng nhập
        const rawUsername = formData.username || "";
        const processedUsername = rawUsername.trim().replace(/\s+/g, '_');

        // 2. GỬI ĐẦY ĐỦ THÔNG TIN (Bao gồm cả password & isactive) 
        // để Backend không bị hụt data và chắc chắn trả về user_id
        const fullPayload = {
            username: processedUsername,
            fullname: formData.fullname?.trim() || "",
            phone: formData.phone?.trim() || "",
            address: formData.address?.trim() || "",
            gender: Number(formData.gender ?? 1),
            role: String(formData.role),
            password: formData.password,               // Đã thêm lại vào Payload gốc
            isactive: String(formData.isactive ?? "1") // Đã thêm lại vào Payload gốc
        };

        try {
            // ==========================================
            // BƯỚC 1: GỌI API THÊM MỚI
            // ==========================================
            const responseAdd = await userService.addUser(fullPayload);
            const beData = handleBusinessError(responseAdd);

            // Bắt Token gói đầu
            if (beData?.data?.accessToken) {
                localStorage.setItem('accessToken', beData.data.accessToken);
            }

            // Trích xuất ID linh hoạt (Chống mọi trường hợp Backend đổi key)
            const innerData = beData?.data || beData;
            const newUserId = innerData?.user_id || innerData?.id;

            // Nếu Backend vẫn "ngoan cố" không trả về ID, log ra F12 để kiểm tra và chặn luồng
            if (!newUserId) {
                console.error("🚨 Backend không trả về ID. Chi tiết Response:", beData);
                throw new Error("Hệ thống lưu thành công nhưng Backend không trả về user_id để hiển thị!");
            }

            // ==========================================
            // BƯỚC 2 & 3: ĐỒNG BỘ MẬT KHẨU VÀ TRẠNG THÁI
            // (Chỉ gọi khi đã có chắc chắn newUserId)
            // ==========================================
            if (formData.password) {
                await userService.setPassword(newUserId, formData.password)
                    .catch(e => console.warn("Lưu ý: API set-password lỗi ngầm", e));
            }
            await userService.setActive(newUserId, String(fullPayload.isactive))
                .catch(e => console.warn("Lưu ý: API set-active lỗi ngầm", e));

            // ==========================================
            // BƯỚC 4: RENDER TỨC THÌ LÊN BẢNG (Optimistic Update)
            // ==========================================
            const newUserToRender = {
                ...fullPayload,
                ...innerData,
                id: newUserId, // Map đúng ID cho Table nhận diện
                roles: [{ code: fullPayload.role, name: fullPayload.role }] 
            };

            setAccounts(prevAccounts => [newUserToRender, ...prevAccounts]);

            // Dọn dẹp giao diện
            setSearchTerm('');
            setFilterRole('all');
            setFilterStatus('all');
            setCurrentPage(1);

            // Fetch lại danh sách ngầm sau nửa giây
            setTimeout(() => fetchAccounts(), 500);

            return beData;

        } catch (error) {
            console.error("❌ Quá trình thêm tài khoản thất bại:", error);
            throw error; 
        }
    };

    // ĐÂY LÀ HÀM EDIT ACCOUNT ĐÃ ĐƯỢC CẬP NHẬT ĐỒNG BỘ PHÂN QUYỀN VÀ TRẠNG THÁI KHÓA
    const editAccount = async (formData) => {
        checkTokenGuard();
        
        // Bọc lót an toàn: Tự trích xuất ID từ formData và ép về dạng chuỗi
        const targetId = String(formData.id || formData.user_id || "");
        if (!targetId || targetId === "undefined") {
            throw new Error("Không tìm thấy ID của tài khoản để cập nhật!");
        }

        // 👉 XỬ LÝ ĐỒNG BỘ QUYỀN: Giải mã code nhóm quyền từ mảng 'roles' hoặc trường 'role' của bạn
        let roleCode = "";
        if (Array.isArray(formData?.roles) && formData.roles.length > 0) {
            roleCode = formData.roles[0].code || formData.roles[0].id || "";
        } else if (formData?.role) {
            roleCode = typeof formData.role === 'string' ? formData.role : (formData.role.code || "");
        }

        const payload = { 
            id: targetId,
            fullname: formData.fullname?.trim() || "",
            email: formData.email?.trim() || "",
            phone: formData.phone?.trim() || "",
            address: formData.address?.trim() || "",
            gender: formData.gender !== undefined ? Number(formData.gender) : 1,
            avatar: formData.avatar || "",
            role: String(roleCode) // Đã đính kèm trường role hợp lệ vào payload của editUser
        };

        const response = await userService.editUser(payload);
        const beData = handleBusinessError(response);

        // KỸ THUẬT GÓI ĐẦU CHỦ ĐỘNG: Bắt ngay Token mới từ API EditUser và lưu vào bộ nhớ
        if (beData?.data?.accessToken) {
            localStorage.setItem('accessToken', beData.data.accessToken);
        }

        // 👉 XỬ LÝ ĐỒNG BỘ TRẠNG THÁI: Tự động gọi API trạng thái /user/set-active nếu người dùng đổi Radio
        if (formData.isactive !== undefined) {
            const statusValue = (formData.isactive === 1 || String(formData.isactive) === "1" || formData.isActive === true) ? 1 : 0;
            await handleBusinessError(await userService.setActive(targetId, statusValue));
        }

        await fetchAccounts(); 
    };

    const deleteAccount = async (id) => {
        checkTokenGuard();
        await handleBusinessError(await userService.deleteUser(id));
        await fetchAccounts(); 
    };

    const setPassword = async (id, password) => {
        checkTokenGuard();
        return await handleBusinessError(await userService.setPassword(id, password.trim()));
    };

    return {
        accounts: paginatedAccounts, loading, error, roles,
        rolesLoading,
        searchTerm, filterRole, filterStatus,
        setSearchTerm, setFilterRole, setFilterStatus,
        currentPage, setCurrentPage, totalPages, totalAccounts: filteredAccounts.length, 
        fetchAccounts, toggleAccountStatus, addAccount, editAccount, setPassword, deleteAccount,
    };
};