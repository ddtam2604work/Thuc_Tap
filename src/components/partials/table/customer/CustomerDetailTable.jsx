import PropTypes from 'prop-types';
import Table from '../../../skeleton/Table';

const CustomerDetailTable = ({ headers = [], data = [], type = 'history' }) => {
  return (
    // Overwrite class bọc ngoài để bảng hiển thị ở cỡ chữ nhỏ nhất, tối ưu không gian hẹp
    <Table headers={headers} className="border-none shadow-none rounded-none text-xs">
      {data.length > 0 ? (
        data.map((item, index) => (
          <tr key={item.id || index} className="hover:bg-gray-50/60 transition-colors h-10 text-[11px]">
            <td className="p-2 text-center text-gray-400 font-medium w-10">
              {index + 1}
            </td>
            
            {type === 'history' ? (
              <>
                <td className="p-2 font-semibold text-gray-700">{item.orderId}</td>
                <td className="p-2 text-gray-500 text-center">{item.date}</td>
                <td className="p-2 text-right font-bold text-[#0037B0]">{item.amount}</td>
              </>
            ) : (
              <>
                <td className="p-2 font-medium text-gray-700">{item.period}</td>
                <td className="p-2 text-right text-gray-600">{item.incurred}</td>
                <td className="p-2 text-right font-bold text-red-600">{item.balance}</td>
              </>
            )}
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan={headers.length} className="p-6 text-center text-gray-400 text-xs">
            Không có dữ liệu phát sinh.
          </td>
        </tr>
      )}
    </Table>
  );
};

CustomerDetailTable.propTypes = {
  headers: PropTypes.arrayOf(PropTypes.string).isRequired,
  data: PropTypes.arrayOf(PropTypes.object),
  type: PropTypes.oneOf(['history', 'debt']),
};

export default CustomerDetailTable;