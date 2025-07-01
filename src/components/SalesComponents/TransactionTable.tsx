import React from 'react';
import type { Transaction } from '../../services/salesService';

interface TransactionTableProps {
  transactions: Transaction[];
  onView: (transaction: Transaction) => void;
  onEdit: (transaction: Transaction) => void;
  onPrint: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions
}) => {
  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };
  const getStatusBadge = (status: Transaction['status']) => {
    const statusConfig = {
      'Completed': { color: 'bg-green-500', text: 'Paid' },
      'Pending': { color: 'bg-yellow-500', text: 'Pending' },
      'Refunded': { color: 'bg-red-500', text: 'Refunded' },
      'Shipped': { color: 'bg-blue-500', text: 'Paid' },
      'Delivered': { color: 'bg-green-500', text: 'Paid' }
    };
    
    const config = statusConfig[status];
    
    return (
      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
        <div className={`w-2 h-2 rounded-full mr-1 ${config.color}`}></div>
        {config.text}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sales Receipt #
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Phone
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Products
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Amount
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tax
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Payment
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date & Time
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cashier
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Return
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.map((transaction, index) => (
            <tr key={transaction.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}>
              <td className="px-4 py-3 text-sm font-medium text-teal-600">
                {transaction.id}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {transaction.customer.customerName}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {transaction.customer.phoneNumber}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                N/A
              </td>
              <td className="px-4 py-3 text-sm text-gray-900 text-center">
                {transaction.items}
              </td>
              <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                {formatCurrency(transaction.total)}
              </td>
              <td className="px-4 py-3 text-sm text-right text-gray-600">
                {formatCurrency(transaction.tax)}
              </td>
              <td className="px-4 py-3 text-center">
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                  <div className={`w-2 h-2 rounded-full mr-1 bg-teal-500`}></div>
                  {transaction.payment}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                {getStatusBadge(transaction.status)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                <div>{transaction.dateTime}</div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {transaction.cashier}
              </td>
              <td className="px-4 py-3 text-center">
                <span className="text-sm text-gray-500">N/A</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
