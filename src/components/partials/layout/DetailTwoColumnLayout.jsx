import PropTypes from 'prop-types';

const DetailTwoColumnLayout = ({ mainContent, sidebarContent, onBackClick, backLabel }) => {
  return (
    <div className="w-full flex flex-col gap-4 text-[#191C1D] text-[12px] font-inter animate-in fade-in duration-300">
      {/* Nút Quay lại chuẩn thiết kế hệ thống */}
      <div className="flex items-center gap-2 py-1">
        <button 
          type="button"
          onClick={onBackClick}
          className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-bold transition-colors cursor-pointer text-xs select-none"
        >
          <span className="text-sm">←</span> {backLabel || 'Quay lại'}
        </button>
      </div>

      {/* Grid luồng bố cục chia tỷ lệ 2 Cột linh hoạt */}
      <div className="w-full flex flex-col lg:flex-row items-start gap-4.5">
        {/* CỘT TRÁI: Ruột chứa nội dung dữ liệu chi tiết chính */}
        <div className="flex-1 w-full flex flex-col gap-4">
          {mainContent}
        </div>

        {/* CỘT PHẢI: Ruột chứa Tiến độ, Hành động, Tổng kết công nợ */}
        <div className="w-full lg:w-[350px] flex flex-col gap-4 shrink-0">
          {sidebarContent}
        </div>
      </div>
    </div>
  );
};

DetailTwoColumnLayout.propTypes = {
  mainContent: PropTypes.node.isRequired,
  sidebarContent: PropTypes.node.isRequired,
  onBackClick: PropTypes.func.isRequired,
  backLabel: PropTypes.string,
};

export default DetailTwoColumnLayout;