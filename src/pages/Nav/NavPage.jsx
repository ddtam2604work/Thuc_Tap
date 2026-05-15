const NavPage = ({ activeTab, onTabChange, tabs }) => {
  return (
    <div className="flex w-full border-b border-gray-200 gap-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center gap-2 pb-2 text-[14px] font-semibold transition-all border-b-2 
            ${activeTab === tab.id 
              ? 'border-[#007BFF] text-[#007BFF]' 
              : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <span>{tab.id === 'categories' ? '📁' : '🖼️'}</span>
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default NavPage;