import { useState, useCallback } from 'react';

const useCategories = () => {
  const [categories, setCategories] = useState([
    { id: 'DM001', name: 'Album ảnh', desc: 'Các loại album in ảnh kích thước khác nhau', count: 5, status: 'ACTIVE' },
    { id: 'DM002', name: 'Ảnh gỗ', desc: 'In ảnh trên chất liệu gỗ cao cấp', count: 3, status: 'ACTIVE' },
  ]);

  const addCategory = useCallback((newCategory) => {
    setCategories((prev) => [...prev, { ...newCategory, id: `DM00${prev.length + 1}`, count: 0 }]);
  }, []);

  const updateCategory = useCallback((id, updatedData) => {
    setCategories((prev) => prev.map(cat => cat.id === id ? { ...cat, ...updatedData } : cat));
  }, []);

  const deleteCategory = useCallback((id) => {
    setCategories((prev) => prev.filter(cat => cat.id !== id));
  }, []);

  return { categories, addCategory, updateCategory, deleteCategory };
};

export default useCategories;