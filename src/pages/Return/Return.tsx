import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../components/Header";
import { returnedProductsData } from "../../data/returnData";

interface ReturnedProduct {
  id: string;
  saleId: string;
  productName: string;
  pluUpc: string;
  sellingPrice: number;
  vendorPrice: number;
  quantity: number;
  returnDate: string;
  reason: string;
  status: "saleable" | "no_saleable" | "scrap";
  customerInfo?: {
    name: string;
    phone: string;
  };
}

interface GroupedReturn {
  saleId: string;
  returnDate: string;
  customerName: string;
  products: ReturnedProduct[];
  totalAmountReturned: number;
}

// Mock product data for selection
const availableProducts = [
  {
    id: "prod-001",
    name: "Samsung Galaxy S24",
    plu: "123456789012",
    price: 899.99,
    vendorPrice: 750.0,
  },
  {
    id: "prod-002",
    name: "Apple iPhone 15 Pro",
    plu: "234567890123",
    price: 1199.99,
    vendorPrice: 950.0,
  },
  {
    id: "prod-003",
    name: "Sony WH-1000XM5 Headphones",
    plu: "345678901234",
    price: 399.99,
    vendorPrice: 280.0,
  },
  {
    id: "prod-004",
    name: "Dell XPS 13 Laptop",
    plu: "456789012345",
    price: 1299.99,
    vendorPrice: 1050.0,
  },
  {
    id: "prod-005",
    name: "Nintendo Switch OLED",
    plu: "567890123456",
    price: 349.99,
    vendorPrice: 280.0,
  },
];

interface AddReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (returnData: any) => void;
  availableProducts: any[];
}

const AddReturnModal: React.FC<AddReturnModalProps> = ({
  isOpen,
  onClose,
  onSave,
  availableProducts,
}) => {
  const [formData, setFormData] = useState({
    selectedProductId: "",
    saleId: "",
    quantity: 1,
    returnDate: new Date().toISOString().split("T")[0],
    reason: "",
    status: "saleable" as "saleable" | "no_saleable" | "scrap",
    customerName: "",
    customerPhone: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const selectedProduct = availableProducts.find(
    (p) => p.id === formData.selectedProductId
  );

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantity" ? parseInt(value) || 1 : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.selectedProductId) {
      newErrors.selectedProductId = "Please select a product";
    }
    if (!formData.saleId.trim()) {
      newErrors.saleId = "Sale ID is required";
    }
    if (formData.quantity < 1) {
      newErrors.quantity = "Quantity must be at least 1";
    }
    if (!formData.returnDate) {
      newErrors.returnDate = "Return date is required";
    }
    if (!formData.reason.trim()) {
      newErrors.reason = "Reason is required";
    }
    if (formData.reason.length > 100) {
      newErrors.reason = "Reason must be 100 characters or less";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm() && selectedProduct) {
      const returnData = {
        saleId: formData.saleId,
        productName: selectedProduct.name,
        pluUpc: selectedProduct.plu,
        sellingPrice: selectedProduct.price,
        vendorPrice: selectedProduct.vendorPrice,
        quantity: formData.quantity,
        returnDate: new Date(formData.returnDate).toISOString(),
        reason: formData.reason,
        status: formData.status,
        customerInfo: formData.customerName
          ? {
              name: formData.customerName,
              phone: formData.customerPhone,
            }
          : undefined,
      };
      onSave(returnData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      selectedProductId: "",
      saleId: "",
      quantity: 1,
      returnDate: new Date().toISOString().split("T")[0],
      reason: "",
      status: "saleable",
      customerName: "",
      customerPhone: "",
    });
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-md overflow-y-auto">
      <div className="absolute inset-0" onClick={handleClose} />
      <div className="relative bg-white rounded-xl shadow-2xl p-6 m-4 mx-auto w-full max-w-2xl my-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#0f4d57]">
            Add Returned Product
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product *
              </label>
              <select
                name="selectedProductId"
                value={formData.selectedProductId}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] ${
                  errors.selectedProductId
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              >
                <option value="">Select a product</option>
                {availableProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - ${product.price} ({product.plu})
                  </option>
                ))}
              </select>
              {errors.selectedProductId && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.selectedProductId}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sale ID *
              </label>
              <input
                type="text"
                name="saleId"
                value={formData.saleId}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] ${
                  errors.saleId ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter sale ID"
              />
              {errors.saleId && (
                <p className="text-red-500 text-xs mt-1">{errors.saleId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity *
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                min="1"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] ${
                  errors.quantity ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.quantity && (
                <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Return Date *
              </label>
              <input
                type="date"
                name="returnDate"
                value={formData.returnDate}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] ${
                  errors.returnDate ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.returnDate && (
                <p className="text-red-500 text-xs mt-1">{errors.returnDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57]"
              >
                <option value="saleable">Saleable</option>
                <option value="no_saleable">No Saleable</option>
                <option value="scrap">Scrap</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57]"
                placeholder="Enter customer name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Phone
              </label>
              <input
                type="tel"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57]"
                placeholder="Enter customer phone"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason * (max 100 characters)
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              rows={3}
              maxLength={100}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] ${
                errors.reason ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter reason for return"
            />
            <div className="flex justify-between items-center mt-1">
              {errors.reason && (
                <p className="text-red-500 text-xs">{errors.reason}</p>
              )}
              <p className="text-gray-400 text-xs ml-auto">
                {formData.reason.length}/100
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#0f4d57] text-white rounded-lg hover:bg-[#0d3f47] transition-colors"
            >
              Add Return
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface SaleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  saleId: string;
  products: ReturnedProduct[];
}

const SaleDetailModal: React.FC<SaleDetailModalProps> = ({
  isOpen,
  onClose,
  saleId,
  products,
}) => {
  if (!isOpen) return null;

  const totalAmount = products.reduce(
    (sum, product) => sum + product.sellingPrice * product.quantity,
    0
  );
  const customerName = products[0]?.customerInfo?.name || "N/A";
  const customerPhone = products[0]?.customerInfo?.phone || "N/A";
  const returnDate = products[0]?.returnDate || "";

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#0f4d57]">
                Sale Details: {saleId}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                View all returned products for this sale
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#0f4d57] text-white rounded-lg hover:bg-[#0d3f47] transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8">
        {/* Sale Summary */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sale Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-600">Customer Name</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">{customerName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Customer Phone</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">{customerPhone}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Return Date</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {new Date(returnDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Amount Returned</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                ${totalAmount.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Returned Products ({products.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PLU/UPC
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Selling Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {product.productName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-blue-600 font-mono">
                        {product.pluUpc}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-semibold">
                        {product.quantity}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-semibold">
                        ${product.sellingPrice.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        ${product.vendorPrice.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-semibold">
                        ${(product.sellingPrice * product.quantity).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.status === "saleable"
                            ? "bg-green-100 text-green-800"
                            : product.status === "no_saleable"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.status === "saleable"
                          ? "Saleable"
                          : product.status === "no_saleable"
                          ? "No Saleable"
                          : "Scrap"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        {product.reason}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Footer */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Total Products: {products.length} | Total Quantity: {products.reduce((sum, p) => sum + p.quantity, 0)}
            </div>
            <div className="text-lg font-semibold text-gray-900">
              Total Amount: ${totalAmount.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Return: React.FC = () => {
  const navigate = useNavigate();
  const { id: storeId } = useParams<{ id: string }>();
  
  const [returnedProducts, setReturnedProducts] =
    useState<ReturnedProduct[]>(returnedProductsData);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "saleable" | "no_saleable" | "scrap">(
    "all"
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Group products by sale ID
  const groupedReturns = returnedProducts.reduce((acc, product) => {
    if (!acc[product.saleId]) {
      acc[product.saleId] = {
        saleId: product.saleId,
        returnDate: product.returnDate,
        customerName: product.customerInfo?.name || "N/A",
        products: [],
        totalAmountReturned: 0,
      };
    }
    acc[product.saleId].products.push(product);
    acc[product.saleId].totalAmountReturned += product.sellingPrice * product.quantity;
    return acc;
  }, {} as Record<string, GroupedReturn>);

  const groupedReturnsArray = Object.values(groupedReturns);

  // Calculate stats
  const totalReturnedItems = returnedProducts.reduce(
    (sum, product) => sum + product.quantity,
    0
  );
  const totalProducts = returnedProducts.length;
  const totalReturnValue = returnedProducts.reduce(
    (sum, product) => sum + product.sellingPrice * product.quantity,
    0
  );
  const totalVendorValue = returnedProducts.reduce(
    (sum, product) => sum + product.vendorPrice * product.quantity,
    0
  );

  // Filter grouped returns
  const filteredGroupedReturns = groupedReturnsArray.filter((groupedReturn) => {
    // Filter by search term
    const matchesSearch = groupedReturn.products.some(product =>
      product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.saleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.pluUpc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      groupedReturn.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Filter by status
    const matchesStatus = statusFilter === "all" || 
      groupedReturn.products.some(product => product.status === statusFilter);
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredGroupedReturns.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentGroupedReturns = filteredGroupedReturns.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAddReturn = (newReturn: any) => {
    const returnData: ReturnedProduct = {
      ...newReturn,
      id: `ret-${Date.now()}`,
    };
    setReturnedProducts((prev) => [...prev, returnData]);
    setIsAddModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Return & Refund
            </h1>
            <p className="text-gray-600">
              Manage returned products and process refunds
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/store/${storeId}/return/create`)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Create Return
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[#0f4d57] hover:bg-[#0d3f47] text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add Return (Modal)
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Returned Items
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {totalReturnedItems.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Sum of all quantities
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m5 5v1a4 4 0 01-4 4H8m0 0l3 3m-3-3l3-3"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Products
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {totalProducts}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Unique products returned
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Return Value
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  ${totalReturnValue.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Based on selling price
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Vendor Value
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  ${totalVendorValue.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Based on vendor price
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Status Filter Buttons */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setStatusFilter("all")}
              className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === "all"
                  ? "bg-[#0f4d57] text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              All Status
              <span
                className={`ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium ${
                  statusFilter === "all"
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                {returnedProducts.length}
              </span>
            </button>
            <button
              onClick={() => setStatusFilter("saleable")}
              className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === "saleable"
                  ? "bg-[#0f4d57] text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Saleable
              <span
                className={`ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium ${
                  statusFilter === "saleable"
                    ? "bg-white/20 text-white"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {returnedProducts.filter((p) => p.status === "saleable").length}
              </span>
            </button>
            <button
              onClick={() => setStatusFilter("no_saleable")}
              className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === "no_saleable"
                  ? "bg-[#0f4d57] text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              No Saleable
              <span
                className={`ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium ${
                  statusFilter === "no_saleable"
                    ? "bg-white/20 text-white"
                    : "bg-orange-100 text-orange-800"
                }`}
              >
                {returnedProducts.filter((p) => p.status === "no_saleable").length}
              </span>
            </button>
            <button
              onClick={() => setStatusFilter("scrap")}
              className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === "scrap"
                  ? "bg-[#0f4d57] text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Scrap
              <span
                className={`ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium ${
                  statusFilter === "scrap"
                    ? "bg-white/20 text-white"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {returnedProducts.filter((p) => p.status === "scrap").length}
              </span>
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search by product name, sale ID, or PLU/UPC..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent w-full sm:w-80"
              />
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="rowsPerPage" className="text-sm text-gray-600">
                Rows per page:
              </label>
              <select
                id="rowsPerPage"
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f4d57]"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sale ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products Count
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Selling Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount Returned
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Refund Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Return Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentGroupedReturns.map((groupedReturn) => {
                  return (
                    <tr 
                      key={groupedReturn.saleId} 
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedSaleId(groupedReturn.saleId);
                        setIsDetailModalOpen(true);
                      }}
                    >
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                        {groupedReturn.saleId}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {groupedReturn.customerName}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <span className="font-medium">{groupedReturn.products.length} products</span>
                          <svg className="w-4 h-4 ml-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Click to view details
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                        ${groupedReturn.products.reduce((sum, product) => sum + product.sellingPrice, 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                        ${groupedReturn.totalAmountReturned.toFixed(2)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Cash Refund
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(groupedReturn.returnDate).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <p className="text-sm text-gray-700">
                    Showing {startIndex + 1} to{" "}
                    {Math.min(endIndex, filteredGroupedReturns.length)} of{" "}
                    {filteredGroupedReturns.length} results
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? "z-10 bg-[#0f4d57] border-[#0f4d57] text-white"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {filteredGroupedReturns.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m5 5v1a4 4 0 01-4 4H8m0 0l3 3m-3-3l3-3"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No returned products
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== "all"
                ? "No products match your current filters."
                : "No products have been returned yet."}
            </p>
          </div>
        )}
      </div>

      {/* Add Return Modal */}
      {isAddModalOpen && (
        <AddReturnModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddReturn}
          availableProducts={availableProducts}
        />
      )}

      {/* Sale Detail Modal */}
      {isDetailModalOpen && selectedSaleId && (
        <SaleDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedSaleId(null);
          }}
          saleId={selectedSaleId}
          products={groupedReturns[selectedSaleId]?.products || []}
        />
      )}
    </div>
  );
};

export default Return;
