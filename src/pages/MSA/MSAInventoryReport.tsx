import React, { useState, useEffect } from "react";
import { useStoreFromUrl } from "../../hooks/useStoreFromUrl";
import { useProducts } from "../../hooks/useProducts";
import Header from "../../components/Header";
import { SpecialButton } from "../../components/buttons";
import { FaFileExport, FaFileAlt } from "react-icons/fa";
import MSAInventoryTable from "../../components/MSAComponents/MSAInventoryTable";
import type { Product } from "../../data/inventoryData";
import toast from "react-hot-toast";

interface MSAInventoryData {
  product: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  msaCategoryCode: string;
  itemsPerSellingUnit: number;
}

const MSAInventoryReport: React.FC = () => {
  const { storeId } = useStoreFromUrl();
  const { products, loading, error } = useProducts({ 
    storeId: storeId,
    page: 1, 
    limit: 1000 // Get all products for MSA report
  });
  
  const [msaData, setMsaData] = useState<MSAInventoryData[]>([]);
  const [filteredData, setFilteredData] = useState<MSAInventoryData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  // Transform products to MSA format
  useEffect(() => {
    if (products && products.length > 0) {
      const transformedData: MSAInventoryData[] = products.map((product: Product) => ({
        product: product.name || "-",
        description: product.description || "-",
        category: typeof product.category === 'string' 
          ? product.category 
          : product.category?.name || "UNCATEGORIZED",
        price: parseFloat(product.price.replace('$', '')) || 0,
        stock: product.quantity || 0,
        msaCategoryCode: generateMSACode(product.plu || product.sku || product.id || ""),
        itemsPerSellingUnit: product.itemsPerUnit || 1
      }));
      
      setMsaData(transformedData);
      
      // Extract unique categories
      const categories = Array.from(new Set(transformedData.map(item => item.category)));
      setAvailableCategories(["All", ...categories]);
    }
  }, [products]);

  // Filter data based on search and category
  useEffect(() => {
    let filtered = msaData;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.msaCategoryCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (selectedCategory !== "All") {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    setFilteredData(filtered);
  }, [msaData, searchTerm, selectedCategory]);

  // Generate MSA code based on product identifier
  const generateMSACode = (identifier: string): string => {
    if (!identifier) return "0000";
    
    // If it's already a number, pad it to 4 digits
    if (/^\d+$/.test(identifier)) {
      return identifier.padStart(4, '0');
    }
    
    // If it has numbers, extract and pad them
    const numbers = identifier.match(/\d+/);
    if (numbers) {
      return numbers[0].padStart(4, '0');
    }
    
    // Generate a code from the string
    let code = "";
    for (let i = 0; i < identifier.length && code.length < 4; i++) {
      if (identifier[i].match(/[a-zA-Z]/)) {
        code += identifier.charCodeAt(i) % 10;
      }
    }
    
    return code.padStart(4, '0');
  };

  // Export to CSV
  const handleExportCSV = () => {
    try {
      if (filteredData.length === 0) {
        toast.error("No data to export");
        return;
      }

      const csvHeaders = [
        "Product",
        "Description", 
        "Category",
        "Price",
        "Quantity in hand",
        "MSA Category Code",
        "Items Per Selling Unit"
      ];

      const csvData = filteredData.map(item => [
        item.product,
        item.description,
        item.category,
        item.price.toFixed(2),
        item.stock,
        item.msaCategoryCode,
        item.itemsPerSellingUnit
      ]);

      const csvContent = [
        csvHeaders.join(","),
        ...csvData.map(row => row.map(cell => `"${cell}"`).join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `MSA_Inventory_Report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("MSA inventory report exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export report. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0f4d57] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading MSA inventory data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <FaFileAlt size={48} className="mx-auto mb-2" />
            <p className="text-lg font-semibold">Error loading inventory data</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="p-4 sm:p-6 bg-white min-h-screen">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0f4d57]">
              MSA Inventory Report
            </h1>
            <p className="text-gray-600 mt-2">
              View and export your inventory data in MSA format
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 sm:gap-4">
            <SpecialButton
              variant="expense-export"
              onClick={handleExportCSV}
              disabled={filteredData.length === 0}
            >
              <FaFileExport size={14} />
              <span className="ml-2">Export CSV</span>
            </SpecialButton>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Products</p>
                <p className="text-2xl font-bold text-blue-900">{filteredData.length}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <FaFileAlt className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Quantity in hand</p>
                <p className="text-2xl font-bold text-green-900">
                  {filteredData.reduce((sum, item) => sum + item.stock, 0).toLocaleString()}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <FaFileAlt className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Total Value</p>
                <p className="text-2xl font-bold text-purple-900">
                  ${filteredData.reduce((sum, item) => sum + (item.price * item.stock), 0).toFixed(2)}
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                <FaFileAlt className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Products
              </label>
              <input
                type="text"
                placeholder="Search by product name, description, or MSA category code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
              />
            </div>
            
            <div className="sm:w-64">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
              >
                {availableCategories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* MSA Table */}
        <MSAInventoryTable data={filteredData} />
      </div>
    </>
  );
};

export default MSAInventoryReport;
