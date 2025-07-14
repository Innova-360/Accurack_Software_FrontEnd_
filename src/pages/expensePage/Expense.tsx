import toast from "react-hot-toast";
import React, { useState } from "react";
import {
  FaChevronDown,
  FaChevronRight,
  FaPlus,
  FaFileExport,
  FaTrash,
  FaSave,
  FaBars,
  FaTimes,
  FaEdit,
} from "react-icons/fa";
import Header from "../../components/Header";
import {
  SpecialButton,
  SidebarButton,
  IconButton,
} from "../../components/buttons";

interface ExpenseItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  createdAt?: Date;
}

interface ExpenseCategory {
  name: string;
  items: ExpenseItem[];
}

interface ExpenseItemWithCategory extends ExpenseItem {
  category: string;
}

const expenseCategories: ExpenseCategory[] = [
  {
    name: "Marketing",
    items: [
      {
        id: 1,
        name: "Google Ads",
        quantity: 10,
        price: 25.65,
        createdAt: new Date("2024-12-01"),
      },
      {
        id: 2,
        name: "Social Media Boost",
        quantity: 3,
        price: 45.69,
        createdAt: new Date("2024-12-05"),
      },
      {
        id: 3,
        name: "Print Media",
        quantity: 5,
        price: 12.5,
        createdAt: new Date("2024-12-10"),
      },
    ],
  },
  {
    name: "Operations",
    items: [
      {
        id: 4,
        name: "Printer Ink",
        quantity: 5,
        price: 90,
        createdAt: new Date("2024-11-28"),
      },
      {
        id: 5,
        name: "Office Chairs",
        quantity: 1,
        price: 970,
        createdAt: new Date("2024-12-02"),
      },
    ],
  },
  {
    name: "Travels",
    items: [
      {
        id: 6,
        name: "Flight Tickets",
        quantity: 2,
        price: 450,
        createdAt: new Date("2024-12-08"),
      },
    ],
  },
  {
    name: "Human Resources",
    items: [],
  },
];

const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

const ExpensePage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] =
    useState<string>("All Expenses");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [categories, setCategories] =
    useState<ExpenseCategory[]>(expenseCategories);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [isAddRowModalOpen, setIsAddRowModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExpenseItem | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    quantity: 0,
    price: 0,
    category: "",
  });
  const [addForm, setAddForm] = useState({
    name: "",
    quantity: 1,
    price: 0,
    category: "Marketing",
  });
  const [newCategoryName, setNewCategoryName] = useState("");

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const currentCategory = categories.find(
    (cat) => cat.name === selectedCategory
  );

  // Filter items by date range (simplified - currently returns all items)
  const filterItemsByDate = (items: ExpenseItem[]): ExpenseItem[] => {
    return items;
  };

  const allExpenses: ExpenseItemWithCategory[] =
    selectedCategory === "All Expenses"
      ? filterItemsByDate(categories.flatMap((cat) => cat.items)).map(
          (item) => ({
            ...item,
            category:
              categories.find((cat) =>
                cat.items.some((catItem) => catItem.id === item.id)
              )?.name || "Unknown",
          })
        )
      : filterItemsByDate(currentCategory?.items || []).map((item) => ({
          ...item,
          category: selectedCategory,
        }));

  const total = allExpenses.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Edit functionality
  const handleEdit = (item: ExpenseItem) => {
    setEditingItem(item);

    // Find the category of the item
    let itemCategory = "";
    if (selectedCategory === "All Expenses") {
      const foundCategory = categories.find((cat) =>
        cat.items.some((catItem) => catItem.id === item.id)
      );
      itemCategory = foundCategory?.name || "Marketing";
    } else {
      itemCategory = selectedCategory;
    }

    setEditForm({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      category: itemCategory,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = () => {
    if (editingItem) {
      if (selectedCategory === "All Expenses") {
        // Find the original category and remove item
        const originalCategory = categories.find((cat) =>
          cat.items.some((item) => item.id === editingItem.id)
        );

        if (originalCategory?.name === editForm.category) {
          // Same category, just update the item
          setCategories((prev) =>
            prev.map((category) => ({
              ...category,
              items: category.items.map((item) =>
                item.id === editingItem.id
                  ? {
                      ...item,
                      name: editForm.name,
                      quantity: editForm.quantity,
                      price: editForm.price,
                    }
                  : item
              ),
            }))
          );
        } else {
          // Different category, remove from old and add to new
          setCategories((prev) =>
            prev.map((category) => {
              if (category.name === originalCategory?.name) {
                // Remove from original category
                return {
                  ...category,
                  items: category.items.filter(
                    (item) => item.id !== editingItem.id
                  ),
                };
              } else if (category.name === editForm.category) {
                // Add to new category
                return {
                  ...category,
                  items: [
                    ...category.items,
                    {
                      ...editingItem,
                      name: editForm.name,
                      quantity: editForm.quantity,
                      price: editForm.price,
                    },
                  ],
                };
              }
              return category;
            })
          );
        }
      } else {
        // Update item in current category only
        setCategories((prev) =>
          prev.map((category) =>
            category.name === selectedCategory
              ? {
                  ...category,
                  items: category.items.map((item) =>
                    item.id === editingItem.id
                      ? {
                          ...item,
                          name: editForm.name,
                          quantity: editForm.quantity,
                          price: editForm.price,
                        }
                      : item
                  ),
                }
              : category
          )
        );
      }
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
      if (selectedCategory === "All Expenses") {
        // Delete from any category that contains this item
        setCategories((prev) =>
          prev.map((category) => ({
            ...category,
            items: category.items.filter((item) => item.id !== deletingItemId),
          }))
        );
      } else {
        // Delete from current category only
        setCategories((prev) =>
          prev.map((category) =>
            category.name === selectedCategory
              ? {
                  ...category,
                  items: category.items.filter(
                    (item) => item.id !== deletingItemId
                  ),
                }
              : category
          )
        );
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
    if (selectedCategory === "All Expenses") {
      // Delete all items from all categories
      setCategories((prev) =>
        prev.map((category) => ({ ...category, items: [] }))
      );
    } else {
      // Delete all items from current category
      setCategories((prev) =>
        prev.map((category) =>
          category.name === selectedCategory
            ? { ...category, items: [] }
            : category
        )
      );
    }
    setIsDeleteAllModalOpen(false);
  };

  // Add new row
  const handleAddRow = () => {
    setAddForm({
      name: "",
      quantity: 1,
      price: 0,
      category:
        selectedCategory === "All Expenses" ? "Marketing" : selectedCategory,
    });
    setIsAddRowModalOpen(true);
  };

  const handleAddSubmit = () => {
    if (addForm.name.trim() === "") {
      toast.error("Please enter an item name");
      return;
    }

    const newId =
      Math.max(
        ...categories.flatMap((cat) => cat.items.map((item) => item.id)),
        0
      ) + 1;
    const newItem: ExpenseItem = {
      id: newId,
      name: addForm.name,
      quantity: addForm.quantity,
      price: addForm.price,
      createdAt: new Date(),
    };

    const targetCategory =
      selectedCategory === "All Expenses" ? addForm.category : selectedCategory;

    setCategories((prev) =>
      prev.map((category) =>
        category.name === targetCategory
          ? { ...category, items: [...category.items, newItem] }
          : category
      )
    );
    setIsAddRowModalOpen(false);
  };

  // Add new category
  const handleAddCategory = () => {
    setNewCategoryName("");
    setIsAddCategoryModalOpen(true);
  };

  const handleAddCategorySubmit = () => {
    if (newCategoryName.trim() === "") {
      toast.error("Please enter a category name");
      return;
    }

    // Check if category already exists
    if (
      categories.some(
        (cat) => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase()
      )
    ) {
      toast.error("A category with this name already exists");
      return;
    }

    const newCategory: ExpenseCategory = {
      name: newCategoryName.trim(),
      items: [],
    };

    setCategories((prev) => [...prev, newCategory]);
    setSelectedCategory(newCategoryName.trim());
    setIsAddCategoryModalOpen(false);
    setNewCategoryName("");
  };

  const handleExportCSV = () => {
    if (selectedCategory === "All Expenses") {
      if (allExpenses.length === 0) {
        toast.error("No data to export");
        return;
      }

      const csvContent = [
        ["#", "Items", "Category", "Quantity", "Unit Price", "Total"],
        ...allExpenses.map((item, index) => [
          index + 1,
          item.name,
          item.category,
          item.quantity,
          item.price,
          item.quantity * item.price,
        ]),
        ["", "", "", "", "Total:", total],
      ]
        .map((row) => row.join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "all_expenses.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      if (!currentCategory || currentCategory.items.length === 0) {
        toast.error("No data to export");
        return;
      }

      const csvContent = [
        ["#", "Items", "Quantity", "Unit Price", "Total"],
        ...currentCategory.items.map((item, index) => [
          index + 1,
          item.name,
          item.quantity,
          item.price,
          item.quantity * item.price,
        ]),
        ["", "", "", "Total:", total],
      ]
        .map((row) => row.join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
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
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={toggleSidebar}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white shadow-lg border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-400 rounded mr-2"></div>
              <span className="font-semibold text-gray-800">
                Expenses Folder
              </span>
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
            {/* All Expenses Option */}
            <SidebarButton
              onClick={() => {
                setSelectedCategory("All Expenses");
                setIsSidebarOpen(false);
              }}
              active={selectedCategory === "All Expenses"}
              icon={
                selectedCategory === "All Expenses" ? (
                  <FaChevronDown size={12} />
                ) : (
                  <FaChevronRight size={12} />
                )
              }
            >
              All Expenses
            </SidebarButton>

            {/* Category Separator */}
            <div className="border-t border-gray-200 my-2"></div>

            {categories.map((category) => (
              <SidebarButton
                key={category.name}
                onClick={() => {
                  setSelectedCategory(category.name);
                  setIsSidebarOpen(false);
                }}
                active={selectedCategory === category.name}
                icon={
                  selectedCategory === category.name ? (
                    <FaChevronDown size={12} />
                  ) : (
                    <FaChevronRight size={12} />
                  )
                }
              >
                {category.name}
              </SidebarButton>
            ))}

            {/* Add New Category Button */}
            <div className="border-t border-gray-200 my-2"></div>
            <SpecialButton
              variant="sidebar-add"
              onClick={handleAddCategory}
              icon={<FaPlus size={10} />}
              className="text-teal-600 font-medium"
            >
              Add New Category
            </SpecialButton>
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
                  <span className="hover:text-[#03414C] cursor-pointer">
                    Back to Expenses
                  </span>
                  <span className="mx-2">›</span>
                  <span className="font-medium text-[#03414C]">
                    {selectedCategory === "All Expenses"
                      ? "All Expenses"
                      : `${selectedCategory} Supplies`}
                  </span>
                </nav>
              </div>

              <div className="flex flex-wrap gap-2">
                <SpecialButton
                  variant="expense-export"
                  onClick={handleExportCSV}
                  icon={<FaFileExport size={12} />}
                >
                  Export CSV
                </SpecialButton>
                <SpecialButton
                  variant="expense-delete"
                  onClick={handleDeleteAll}
                  icon={<FaTrash size={12} />}
                >
                  Delete All
                </SpecialButton>
                <SpecialButton
                  variant="expense-save"
                  icon={<FaSave size={12} />}
                >
                  Save
                </SpecialButton>
                <SpecialButton
                  variant="expense-add"
                  onClick={handleAddRow}
                  icon={<FaPlus size={12} />}
                >
                  Add new Expense
                </SpecialButton>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto p-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Table Header */}
              <div className="px-4 py-3 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">
                  Expenses Data
                </h2>
              </div>

              {/* Add Row button */}
              <div className="px-4 py-2 border-b border-gray-200 flex justify-end">
                <SpecialButton
                  variant="expense-add"
                  onClick={handleAddRow}
                  icon={<FaPlus size={10} />}
                  className="text-sm"
                >
                  Add Expense
                </SpecialButton>
              </div>

              {/* Table */}
              {(
                selectedCategory === "All Expenses"
                  ? allExpenses.length > 0
                  : currentCategory && currentCategory.items.length > 0
              ) ? (
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
                        {selectedCategory === "All Expenses" && (
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                        )}
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
                      {(selectedCategory === "All Expenses"
                        ? allExpenses
                        : currentCategory?.items || []
                      ).map((item, index) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-500 text-center">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {item.name}
                          </td>
                          {selectedCategory === "All Expenses" && (
                            <td className="px-4 py-3 text-sm text-gray-600">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {(item as ExpenseItemWithCategory).category ||
                                  "Unknown"}
                              </span>
                            </td>
                          )}
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
                                onClick={() => handleEdit(item)}
                                variant="secondary"
                                size="sm"
                                title="Edit"
                                className="text-gray-500 hover:text-blue-600"
                              />
                              <IconButton
                                icon={<FaTrash size={14} />}
                                onClick={() => handleDeleteItem(item.id)}
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
                        <td
                          className="px-4 py-3 text-sm text-gray-900 text-center"
                          colSpan={selectedCategory === "All Expenses" ? 5 : 4}
                        >
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
                  </p>
                  <SpecialButton variant="expense-add" onClick={handleAddRow}>
                    Add First Expense
                  </SpecialButton>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md border-2 border-[#03414C]">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-[#03414C] rounded-full flex items-center justify-center mr-3">
                  <FaEdit className="text-white" size={16} />
                </div>
                <h3 className="text-lg font-semibold text-[#03414C]">
                  Edit Expense
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-[#03414C]"
                    placeholder="Enter item name"
                  />
                </div>

                {selectedCategory === "All Expenses" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={editForm.category}
                      onChange={(e) =>
                        setEditForm({ ...editForm, category: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-[#03414C]"
                    >
                      {categories.map((category) => (
                        <option key={category.name} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={editForm.quantity}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        quantity: parseInt(e.target.value) || 0,
                      })
                    }
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
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-[#03414C]"
                    placeholder="Enter unit price"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <SpecialButton
                  variant="modal-cancel"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </SpecialButton>
                <SpecialButton
                  variant="modal-confirm"
                  onClick={handleEditSubmit}
                >
                  Save Changes
                </SpecialButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Item Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md border-2 border-red-500">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3">
                  <FaTrash className="text-white" size={16} />
                </div>
                <h3 className="text-lg font-semibold text-red-600">
                  Delete Expense
                </h3>
              </div>

              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this expense? This action cannot
                be undone.
              </p>

              <div className="flex justify-end space-x-3">
                <SpecialButton
                  variant="modal-cancel"
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  Cancel
                </SpecialButton>
                <SpecialButton
                  variant="modal-delete"
                  onClick={confirmDeleteItem}
                >
                  Delete
                </SpecialButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Modal */}
      {isDeleteAllModalOpen && (
        <div className="fixed inset-0 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md border-2 border-red-500">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3">
                  <FaTrash className="text-white" size={16} />
                </div>
                <h3 className="text-lg font-semibold text-red-600">
                  Delete All Expenses
                </h3>
              </div>

              <p className="text-gray-600 mb-6">
                Are you sure you want to delete all expenses in{" "}
                <strong>{selectedCategory}</strong>? This action cannot be
                undone and will remove all {currentCategory?.items.length || 0}{" "}
                items.
              </p>

              <div className="flex justify-end space-x-3">
                <SpecialButton
                  variant="modal-cancel"
                  onClick={() => setIsDeleteAllModalOpen(false)}
                >
                  Cancel
                </SpecialButton>
                <SpecialButton
                  variant="modal-delete"
                  onClick={confirmDeleteAll}
                >
                  Delete All
                </SpecialButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Row Modal */}
      {isAddRowModalOpen && (
        <div className="fixed inset-0 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md border-2 border-teal-500">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center mr-3">
                  <FaPlus className="text-white" size={16} />
                </div>
                <h3 className="text-lg font-semibold text-teal-600">
                  Add New Expense
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={addForm.name}
                    onChange={(e) =>
                      setAddForm({ ...addForm, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter item name"
                  />
                </div>

                {selectedCategory === "All Expenses" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={addForm.category}
                      onChange={(e) =>
                        setAddForm({ ...addForm, category: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    >
                      {categories.map((category) => (
                        <option key={category.name} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={addForm.quantity}
                    onChange={(e) =>
                      setAddForm({
                        ...addForm,
                        quantity: parseInt(e.target.value) || 1,
                      })
                    }
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
                    onChange={(e) =>
                      setAddForm({
                        ...addForm,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter unit price"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <SpecialButton
                  variant="modal-cancel"
                  onClick={() => setIsAddRowModalOpen(false)}
                >
                  Cancel
                </SpecialButton>
                <SpecialButton variant="modal-add" onClick={handleAddSubmit}>
                  Add Expense
                </SpecialButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {isAddCategoryModalOpen && (
        <div className="fixed inset-0 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md border-2 border-teal-500">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center mr-3">
                  <FaPlus className="text-white" size={16} />
                </div>
                <h3 className="text-lg font-semibold text-teal-600">
                  Add New Category
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter category name (e.g., Equipment, Software, Travel)"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleAddCategorySubmit();
                      }
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Category names should be unique and descriptive
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <SpecialButton
                  variant="modal-cancel"
                  onClick={() => setIsAddCategoryModalOpen(false)}
                >
                  Cancel
                </SpecialButton>
                <SpecialButton
                  variant="modal-add"
                  onClick={handleAddCategorySubmit}
                >
                  Add Category
                </SpecialButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExpensePage;
