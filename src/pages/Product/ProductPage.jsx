import ProductCatalogPage from './ProductCatalogPage';
import ProductManagementPage from './ProductManagementPage';
import NavPage from '../Nav/NavPage';
import { PRODUCT_NAV_TABS } from '../../constants/product';
import Button from '../../components/skeleton/Button';
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
    </div>
  );
};

export default ProductPage;