import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FaPlus, FaTrash, FaArrowLeft, FaSearch, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import toast from "react-hot-toast";
import Header from "../../components/Header";
import { SpecialButton } from "../../components/buttons";
import { fetchProductsPaginated, setSearchQuery } from "../../store/slices/productsSlice";
import { createSale } from "../../store/slices/salesSlice";
import { fetchUser } from "../../store/slices/userSlice";
import { fetchCustomers } from "../../store/slices/customerSlice";
import useRequireStore from "../../hooks/useRequireStore";
import type { RootState, AppDispatch } from "../../store";
import type { Product } from "../../data/inventoryData";
import type { SaleRequestData, SaleItem } from "../../store/slices/salesSlice";

interface ProductItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
  productId?: string; // Add this to reference the actual product
  variantId?: string; // Add this to reference the variant if it's a variant
  selectedProduct?: Product | null; // Store the full product/variant details
}

const AddNewSale: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  // Get current store and user data
  const currentStore = useRequireStore();
  const { user } = useSelector((state: RootState) => state.user);
  const {id} = useParams(); // Get store ID from URL params
  
  // Redux state
  const {
    products: availableProducts,
    loading: productsLoading,
    error: productsError,
    totalProducts,
    totalPages,
    currentPage,
    hasNextPage,
    hasPreviousPage,
  } = useSelector((state: RootState) => state.products);
  
  // Sales state
  const { loading: salesLoading } = useSelector((state: RootState) => state.sales);

  // Customers state
  const { customers, loading: customersLoading } = useSelector((state: RootState) => state.customers);

  // Local state for pagination and search
  const [currentPageLocal, setCurrentPageLocal] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const productsPerPage = 50;

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPageLocal(1); // Reset to first page when searching
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch products with pagination and search
  const fetchProductsData = useCallback(() => {
    dispatch(fetchProductsPaginated({
      page: currentPageLocal,
      limit: productsPerPage,
      search: debouncedSearchTerm || undefined,
      storeId: currentStore?.id
    }));
  }, [dispatch, currentPageLocal, debouncedSearchTerm]);

  // Fetch products, user, and customers on component mount
  useEffect(() => {
    fetchProductsData();
    dispatch(fetchUser());
    // Fetch customers for the dropdown
    if (currentStore?.id) {
      dispatch(fetchCustomers({ storeId: currentStore.id, page: 1, limit: 100 }));
    }
  }, [fetchProductsData, dispatch, currentStore?.id]);

  // Update search query in redux store
  useEffect(() => {
    dispatch(setSearchQuery(debouncedSearchTerm));
  }, [dispatch, debouncedSearchTerm]);

  // Form state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [customerName, setCustomerName] = useState("");
  const [countryCode, setCountryCode] = useState("+1"); // Added country code state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [street, setStreet] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [products, setProducts] = useState<ProductItem[]>([
    { id: "1", name: "", quantity: 1, price: 0, total: 0 },
  ]);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [notes, setNotes] = useState("");
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<"percentage" | "amount">(
    "percentage"
  );
  const [taxRate, setTaxRate] = useState(10); // Default 10% tax, but user can change

  // Calculated values
  const subtotal = products.reduce((sum, product) => sum + product.total, 0);
  const discountAmount =
    discountType === "percentage" ? (subtotal * discount) / 100 : discount;
  const taxAmount = ((subtotal - discountAmount) * taxRate) / 100;
  const finalTotal = subtotal - discountAmount + taxAmount;

  // Combine address fields into a single address string
  const getFullAddress = () => {
    const addressParts = [street, city, state, postalCode, country].filter(
      (part) => part.trim() !== ""
    );
    return addressParts.join(", ");
  };

  // Handle customer selection from dropdown
  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomerId(customerId);
    
    if (customerId === "new") {
      // Clear all fields for a new customer
      setCustomerName("");
      setCountryCode("+1");
      setPhoneNumber("");
      setEmail("");
      setStreet("");
      setCity("");
      setState("");
      setPostalCode("");
      setCountry("");
      return;
    }

    if (customerId === "") {
      // Clear all fields when no customer is selected
      setCustomerName("");
      setCountryCode("+1");
      setPhoneNumber("");
      setEmail("");
      setStreet("");
      setCity("");
      setState("");
      setPostalCode("");
      setCountry("");
      return;
    }

    // Find the selected customer and auto-fill the form
    const selectedCustomer = customers.find(customer => customer.id === customerId);
    if (selectedCustomer) {
      setCustomerName(selectedCustomer.customerName || "");
      
      // Extract country code from phone number or set default
      const phoneStr = selectedCustomer.phoneNumber || "";
      const phoneRegex = /^(\+\d+)(.*)$/;
      const match = phoneStr.match(phoneRegex);
      
      if (match) {
        setCountryCode(match[1]);
        setPhoneNumber(match[2]);
      } else {
        setCountryCode("+1");
        setPhoneNumber(phoneStr);
      }
      
      setEmail(selectedCustomer.customerMail || "");
      
      if (selectedCustomer.customerAddress) {
        // Split address into components if available
        const addressParts = selectedCustomer.customerAddress.split(', ');
        if (addressParts.length >= 5) {
          setStreet(addressParts[0]);
          setCity(addressParts[1]);
          setState(addressParts[2]);
          setPostalCode(addressParts[3]);
          setCountry(addressParts.slice(4).join(', '));
        } else {
          // If address format is unexpected, just set the full address to street
          setStreet(selectedCustomer.customerAddress);
        }
      }
    }
  };

  // Create flattened product list including variants
  const flattenedProducts = React.useMemo(() => {
    const flattened: Array<{
      id: string;
      name: string;
      displayName: string;
      price: number;
      originalProduct: Product;
      isVariant: boolean;
      variantData?: any;
    }> = [];

    availableProducts.forEach((product) => {
      if (
        product.hasVariants &&
        product.variants &&
        product.variants.length > 0
      ) {
        // Add each variant as a separate option
        product.variants.forEach((variant) => {
          flattened.push({
            id: variant.id || `${product.id}-${variant.name}`,
            name: variant.name,
            displayName: `${product.name} - ${variant.name}`,
            price: variant.price || 0,
            originalProduct: product,
            isVariant: true,
            variantData: variant,
          });
        });
      } else {
        // Add regular product (no variants)
        flattened.push({
          id: product.id || product.name,
          name: product.name,
          displayName: product.name,
          price: parseFloat(product.price?.replace("$", "") || "0"),
          originalProduct: product,
          isVariant: false,
        });
      }
    });

    return flattened;
  }, [availableProducts]);

  const handleProductChange = (
    index: number,
    field: keyof ProductItem,
    value: string | number
  ) => {
    const updatedProducts = [...products];

    // Handle product selection
    if (field === "name") {
      const selectedFlatProduct = flattenedProducts.find(
        (p) => p.displayName === value
      );
      if (selectedFlatProduct) {
        const { originalProduct, isVariant, variantData } = selectedFlatProduct;

        updatedProducts[index] = {
          ...updatedProducts[index],
          name: selectedFlatProduct.displayName,
          productId: originalProduct.id,
          variantId: isVariant ? variantData?.id : undefined,
          selectedProduct: originalProduct,
          // Auto-fill price from selected product/variant
          price: selectedFlatProduct.price,
        };
        // Recalculate total
        updatedProducts[index].total =
          updatedProducts[index].quantity * updatedProducts[index].price;
      } else {
        updatedProducts[index] = {
          ...updatedProducts[index],
          [field]: value as any,
          selectedProduct: null,
        };
      }
    } else {
      // Type-safe assignment based on field type
      if (field === "quantity" || field === "price" || field === "total") {
        updatedProducts[index] = {
          ...updatedProducts[index],
          [field]: value as number,
        };
      } else {
        updatedProducts[index] = {
          ...updatedProducts[index],
          [field]: value as string,
        };
      }

      // Recalculate total for the product
      if (field === "quantity" || field === "price") {
        updatedProducts[index].total =
          updatedProducts[index].quantity * updatedProducts[index].price;
      }
    }

    setProducts(updatedProducts);
  };

  const addProduct = () => {
    setProducts([
      ...products,
      {
        id: Date.now().toString(),
        name: "",
        quantity: 1,
        price: 0,
        total: 0,
      },
    ]);
  };

  const removeProduct = (index: number) => {
    if (products.length > 1) {
      setProducts(products.filter((_, i) => i !== index));
    }
  };

  const handleDiscountChange = (value: number) => {
    setDiscount(value);
  };

  const handleDiscountTypeChange = (type: "percentage" | "amount") => {
    setDiscountType(type);
    // Reset discount value when changing type to avoid confusion
    setDiscount(0);
  };

  // const handleSaveDraft = () => {
  //   // TODO: Implement save as draft functionality
  //   console.log("Save as draft");
  // };

  const handleCreateSale = async () => {
    // Validate form
    if (!customerName.trim()) {
      toast.error("Customer name is required");
      return;
    }

    if (!countryCode.trim()) {
      toast.error("Country code is required");
      return;
    }

    if (!phoneNumber.trim()) {
      toast.error("Phone number is required");
      return;
    }
    
    // Make sure country code is in proper format
    if (!countryCode.startsWith('+')) {
      toast.error("Country code must start with '+' (e.g., +1)");
      return;
    }

    // Combine country code and phone number
    const fullPhoneNumber = `${countryCode}${phoneNumber}`;

    // Validate address fields (except street which is optional)
    if (!city.trim()) {
      toast.error("City is required");
      return;
    }

    if (!state.trim()) {
      toast.error("State/Province is required");
      return;
    }

    if (!postalCode.trim()) {
      toast.error("Postal code is required");
      return;
    }

    if (!country.trim()) {
      toast.error("Country is required");
      return;
    }

    if (products.some((p) => !p.name.trim() || p.price <= 0)) {
      toast.error("Please fill in all product details");
      return;
    }

    if (!currentStore?.id) {
      toast.error("Store information is missing");
      return;
    }

    if (!user?.clientId) {
      toast.error("User information is missing");
      return;
    }

    try {
      // Prepare sale items
      const saleItems: SaleItem[] = products.map((product) => {
        // Get the PLU/UPC from the selected product or variant
        let pluUpc = "";
        if (product.selectedProduct) {
          // If it's a variant, check for variant PLU/UPC first
          if (product.variantId && product.selectedProduct.variants) {
            const variant = product.selectedProduct.variants.find(v => v.id === product.variantId);
            pluUpc = variant?.pluUpc || product.selectedProduct.plu || product.selectedProduct.sku || "";
          } else {
            // For regular products, use pluUpc, plu, or sku as fallback
            pluUpc = (product.selectedProduct as any).pluUpc || product.selectedProduct.plu || product.selectedProduct.sku || "";
          }
        }

        return {
          productId: product.productId || product.selectedProduct?.id || "",
          productName: product.selectedProduct?.name || product.name,
          quantity: product.quantity,
          sellingPrice: product.price,
          totalPrice: product.total,
          pluUpc: pluUpc,
        };
      });

      // Prepare sale data according to API format
      const saleData: SaleRequestData = {
        customerPhone: fullPhoneNumber,
        customerData: {
          customerName: customerName.trim(),
          customerAddress: getFullAddress(),
          phoneNumber: fullPhoneNumber,
          telephoneNumber: fullPhoneNumber,
          customerMail: email.trim(),
          storeId: currentStore.id,
          clientId: user.clientId,
        },
        storeId: currentStore.id,
        clientId: user.clientId,
        paymentMethod: paymentMethod as "CASH" | "CARD" | "BANK_TRANSFER" | "CHECK" | "DIGITAL_WALLET",
        totalAmount: Math.round(finalTotal * 100) / 100, // Ensure proper number format
        tax: Math.round(taxAmount * 100) / 100, // Ensure proper number format
        cashierName: user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : user.email || "Current User",
        generateInvoice: false, // Default to false as specified
        source: "manual", // Default source as manual
        status: "PENDING", // Default status as pending (uppercase)
        saleItems,
      };

      console.log("📦 Prepared sale data:", JSON.stringify(saleData, null, 2));

      // Dispatch create sale action
      await dispatch(createSale(saleData)).unwrap();
      
      toast.success("Sale created successfully!");
      
      // Navigate back to sales page
      navigate(-1);
    } catch (error) {
      console.error("Error creating sale:", error);
      toast.error(`Failed to create sale: ${error}`);
    }
  };

   const handleCreateInvoice = () => {
    // Validate form before proceeding to invoice creation
    if (!customerName.trim()) {
      alert('Customer name is required');
      return;
    }

    if (!phoneNumber.trim()) {
      alert('Phone number is required');
      return;
    }

    // Validate address fields (except street which is optional)
    if (!city.trim()) {
      alert('City is required');
      return;
    }

    if (!state.trim()) {
      alert('State/Province is required');
      return;
    }

    if (!postalCode.trim()) {
      alert('Postal code is required');
      return;
    }

    if (!country.trim()) {
      alert('Country is required');
      return;
    }

    if (products.some(p => !p.name.trim() || p.price <= 0)) {
      alert('Please fill in all product details');
      return;
    }

    

    // Prepare invoice data
    const invoiceData = {
      customerDetails: {
        name: customerName.trim(),
        phone: phoneNumber.trim(),
        email: email.trim(),
        address: getFullAddress(),
        street,
        city,
        state,
        postalCode,
        country
      },
      products: products.filter(p => p.name.trim() && p.price > 0).map(product => {
        // Get the PLU/UPC from the selected product or variant
        let pluUpc = "";
        if (product.selectedProduct) {
          // If it's a variant, check for variant PLU/UPC first
          if (product.variantId && product.selectedProduct.variants) {
            const variant = product.selectedProduct.variants.find(v => v.id === product.variantId);
            pluUpc = variant?.pluUpc || product.selectedProduct.plu || product.selectedProduct.sku || "";
          } else {
            // For regular products, use pluUpc, plu, or sku as fallback
            pluUpc = (product.selectedProduct as any).pluUpc || product.selectedProduct.plu || product.selectedProduct.sku || "";
          }
        }
        return {
          ...product,
          pluUpc,
          plu: product.selectedProduct?.plu || "",
          sku: product.selectedProduct?.sku || ""
        };
      }),
      subtotal,
      discount,
      discountType,
      discountAmount,
      taxRate,
      taxAmount,
      finalTotal,
      paymentMethod,
      notes
    };

    console.log("Products for invoice:", products);
    

    // Navigate to invoice creation with data
    navigate(`/store/${id}/create-invoice`, { state: { invoiceData } });
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaArrowLeft className="text-gray-600" size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add New Sale</h1>
              <p className="text-gray-600">Create a new sales record</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">Sales • New • Add sales</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Customer Information
              </h2>
              
              {/* Customer Selection Dropdown */}
              <div className="mb-6 py-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Existing Customer
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => handleCustomerSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
                  disabled={customersLoading}
                >
                  <option value="" className="text-gray-500">
                    {customersLoading 
                      ? "Loading customers..." 
                      : customers.length > 0 
                        ? `Select from ${customers.length} existing customers or enter new details below`
                        : "No existing customers found - enter new details below"
                    }
                  </option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.customerName} - {customer.phoneNumber}
                    </option>
                  ))}
                {customers.length > 0 && <option className="text-gray-700 py-1.5" value="new">Add New Customer</option>}
                </select>
                {selectedCustomerId === "new" && (
                  <p className="mt-2 text-sm text-green-700">
                    Ready to enter new customer details below.
                  </p>
                )}
                {!customersLoading && customers.length === 0 && (
                  <p className="mt-2 text-sm text-orange-700">
                    No existing customers found. Please enter customer details below.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
                      placeholder="+1"
                      aria-label="Country Code"
                    />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              {/* Address Section */}
              <div className="mt-6">
                <h3 className="text-md font-medium text-gray-900 mb-4">
                  Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
                      placeholder="Enter street address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State/Province <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
                      placeholder="Enter state/province"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postal Code/ Zip Code{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
                      placeholder="Enter postal code"
                    />
                  </div>
                  <div className="md:col-span-2 lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
                      placeholder="Enter country"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Products Purchased */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Products Purchased
                </h2>
              </div>

              {/* Product Search Bar */}
              <div className="mb-4">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
                    placeholder="Search products by name, SKU, PLU, or category..."
                  />
                </div>
                {debouncedSearchTerm && (
                  <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                    <span>
                      {totalProducts} product{totalProducts !== 1 ? 's' : ''} found
                      {debouncedSearchTerm && ` for "${debouncedSearchTerm}"`}
                    </span>
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setDebouncedSearchTerm("");
                      }}
                      className="text-[#03414C] hover:text-[#025561] underline"
                    >
                      Clear search
                    </button>
                  </div>
                )}
              </div>

              {/* Pagination Controls - Top */}
              {totalPages > 1 && (
                <div className="mb-4 flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages} ({totalProducts} total products)
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPageLocal(prev => Math.max(1, prev - 1))}
                      disabled={!hasPreviousPage || productsLoading}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaChevronLeft size={14} />
                    </button>
                    <span className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm">
                      {currentPage}
                    </span>
                    <button
                      onClick={() => setCurrentPageLocal(prev => prev + 1)}
                      disabled={!hasNextPage || productsLoading}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* Products loading/error state */}
              {productsLoading && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-blue-700 text-sm">
                    {debouncedSearchTerm 
                      ? `Searching for "${debouncedSearchTerm}"...` 
                      : "Loading products..."}
                  </p>
                </div>
              )}

              {productsError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-red-700 text-sm">
                    Error loading products: {productsError}
                  </p>
                </div>
              )}

              {!productsLoading && !productsError && availableProducts.length === 0 && debouncedSearchTerm && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-yellow-700 text-sm">
                    No products found for "{debouncedSearchTerm}". Try a different search term.
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {products.map((product, index) => (
                  <div
                    key={product.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Product <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={product.name}
                          onChange={(e) =>
                            handleProductChange(index, "name", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
                          disabled={productsLoading}
                        >
                          <option value="">
                            {productsLoading
                              ? (debouncedSearchTerm ? `Searching "${debouncedSearchTerm}"...` : "Loading products...")
                              : `Select from ${totalProducts} products${debouncedSearchTerm ? ` (filtered)` : ''}...`}
                          </option>
                          {flattenedProducts.map((flatProduct) => (
                            <option
                              key={flatProduct.id}
                              value={flatProduct.displayName}
                            >
                              {flatProduct.displayName}
                            </option>
                          ))}
                          {productsError && (
                            <option value="" disabled>
                              Error loading products
                            </option>
                          )}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quantity <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={product.quantity}
                          onChange={(e) =>
                            handleProductChange(
                              index,
                              "quantity",
                              parseInt(e.target.value) || 1
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Selling Price <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center gap-2 w-20 max-w-36">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={product.price}
                            onChange={(e) =>
                              handleProductChange(
                                index,
                                "price",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="overflow-hidden w-20 max-w-36 flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
                          />
                          {products.length > 1 && (
                            <button
                              onClick={() => removeProduct(index)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <FaTrash size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Product Details Bar - Show when a product is selected */}
                    {product.selectedProduct && (
                      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-blue-900 mb-3">
                          Product Details
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">
                              Product Name:
                            </span>
                            <div className="text-gray-900 font-medium">
                              {product.selectedProduct.name}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">
                              Stock Quantity:
                            </span>
                            <div
                              className={`${product.selectedProduct.quantity < 10 ? "text-red-600 font-bold" : "text-gray-900"} font-medium`}
                            >
                              {product.selectedProduct.quantity}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">
                              Original Price:
                            </span>
                            <div className="text-gray-900 font-medium">
                              {product.selectedProduct.price}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">
                              Selling Price:
                            </span>
                            <div className="text-green-600 font-bold">
                              ${product.price.toFixed(2)}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">
                              PLU/UPC:
                            </span>
                            <div className="text-gray-900 font-mono text-xs">
                              {product.selectedProduct.plu || "N/A"}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">
                              SKU:
                            </span>
                            <div className="text-gray-900 font-mono text-xs">
                              {product.selectedProduct.sku || "N/A"}
                            </div>
                          </div>
                        </div>

                        {/* Additional product information row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-3 pt-3 border-t border-blue-200">
                          <div>
                            <span className="font-medium text-gray-600">
                              Category:
                            </span>
                            <div className="text-gray-900">
                              {typeof product.selectedProduct.category ===
                              "string"
                                ? product.selectedProduct.category
                                : (product.selectedProduct.category as any)?.name ||
                                  "Uncategorized"}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">
                              Supplier:
                            </span>
                            <div className="text-gray-900">
                              {typeof product.selectedProduct.supplier ===
                              "string"
                                ? product.selectedProduct.supplier
                                : (product.selectedProduct.supplier as any)?.name ||
                                  "N/A"}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">
                              Items per Unit:
                            </span>
                            <div className="text-gray-900">
                              {product.selectedProduct.itemsPerUnit || 1}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">
                              Line Total:
                            </span>
                            <div className="text-green-600 font-bold">
                              ${product.total.toFixed(2)}
                            </div>
                          </div>
                        </div>

                        {product.variantId && (
                          <div className="mt-3 pt-2 border-t border-blue-200">
                            <div className="text-xs text-blue-700">
                              <span className="font-medium">
                                Variant Selected:
                              </span>{" "}
                              {product.name.split(" - ").pop()}
                            </div>
                            {/* Show variant-specific details if available */}
                            {flattenedProducts.find(
                              (fp) => fp.displayName === product.name
                            )?.variantData && (
                              <div className="text-xs text-gray-600 mt-1">
                                <span className="font-medium">
                                  Variant SKU:
                                </span>{" "}
                                {flattenedProducts.find(
                                  (fp) => fp.displayName === product.name
                                )?.variantData?.sku || "N/A"}
                                {flattenedProducts.find(
                                  (fp) => fp.displayName === product.name
                                )?.variantData?.pluUpc && (
                                  <>
                                    {" | "}
                                    <span className="font-medium">
                                      Variant PLU:
                                    </span>{" "}
                                    {
                                      flattenedProducts.find(
                                        (fp) => fp.displayName === product.name
                                      )?.variantData?.pluUpc
                                    }
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-sm text-gray-600">Line Total:</span>
                      <span className="font-semibold text-lg">
                        ${product.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addProduct}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#03414C] hover:text-[#03414C] transition-colors flex items-center justify-center gap-2"
                >
                  <FaPlus size={16} />
                  Add Another Product
                </button>
              </div>

              {/* Pagination Controls - Bottom */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * productsPerPage) + 1}-{Math.min(currentPage * productsPerPage, totalProducts)} of {totalProducts} products
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPageLocal(prev => Math.max(1, prev - 1))}
                      disabled={!hasPreviousPage || productsLoading}
                      className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPageLocal(prev => prev + 1)}
                      disabled={!hasNextPage || productsLoading}
                      className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Payment & Additional Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Payment & Additional Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
                  >
                    <option value="CASH">Cash</option>
                    <option value="CARD">Card</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CHECK">Check</option>
                    <option value="DIGITAL_WALLET">Digital Wallet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sale Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
                    defaultValue={new Date().toISOString().slice(0, 16)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
                    placeholder="Add any additional notes..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary - Right Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Order Summary
              </h2>{" "}
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                <div className="border-t border-gray-100 pt-3">
                  <div className="flex justify-between items-start text-gray-600 mb-3">
                    <span className="font-medium">Discount</span>
                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex items-center gap-3">
                        <select
                          value={discountType}
                          onChange={(e) =>
                            handleDiscountTypeChange(
                              e.target.value as "percentage" | "amount"
                            )
                          }
                          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
                        >
                          <option value="percentage">Percentage</option>
                          <option value="amount">Amount</option>
                        </select>
                        <input
                          type="number"
                          min="0"
                          max={discountType === "percentage" ? 100 : subtotal}
                          step={discountType === "percentage" ? 1 : 0.01}
                          value={discount}
                          onChange={(e) =>
                            handleDiscountChange(
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-24 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
                          placeholder={
                            discountType === "percentage" ? "0" : "0.00"
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span></span>
                    <span className="text-red-600">
                      -${discountAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-start text-gray-600">
                  <span className="font-medium">Tax</span>
                  <div className="flex flex-col items-end space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={taxRate}
                        onChange={(e) =>
                          setTaxRate(parseFloat(e.target.value) || 0)
                        }
                        className="w-[100%] px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
                        placeholder="0"
                      />
                      <span className="text-sm">%</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span></span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>

                <hr className="my-4" />

                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <SpecialButton
                  variant="primary"
                  onClick={handleCreateSale}
                  className="w-full bg-[#03414C] hover:bg-[#025561] text-white py-3"
                  disabled={salesLoading}
                >
                  {salesLoading ? "Creating Sale..." : "Create Sale"}
                </SpecialButton>

                <SpecialButton
                  variant="primary"
                  onClick={handleCreateInvoice}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                >
                  Create Sale and make Invoice
                </SpecialButton>

                {/* <SpecialButton
                  variant="secondary"
                  onClick={handleSaveDraft}
                  className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 py-3"
                >
                  Save as Draft
                </SpecialButton> */}

                <SpecialButton
                  variant="modal-cancel"
                  onClick={handleCancel}
                  className="w-full text-gray-500 hover:bg-gray-50 py-3"
                >
                  Cancel
                </SpecialButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddNewSale;
