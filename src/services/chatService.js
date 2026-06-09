const BASE_URL = import.meta.env.VITE_BE_URL || 'https://113.161.204.185:4000';
const MEDIA_URL = import.meta.env.VITE_MEDIA_URL || 'https://113.161.204.185:4010';

const getHeaders = (isMultipart = false) => {
  const token = localStorage.getItem('accessToken') || '';
  const headers = {
    'Authorization': `Bearer ${token.replace(/^Bearer\s+/i, '').trim()}`,
  };
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

export const chatService = {
  getMediaUrl: (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('blob:')) {
      return path;
    }
    const cleanMediaUrl = MEDIA_URL.replace(/\/$/, '');
    const cleanPath = path.replace(/^\//, '');
    return `${cleanMediaUrl}/${cleanPath}`;
  },

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
  },

  uploadImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${MEDIA_URL}/api/v1/media/upload-image`, {
        method: 'POST',
        headers: getHeaders(true),
        body: formData,
      });
      if (!res.ok) throw new Error(`Media Error status ${res.status}`);
      return await res.json();
    } catch (error) {
      console.error('[chatService] uploadImage error:', error);
      throw error;
    }
  },

  uploadAudioBase64: async (base64Data) => {
    try {
      const res = await fetch(`${MEDIA_URL}/api/v1/media/upload-audio`, {
        method: 'POST',
        headers: getHeaders(false),
        body: JSON.stringify({ audio: base64Data }),
      });
      if (!res.ok) throw new Error(`Media Error status ${res.status}`);
      return await res.json();
    } catch (error) {
      console.error('[chatService] uploadAudioBase64 error:', error);
      throw error;
    }
  },

  recallMessageApi: async (messageId) => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/chat/conversations/messages/recall`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ message_id: messageId }),
      });
      return res.ok;
    } catch (error) {
      console.error('[chatService] recallMessageApi error:', error);
      return false;
    }
  }
};