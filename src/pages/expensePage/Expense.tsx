import React, { useState } from 'react';
import Header from '../../components/Header';
import {
  ExpenseSidebar,
  ExpenseActionBar,
  ExpenseTable,
  EditExpenseModal,
  AddExpenseModal,
  DeleteConfirmModal,
  AddCategoryModal,
  DateRangeSelector,
  type ExpenseCategory,
  type ExpenseItem,
  type ExpenseItemWithCategory
} from '../../components/ExpenseComponents';

const expenseCategories: ExpenseCategory[] = [
  {
    name: 'Marketing',
    items: [
      { id: 1, name: 'Google Ads', quantity: 10, price: 25.65, createdAt: new Date('2024-12-01') },
      { id: 2, name: 'Social Media Boost', quantity: 3, price: 45.69, createdAt: new Date('2024-12-05') },
      { id: 3, name: 'Print Media', quantity: 5, price: 12.50, createdAt: new Date('2024-12-10') },
    ],
  },
  {
    name: 'Operations',
    items: [
      { id: 4, name: 'Printer Ink', quantity: 5, price: 90, createdAt: new Date('2024-11-28') },
      { id: 5, name: 'Office Chairs', quantity: 1, price: 970, createdAt: new Date('2024-12-02') },
    ],
  },
  {
    name: 'Travels',
    items: [
      { id: 6, name: 'Flight Tickets', quantity: 2, price: 450, createdAt: new Date('2024-12-08') },
    ],
  },
  {
    name: 'Human Resources',
    items: [],
  },
];

const ExpensePage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Expenses');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [categories, setCategories] = useState<ExpenseCategory[]>(expenseCategories);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [isAddRowModalOpen, setIsAddRowModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExpenseItem | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<number | null>(null);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const currentCategory = categories.find(cat => cat.name === selectedCategory);
  
  // Filter items by date range
  const filterItemsByDate = (items: ExpenseItem[]): ExpenseItem[] => {
    if (!fromDate && !toDate) return items;
    
    return items.filter(item => {
      const itemDate = new Date(item.createdAt);
      const startOfItemDate = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());
      
      if (fromDate && toDate) {
        const startOfFromDate = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
        const startOfToDate = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate());
        return startOfItemDate >= startOfFromDate && startOfItemDate <= startOfToDate;
      } else if (fromDate) {
        const startOfFromDate = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
        return startOfItemDate >= startOfFromDate;
      } else if (toDate) {
        const startOfToDate = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate());
        return startOfItemDate <= startOfToDate;
      }
      return true;
    });
  };

  const allExpenses: ExpenseItemWithCategory[] = selectedCategory === 'All Expenses' 
    ? filterItemsByDate(categories.flatMap(cat => cat.items)).map(item => ({ 
        ...item, 
        category: categories.find(cat => cat.items.some(catItem => catItem.id === item.id))?.name || 'Unknown'
      }))
    : filterItemsByDate(currentCategory?.items || []).map(item => ({ ...item, category: selectedCategory }));
  
  const total = allExpenses.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleDateRangeChange = (newFromDate: Date | null, newToDate: Date | null) => {
    setFromDate(newFromDate);
    setToDate(newToDate);
  };

  // Edit functionality
  const handleEdit = (item: ExpenseItem) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };
  const handleEditSubmit = (updatedExpense: ExpenseItem & { category?: string }) => {
    if (selectedCategory === 'All Expenses' && updatedExpense.category) {
      // Remove from old category and add to new category
      setCategories(prev => prev.map(category => {
        // Remove from all categories first
        const itemsWithoutUpdated = category.items.filter(item => item.id !== updatedExpense.id);
        
        // Add to the target category
        if (category.name === updatedExpense.category) {
          return {
            ...category,
            items: [...itemsWithoutUpdated, {
              id: updatedExpense.id,
              name: updatedExpense.name,
              quantity: updatedExpense.quantity,
              price: updatedExpense.price,
              createdAt: updatedExpense.createdAt
            }]
          };
        }
        
        return { ...category, items: itemsWithoutUpdated };
      }));
    } else {
      // Update item in current category only
      setCategories(prev => prev.map(category => 
        category.name === selectedCategory 
          ? {
              ...category,
              items: category.items.map(item => 
                item.id === updatedExpense.id 
                  ? {
                      id: item.id,
                      name: updatedExpense.name,
                      quantity: updatedExpense.quantity,
                      price: updatedExpense.price,
                      createdAt: item.createdAt
                    }
                  : item
              )
            }
          : category
      ));
    }
    setIsEditModalOpen(false);
    setEditingItem(null);
  };

  // Delete individual item
  const handleDeleteItem = (itemId: number) => {
    setDeletingItemId(itemId);
    setIsDeleteModalOpen(true);
  };
  const confirmDeleteItem = () => {
    if (deletingItemId) {
      if (selectedCategory === 'All Expenses') {
        // Delete from any category that contains this item
        setCategories(prev => prev.map(category => 
          ({ ...category, items: category.items.filter(item => item.id !== deletingItemId) })
        ));
      } else {
        // Delete from current category only
        setCategories(prev => prev.map(category => 
          category.name === selectedCategory 
            ? { ...category, items: category.items.filter(item => item.id !== deletingItemId) }
            : category
        ));
      }
      setIsDeleteModalOpen(false);
      setDeletingItemId(null);
    }
  };
  // Delete all items in current category or all categories
  const handleDeleteAll = () => {
    setIsDeleteAllModalOpen(true);
  };

  const confirmDeleteAll = () => {
    if (selectedCategory === 'All Expenses') {
      // Delete all items from all categories
      setCategories(prev => prev.map(category => 
        ({ ...category, items: [] })
      ));
    } else {
      // Delete all items from current category
      setCategories(prev => prev.map(category => 
        category.name === selectedCategory 
          ? { ...category, items: [] }
          : category
      ));
    }
    setIsDeleteAllModalOpen(false);
  };

  // Add new row
  const handleAddRow = () => {
    setIsAddRowModalOpen(true);
  };

  const handleAddSubmit = (expenseData: { name: string; quantity: number; price: number; category: string }) => {
    if (expenseData.name.trim() === '') {
      alert('Please enter an item name');
      return;
    }
    
    const newId = Math.max(...categories.flatMap(cat => cat.items.map(item => item.id)), 0) + 1;    const newItem: ExpenseItem = {
      id: newId,
      name: expenseData.name,
      quantity: expenseData.quantity,
      price: expenseData.price,
      createdAt: new Date()
    };
    
    // Determine target category
    const targetCategory = selectedCategory === 'All Expenses' ? expenseData.category : selectedCategory;
    
    setCategories(prev => prev.map(category => 
      category.name === targetCategory 
        ? { ...category, items: [...category.items, newItem] }
        : category
    ));
    setIsAddRowModalOpen(false);
  };

  // Add new category
  const handleAddCategory = () => {
    setIsAddCategoryModalOpen(true);
  };

  const handleAddCategorySubmit = (categoryName: string) => {
    if (categoryName.trim() === '') {
      alert('Please enter a category name');
      return;
    }
    
    // Check if category already exists
    if (categories.some(cat => cat.name.toLowerCase() === categoryName.toLowerCase())) {
      alert('Category already exists');
      return;
    }
    
    const newCategory: ExpenseCategory = {
      name: categoryName,
      items: []
    };
    
    setCategories(prev => [...prev, newCategory]);
    setIsAddCategoryModalOpen(false);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (selectedCategory === 'All Expenses') {
      // Export all expenses
      if (allExpenses.length === 0) {
        alert('No data to export');
        return;
      }

      const csvContent = [
        ['#', 'Items', 'Category', 'Quantity', 'Unit Price', 'Total'],
        ...allExpenses.map((item, index) => [
          index + 1,
          item.name,
          item.category,
          item.quantity,
          item.price,
          item.quantity * item.price
        ]),
        ['', '', '', '', 'Total:', total]
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'all_expenses.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      // Export single category
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
    }
  };

  return (
    <>
      <Header />
      <div className="flex h-screen bg-gray-50">
        <ExpenseSidebar
          selectedCategory={selectedCategory}
          categories={categories}
          isSidebarOpen={isSidebarOpen}
          onCategorySelect={(category) => {
            setSelectedCategory(category);
            setIsSidebarOpen(false);
          }}
          onSidebarToggle={toggleSidebar}
          onAddCategory={handleAddCategory}
        />

        {/* Main Content */}        <main className="flex-1 flex flex-col overflow-hidden">
          <ExpenseActionBar
            selectedCategory={selectedCategory}
            onSidebarToggle={toggleSidebar}
            onExportCSV={handleExportCSV}
            onDeleteAll={handleDeleteAll}
            onAddExpense={handleAddRow}
          />          {/* Date Range Filter */}
          <div className="border-b border-gray-200 bg-white px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h4 className="text-sm font-medium text-gray-700">Filter by Date:</h4>
                <DateRangeSelector
                  fromDate={fromDate}
                  toDate={toDate}
                  onDateRangeChange={handleDateRangeChange}
                  onClose={() => {}}
                />
              </div>
              {(fromDate || toDate) && (
                <button
                  onClick={() => handleDateRangeChange(null, null)}
                  className="text-sm text-teal-600 hover:text-teal-800 underline"
                >
                  Clear Filter
                </button>
              )}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto p-4">
            <ExpenseTable
              selectedCategory={selectedCategory}
              expenses={allExpenses}
              total={total}
              onAddExpense={handleAddRow}
              onEditExpense={handleEdit}
              onDeleteExpense={handleDeleteItem}
            />
          </div>
        </main>
      </div>

      {/* Modals */}
      <EditExpenseModal
        isOpen={isEditModalOpen}
        expense={editingItem}
        selectedCategory={selectedCategory}
        categories={categories}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleEditSubmit}
      />

      <AddExpenseModal
        isOpen={isAddRowModalOpen}
        selectedCategory={selectedCategory}
        categories={categories}
        onClose={() => setIsAddRowModalOpen(false)}
        onAdd={handleAddSubmit}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteItem}
      />

      <DeleteConfirmModal
        isOpen={isDeleteAllModalOpen}
        title="Delete All Expenses"
        message={`Are you sure you want to delete all expenses in ${selectedCategory}? This action cannot be undone and will remove all items.`}
        onClose={() => setIsDeleteAllModalOpen(false)}
        onConfirm={confirmDeleteAll}
      />

      <AddCategoryModal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        onAdd={handleAddCategorySubmit}
      />
    </>
  );
};

export default ExpensePage;
