import React, { useState } from 'react';
import { FaPlus, FaFileExport, FaTrash, FaBars } from 'react-icons/fa';
import { SpecialButton } from '../../components/buttons';
import {  AddSupplierModal,  EditSupplierModal, DeleteSupplierModal, ViewSupplierModal,ViewProductsModal,SupplierSidebar,SupplierTable,ProductsTable,StatsGrid,
  type Supplier,
  type Product
} from '../../components/SupplierComponents';
import Header from '../../components/Header';
// Sample suppliers data
const initialSuppliers: Supplier[] = [
  {
    id: 1,
    name: 'TechCorp Electronics',
    email: 'contact@techcorp.com',
    phone: '+1-555-0101',
    address: '123 Tech Street, Silicon Valley, CA 94105',
    category: '',
    status: 'Active',
    productsSupplied: 45,
    totalValue: 125000.00,
    joinedDate: '2023-01-15'
  },
  {
    id: 2,
    name: 'Fashion Forward Ltd',
    email: 'orders@fashionforward.com',
    phone: '+1-555-0202',
    address: '456 Fashion Ave, New York, NY 10001',
    category: '',
    status: 'Active',
    productsSupplied: 78,
    totalValue: 89500.50,
    joinedDate: '2023-02-20'
  },
  {
    id: 3,
    name: 'Fresh Foods Co',
    email: 'supply@freshfoods.com',
    phone: '+1-555-0303',
    address: '789 Market Road, Chicago, IL 60601',
    category: '',
    status: 'Active',
    productsSupplied: 120,
    totalValue: 65000.75,
    joinedDate: '2023-03-10'
  },
  {
    id: 4,
    name: 'Office Pro Supplies',
    email: 'sales@officepro.com',
    phone: '+1-555-0404',
    address: '321 Business Blvd, Dallas, TX 75201',
    category: '',
    status: 'Inactive',
    productsSupplied: 32,
    totalValue: 15000.25,
    joinedDate: '2023-04-05'
  },
  {
    id: 5,
    name: 'MedSupply Global',
    email: 'info@medsupply.com',
    phone: '+1-555-0505',
    address: '654 Medical Center Dr, Boston, MA 02101',
    category: '',
    status: 'Active',
    productsSupplied: 95,
    totalValue: 156000.80,
    joinedDate: '2023-05-12'
  },
  {
    id: 6,
    name: 'Steel & Iron Works',
    email: 'orders@steelworks.com',
    phone: '+1-555-0606',
    address: '987 Industrial Ave, Pittsburgh, PA 15201',
    category: '',
    status: 'Active',
    productsSupplied: 65,
    totalValue: 245000.00,
    joinedDate: '2023-06-08'
  }
];

// Sample products data
const initialProducts: Product[] = [
  // TechCorp Electronics products
  { id: 1, name: 'Laptop Pro 15"', sku: 'TECH-LP-001', category: 'Computers', price: 1299.99, stock: 25, description: 'High-performance laptop for professionals', supplierId: 1 },
  { id: 2, name: 'Wireless Mouse', sku: 'TECH-WM-002', category: 'Accessories', price: 29.99, stock: 150, description: 'Ergonomic wireless mouse', supplierId: 1 },
  { id: 3, name: 'USB-C Hub', sku: 'TECH-HB-003', category: 'Accessories', price: 89.99, stock: 75, description: '7-in-1 USB-C connectivity hub', supplierId: 1 },
  
  // Fashion Forward Ltd products
  { id: 4, name: 'Business Shirt - White', sku: 'FASH-BS-001', category: 'Formal Wear', price: 45.00, stock: 200, description: 'Professional white cotton shirt', supplierId: 2 },
  { id: 5, name: 'Denim Jeans - Blue', sku: 'FASH-DJ-002', category: 'Casual Wear', price: 75.00, stock: 120, description: 'Classic blue denim jeans', supplierId: 2 },
  { id: 6, name: 'Summer Dress', sku: 'FASH-SD-003', category: 'Casual Wear', price: 95.00, stock: 80, description: 'Light summer dress for women', supplierId: 2 },
  
  // Fresh Foods Co products
  { id: 7, name: 'Organic Apples', sku: 'FOOD-OA-001', category: 'Fruits', price: 4.99, stock: 500, description: 'Fresh organic apples - 1 lb bag', supplierId: 3 },
  { id: 8, name: 'Whole Grain Bread', sku: 'FOOD-WB-002', category: 'Bakery', price: 3.49, stock: 200, description: 'Healthy whole grain bread loaf', supplierId: 3 },
  { id: 9, name: 'Greek Yogurt', sku: 'FOOD-GY-003', category: 'Dairy', price: 5.99, stock: 150, description: 'Creamy Greek yogurt - 32oz container', supplierId: 3 },
  
  // Office Pro Supplies products
  { id: 10, name: 'Copy Paper A4', sku: 'OFF-CP-001', category: 'Paper', price: 8.99, stock: 100, description: 'Premium A4 copy paper - 500 sheets', supplierId: 4 },
  { id: 11, name: 'Ball Point Pens', sku: 'OFF-BP-002', category: 'Writing', price: 12.99, stock: 50, description: 'Blue ink ball point pens - pack of 10', supplierId: 4 },
];

const SupplierPage: React.FC = () => {
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [viewMode, setViewMode] = useState<'suppliers' | 'products'>('suppliers');
  
  // Modal states
  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isViewProductsModalOpen, setIsViewProductsModalOpen] = useState(false);
  
  // Handle supplier selection from sidebar
  const handleSupplierSelect = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setViewMode('products');
  };

  // Handle back to suppliers view
  const handleBackToSuppliers = () => {
    setSelectedSupplier(null);
    setViewMode('suppliers');
  };
  
  // Get products for selected supplier
  const getSupplierProducts = () => {
    if (!selectedSupplier) return [];
    return products.filter(product => product.supplierId === selectedSupplier.id);
  };

  // Calculate totals based on current view
  const totalValue = suppliers.reduce((sum, supplier) => sum + supplier.totalValue, 0);
  const totalProducts = suppliers.reduce((sum, supplier) => sum + supplier.productsSupplied, 0);
  
  // Get current supplier products if viewing products
  const currentSupplierProducts = getSupplierProducts();

  // Add new supplier
  const handleAddSupplier = (newSupplierData: Omit<Supplier, 'id'>) => {
    try {
      const newId = Math.max(...suppliers.map(s => s.id), 0) + 1;
      const newSupplier: Supplier = {
        ...newSupplierData,
        id: newId
      };
      setSuppliers(prev => [...prev, newSupplier]);
      setIsAddSupplierModalOpen(false);
    } catch (error) {
      console.error('Error adding supplier:', error);
    }
  };

  // Edit supplier
  const handleEditSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsEditModalOpen(true);
  };

  const handleUpdateSupplier = (updatedSupplier: Supplier) => {
    try {
      setSuppliers(prev => prev.map(supplier => 
        supplier.id === updatedSupplier.id ? updatedSupplier : supplier
      ));
      setIsEditModalOpen(false);
      setSelectedSupplier(null);
    } catch (error) {
      console.error('Error updating supplier:', error);
    }
  };

  // Delete supplier
  const handleDeleteSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteSupplier = () => {
    try {
      if (selectedSupplier) {
        setSuppliers(prev => prev.filter(supplier => supplier.id !== selectedSupplier.id));
        // Also remove associated products
        setProducts(prev => prev.filter(product => product.supplierId !== selectedSupplier.id));
        
        // If we're currently viewing this supplier's products, go back to suppliers view
        if (viewMode === 'products' && selectedSupplier) {
          setViewMode('suppliers');
        }
      }
      setIsDeleteModalOpen(false);
      setSelectedSupplier(null);
    } catch (error) {
      console.error('Error deleting supplier:', error);
    }
  };

  // Delete all suppliers
  const handleDeleteAll = () => {
    setIsDeleteAllModalOpen(true);
  };

  const confirmDeleteAll = () => {
    try {
      setSuppliers([]);
      setProducts([]);
      setSelectedSupplier(null);
      setViewMode('suppliers');
      setIsDeleteAllModalOpen(false);
    } catch (error) {
      console.error('Error deleting all suppliers:', error);
    }
  };

  // View supplier
  const handleViewSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsViewModalOpen(true);
  };

  // View products
  const handleViewProducts = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsViewProductsModalOpen(true);
  };

  // Export functionality
  const handleExport = () => {
    try {
      const dataToExport = suppliers.map(supplier => ({
        Name: supplier.name,
        Email: supplier.email,
        Phone: supplier.phone,
        Address: supplier.address,
        Category: supplier.category,
        Status: supplier.status,
        'Products Supplied': supplier.productsSupplied,
        'Total Value': supplier.totalValue,
        'Joined Date': supplier.joinedDate
      }));

      const csvContent = [
        Object.keys(dataToExport[0] || {}).join(','),
        ...dataToExport.map(row => Object.values(row).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `suppliers_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };  return (
    <>
    <Header/>
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <SupplierSidebar
        suppliers={suppliers}
        selectedSupplier={selectedSupplier}
        isSidebarOpen={isSidebarOpen}
        viewMode={viewMode}
        onSupplierSelect={handleSupplierSelect}
        onBackToSuppliers={handleBackToSuppliers}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onAddSupplier={() => setIsAddSupplierModalOpen(true)}
        onSetViewMode={setViewMode}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Navigation */}
        <div className="bg-white  border-b border-gray-200 px-4 md:px-6 py-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-md md:hidden"
              >
                <FaBars className="text-gray-600" size={16} />
              </button>
              
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-teal-600 rounded-full"></div>
                <span className="text-gray-800 font-semibold text-lg">
                  {viewMode === 'products' && selectedSupplier 
                    ? selectedSupplier.name
                    : 'All Suppliers'
                  }
                </span>
              </div>
              {viewMode === 'products' && selectedSupplier && (
                <button
                  onClick={handleBackToSuppliers}
                  className="text-sm text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors duration-200 flex items-center gap-1"
                >
                  ← Back to Suppliers
                </button>
              )}
            </div>            
            <div className="flex items-center gap-2">
              <SpecialButton variant="expense-export" onClick={handleExport}>
                <FaFileExport size={14} />
                <span className="sm:inline ml-2">Export</span>
              </SpecialButton>
              <SpecialButton variant="expense-delete" onClick={handleDeleteAll}>
                <FaTrash size={14} />
                <span className="sm:inline ml-2">Delete All</span>
              </SpecialButton>
              <SpecialButton variant="expense-add" onClick={() => setIsAddSupplierModalOpen(true)}>
                <FaPlus size={14} />
                <span className="sm:inline ml-2">Add New</span>
              </SpecialButton>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header */}
            <div className="px-6 py-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {viewMode === 'products' && selectedSupplier 
                  ? `${selectedSupplier.name} - Products` 
                  : 'Suppliers Management'
                }
              </h2>
              <p className="text-gray-600 text-sm mb-4">
                {viewMode === 'products' && selectedSupplier 
                  ? `Manage products from ${selectedSupplier.name}`
                  : 'Manage your suppliers and their information'
                }
              </p>
              
              {/* Stats Grid */}
              <StatsGrid 
                viewMode={viewMode}
                suppliers={suppliers}
                selectedSupplier={selectedSupplier}
                currentSupplierProducts={currentSupplierProducts}
              />
            </div>

            {/* Content based on view mode */}
            {viewMode === 'suppliers' ? (
              <SupplierTable
                suppliers={suppliers}
                totalValue={totalValue}
                totalProducts={totalProducts}
                onViewSupplier={handleViewSupplier}
                onEditSupplier={handleEditSupplier}
                onDeleteSupplier={handleDeleteSupplier}
                onViewProducts={handleViewProducts}
                onAddSupplier={() => setIsAddSupplierModalOpen(true)}
              />
            ) : selectedSupplier && (
              <ProductsTable
                products={currentSupplierProducts}
                supplier={selectedSupplier}
                onBackToSuppliers={handleBackToSuppliers}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddSupplierModal
        isOpen={isAddSupplierModalOpen}
        onClose={() => setIsAddSupplierModalOpen(false)}
        onAdd={handleAddSupplier}
      />

      <EditSupplierModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedSupplier(null);
        }}
        onEdit={handleUpdateSupplier}
        supplier={selectedSupplier}
      />

      <DeleteSupplierModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedSupplier(null);
        }}
        onDelete={confirmDeleteSupplier}
        supplier={selectedSupplier}
      />

      <DeleteSupplierModal
        isOpen={isDeleteAllModalOpen}
        onClose={() => setIsDeleteAllModalOpen(false)}
        onDelete={confirmDeleteAll}
        supplier={null}
        isDeleteAll={true}
        supplierCount={suppliers.length}
      />

      <ViewSupplierModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedSupplier(null);
        }}
        supplier={selectedSupplier}
      />

      <ViewProductsModal
        isOpen={isViewProductsModalOpen}
        onClose={() => {
          setIsViewProductsModalOpen(false);
          setSelectedSupplier(null);
        }}
        supplier={selectedSupplier}
        products={products}
      />
    </div>
    </>
  );
};

export default SupplierPage;