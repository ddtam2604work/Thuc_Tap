import { useState, useCallback, useMemo, useEffect } from 'react';
import { userService } from '../../services/accountService';
import { useNotification } from '../../context/NotificationContext';

export const useAccounts = () => {
    const [roles, setRoles] = useState([]); 
    const [rolesLoading, setRolesLoading] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all'); 

    const { showToast } = useNotification();

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
                setAccounts(Array.isArray(rawList) ? rawList : []); 
            } else {
                throw new Error(response?.message || 'Không thể lấy danh sách tài khoản.');
            }
        } catch (err) {
            setError(err.message);
            setAccounts([]); 
            showToast("Lỗi tải danh sách tài khoản: " + err.message, "error");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        const fetchRoles = async () => {
            setRolesLoading(true);
            try {
                const response = await userService.getRoles({});
                if (response && (response.errorCode === 1 || response.errorCode === "1")) {
                    const roleList = response.data || [];
                    setRoles(Array.isArray(roleList) ? roleList : []);
                } else {
                    throw new Error(response?.message || 'Không thể lấy danh sách vai trò.');
                }
            } catch (error) {
                console.error("Lỗi khi tải vai trò:", error);
                setRoles([]); 
            } finally {
                setRolesLoading(false);
            }
        };
        fetchRoles();
    }, []);

    useEffect(() => { fetchAccounts(); }, [fetchAccounts]);
    useEffect(() => { setCurrentPage(1); }, [searchTerm, filterRole, filterStatus]);

    const filteredAccounts = useMemo(() => {
        return accounts
            .filter(acc => {
                const isActiveUser = String(acc.isactive) === "1" || acc.isactive === true || acc.isActive === true;
                if (filterStatus === 'active') return isActiveUser;
                if (filterStatus === 'inactive') return !isActiveUser;
                return true;
            })
            .filter(acc => {
                if (filterRole !== 'all') {
                    if (Array.isArray(acc.roles)) {
                        return acc.roles.some(role => role.code === filterRole || role.id === filterRole || String(role) === filterRole);
                    }
                    if (acc.role) {
                        const roleVal = acc.role.code || acc.role;
                        return String(roleVal) === filterRole;
                    }
                    return false; 
                }
                return true;
            })
            .filter(acc => {
                const term = searchTerm.toLowerCase().trim();
                if (!term) return true;
                return (
                    (acc.fullname || '').toLowerCase().includes(term) ||
                    (acc.username || '').toLowerCase().includes(term) ||
                    (acc.email || '').toLowerCase().includes(term) ||
                    (acc.phone || '').toLowerCase().includes(term)
                );
            });
    }, [accounts, searchTerm, filterRole, filterStatus]);

    const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
    const safeCurrentPage = currentPage > totalPages && totalPages > 0 ? totalPages : currentPage;
    const paginatedAccounts = filteredAccounts.slice((safeCurrentPage - 1) * itemsPerPage, safeCurrentPage * itemsPerPage);

    const handleBusinessError = (rawResponse) => {
        if (!rawResponse) throw new Error('Không nhận được phản hồi từ máy chủ.');
        const beData = rawResponse.errorCode !== undefined ? rawResponse : (rawResponse.data || rawResponse);
        if (beData.errorCode !== 1 && String(beData.errorCode) !== "1" && beData.statusCode !== 200) {
            throw new Error(beData?.message || beData?.msg || beData?.error || 'Dữ liệu không hợp lệ.');
        }
        return beData; 
    };

    const toggleAccountStatus = async (id, currentStatus) => {
        checkTokenGuard();
        const newStatus = (String(currentStatus) === "1" || currentStatus === true) ? 0 : 1;
        await handleBusinessError(await userService.setActive(id, newStatus));
        await fetchAccounts(); 
    };

    // 🎯 ĐIỀU CHỈNH CHUẨN HÓA HÀM THÊM TÀI KHOẢN (ĐANG KÝ) THEO PAYLOAD MỚI
    const addAccount = async (formData) => {
        // Tên đăng nhập được đồng bộ hóa từ chính field username đã map ở UI
        const processedUsername = (formData.username || formData.phone || "").trim();

        const fullPayload = {
            username: processedUsername,
            fullname: formData.fullname?.trim() || "",
            role: String(formData.role),
            address: formData.address || "",
            email: formData.email?.trim() || "", // 🛠️ BỔ SUNG: email đồng bộ vào payload đăng ký mẫu
            gender: Number(formData.gender ?? 1),
            isactive: Number(formData.isactive ?? 1), // 🛠️ SỬA LỖI: Ép kiểu dữ liệu Number (1) khớp payload của bạn
            phone: formData.phone?.trim() || ""
        };

        try {
            const responseAdd = await userService.addUser(fullPayload);
            const beData = handleBusinessError(responseAdd);
            const innerData = beData?.data || beData;
            const newUserId = innerData?.user_id || innerData?.id;

            if (!newUserId) {
                throw new Error("Hệ thống lưu thành công nhưng máy chủ không phản hồi mã người dùng!");
            }

            // Giữ nguyên logic chạy nền an toàn của hệ thống
            if (formData.password) {
                await userService.setPassword(newUserId, formData.password.trim())
                    .catch(e => console.warn("Lưu ý: API set-password chạy ngầm báo lỗi", e));
            }
            
            await userService.setActive(newUserId, Number(fullPayload.isactive))
                .catch(e => console.warn("Lưu ý: API set-active chạy ngầm báo lỗi", e));

            setSearchTerm('');
            setFilterRole('all');
            setFilterStatus('all');
            setCurrentPage(1);

            await fetchAccounts();
            return beData;
        } catch (error) {
            console.error("❌ Quá trình thêm tài khoản thất bại:", error);
            throw error; 
        }
    };

    const editAccount = async (formData) => {
        checkTokenGuard();
        const targetId = String(formData.id || formData.user_id || "");
        if (!targetId || targetId === "undefined") throw new Error("Không tìm thấy ID tài khoản cập nhật!");

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
            role: String(roleCode) 
        };

        await handleBusinessError(await userService.editUser(payload));

        if (formData.isactive !== undefined) {
            const statusValue = (formData.isactive === 1 || String(formData.isactive) === "1" || formData.isActive === true) ? 1 : 0;
            await handleBusinessError(await userService.setActive(targetId, statusValue));
        }

        if (formData.password && formData.password.trim() !== "") {
            await handleBusinessError(await userService.setPassword(targetId, formData.password.trim()));
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
        accounts: paginatedAccounts, loading, error, roles, rolesLoading,
        searchTerm, filterRole, filterStatus, setSearchTerm, setFilterRole, setFilterStatus,
        currentPage, setCurrentPage, totalPages, totalAccounts: filteredAccounts.length, 
        fetchAccounts, toggleAccountStatus, addAccount, editAccount, setPassword, deleteAccount,
    };
};