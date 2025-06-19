import React from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { SpecialButton, IconButton } from '../buttons';
import type { ExpenseItem, ExpenseItemWithCategory } from './types';

interface ExpenseTableProps {
  selectedCategory: string;
  expenses: ExpenseItem[] | ExpenseItemWithCategory[];
  total: number;
  onAddExpense: () => void;
  onEditExpense: (item: ExpenseItem) => void;
  onDeleteExpense: (id: number) => void;
}

const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

const ExpenseTable: React.FC<ExpenseTableProps> = ({
  selectedCategory,
  expenses,
  total,
  onAddExpense,
  onEditExpense,
  onDeleteExpense
}) => {
  const isAllExpenses = selectedCategory === 'All Expenses';

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Table Header */}
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Expenses Data</h2>
        </div>
        
        {/* Empty State */}
        <div className="px-4 py-12 text-center">
          <div className="text-gray-400 mb-3">
            <FaPlus size={32} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No expenses recorded
          </h3>
          <p className="text-gray-500 mb-4">
            Start by adding your first expense to {selectedCategory}
          </p>
          <SpecialButton
            variant="expense-add"
            onClick={onAddExpense}
          >
            Add First Expense
          </SpecialButton>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Table Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Expenses Data</h2>
      </div>
      
      {/* Add Row button */}
      <div className="px-4 py-2 border-b border-gray-200 flex justify-end">
        <SpecialButton
          variant="expense-add"
          onClick={onAddExpense}
          icon={<FaPlus size={10} />}
          className="text-sm"
        >
          Add Expense
        </SpecialButton>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Items
              </th>
              {isAllExpenses && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
              )}
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date Created
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unit Price
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {expenses.map((item, index) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-500 text-center">
                  {index + 1}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {item.name}
                </td>                {isAllExpenses && (
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {(item as ExpenseItemWithCategory).category || 'Unknown'}
                    </span>
                  </td>
                )}
                <td className="px-4 py-3 text-sm text-gray-600 text-center">
                  {new Date(item.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-center">
                  {item.quantity}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">
                  <span className="text-green-600 font-medium">
                    {formatCurrency(item.price)}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                  {formatCurrency(item.quantity * item.price)}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center space-x-2">
                    <IconButton
                      icon={<FaEdit size={14} />}
                      onClick={() => onEditExpense(item)}
                      variant="secondary"
                      size="sm"
                      title="Edit"
                      className="text-gray-500 hover:text-blue-600"
                    />
                    <IconButton
                      icon={<FaTrash size={14} />}
                      onClick={() => onDeleteExpense(item.id)}
                      variant="danger"
                      size="sm"
                      title="Delete"
                      className="text-gray-500 hover:text-red-600"
                    />
                  </div>
                </td>
              </tr>
            ))}
            
            {/* Total Row */}
            <tr className="bg-gray-50 font-bold">
              <td className="px-4 py-3 text-sm text-gray-900 text-center" colSpan={isAllExpenses ? 5 : 4}>
                Total
              </td>
              <td className="px-4 py-3 text-sm text-gray-900 text-right">
                <span className="text-lg font-bold text-[#03414C]">
                  {formatCurrency(total)}
                </span>
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpenseTable;
