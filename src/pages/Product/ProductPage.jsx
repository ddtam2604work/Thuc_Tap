import ProductCatalogPage from './ProductCatalogPage';
import ProductManagementPage from './ProductManagementPage';
import NavPage from '../Nav/NavPage';
import { PRODUCT_NAV_TABS } from '../../constants/product';
import { useState } from 'react';

const ProductPage = () => {
  const [activeTab, setActiveTab] = useState('categories');

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Page Header Area */}
      <div className="flex flex-col gap-4">
                
        <NavPage 
          activeTab={activeTab} 
          onTabChange={(tabId) => setActiveTab(tabId)} 
          tabs={PRODUCT_NAV_TABS} 
        />
      </div>

      {/* Content Area */}
      <div className="transition-all duration-300">
        {activeTab === 'categories' ? (
          <ProductCatalogPage />
        ) : (
          <ProductManagementPage />
        )}
      </div>

      {/* Floating Chat Button */}
      <button className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-xl bg-[#0037B0] text-white shadow-xl hover:scale-110 transition-all z-50">
        <span className="text-2xl">💬</span>
        <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[#BA1A1A] text-[10px] font-bold">
          3
        </div>
      </button>
    </div>
  );
};

export default ProductPage;