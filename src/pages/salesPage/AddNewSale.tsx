import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FaPlus, FaTrash, FaArrowLeft } from "react-icons/fa";
import Header from "../../components/Header";
import { SpecialButton } from "../../components/buttons";
import type { Transaction } from "../../services/salesService";
import { fetchProducts } from "../../store/slices/productsSlice";
import type { RootState } from "../../store";
import type { Product } from "../../data/inventoryData";

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
  const dispatch = useDispatch();

  // Redux state
  const {
    products: availableProducts,
    loading: productsLoading,
    error: productsError,
  } = useSelector((state: RootState) => state.products);

  // Fetch products on component mount
  useEffect(() => {
    dispatch(fetchProducts() as any);
  }, [dispatch]);

  // Form state
  const [customerName, setCustomerName] = useState("");
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
  const [paymentMethod, setPaymentMethod] = useState("Cash");
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
  const discountPercentage =
    discountType === "amount"
      ? subtotal > 0
        ? (discount / subtotal) * 100
        : 0
      : discount;
  const taxAmount = ((subtotal - discountAmount) * taxRate) / 100;
  const finalTotal = subtotal - discountAmount + taxAmount;

  // Combine address fields into a single address string
  const getFullAddress = () => {
    const addressParts = [street, city, state, postalCode, country].filter(
      (part) => part.trim() !== ""
    );
    return addressParts.join(", ");
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
        const { originalProduct, isVariant, variantData } =
          selectedFlatProduct;

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
          [field]: value,
          selectedProduct: null,
        };
      }
    } else {
      updatedProducts[index] = {
        ...updatedProducts[index],
        [field]: value,
      };

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

  const handleSaveDraft = () => {
    // TODO: Implement save as draft functionality
    console.log("Save as draft");
  };

  const handleCreateSale = () => {
    // Validate form
    if (!customerName.trim()) {
      alert("Customer name is required");
      return;
    }

    if (!phoneNumber.trim()) {
      alert("Phone number is required");
      return;
    }

    // Validate address fields (except street which is optional)
    if (!city.trim()) {
      alert("City is required");
      return;
    }

    if (!state.trim()) {
      alert("State/Province is required");
      return;
    }

    if (!postalCode.trim()) {
      alert("Postal code is required");
      return;
    }

    if (!country.trim()) {
      alert("Country is required");
      return;
    }

    if (products.some((p) => !p.name.trim() || p.price <= 0)) {
      alert("Please fill in all product details");
      return;
    }

    // Create sale transaction
    const newTransaction: Omit<Transaction, "id"> = {
      transactionId: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      dateTime: new Date().toLocaleString(),
      customer: customerName.trim(),
      items: products.length,
      total: finalTotal,
      tax: taxAmount,
      payment: paymentMethod as "Cash" | "Card" | "Digital",
      status: "Completed",
      cashier: "Current User",
    };

    // Add the combined address to transaction data for future use
    const transactionWithAddress = {
      ...newTransaction,
      customerDetails: {
        name: customerName.trim(),
        phone: phoneNumber.trim(),
        email: email.trim(),
        address: getFullAddress(),
      },
    };

    // TODO: Implement create transaction API call
    console.log("Creating transaction:", transactionWithAddress);

    // Navigate back to sales page
    navigate(-1);
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
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
                    placeholder="Enter phone number"
                  />
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

              {/* Products loading/error state */}
              {productsLoading && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-blue-700 text-sm">
                    Loading available products...
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
                              ? "Loading products..."
                              : "Select product..."}
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
                              {product.selectedProduct.category}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">
                              Supplier:
                            </span>
                            <div className="text-gray-900">
                              {product.selectedProduct.supplier || "N/A"}
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
                            {flattenedProducts.find(fp => fp.displayName === product.name)?.variantData && (
                              <div className="text-xs text-gray-600 mt-1">
                                <span className="font-medium">Variant SKU:</span> {flattenedProducts.find(fp => fp.displayName === product.name)?.variantData?.sku || 'N/A'}
                                {flattenedProducts.find(fp => fp.displayName === product.name)?.variantData?.pluUpc && (
                                  <>
                                    {" | "}
                                    <span className="font-medium">Variant PLU:</span> {flattenedProducts.find(fp => fp.displayName === product.name)?.variantData?.pluUpc}
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
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="Digital">Digital</option>
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
                >
                  Create Sale
                </SpecialButton>

                <SpecialButton
                  variant="secondary"
                  onClick={handleSaveDraft}
                  className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 py-3"
                >
                  Save as Draft
                </SpecialButton>

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
