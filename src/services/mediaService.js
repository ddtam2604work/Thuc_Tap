//Xử lý file ảnh
import { apiMedia } from '../config/axiosClient';

export const mediaService = {
  uploadMultiDraft: (formData) => apiMedia.post('/upload/image/multi-draft', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getViewUrl: (id) => `${apiMedia.defaults.baseURL}/get/public/${id}`,
};