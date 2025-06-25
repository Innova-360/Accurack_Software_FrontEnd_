import React from 'react';
import { FaEye, FaEdit, FaPrint, FaTrash } from 'react-icons/fa';
import type { Transaction } from '../../services/salesService';

interface TransactionTableProps {
  transactions: Transaction[];
  onView: (transaction: Transaction) => void;
  onEdit: (transaction: Transaction) => void;
  onPrint: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  onView,
  onEdit,
  onPrint,
  onDelete
}) => {
  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };
  const getStatusBadge = (status: Transaction['status']) => {
    const statusStyles = {
      'Completed': 'bg-green-100 text-green-800 border-green-200',
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Refunded': 'bg-red-100 text-red-800 border-red-200',
      'Shipped': 'bg-blue-100 text-blue-800 border-blue-200',
      'Delivered': 'bg-purple-100 text-purple-800 border-purple-200'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusStyles[status]}`}>
        {status}
      </span>
    );
  };

  // const getPaymentBadge = (payment: Transaction['payment']) => {
  //   const paymentStyles = {
  //     'Cash': 'bg-green-50 text-green-700',
  //     'Card': 'bg-blue-50 text-blue-700',
  //     'Digital': 'bg-purple-50 text-purple-700'
  //   };
    
  //   return (
  //     <span className={`px-2 py-1 text-xs font-medium rounded ${paymentStyles[payment]}`}>
  //       {payment}
  //     </span>
  //   );
  // };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sales ID
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date & Time
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Items
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Payment
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cashier
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium text-blue-600">
                {transaction.transactionId}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                <div>{transaction.dateTime}</div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {transaction.customer}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900 text-center">
                {transaction.items}
              </td>
              <td className="px-4 py-3 text-sm text-right">
                <div className="font-semibold text-gray-900">
                  {formatCurrency(transaction.total)}
                </div>
                <div className="text-xs text-gray-500">
                  Tax: {formatCurrency(transaction.tax)}
                </div>
              </td>
              <td className="px-4 py-3 text-center">
              </td>
              <td className="px-4 py-3 text-center">
                {getStatusBadge(transaction.status)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {transaction.cashier}
              </td>
              <td className="px-4 py-3 text-center">
                <div className="flex justify-center space-x-2">
                  <button 
                    onClick={() => onView(transaction)}
                    className="text-gray-500 hover:text-blue-600 p-1"
                    title="View"
                  >
                    <FaEye size={14} />
                  </button>
                  <button 
                    onClick={() => onEdit(transaction)}
                    className="text-gray-500 hover:text-green-600 p-1"
                    title="Edit"
                  >
                    <FaEdit size={14} />
                  </button>
                  <button 
                    onClick={() => onPrint(transaction)}
                    className="text-gray-500 hover:text-purple-600 p-1"
                    title="Print"
                  >
                    <FaPrint size={14} />
                  </button>
                  <button 
                    onClick={() => onDelete(transaction)}
                    className="text-gray-500 hover:text-red-600 p-1"
                    title="Delete"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
