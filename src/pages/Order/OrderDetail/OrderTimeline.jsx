import PropTypes from 'prop-types';

const OrderTimeline = ({ timeline }) => {
  return (
    <div className="bg-white border border-gray-100 shadow-xs rounded-xl p-5 flex flex-col gap-3.5">
      <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Tiến độ đơn hàng</h3>
      <div className="flex flex-col pl-2 mt-1">
        {timeline.map((step, idx) => (
          <div key={step.id} className="flex gap-4 relative pb-4 last:pb-0 text-[12px]">
            {/* Đường trục kẻ dọc nối tiếp giữa các bước */}
            {idx !== timeline.length - 1 && (
              <div className={`absolute left-2.5 top-4 bottom-0 w-0.5 ${step.isDone ? 'bg-green-500' : 'bg-gray-100'}`}></div>
            )}
            
            {/* Vòng chấm trạng thái */}
            <div className="relative z-10 flex items-center justify-center">
              {step.isDone ? (
                // Bước đã xong: Luôn luôn là tích xanh
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-[10px] font-black shadow-xs">
                  ✓
                </div>
              ) : step.isCurrent ? (
                // Bước hiện tại (và chưa xong): Vòng tròn cam nhấp nháy
                <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center ring-4 ring-orange-500/10">
                  <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse"></div>
                </div>
              ) : (
                // Bước chưa đến: Vòng tròn xám
                <div className="w-5 h-5 rounded-full border-2 bg-white border-gray-200"></div>
              )}
            </div>

            {/* Văn bản nội dung bước tương ứng */}
            <div className="flex flex-col -mt-0.5 min-w-0">
              <span className={`font-bold ${step.isCurrent ? 'text-blue-700' : step.isDone ? 'text-green-600' : 'text-gray-400'}`}>
                {step.label}
              </span>
              {step.subtext && <span className="text-[10px] text-gray-400 font-medium mt-0.5">{step.subtext}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

OrderTimeline.propTypes = {
  timeline: PropTypes.array.isRequired,
};

export default OrderTimeline;