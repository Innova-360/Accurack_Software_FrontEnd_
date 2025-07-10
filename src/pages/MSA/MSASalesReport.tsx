import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Header from "../../components/Header";
import Loading from "../../components/Loading";
import MSASalesTable from "../../components/MSAComponents/MSASalesTable";
import { fetchSales } from "../../store/slices/salesSlice";
import type { RootState, AppDispatch } from "../../store";
import useRequireStore from "../../hooks/useRequireStore";

// Address parser utility
const parseAddress = (addressString: string) => {
  if (!addressString || addressString.trim() === "") {
    return {
      street1: "-",
      street2: "-",
      city: "-",
      state: "-",
      postalCode: "-",
      country: "-"
    };
  }

  // Split by common delimiters
  const parts = addressString.split(/[,\n\r]+/).map(part => part.trim()).filter(part => part !== "");
  
  if (parts.length === 0) {
    return {
      street1: "-",
      street2: "-",
      city: "-",
      state: "-",
      postalCode: "-",
      country: "-"
    };
  }

  // Extract postal code (usually contains numbers)
  const postalCodeMatch = addressString.match(/\b\d{5,6}\b/);
  const postalCode = postalCodeMatch ? postalCodeMatch[0] : "-";

  // Extract state (usually 2-3 letter abbreviation before postal code)
  const stateMatch = addressString.match(/\b[A-Z]{2,3}\b/);
  const state = stateMatch ? stateMatch[0] : "-";

  // Basic parsing logic
  const street1 = parts[0] || "-";
  const street2 = parts.length > 1 ? parts[1] : "-";
  const city = parts.length > 2 ? parts[2] : "-";
  
  return {
    street1,
    street2,
    city,
    state,
    postalCode,
    country: "USA" // Default country
  };
};

export interface MSASalesData {
  sNo: number;
  clientName: string;
  companyName: string;
  phoneNumber: string;
  shippedFrom: string;
  businessStreet1: string;
  businessStreet2: string;
  businessCity: string;
  businessState: string;
  businessPostalCode: string;
  shippedTo: string;
  shippedToStreet1: string;
  shippedToStreet2: string;
  shippedToCity: string;
  shippedToState: string;
  shippedToPostalCode: string;
  shipmentDate: string;
  totalValue: number;
  transactionId: string;
  paymentMethod: string;
  cashierName: string;
  status: string;
}

const MSASalesReport: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const currentStore = useRequireStore();

  // Redux state
  const { sales, loading, error } = useSelector(
    (state: RootState) => state.sales
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");

  // Fetch sales data
  useEffect(() => {
    if (currentStore?.id) {
      dispatch(fetchSales({ 
        storeId: currentStore.id, 
        page: 1, 
        limit: 1000 
      }));
    }
  }, [dispatch, currentStore?.id]);

  // Transform sales data to MSA format
  const msaSalesData: MSASalesData[] = sales.map((sale: any, index: number) => {
    const customerData = sale.customerData || sale.customer || {};
    const customerAddress = customerData.customerAddress || customerData.address || "";
    const storeAddress = currentStore?.address || "";

    // Parse addresses
    const businessAddress = parseAddress(storeAddress);
    const shippedToAddress = parseAddress(customerAddress);

    return {
      sNo: index + 1,
      clientName: customerData.customerName || customerData.name || "Unknown",
      companyName: customerData.companyName || currentStore?.name || "Unknown",
      phoneNumber: customerData.phoneNumber || customerData.phone || sale.customerPhone || "-",
      shippedFrom: currentStore?.name || "Unknown Store",
      businessStreet1: businessAddress.street1,
      businessStreet2: businessAddress.street2,
      businessCity: businessAddress.city,
      businessState: businessAddress.state,
      businessPostalCode: businessAddress.postalCode,
      shippedTo: customerData.customerName || customerData.name || "Unknown",
      shippedToStreet1: shippedToAddress.street1,
      shippedToStreet2: shippedToAddress.street2,
      shippedToCity: shippedToAddress.city,
      shippedToState: shippedToAddress.state,
      shippedToPostalCode: shippedToAddress.postalCode,
      shipmentDate: new Date(sale.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit"
      }),
      totalValue: sale.totalAmount || 0,
      transactionId: sale.transactionId || sale.id,
      paymentMethod: sale.paymentMethod || "Unknown",
      cashierName: sale.cashierName || "Unknown",
      status: sale.status || "Unknown"
    };
  });

  // Filter data based on search and date
  const filteredData = msaSalesData.filter(item => {
    const matchesSearch = searchTerm === "" || 
      item.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.phoneNumber.includes(searchTerm) ||
      item.transactionId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate = dateFilter === "all" || 
      (dateFilter === "today" && new Date(item.shipmentDate).toDateString() === new Date().toDateString()) ||
      (dateFilter === "week" && new Date(item.shipmentDate) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
      (dateFilter === "month" && new Date(item.shipmentDate) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));

    return matchesSearch && matchesDate;
  });

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      "S.No", "Client Name", "Company Name", "Phone Number", "Shipped From",
      "Business Street 1", "Business Street 2", "Business City", "Business State", "Business Postal Code",
      "Shipped To", "Shipped To Street 1", "Shipped To Street 2", "Shipped To City", "Shipped To State", "Shipped To Postal Code",
      "Shipment Date", "Total Value", "Transaction ID", "Payment Method", "Cashier Name", "Status"
    ];

    const csvContent = [
      headers.join(","),
      ...filteredData.map(row => [
        row.sNo,
        `"${row.clientName}"`,
        `"${row.companyName}"`,
        `"${row.phoneNumber}"`,
        `"${row.shippedFrom}"`,
        `"${row.businessStreet1}"`,
        `"${row.businessStreet2}"`,
        `"${row.businessCity}"`,
        `"${row.businessState}"`,
        `"${row.businessPostalCode}"`,
        `"${row.shippedTo}"`,
        `"${row.shippedToStreet1}"`,
        `"${row.shippedToStreet2}"`,
        `"${row.shippedToCity}"`,
        `"${row.shippedToState}"`,
        `"${row.shippedToPostalCode}"`,
        `"${row.shipmentDate}"`,
        row.totalValue,
        `"${row.transactionId}"`,
        `"${row.paymentMethod}"`,
        `"${row.cashierName}"`,
        `"${row.status}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `MSA_Sales_Report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Sales Data</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">MSA Sales Report</h1>
          <p className="text-gray-600">
            Comprehensive sales data formatted for MSA compliance and reporting
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, phone, or transaction ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
                />
              </div>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
            <button
              onClick={exportToCSV}
              className="px-6 py-2 bg-[#0f4d57] text-white rounded-lg hover:bg-[#083a44] transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>
          </div>
        </div>

        {/* Sales Table */}
        <MSASalesTable data={filteredData} />
      </div>
    </div>
  );
};

export default MSASalesReport;
