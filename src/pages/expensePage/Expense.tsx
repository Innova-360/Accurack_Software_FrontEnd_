import React, { useState } from 'react';
import { 
  FaChevronDown, 
  FaChevronRight, 
  FaPlus, 
  FaFileExport, 
  FaTrash, 
  FaSave,
  FaBars,
  FaTimes,
  FaEdit
} from 'react-icons/fa';
import Header from '../../components/Header';

interface ExpenseItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

interface ExpenseCategory {
  name: string;
  items: ExpenseItem[];
}

const expenseCategories: ExpenseCategory[] = [
  {
    name: 'Marketing',
    items: [
      { id: 1, name: 'Google Ads', quantity: 10, price: 25.65 },
      { id: 2, name: 'Social Media Boost', quantity: 3, price: 45.69 },
      { id: 3, name: 'Print Media', quantity: 5, price: 12.50 },
    ],
  },
  {
    name: 'Operations',
    items: [
      { id: 4, name: 'Printer Ink', quantity: 5, price: 90 },
      { id: 5, name: 'Office Chairs', quantity: 1, price: 970 },
    ],
  },
  {
    name: 'Travels',
    items: [
      { id: 6, name: 'Flight Tickets', quantity: 2, price: 450 },
    ],
  },
  {
    name: 'Human Resources',
    items: [],
  },
];

const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

const ExpensePage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Marketing');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [categories, setCategories] = useState<ExpenseCategory[]>(expenseCategories);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [isAddRowModalOpen, setIsAddRowModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExpenseItem | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: '', quantity: 0, price: 0 });
  const [addForm, setAddForm] = useState({ name: '', quantity: 1, price: 0 });

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const currentCategory = categories.find(cat => cat.name === selectedCategory);
  const total = currentCategory?.items.reduce((sum, item) => sum + item.price * item.quantity, 0) ?? 0;

  // Edit functionality
  const handleEdit = (item: ExpenseItem) => {
    setEditingItem(item);
    setEditForm({ name: item.name, quantity: item.quantity, price: item.price });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = () => {
    if (editingItem) {
      setCategories(prev => prev.map(category => 
        category.name === selectedCategory 
          ? {
              ...category,
              items: category.items.map(item => 
                item.id === editingItem.id 
                  ? { ...item, name: editForm.name, quantity: editForm.quantity, price: editForm.price }
                  : item
              )
            }
          : category
      ));
      setIsEditModalOpen(false);
      setEditingItem(null);
    }
  };
  // Delete individual item
  const handleDeleteItem = (itemId: number) => {
    setDeletingItemId(itemId);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteItem = () => {
    if (deletingItemId) {
      setCategories(prev => prev.map(category => 
        category.name === selectedCategory 
          ? { ...category, items: category.items.filter(item => item.id !== deletingItemId) }
          : category
      ));
      setIsDeleteModalOpen(false);
      setDeletingItemId(null);
    }
  };

  // Delete all items in current category
  const handleDeleteAll = () => {
    setIsDeleteAllModalOpen(true);
  };

  const confirmDeleteAll = () => {
    setCategories(prev => prev.map(category => 
      category.name === selectedCategory 
        ? { ...category, items: [] }
        : category
    ));
    setIsDeleteAllModalOpen(false);
  };

  // Add new row
  const handleAddRow = () => {
    setAddForm({ name: '', quantity: 1, price: 0 });
    setIsAddRowModalOpen(true);
  };

  const handleAddSubmit = () => {
    if (addForm.name.trim() === '') {
      alert('Please enter an item name');
      return;
    }
    
    const newId = Math.max(...categories.flatMap(cat => cat.items.map(item => item.id)), 0) + 1;
    const newItem: ExpenseItem = {
      id: newId,
      name: addForm.name,
      quantity: addForm.quantity,
      price: addForm.price
    };
    
    setCategories(prev => prev.map(category => 
      category.name === selectedCategory 
        ? { ...category, items: [...category.items, newItem] }
        : category
    ));
    setIsAddRowModalOpen(false);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!currentCategory || currentCategory.items.length === 0) {
      alert('No data to export');
      return;
    }

    const csvContent = [
      ['#', 'Items', 'Quantity', 'Unit Price', 'Total'],
      ...currentCategory.items.map((item, index) => [
        index + 1,
        item.name,
        item.quantity,
        item.price,
        item.quantity * item.price
      ]),
      ['', '', '', 'Total:', total]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedCategory}_expenses.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      <Header />
      <div className="flex h-screen bg-gray-50">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={toggleSidebar}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white shadow-lg border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-400 rounded mr-2"></div>
              <span className="font-semibold text-gray-800">Expenses Folder</span>
            </div>
            <button
              onClick={toggleSidebar}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <FaTimes size={16} />
            </button>
          </div>

          {/* Categories */}
          <div className="p-2">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => {
                  setSelectedCategory(category.name);
                  setIsSidebarOpen(false);
                }}
                className={`
                  flex items-center justify-between w-full px-3 py-2 mb-1 text-left rounded-md
                  hover:bg-gray-100 transition-colors
                  ${selectedCategory === category.name ? 'bg-[#03414C] text-white' : 'text-gray-700'}
                `}
              >
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-current rounded-full mr-2 opacity-60"></div>
                  <span className="text-sm">{category.name}</span>
                </div>
                {selectedCategory === category.name ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar with Actions */}
          <div className="bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center">
                <button
                  onClick={toggleSidebar}
                  className="lg:hidden mr-3 p-1 text-gray-600 hover:text-gray-800"
                >
                  <FaBars size={16} />
                </button>
                <nav className="text-sm text-gray-600">
                  <span className="hover:text-[#03414C] cursor-pointer">Back to Expenses</span>
                  <span className="mx-2">›</span>
                  <span className="font-medium text-[#03414C]">{selectedCategory} Supplies</span>
                </nav>
              </div>              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={handleExportCSV}
                  className="flex items-center px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md border transition-colors min-w-[100px] justify-center"
                >
                  <FaFileExport size={12} className="mr-2" />
                  Export CSV
                </button>
                <button 
                  onClick={handleDeleteAll}
                  className="flex items-center px-4 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-600 rounded-md border transition-colors min-w-[100px] justify-center"
                >
                  <FaTrash size={12} className="mr-2" />
                  Delete All
                </button>
                <button className="flex items-center px-4 py-2 text-sm bg-[#03414C] hover:bg-[#025a6b] text-white rounded-md transition-colors min-w-[100px] justify-center">
                  <FaSave size={12} className="mr-2" />
                  Save
                </button>
                <button 
                  onClick={handleAddRow}
                  className="flex items-center px-4 py-2 text-sm bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors min-w-[100px] justify-center"
                >
                  <FaPlus size={12} className="mr-2" />
                  Add a Row
                </button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto p-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Table Header */}
              <div className="px-4 py-3 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Expenses Data</h2>
              </div>              {/* Add Row button */}
              <div className="px-4 py-2 border-b border-gray-200 flex justify-end">
                <button 
                  onClick={handleAddRow}
                  className="text-sm text-teal-600 hover:text-teal-700 flex items-center"
                >
                  <FaPlus size={10} className="mr-1" />
                  Add Row
                </button>
              </div>

              {/* Table */}
              {currentCategory && currentCategory.items.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          #
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Items
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
                      {currentCategory.items.map((item, index) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-500 text-center">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {item.name}
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
                          </td>                          <td className="px-4 py-3 text-center">
                            <div className="flex justify-center space-x-2">
                              <button 
                                onClick={() => handleEdit(item)}
                                className="text-gray-500 hover:text-blue-600"
                                title="Edit"
                              >
                                <FaEdit size={14} />
                              </button>
                              <button 
                                onClick={() => handleDeleteItem(item.id)}
                                className="text-gray-500 hover:text-red-600"
                                title="Delete"
                              >
                                <FaTrash size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      
                      {/* Total Row */}
                      <tr className="bg-gray-50 font-bold">
                        <td className="px-4 py-3 text-sm text-gray-900 text-center" colSpan={4}>
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
              ) : (
                <div className="px-4 py-12 text-center">
                  <div className="text-gray-400 mb-3">
                    <FaPlus size={32} className="mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No expenses recorded
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Start by adding your first expense to {selectedCategory}
                  </p>                  <button 
                    onClick={handleAddRow}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Add First Expense
                  </button>
                </div>
              )}
            </div>          </div>
        </main>
      </div>      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md border-2 border-[#03414C]">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-[#03414C] rounded-full flex items-center justify-center mr-3">
                  <FaEdit className="text-white" size={16} />
                </div>
                <h3 className="text-lg font-semibold text-[#03414C]">Edit Expense</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-[#03414C]"
                    placeholder="Enter item name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={editForm.quantity}
                    onChange={(e) => setEditForm({ ...editForm, quantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-[#03414C]"
                    placeholder="Enter quantity"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Price ($)
                  </label>
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-[#03414C]"
                    placeholder="Enter unit price"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSubmit}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#03414C] hover:bg-[#025a6b] rounded-md transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}      {/* Delete Item Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md border-2 border-red-500">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3">
                  <FaTrash className="text-white" size={16} />
                </div>
                <h3 className="text-lg font-semibold text-red-600">Delete Expense</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this expense? This action cannot be undone.
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteItem}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}      {/* Delete All Modal */}
      {isDeleteAllModalOpen && (
        <div className="fixed inset-0 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md border-2 border-red-500">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3">
                  <FaTrash className="text-white" size={16} />
                </div>
                <h3 className="text-lg font-semibold text-red-600">Delete All Expenses</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete all expenses in <strong>{selectedCategory}</strong>? 
                This action cannot be undone and will remove all {currentCategory?.items.length || 0} items.
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsDeleteAllModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteAll}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors"
                >
                  Delete All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}      {/* Add Row Modal */}
      {isAddRowModalOpen && (
        <div className="fixed inset-0 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md border-2 border-teal-500">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center mr-3">
                  <FaPlus className="text-white" size={16} />
                </div>
                <h3 className="text-lg font-semibold text-teal-600">Add New Expense</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter item name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={addForm.quantity}
                    onChange={(e) => setAddForm({ ...addForm, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter quantity"
                    min="1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Price ($)
                  </label>
                  <input
                    type="number"
                    value={addForm.price}
                    onChange={(e) => setAddForm({ ...addForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter unit price"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsAddRowModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSubmit}
                  className="px-4 py-2 text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 rounded-md transition-colors"
                >
                  Add Expense
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExpensePage;
