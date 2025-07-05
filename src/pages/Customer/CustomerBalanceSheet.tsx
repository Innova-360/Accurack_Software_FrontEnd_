import React, { useState, useEffect } from "react";
import { useNavigate, useParams} from "react-router-dom";
import {
  FaArrowLeft,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaSearch,
  FaDollarSign,
  FaChartLine,
  FaFileInvoiceDollar,
} from "react-icons/fa";
import Header from "../../components/Header";
import { SpecialButton, IconButton } from "../../components/buttons";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchCustomerBalance, clearCustomerBalance } from "../../store/slices/customerSlice";
import type {  BalanceHistoryItem } from "../../types/customer";



const CustomerBalanceSheet: React.FC = () => {
  const navigate = useNavigate();
  const { id: storeId, customerId } = useParams<{ id: string; customerId: string }>();
  // const location = useLocation();
  // const customer = location.state?.customer as Customer;
  const dispatch = useAppDispatch();

  const { balance } = useAppSelector((state) => state.customers);
  const { balanceData, loading, error } = balance;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDateRange, setSelectedDateRange] = useState("last30days");
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    if (customerId) {
      dispatch(fetchCustomerBalance(customerId));
    }
    return () => {
      dispatch(clearCustomerBalance());
    };
  }, [dispatch, customerId]);

  const filteredPayments = (balanceData?.balanceHistory || []).filter((payment: BalanceHistoryItem) => {
    const matchesSearch = payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || payment.paymentStatus.toLowerCase() === selectedStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleBack = () => {
    navigate(`/store/${storeId}/customer`);
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'UNPAID': return 'bg-red-100 text-red-800';
      case 'PARTIALLY_PAID': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0f4d57] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading balance sheet...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600">Error Loading Balance Sheet</h2>
            <p className="mt-2 text-gray-600">{error}</p>
            <SpecialButton onClick={handleBack} variant="primary" className="mt-4">
              Back to Customers
            </SpecialButton>
          </div>
        </div>
      </div>
    );
  }

  if (!balanceData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">No balance data found</h2>
            <p className="mt-2 text-gray-600">Please return to the customer list and try again.</p>
            <SpecialButton onClick={handleBack} variant="primary" className="mt-4">
              Back to Customers
            </SpecialButton>
          </div>
        </div>
      </div>
    );
  }

  const customerInfo = balanceData.customer;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <IconButton
            icon={<FaArrowLeft size={16} />}
            onClick={handleBack}
            variant="outline"
            className="text-gray-600 hover:text-gray-800"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customer Balance Sheet</h1>
            <p className="text-gray-600">View detailed payment history and balance information</p>
          </div>
        </div>

        {/* Customer Info Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-[#0f4d57] flex items-center justify-center">
                <span className="text-xl font-medium text-white">
                  {customerInfo.customerName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{customerInfo.customerName}</h2>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <FaPhone size={12} />
                    <span>{customerInfo.phoneNumber}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaEnvelope size={12} />
                    <span>{customerInfo.customerMail}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
                  <FaMapMarkerAlt size={12} />
                  <span className="line-clamp-1">{customerInfo.customerAddress}</span>
                </div>
              </div>
            </div>
            {/* <div className="flex gap-2">
              <SpecialButton variant="secondary" className="flex items-center gap-2">
                <FaDownload size={14} />
                Export
              </SpecialButton>
              <SpecialButton variant="primary" className="flex items-center gap-2">
                <FaFileInvoiceDollar size={14} />
                Send Statement
              </SpecialButton>
            </div> */}
          </div>
        </div>

        {/* Balance Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Due Balance</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(balanceData.currentBalance)}</p>
                <p className="text-xs text-gray-500 mt-1">Outstanding Amount</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <FaDollarSign className="text-red-600" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Paid</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(balanceData.totalPaid)}</p>
                <p className="text-xs text-gray-500 mt-1">All Time</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FaChartLine className="text-green-600" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-blue-600">{balanceData.balanceHistory.length}</p>
                <p className="text-xs text-gray-500 mt-1">All Records</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaFileInvoiceDollar className="text-blue-600" size={20} />
              </div>
            </div>
          </div>
        </div>



        {/* Payment History */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
              {/* <SpecialButton variant="primary" className="flex items-center gap-2">
                <FaFileInvoiceDollar size={14} />
                Add Payment
              </SpecialButton> */}
            </div>
          </div>

          {/* Filters */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  placeholder="Search by payment ID or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                />
              </div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="partially_paid">Partially Paid</option>
              </select>
              <select
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="last30days">Last 30 Days</option>
                <option value="last90days">Last 90 Days</option>
                <option value="thisyear">This Year</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>

          {/* Payment Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount Paid
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Remaining Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>*/}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.saleId || payment.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(payment.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate" title={payment.description}>
                        {payment.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="text-green-600">
                        {formatCurrency(payment.amountPaid)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <span className="text-red-600">
                        {formatCurrency(payment.remainingAmount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.paymentStatus)}`}
                      >
                        {payment.paymentStatus}
                      </span>
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <SpecialButton variant="action-view" className="text-blue-600 hover:text-blue-800">
                        View
                      </SpecialButton>
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPayments.length === 0 && (
            <div className="text-center py-12">
              <FaFileInvoiceDollar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No payment records found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? "Try adjusting your search terms." : "No payment history available for this customer."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerBalanceSheet;
