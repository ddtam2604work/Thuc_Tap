const BE_URL = import.meta.env.VITE_BE_URL || 'https://113.161.204.185:4000';

const createHeaders = (token) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const notificationService = {
  /**
   * Postman Request: get-personal-paging
   */
  getPersonalPaging: async (token, page = 1, pagesize = 20, search = "") => {
    try {
      const response = await fetch(`${BE_URL}/api/v1/notification/get-personal-paging`, {
        method: 'POST',
        headers: createHeaders(token),
        body: JSON.stringify({ page, pagesize, search }),
      });
      
      if (!response.ok) throw new Error(`Lỗi HTTP: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Service Error [getPersonalPaging]:', error);
      throw error;
    }
  },

  /**
   * Postman Request: get-personal-detail
   */
  getPersonalDetail: async (token, id) => {
    try {
      const response = await fetch(`${BE_URL}/api/v1/notification/get-personal-detail`, {
        method: 'POST',
        headers: createHeaders(token),
        body: JSON.stringify({ id }),
      });

      if (!response.ok) throw new Error(`Lỗi HTTP: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Service Error [getPersonalDetail]:', error);
      throw error;
    }
  }
};