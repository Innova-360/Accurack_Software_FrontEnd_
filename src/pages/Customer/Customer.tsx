import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaUsers,
  FaPlus,
  FaSearch,
  FaFilter,
  FaEdit,
  FaTrash,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaChevronLeft,
  FaChevronRight,
  FaFileInvoiceDollar,
} from "react-icons/fa";
import Header from "../../components/Header";
import { SpecialButton, IconButton } from "../../components/buttons";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchCustomers,
  deleteCustomer,
  deleteAllCustomers,
  setPage,
  clearError,
} from "../../store/slices/customerSlice";
import { selectCurrentStore } from "../../store/selectors";
import type { Customer } from "../../types/customer";

const CustomerPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id: storeId } = useParams<{ id: string }>();
  
  const currentStore = useAppSelector(selectCurrentStore);
  const {
    customers,
    loading,
    error,
    pagination,
  } = useAppSelector((state) => state.customers);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);

  // Hardcoded customers for display (while keeping API functionality)
  const hardcodedCustomers: Customer[] = [
    {
      id: "hardcoded-1",
      customerName: "John Smith",
      customerMail: "john.smith@email.com",
      phoneNumber: "+1-555-0123",
      telephoneNumber: "+1-555-0124",
      customerAddress: "123 Main St, New York, NY, 10001, USA",
      storeId: storeId || "",
      clientId: "demo-client",
      createdAt: "2024-12-01T10:00:00Z",
      updatedAt: "2024-12-01T10:00:00Z"
    },
    {
      id: "hardcoded-2",
      customerName: "Sarah Johnson",
      customerMail: "sarah.johnson@email.com",
      phoneNumber: "+1-555-0125",
      telephoneNumber: "",
      customerAddress: "456 Oak Ave, Los Angeles, CA, 90210, USA",
      storeId: storeId || "",
      clientId: "demo-client",
      createdAt: "2024-12-02T14:30:00Z",
      updatedAt: "2024-12-02T14:30:00Z"
    },
    {
      id: "hardcoded-3",
      customerName: "Michael Brown",
      customerMail: "michael.brown@email.com",
      phoneNumber: "+1-555-0126",
      telephoneNumber: "+1-555-0127",
      customerAddress: "789 Pine Rd, Chicago, IL, 60601, USA",
      storeId: storeId || "",
      clientId: "demo-client",
      createdAt: "2024-12-03T09:15:00Z",
      updatedAt: "2024-12-03T09:15:00Z"
    },
    {
      id: "hardcoded-4",
      customerName: "Emily Davis",
      customerMail: "emily.davis@email.com",
      phoneNumber: "+1-555-0128",
      telephoneNumber: "",
      customerAddress: "321 Elm St, Houston, TX, 77001, USA",
      storeId: storeId || "",
      clientId: "demo-client",
      createdAt: "2024-12-04T16:45:00Z",
      updatedAt: "2024-12-04T16:45:00Z"
    },
    {
      id: "hardcoded-5",
      customerName: "David Wilson",
      customerMail: "david.wilson@email.com",
      phoneNumber: "+1-555-0129",
      telephoneNumber: "+1-555-0130",
      customerAddress: "654 Maple Dr, Phoenix, AZ, 85001, USA",
      storeId: storeId || "",
      clientId: "demo-client",
      createdAt: "2024-12-05T11:20:00Z",
      updatedAt: "2024-12-05T11:20:00Z"
    }
  ];

  useEffect(() => {
    if (storeId) {
      dispatch(fetchCustomers({ storeId, page: pagination.page, limit: pagination.limit }));
    }
  }, [dispatch, storeId, pagination.page, pagination.limit]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const filteredCustomers = [...customers, ...hardcodedCustomers].filter(
    (customer) =>
      customer.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.customerMail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phoneNumber.includes(searchTerm) ||
      customer.customerAddress.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCustomer = () => {
    navigate(`/store/${storeId}/customer/create`);
  };

  const handleEditCustomer = (customer: Customer) => {
    navigate(`/store/${storeId}/customer/edit/${customer.id}`, { state: { customer } });
  };


  const handleViewBalanceSheet = (customer: Customer) => {
    navigate(`/store/${storeId}/customer/balance/${customer.id}`, { state: { customer } });
  };

  const handleDeleteCustomer = (customer: Customer) => {
    setCustomerToDelete(customer);
    setShowDeleteModal(true);
  };

  const confirmDeleteCustomer = async () => {
    if (customerToDelete && storeId) {
      try {
        await dispatch(deleteCustomer({ id: customerToDelete.id, storeId })).unwrap();
        toast.success("Customer deleted successfully");
        setShowDeleteModal(false);
        setCustomerToDelete(null);
      } catch (error: any) {
        toast.error(error || "Failed to delete customer");
      }
    }
  };

  const handleDeleteAllCustomers = () => {
    if (filteredCustomers.length === 0) {
      toast.error("No customers to delete");
      return;
    }
    setShowDeleteAllModal(true);
  };

  const confirmDeleteAllCustomers = async () => {
    if (storeId) {
      try {
        await dispatch(deleteAllCustomers(storeId)).unwrap();
        toast.success("All customers deleted successfully");
        setShowDeleteAllModal(false);
        setSelectedCustomers([]);
      } catch (error: any) {
        toast.error(error || "Failed to delete all customers");
      }
    }
  };

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomers((prev) =>
      prev.includes(customerId)
        ? prev.filter((id) => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSelectAllCustomers = () => {
    if (selectedCustomers.length === filteredCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(filteredCustomers.map((customer) => customer.id));
    }
  };

  const handlePageChange = (newPage: number) => {
    dispatch(setPage(newPage));
  };

  const renderPagination = () => {
    const { page, totalPages } = pagination;
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-2 py-2 sm:px-3 sm:py-2 mx-0.5 sm:mx-1 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
            i === page
              ? "bg-[#0f4d57] text-white"
              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-6 gap-4">
        <div className="text-sm text-gray-700 text-center sm:text-left">
          Showing {Math.min((page - 1) * pagination.limit + 1, pagination.total)} to{" "}
          {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} customers
        </div>
        <div className="flex items-center justify-center space-x-1 sm:space-x-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaChevronLeft size={12} className="sm:hidden" />
            <FaChevronLeft size={14} className="hidden sm:block" />
          </button>
          <div className="flex space-x-1">
            {pages}
          </div>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaChevronRight size={12} className="sm:hidden" />
            <FaChevronRight size={14} className="hidden sm:block" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#0f4d57] rounded-lg">
              <FaUsers className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Customer Management</h1>
              <p className="text-sm sm:text-base text-gray-600">
                Manage your customers for {currentStore?.name || "your store"}
              </p>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col gap-4">
            {/* Search and Filter Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap">
                <FaFilter size={16} />
                <span className="hidden sm:inline">Filter</span>
              </button>
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
              {selectedCustomers.length > 0 && (
                <button
                  onClick={handleDeleteAllCustomers}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                >
                  <FaTrash size={16} />
                  <span className="hidden sm:inline">Delete Selected ({selectedCustomers.length})</span>
                  <span className="sm:hidden">Delete ({selectedCustomers.length})</span>
                </button>
              )}
              <SpecialButton
                onClick={handleCreateCustomer}
                variant="primary"
                className="flex items-center justify-center gap-2 px-4 py-2"
              >
                <FaPlus size={16} />
                <span className="hidden sm:inline">Add Customer</span>
                <span className="sm:hidden">Add</span>
              </SpecialButton>
            </div>
          </div>
        </div>

        {/* Customer Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{customers.length + hardcodedCustomers.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaUsers className="text-blue-600" size={20} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Customers</p>
                <p className="text-2xl font-bold text-gray-900">{customers.length + hardcodedCustomers.length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FaUsers className="text-green-600" size={20} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {[...customers, ...hardcodedCustomers].filter(c => new Date(c.createdAt || '').getMonth() === new Date().getMonth()).length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <FaUsers className="text-purple-600" size={20} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Search Results</p>
                <p className="text-2xl font-bold text-gray-900">{filteredCustomers.length}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <FaSearch className="text-orange-600" size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Customer Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Customers</h3>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                  onChange={handleSelectAllCustomers}
                  className="rounded border-gray-300 text-teal-500 focus:ring-teal-500"
                />
                <span className="text-sm text-gray-600">Select All</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0f4d57]"></div>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <FaUsers className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? "Try adjusting your search terms." : "Get started by creating a new customer."}
              </p>
              {!searchTerm && (
                <div className="mt-6">
                  <SpecialButton onClick={handleCreateCustomer} variant="primary" className="inline-flex items-center gap-2">
                    <FaPlus size={16} />
                    Add Customer
                  </SpecialButton>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full py-2 align-middle">
                <div className="overflow-hidden shadow sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Select
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Address
                        </th>
                        <th className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredCustomers.map((customer) => (
                        <tr key={customer.id} className="hover:bg-gray-50">
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedCustomers.includes(customer.id)}
                              onChange={() => handleSelectCustomer(customer.id)}
                              className="rounded border-gray-300 text-teal-500 focus:ring-teal-500"
                            />
                          </td>
                          <td className="px-3 sm:px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-[#0f4d57] flex items-center justify-center">
                                  <span className="text-xs sm:text-sm font-medium text-white">
                                    {customer.customerName.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-3 sm:ml-4">
                                <div 
                                  className="text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none cursor-pointer hover:text-[#0f4d57] hover:underline"
                                  onClick={() => handleViewBalanceSheet(customer)}
                                  title="Click to view balance sheet"
                                >
                                  {customer.customerName}
                                </div>
                                <div className="text-xs sm:text-sm text-gray-500 truncate">ID: {customer.id}</div>
                                {/* Show contact info on mobile when contact column is hidden */}
                                <div className="md:hidden mt-1">
                                  <div className="text-xs text-gray-600 flex items-center gap-1">
                                    <FaPhone size={10} className="text-gray-400" />
                                    <span className="truncate">{customer.phoneNumber}</span>
                                  </div>
                                  <div className="text-xs text-gray-600 flex items-center gap-1">
                                    <FaEnvelope size={10} className="text-gray-400" />
                                    <span className="truncate">{customer.customerMail}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="hidden md:table-cell px-3 sm:px-6 py-4">
                            <div className="text-sm text-gray-900">
                              <div className="flex items-center gap-1 mb-1">
                                <FaPhone size={12} className="text-gray-400" />
                                <span>{customer.phoneNumber}</span>
                              </div>
                              {customer.telephoneNumber && (
                                <div className="flex items-center gap-1 mb-1">
                                  <FaPhone size={12} className="text-gray-400" />
                                  <span>{customer.telephoneNumber}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <FaEnvelope size={12} className="text-gray-400" />
                                <span className="truncate max-w-[200px]">{customer.customerMail}</span>
                              </div>
                            </div>
                          </td>
                          <td className="hidden lg:table-cell px-3 sm:px-6 py-4">
                            <div className="text-sm text-gray-900 flex items-start gap-1">
                              <FaMapMarkerAlt size={12} className="text-gray-400 mt-1 flex-shrink-0" />
                              <span className="line-clamp-2 max-w-[200px]">{customer.customerAddress}</span>
                            </div>
                          </td>
                          <td className="hidden sm:table-cell px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-1 sm:gap-2">
                              <IconButton
                                icon={<FaFileInvoiceDollar size={14} />}
                                onClick={() => handleViewBalanceSheet(customer)}
                                variant="outline"
                                size="sm"
                                className="text-purple-600 hover:text-purple-800 p-1 sm:p-2"
                                title="View Balance Sheet"
                              />
                              <IconButton
                                icon={<FaEdit size={14} />}
                                onClick={() => handleEditCustomer(customer)}
                                variant="outline"
                                size="sm"
                                className="text-green-600 hover:text-green-800 p-1 sm:p-2"
                              />
                              <IconButton
                                icon={<FaTrash size={14} />}
                                onClick={() => handleDeleteCustomer(customer)}
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-800 p-1 sm:p-2"
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Pagination */}
          {filteredCustomers.length > 0 && renderPagination()}
        </div>
      </div>

      {/* Delete Customer Modal */}
      {showDeleteModal && customerToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <FaTrash className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-2">Delete Customer</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete "{customerToDelete.customerName}"? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-4 px-4 py-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteCustomer}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Customers Modal */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <FaTrash className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-2">Delete All Customers</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete all customers? This action will permanently remove all customer data and cannot be undone.
                </p>
              </div>
              <div className="flex gap-4 px-4 py-3">
                <button
                  onClick={() => setShowDeleteAllModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteAllCustomers}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPage;
