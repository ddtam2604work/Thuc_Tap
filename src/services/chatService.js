const BASE_URL = import.meta.env.VITE_BE_URL || 'https://113.161.204.185:4000';

const getHeaders = () => {
  const token = localStorage.getItem('accessToken') || '';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token.replace(/^Bearer\s+/i, '').trim()}`,
  };
};

export const chatService = {
  getConversations: async (companyId, page = 1, pageSize = 100) => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/chat/conversations/get-paging`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ company_id: companyId, page, pagesize: pageSize }),
      });
      if (!res.ok) throw new Error(`API Error status ${res.status}`);
      return await res.json();
    } catch (error) {
      console.error('[chatService] getConversations error:', error);
      throw error;
    }
  },

  getConversationMessages: async (conversationId, page = 1, pageSize = 20) => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/chat/conversations/messages/get-paging`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ id: conversationId, page, pagesize: pageSize }),
      });
      if (!res.ok) throw new Error(`API Error status ${res.status}`);
      return await res.json();
    } catch (error) {
      console.error('[chatService] getConversationMessages error:', error);
      throw error;
    }
  },

  /**
   * NEW LOGIC: Lấy hoặc tự tạo cuộc hội thoại mới cho Khách hàng
   */
  getOrCreateConversation: async (companyId) => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/chat/conversations/get-or-create`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ company_id: companyId }),
      });
      if (!res.ok) throw new Error(`API Error status ${res.status}`);
      return await res.json();
    } catch (error) {
      console.error('[chatService] getOrCreateConversation error:', error);
      throw error;
    }
  }
};