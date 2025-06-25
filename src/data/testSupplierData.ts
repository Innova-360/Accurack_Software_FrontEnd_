// Test data for supplier functionality
// This file contains sample data and helper functions for testing

export const sampleSuppliers = [
  {
    supplier_id: "SUP001",
    name: "ABC Electronics Ltd",
    email: "contact@abcelectronics.com",
    phone: "+1-555-123-4567",
    address: "123 Tech Street, Silicon Valley, CA 95014",
    storeId: "",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    supplier_id: "SUP002", 
    name: "Global Foods Supply",
    email: "orders@globalfoods.com",
    phone: "+1-555-987-6543",
    address: "456 Food Ave, New York, NY 10001",
    storeId: "",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    supplier_id: "SUP003",
    name: "Fashion Forward Inc",
    email: "wholesale@fashionforward.com", 
    phone: "+1-555-456-7890",
    address: "789 Style Blvd, Los Angeles, CA 90210",
    storeId: "",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    supplier_id: "SUP004",
    name: "Office Supplies Pro",
    email: "sales@officesuppliespro.com",
    phone: "+1-555-321-9876",
    address: "321 Business Park, Chicago, IL 60601",
    storeId: "",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    supplier_id: "SUP005",
    name: "Home & Garden Express",
    email: "info@homegardenexpress.com",
    phone: "+1-555-654-3210",
    address: "654 Garden Way, Austin, TX 73301",
    storeId: "",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const testSupplierFormData = {
  supplier_id: "SUP006",
  name: "Test Supplier Ltd",
  email: "test@supplier.com",
  phone: "+1-555-111-2222",
  address: "999 Test Street, Test City, TS 12345",
  storeId: ""
};
