import ProductItemRow from './ProductItemRow';

const ProductListSection = ({ products, catalog, isLoadingCatalog, onAddProduct, onRemoveProduct, onUpdateProduct }) => {
  return (
    <div className="bg-transparent flex flex-col gap-4">
      <div className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-gray-800 bg-white border border-gray-100 p-4 rounded-xl shadow-xs">
        <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg text-sm">📦</span>
        <h2>Danh sách sản phẩm cấu hình ({products.length})</h2>
      </div>

      <div className="flex flex-col gap-4">
        {products.map((product, index) => (
          <ProductItemRow
            key={product.id}
            product={product}
            index={index}
            catalog={catalog}
            isLoadingCatalog={isLoadingCatalog}
            isRemovable={products.length > 1}
            onRemove={() => onRemoveProduct(product.id)}
            onUpdate={(fields) => onUpdateProduct(product.id, fields)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onAddProduct}
        className="w-full py-3 border-2 border-dashed border-gray-200 hover:border-blue-500/40 hover:text-blue-600 rounded-xl text-center text-[11px] font-bold text-gray-500 bg-white shadow-2xs hover:shadow-xs uppercase tracking-wider transition-all duration-200 active:scale-[0.99]"
      >
        + Thêm dòng sản phẩm mới
      </button>
    </div>
  );
};

export default ProductListSection;