import React, { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  FaArrowLeft,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaDownload,
  FaSearch,
  FaDollarSign,
  FaChartLine,
  FaFileInvoiceDollar,
  FaClock
} from "react-icons/fa";
import Header from "../../components/Header";
import { SpecialButton, IconButton } from "../../components/buttons";
import type { Customer } from "../../types/customer";

interface PaymentRecord {
  id: string;
  paymentId: string;
  date: string;
  description: string;
  amount: number;
  balance: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  type: 'Debit' | 'Credit';
}

const CustomerBalanceSheet: React.FC = () => {
  const navigate = useNavigate();
  const { id: storeId } = useParams<{ id: string; customerId: string }>();
  const location = useLocation();
  const customer = location.state?.customer as Customer;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDateRange, setSelectedDateRange] = useState("last30days");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Mock data for the balance sheet
  const balanceData = {
    totalBalance: 14325.50,
    totalPaid: 2845.75,
    creditLimit: 5000.00,
    availableCredit: 2154.25,
    lastPayment: new Date('2024-12-15'),
    nextDue: new Date('2024-12-30')
  };

  const paymentHistory: PaymentRecord[] = [
    {
      id: "1",
      paymentId: "PAY-001",
      date: "2024-12-15",
      description: "Invoice Payment - INV-2024-001",
      amount: 1250.00,
      balance: 14325.50,
      status: "Paid",
      type: "Credit"
    },
    {
      id: "2",
      paymentId: "PAY-002",
      date: "2024-12-10",
      description: "Product Purchase - Store Credit",
      amount: 850.25,
      balance: 15575.50,
      status: "Paid",
      type: "Debit"
    },
    {
      id: "3",
      paymentId: "PAY-003",
      date: "2024-12-05",
      description: "Refund - Return Item",
      amount: 125.00,
      balance: 14725.25,
      status: "Paid",
      type: "Credit"
    },
    {
      id: "4",
      paymentId: "PAY-004",
      date: "2024-11-28",
      description: "Invoice Payment - INV-2024-002",
      amount: 2100.50,
      balance: 14850.25,
      status: "Pending",
      type: "Debit"
    },
    {
      id: "5",
      paymentId: "PAY-005",
      date: "2024-11-20",
      description: "Late Fee Charges",
      amount: 45.00,
      balance: 16950.75,
      status: "Overdue",
      type: "Debit"
    }
  ];

  // Chart data for payment analytics
  const chartData = [
    { month: 'Jan', amount: 1200, remaining: 4800 },
    { month: 'Feb', amount: 1800, remaining: 3200 },
    { month: 'Mar', amount: 2200, remaining: 2800 },
    { month: 'Apr', amount: 1600, remaining: 3400 },
    { month: 'May', amount: 2400, remaining: 2600 },
    { month: 'Jun', amount: 1900, remaining: 3100 },
    { month: 'Jul', amount: 2100, remaining: 2900 }
  ];

  const filteredPayments = paymentHistory.filter(payment => {
    const matchesSearch = payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.paymentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || payment.status.toLowerCase() === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleBack = () => {
    navigate(`/store/${storeId}/customer`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
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

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Customer not found</h2>
            <p className="mt-2 text-gray-600">Please return to the customer list and try again.</p>
            <SpecialButton onClick={handleBack} variant="primary" className="mt-4">
              Back to Customers
            </SpecialButton>
          </div>
        </div>
      </div>
    );
  }

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
                  {customer.customerName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{customer.customerName}</h2>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <FaPhone size={12} />
                    <span>{customer.phoneNumber}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaEnvelope size={12} />
                    <span>{customer.customerMail}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
                  <FaMapMarkerAlt size={12} />
                  <span className="line-clamp-1">{customer.customerAddress}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <SpecialButton variant="secondary" className="flex items-center gap-2">
                <FaDownload size={14} />
                Export
              </SpecialButton>
              <SpecialButton variant="primary" className="flex items-center gap-2">
                <FaFileInvoiceDollar size={14} />
                Send Statement
              </SpecialButton>
            </div>
          </div>
        </div>

        {/* Balance Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Balance</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(balanceData.totalBalance)}</p>
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
                <p className="text-xs text-gray-500 mt-1">This Month</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FaChartLine className="text-green-600" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Credit Limit</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(balanceData.creditLimit)}</p>
                <p className="text-xs text-gray-500 mt-1">Maximum Allowed</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaFileInvoiceDollar className="text-blue-600" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Credit</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(balanceData.availableCredit)}</p>
                <p className="text-xs text-gray-500 mt-1">Remaining Limit</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <FaClock className="text-purple-600" size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Analytics Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Payment Analytics</h3>
                <select className="border border-gray-300 rounded-md px-3 py-1 text-sm">
                  <option value="last7days">Last 7 Days</option>
                  <option value="last30days">Last 30 Days</option>
                  <option value="last90days">Last 90 Days</option>
                  <option value="thisyear">This Year</option>
                </select>
              </div>
              
              {/* Line chart representation */}
              <div className="relative h-64 bg-gray-50 rounded-lg p-4">
                <svg className="w-full h-full" viewBox="0 0 400 200">
                  {/* Grid lines */}
                  <defs>
                    <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  
                  {/* Y-axis labels */}
                  <g className="text-xs fill-gray-500">
                    <text x="10" y="20" textAnchor="start">$3000</text>
                    <text x="10" y="70" textAnchor="start">$2000</text>
                    <text x="10" y="120" textAnchor="start">$1000</text>
                    <text x="10" y="170" textAnchor="start">$0</text>
                  </g>
                  
                  {/* Amount Paid Line */}
                  <polyline
                    fill="none"
                    stroke="#0f4d57"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={chartData.map((data, index) => 
                      `${50 + index * 45},${170 - (data.amount / 3000) * 150}`
                    ).join(' ')}
                  />
                  
                  {/* Remaining Amount Line */}
                  <polyline
                    fill="none"
                    stroke="#6b7280"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="5,5"
                    points={chartData.map((data, index) => 
                      `${50 + index * 45},${170 - (data.remaining / 5000) * 150}`
                    ).join(' ')}
                  />
                  
                  {/* Data points for Amount Paid */}
                  {chartData.map((data, index) => (
                    <circle
                      key={`paid-${index}`}
                      cx={50 + index * 45}
                      cy={170 - (data.amount / 3000) * 150}
                      r="4"
                      fill="#0f4d57"
                      stroke="white"
                      strokeWidth="2"
                    />
                  ))}
                  
                  {/* Data points for Remaining Amount */}
                  {chartData.map((data, index) => (
                    <circle
                      key={`remaining-${index}`}
                      cx={50 + index * 45}
                      cy={170 - (data.remaining / 5000) * 150}
                      r="4"
                      fill="#6b7280"
                      stroke="white"
                      strokeWidth="2"
                    />
                  ))}
                  
                  {/* X-axis labels */}
                  {chartData.map((data, index) => (
                    <text
                      key={`label-${index}`}
                      x={50 + index * 45}
                      y="195"
                      textAnchor="middle"
                      className="text-xs fill-gray-600"
                    >
                      {data.month}
                    </text>
                  ))}
                </svg>
              </div>
              
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 bg-[#0f4d57] rounded"></div>
                  <span className="text-sm text-gray-600">Amount Paid</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 bg-gray-400 rounded border-dashed border-t-2 border-gray-400"></div>
                  <span className="text-sm text-gray-600">Remaining Amount</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Status Pie Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Payment Status</h3>
            
            {/* Simple pie chart representation */}
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-400"></div>
                <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
                  <span className="text-sm font-semibold text-gray-700">92%</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-gray-600">Paid</span>
                </div>
                <span className="text-sm font-medium">60%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <span className="text-sm text-gray-600">Pending</span>
                </div>
                <span className="text-sm font-medium">25%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <span className="text-sm text-gray-600">Overdue</span>
                </div>
                <span className="text-sm font-medium">15%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
              <SpecialButton variant="primary" className="flex items-center gap-2">
                <FaFileInvoiceDollar size={14} />
                Add Payment
              </SpecialButton>
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
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
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
                    Payment ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Available Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.paymentId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(payment.date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate" title={payment.description}>
                        {payment.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={payment.type === 'Credit' ? 'text-green-600' : 'text-red-600'}>
                        {payment.type === 'Credit' ? '+' : '-'}{formatCurrency(payment.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(payment.balance)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <SpecialButton variant="action-view" className="text-blue-600 hover:text-blue-800">
                        View
                      </SpecialButton>
                    </td>
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
