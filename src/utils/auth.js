export const getUserRoleFromToken = () => {
    try {
        const token = localStorage.getItem('accessToken');
        if (!token) return 'staff';
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        return payload.customer_id ? 'customer' : 'staff';
    } catch (e) {
        return 'staff';
    }
};
