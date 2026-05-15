import { useState, useCallback } from 'react';

const useProducts = () => {
  const [products, setProducts] = useState([
    { id: 'SP001', name: 'Album 20x30cm', category: 'Album ảnh', price: '280.000', status: 'ACTIVE', desc: '-' },
    { id: 'SP005', name: 'Photobook 21x29.7', category: 'Photobook', price: '280.000', status: 'STOP_BUSINESS', desc: '-' },
  ]);

  const addProduct = useCallback((newProduct) => {
    setProducts((prev) => [...prev, { ...newProduct, id: `SP00${prev.length + 1}` }]);
  }, []);

  const updateProduct = useCallback((id, updatedData) => {
    setProducts((prev) => prev.map(p => p.id === id ? { ...p, ...updatedData } : p));
  }, []);

  const deleteProduct = useCallback((id) => {
    setProducts((prev) => prev.filter(p => p.id !== id));
  }, []);

  return { products, addProduct, updateProduct, deleteProduct };
};

export default useProducts;