import React, { useState, useMemo } from "react";

const Inventory: React.FC = () => {
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [groupBy, setGroupBy] = useState("");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const products = [
    {
      name: "Premium Coffee Beans",
      quantity: 150,
      plu: "PLU001",
      sku: "SKU-CF-001",
      description: "High-quality arabica coffee beans sourced from...",
      price: "$24.99",
      category: "BEVERAGES",
      itemsPerUnit: 1,
    },
    {
      name: "Organic Milk",
      quantity: 75,
      plu: "PLU002",
      sku: "SKU-ML-002",
      description: "Fresh organic whole milk, 1 gallon",
      price: "$5.49",
      category: "DAIRY",
      itemsPerUnit: 1,
    },
    {
      name: "Artisan Bread",
      quantity: 25,
      plu: "PLU003",
      sku: "SKU-BR-003",
      description: "Freshly baked sourdough bread",
      price: "$7.99",
      category: "BAKERY",
      itemsPerUnit: 1,
    },
    {
      name: "Seasonal Fruits Mix",
      quantity: 200,
      plu: "PLU004",
      sku: "SKU-FR-004",
      description: "Mixed seasonal fruits including apples, oranges...",
      price: "$12.99",
      category: "PRODUCE",
      itemsPerUnit: 5,
    },
    {
      name: "Gourmet Cheese",
      quantity: 30,
      plu: "PLU005",
      sku: "SKU-CH-005",
      description: "Aged cheddar cheese, premium quality",
      price: "$18.99",
      category: "DAIRY",
      itemsPerUnit: 1,
    },
    {
      name: "Fresh Pasta",
      quantity: 80,
      plu: "PLU006",
      sku: "SKU-PA-006",
      description: "Homemade fresh pasta, various shapes available",
      price: "$9.99",
      category: "PASTA",
      itemsPerUnit: 1,
    },
    {
      name: "Organic Spinach",
      quantity: 120,
      plu: "PLU007",
      sku: "SKU-SP-007",
      description: "Fresh organic spinach leaves, 5oz bag",
      price: "$3.49",
      category: "PRODUCE",
      itemsPerUnit: 1,
    },
    {
      name: "Premium Olive Oil",
      quantity: 45,
      plu: "PLU008",
      sku: "SKU-OL-008",
      description: "Extra virgin olive oil, 500ml bottle",
      price: "$15.99",
      category: "CONDIMENTS",
      itemsPerUnit: 1,
    },
    {
      name: "Vanilla Ice Cream",
      quantity: 60,
      plu: "PLU009",
      sku: "SKU-IC-009",
      description: "Premium vanilla ice cream, 1 pint",
      price: "$6.99",
      category: "FROZEN",
      itemsPerUnit: 1,
    },
    {
      name: "Whole Grain Cereal",
      quantity: 90,
      plu: "PLU010",
      sku: "SKU-CE-010",
      description: "Healthy whole grain breakfast cereal",
      price: "$8.49",
      category: "BREAKFAST",
      itemsPerUnit: 1,
    },
    {
      name: "Wild Salmon Fillet",
      quantity: 25,
      plu: "PLU011",
      sku: "SKU-SA-011",
      description: "Fresh wild-caught salmon fillet, per lb",
      price: "$22.99",
      category: "SEAFOOD",
      itemsPerUnit: 1,
    },
    {
      name: "Greek Yogurt",
      quantity: 110,
      plu: "PLU012",
      sku: "SKU-YO-012",
      description: "Thick and creamy Greek yogurt, 32oz",
      price: "$7.99",
      category: "DAIRY",
      itemsPerUnit: 1,
    },
  ]; // Filter products based on search term and group by category
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.plu.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply group by filter
    if (groupBy) {
      filtered = filtered.filter((product) => product.category === groupBy);
    }

    // Apply sorting
    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof typeof a];
        const bValue = b[sortConfig.key as keyof typeof b];

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortConfig.direction === "asc"
            ? aValue - bValue
            : bValue - aValue;
        }

        return 0;
      });
    }

    return filtered;
  }, [products, searchTerm, groupBy, sortConfig]);

  // Get unique categories for the group by dropdown
  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(products.map((product) => product.category)),
    ];
    return uniqueCategories.sort();
  }, [products]);

  // Calculate pagination
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1); // Reset to first page when changing rows per page
  };
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };
  const handleGroupByChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setGroupBy(event.target.value);
    setCurrentPage(1); // Reset to first page when changing group by
  };

  // Sorting function
  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Checkbox handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = currentProducts.map((_, index) => startIndex + index);
      setSelectedItems(allIds);
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (index: number, checked: boolean) => {
    const actualIndex = startIndex + index;
    if (checked) {
      setSelectedItems([...selectedItems, actualIndex]);
    } else {
      setSelectedItems(selectedItems.filter((id) => id !== actualIndex));
    }
  };
  return (
    <div className="p-4 sm:p-6 bg-white min-h-screen">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 lg:mb-6 space-y-4 lg:space-y-0">
        <h1 className="text-xl sm:text-2xl font-bold text-[#0f4d57]">
          Inventory Management
        </h1>{" "}
        <div className="flex flex-wrap gap-2 sm:gap-4">
          <button className="bg-[#0f4d57] text-white px-3 py-2 sm:px-4 sm:py-2 rounded-xl shadow-md text-sm sm:text-base">
            + Create Inventory
          </button>
          <button className="bg-[#0f4d57] text-white px-3 py-2 sm:px-4 sm:py-2 rounded-xl shadow-md text-sm sm:text-base">
            Update Inventory
          </button>
          <button className="bg-[#0f4d57] text-white px-3 py-2 sm:px-4 sm:py-2 rounded-xl shadow-md text-sm sm:text-base">
            Delete Inventory
          </button>
          <button className="bg-[#0f4d57] text-white px-3 py-2 sm:px-4 sm:py-2 rounded-xl shadow-md text-sm sm:text-base">
            Upload Inventory
          </button>
        </div>
      </div>
      {/* Horizontal line */}
      <hr className="border-gray-300 mb-6" /> {/* Inventory Items Section */}
      <div className="border border-gray-300 px-4 sm:px-6 lg:px-10 py-4 sm:py-5 rounded-lg rounded-b-none border-b-0">
        <h2 className="text-base sm:text-lg font-semibold mb-4">
          Inventory Items
        </h2>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <input
            type="text"
            placeholder="Search inventory..."
            className="border border-gray-300 rounded px-4 py-2 w-full lg:w-80"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 lg:space-x-6 w-full lg:w-auto">
            <div className="flex items-center space-x-2">
              <span className="text-sm sm:text-base whitespace-nowrap">
                Group By:
              </span>
              <select
                className="border border-gray-300 rounded px-2 py-1 text-sm sm:text-base"
                value={groupBy}
                onChange={handleGroupByChange}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm sm:text-base whitespace-nowrap">
                Rows per page:
              </span>
              <select
                className="border border-gray-300 rounded px-2 py-1 text-sm sm:text-base"
                value={rowsPerPage}
                onChange={(e) =>
                  handleRowsPerPageChange(Number(e.target.value))
                }
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>{" "}
      </div>
      <div className="border border-gray-300 px-4 sm:px-6 lg:px-10 py-4 sm:py-5 rounded-lg rounded-t-none">
        {/* Mobile Card View */}
        <div className="block lg:hidden">
          {currentProducts.length > 0 ? (
            <div className="space-y-4">
              {currentProducts.map((product, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {product.name}
                    </h3>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {product.category}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div>
                      <span className="font-medium">Quantity:</span>{" "}
                      {product.quantity}
                    </div>
                    <div>
                      <span className="font-medium">Price:</span>{" "}
                      {product.price}
                    </div>
                    <div>
                      <span className="font-medium">PLU:</span> {product.plu}
                    </div>
                    <div>
                      <span className="font-medium">SKU:</span> {product.sku}
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">Items/Unit:</span>{" "}
                      {product.itemsPerUnit}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    <span className="font-medium">Description:</span>{" "}
                    {product.description}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No products found matching your search criteria.{" "}
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="table-auto w-full bg-white rounded-lg border-separate border-spacing-0 border border-gray-300 overflow-hidden">
            <thead>
              <tr className="text-left">
                <th className="px-4 py-2 font-medium border-b border-r border-gray-300 text-sm">
                  <input
                    type="checkbox"
                    checked={
                      currentProducts.length > 0 &&
                      selectedItems.length === currentProducts.length
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded"
                  />
                </th>
                <th
                  className="px-4 py-2 font-medium border-b border-r border-gray-300 text-sm cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center justify-between">
                    Product Name
                    <div className="flex flex-col">
                      <span
                        className={`text-xs ${sortConfig?.key === "name" && sortConfig.direction === "asc" ? "text-blue-600" : "text-gray-400"}`}
                      >
                        ▲
                      </span>
                      <span
                        className={`text-xs ${sortConfig?.key === "name" && sortConfig.direction === "desc" ? "text-blue-600" : "text-gray-400"}`}
                      >
                        ▼
                      </span>
                    </div>
                  </div>
                </th>
                <th
                  className="px-4 py-2 font-medium border-b border-r border-gray-300 text-sm cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("quantity")}
                >
                  <div className="flex items-center justify-between">
                    Quantity
                    <div className="flex flex-col">
                      <span
                        className={`text-xs ${sortConfig?.key === "quantity" && sortConfig.direction === "asc" ? "text-blue-600" : "text-gray-400"}`}
                      >
                        ▲
                      </span>
                      <span
                        className={`text-xs ${sortConfig?.key === "quantity" && sortConfig.direction === "desc" ? "text-blue-600" : "text-gray-400"}`}
                      >
                        ▼
                      </span>
                    </div>
                  </div>
                </th>
                <th
                  className="px-4 py-2 font-medium border-b border-r border-gray-300 text-sm cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("plu")}
                >
                  <div className="flex items-center justify-between">
                    PLU
                    <div className="flex flex-col">
                      <span
                        className={`text-xs ${sortConfig?.key === "plu" && sortConfig.direction === "asc" ? "text-blue-600" : "text-gray-400"}`}
                      >
                        ▲
                      </span>
                      <span
                        className={`text-xs ${sortConfig?.key === "plu" && sortConfig.direction === "desc" ? "text-blue-600" : "text-gray-400"}`}
                      >
                        ▼
                      </span>
                    </div>
                  </div>
                </th>
                <th
                  className="px-4 py-2 font-medium border-b border-r border-gray-300 text-sm cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("sku")}
                >
                  <div className="flex items-center justify-between">
                    SKU
                    <div className="flex flex-col">
                      <span
                        className={`text-xs ${sortConfig?.key === "sku" && sortConfig.direction === "asc" ? "text-blue-600" : "text-gray-400"}`}
                      >
                        ▲
                      </span>
                      <span
                        className={`text-xs ${sortConfig?.key === "sku" && sortConfig.direction === "desc" ? "text-blue-600" : "text-gray-400"}`}
                      >
                        ▼
                      </span>
                    </div>
                  </div>
                </th>
                <th className="px-4 py-2 font-medium border-b border-r border-gray-300 text-sm">
                  Description
                </th>
                <th
                  className="px-4 py-2 font-medium border-b border-r border-gray-300 text-sm cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("price")}
                >
                  <div className="flex items-center justify-between">
                    Price
                    <div className="flex flex-col">
                      <span
                        className={`text-xs ${sortConfig?.key === "price" && sortConfig.direction === "asc" ? "text-blue-600" : "text-gray-400"}`}
                      >
                        ▲
                      </span>
                      <span
                        className={`text-xs ${sortConfig?.key === "price" && sortConfig.direction === "desc" ? "text-blue-600" : "text-gray-400"}`}
                      >
                        ▼
                      </span>
                    </div>
                  </div>
                </th>
                <th
                  className="px-4 py-2 font-medium border-b border-r border-gray-300 text-sm cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("category")}
                >
                  <div className="flex items-center justify-between">
                    MSA Category
                    <div className="flex flex-col">
                      <span
                        className={`text-xs ${sortConfig?.key === "category" && sortConfig.direction === "asc" ? "text-blue-600" : "text-gray-400"}`}
                      >
                        ▲
                      </span>
                      <span
                        className={`text-xs ${sortConfig?.key === "category" && sortConfig.direction === "desc" ? "text-blue-600" : "text-gray-400"}`}
                      >
                        ▼
                      </span>
                    </div>
                  </div>
                </th>
                <th
                  className="px-4 py-2 font-medium border-b border-gray-300 text-sm cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("itemsPerUnit")}
                >
                  <div className="flex items-center justify-between">
                    Items/Unit
                    <div className="flex flex-col">
                      <span
                        className={`text-xs ${sortConfig?.key === "itemsPerUnit" && sortConfig.direction === "asc" ? "text-blue-600" : "text-gray-400"}`}
                      >
                        ▲
                      </span>
                      <span
                        className={`text-xs ${sortConfig?.key === "itemsPerUnit" && sortConfig.direction === "desc" ? "text-blue-600" : "text-gray-400"}`}
                      >
                        ▼
                      </span>
                    </div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.length > 0 ? (
                currentProducts.map((product, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 border-b border-r border-gray-300 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(startIndex + index)}
                        onChange={(e) =>
                          handleSelectItem(index, e.target.checked)
                        }
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-2 border-b border-r border-gray-300 text-sm">
                      {product.name}
                    </td>
                    <td className="px-4 py-2 border-b border-r border-gray-300 text-sm">
                      {product.quantity}
                    </td>
                    <td className="px-4 py-2 border-b border-r border-gray-300 text-sm text-blue-600">
                      {product.plu}
                    </td>
                    <td className="px-4 py-2 border-b border-r border-gray-300 text-sm text-blue-600">
                      {product.sku}
                    </td>
                    <td className="px-4 py-2 border-b border-r border-gray-300 text-sm">
                      {product.description}
                    </td>
                    <td className="px-4 py-2 border-b border-r border-gray-300 text-sm">
                      {product.price}
                    </td>
                    <td className="px-4 py-2 border-b border-r border-gray-300 text-sm">
                      {product.category}
                    </td>
                    <td className="px-4 py-2 border-b border-gray-300 text-sm">
                      {product.itemsPerUnit}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-8 text-center text-gray-500 border-b border-gray-300"
                  >
                    No products found matching your search criteria.
                  </td>
                </tr>
              )}{" "}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 space-y-4 sm:space-y-0">
          <span className="text-sm sm:text-base text-gray-600">
            Showing {totalItems === 0 ? 0 : startIndex + 1} to{" "}
            {Math.min(endIndex, totalItems)} of {totalItems} results
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              className={`px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded text-sm sm:text-base ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white hover:bg-gray-50"
              }`}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            {/* Page numbers */}
            <div className="flex flex-wrap gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNumber) => {
                  // Show first page, last page, current page, and pages around current page
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 &&
                      pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        className={`px-2 py-2 sm:px-3 sm:py-2 border border-gray-300 rounded text-sm sm:text-base ${
                          currentPage === pageNumber
                            ? "bg-[#0f4d57] text-white"
                            : "bg-white hover:bg-gray-50"
                        }`}
                        onClick={() => handlePageChange(pageNumber)}
                      >
                        {pageNumber}
                      </button>
                    );
                  } else if (
                    pageNumber === currentPage - 2 ||
                    pageNumber === currentPage + 2
                  ) {
                    return (
                      <span
                        key={pageNumber}
                        className="px-1 sm:px-2 text-sm sm:text-base"
                      >
                        ...
                      </span>
                    );
                  }
                  return null;
                }
              )}
            </div>

            <button
              className={`px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded text-sm sm:text-base ${
                currentPage === totalPages || totalPages === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white hover:bg-gray-50"
              }`}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
