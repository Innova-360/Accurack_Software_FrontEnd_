import React from 'react';

interface TransactionTableProps {
  transactions: any[]; // Using any to support both old and new transaction formats
  onView: (transaction: any) => void;
  onEdit: (transaction: any) => void;
  onPrint: (transaction: any) => void;
  onDelete: (transaction: any) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions
}) => {
  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };
  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { color: string; text: string } } = {
      'completed': { color: 'bg-green-500', text: 'Completed' },
      'pending': { color: 'bg-yellow-500', text: 'Pending' },
      'refunded': { color: 'bg-red-500', text: 'Refunded' },
      'shipped': { color: 'bg-blue-500', text: 'Shipped' },
      'delivered': { color: 'bg-green-500', text: 'Delivered' },
      'cancelled': { color: 'bg-gray-500', text: 'Cancelled' }
    };
    
    const normalizedStatus = status?.toLowerCase() || 'pending';
    const config = statusConfig[normalizedStatus] || { color: 'bg-gray-500', text: status || 'Unknown' };
    
    return (
      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
        <div className={`w-2 h-2 rounded-full mr-1 ${config.color}`}></div>
        {config.text}
      </span>
    );
  };

  const getPaymentMethodBadge = (paymentMethod: string) => {
    const paymentConfig: { [key: string]: { color: string; icon: string } } = {
      'cash': { color: 'bg-green-500', icon: '' },
      'card': { color: 'bg-blue-500', icon: '' },
      'bank_transfer': { color: 'bg-teal-500', icon: '' },
      'check': { color: 'bg-orange-500', icon: '' },
      'digital_wallet': { color: 'bg-purple-500', icon: '' }
    };
    
    const normalizedMethod = paymentMethod?.toLowerCase() || 'cash';
    const config = paymentConfig[normalizedMethod] || { color: 'bg-gray-500', icon: '💰' };
    
    // Format display name
    const displayName = paymentMethod ? 
      paymentMethod.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
      'Cash';
    
    return (
      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
        <span className="mr-1">{config.icon}</span>
        <div className={`w-2 h-2 rounded-full mr-1 ${config.color}`}></div>
        {displayName}
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
                {transaction.customerName || transaction.customer?.customerName || 'Unknown Customer'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {transaction.phoneNumber || transaction.customer?.phoneNumber || 'N/A'}
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
                {getPaymentMethodBadge(transaction.payment)}
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
