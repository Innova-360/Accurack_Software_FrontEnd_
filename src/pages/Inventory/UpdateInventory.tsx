import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { ProductFormData } from "../../components/InventoryComponents/UpdateInventory/types";
import {
  needsVariations,
  shouldHideFields,
} from "../../components/InventoryComponents/UpdateInventory/utils";
import ProductBasicInfo from "../../components/InventoryComponents/UpdateInventory/ProductBasicInfo";
import PackConfiguration from "../../components/InventoryComponents/UpdateInventory/PackConfiguration";
import AttributesConfiguration from "../../components/InventoryComponents/UpdateInventory/AttributesConfiguration";
import VariationsConfiguration from "../../components/InventoryComponents/UpdateInventory/VariationsConfiguration";
import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";

import {
  updateProduct,
  fetchProductById,
} from "../../store/slices/productsSlice";

import { useAppSelector } from "../../store/hooks";
import { selectCurrentStore } from "../../store/selectors";
import useSuppliers from "../../hooks/useSuppliers";
import { fetchUser } from "../../store/slices/userSlice";
import { useProductCategories } from "../../hooks/useProductCategories";

const UpdateInventory: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { productId } = useParams<{ productId: string }>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    setError(null);
    loadProductData();
  };

  const getStoreIdFromUrl = () => {
    const match = location.pathname.match(/store\/([a-f0-9-]+)\//i);
    return match ? match[1] : "";
  };

  const currentStore = useAppSelector(selectCurrentStore);
  const storeId = currentStore?.id || getStoreIdFromUrl();
  const {
    suppliers,
    loading: suppliersLoading,
    error: suppliersError,
  } = useSuppliers(storeId);

  const clientId = useAppSelector((state) => state.user.user?.clientId);

  const {
    categories: productCategories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useProductCategories();

  // Add explicit types for calculateDiscounts
  const calculateDiscounts = (
    discountType: "percentage" | "fixed" | undefined,
    discountValue: number | string | undefined,
    price: number | string | undefined
  ) => {
    if (!discountValue || isNaN(Number(discountValue))) {
      return { discountAmount: 0, percentAmount: 0 };
    }
    if (discountType === "percentage") {
      const percent = parseFloat(String(discountValue));
      const amount = price ? (parseFloat(String(price)) * percent) / 100 : 0;
      return { discountAmount: 0, percentAmount: amount };
    } else if (discountType === "fixed") {
      return {
        discountAmount: parseFloat(String(discountValue)),
        percentAmount: 0,
      };
    }
    return { discountAmount: 0, percentAmount: 0 };
  };

  const buildApiPayload = () => {
    const basePayload: any = {
      id: productId, // Include product ID for update
      name: formData.productName,
      categoryId: formData.category,
      ean: hasVariants ? "" : formData.ean,
      pluUpc: hasVariants ? "" : formData.pluUpc,
      supplierId: (!hasVariants && formData.supplierId) || "",
      sku: hasVariants ? "" : formData.customSku,
      singleItemCostPrice: hasVariants ? 0 : parseFloat(formData.itemCost) || 0,
      itemQuantity: hasVariants ? 0 : parseInt(formData.quantity) || 0,
      msrpPrice: hasVariants ? 0 : parseFloat(formData.msrpPrice) || 0,
      singleItemSellingPrice: hasVariants
        ? 0
        : parseFloat(formData.itemSellingCost) || 0,
      clientId: clientId,
      storeId: storeId,
      hasVariants: hasVariants,
      packs: hasVariants
        ? []
        : (formData.packDiscounts || []).map((pack: any) => {
            const { discountAmount } = calculateDiscounts(
              pack.discountType,
              pack.discountValue,
              formData.itemSellingCost
            );
            return {
              minimumSellingQuantity: pack.quantity,
              totalPacksQuantity: pack.totalPacksQuantity || 0,
              orderedPacksPrice: pack.orderedPacksPrice || 0,
              discountAmount,
              percentDiscount:
                pack.discountType === "percentage" ? pack.discountValue : 0,
            };
          }),
      discountAmount: (() => {
        if (!hasVariants && formData.orderValueDiscountType === "fixed") {
          return parseFloat(formData.orderValueDiscountValue) || 0;
        }
        return 0;
      })(),
      percentDiscount: (() => {
        if (!hasVariants && formData.orderValueDiscountType === "percentage") {
          return parseFloat(formData.orderValueDiscountValue) || 0;
        }
        return 0;
      })(),
      variants: [],
    };

    if (hasVariants && formData.variations && formData.variations.length > 0) {
      console.log("Update: Processing variants with categories:", 
        formData.variations.map((v: any, i: number) => ({
          index: i,
          name: v.name,
          category: v.category
        }))
      );
      
      basePayload.variants = formData.variations.map(
        (variant: any, index: number) => {
          const price = parseFloat(variant.itemSellingCost) || 0;
          const costPrice = parseFloat(variant.itemCost) || 0;
          const msrpPrice = parseFloat(variant.msrpPrice) || 0;
          const quantity = parseInt(variant.quantity) || 0;

          const variantDiscountAmount = parseFloat(variant.discount) || 0;
          const variantPercentDiscount =
            parseFloat(variant.orderValueDiscount) || 0;

          const mappedVariant = {
            id: variant.id, // Include variant ID for update if exists
            name: variant.name || `Variant ${index + 1}`,
            categoryId: variant.category || "", // Include category for variants
            price,
            costPrice,
            sku: variant.customSku || "",
            ean: variant.ean || "",
            pluUpc: variant.plu || variant.pluUpc || "",
            quantity,
            supplierId: variant.supplierId || "",
            msrpPrice,
            discountAmount: variantDiscountAmount,
            percentDiscount: variantPercentDiscount,
            attributes: variant.attributes || {},
            packs: (variant.packDiscounts || []).map((pack: any) => {
              const packPrice = parseFloat(pack.orderedPacksPrice) || 0;
              const { discountAmount: packDiscountAmount } = calculateDiscounts(
                pack.discountType,
                pack.discountValue,
                packPrice
              );
              return {
                id: pack.id, // Include pack ID for update if exists
                minimumSellingQuantity: parseInt(pack.quantity) || 0,
                totalPacksQuantity: parseInt(pack.totalPacksQuantity) || 0,
                orderedPacksPrice: packPrice,
                discountAmount: packDiscountAmount,
                percentDiscount:
                  pack.discountType === "percentage"
                    ? parseFloat(pack.discountValue) || 0
                    : 0,
              };
            }),
          };

          return mappedVariant;
        }
      );
    }

    return basePayload;
  };

  // Form state management
  const [showVariations, setShowVariations] = useState(false);
  const [hasVariants, setHasVariants] = useState(false);
  // Main form data
  const [formData, setFormData] = useState<ProductFormData>({
    productName: "",
    category: "",
    price: "",
    customSku: "",
    ean: "",
    pluUpc: "",
    individualItemQuantity: "1",
    itemCost: "",
    itemSellingCost: "",
    minSellingQuantity: "1",
    minOrderValue: "",
    msrpPrice: "",
    supplierId: "",
    orderValueDiscountType: "",
    orderValueDiscountValue: "",
    quantity: "",
    description: "",
    imageFile: null,
    imagePreview: "",
    hasPackSettings: false,
    packDiscounts: [],
    hasDiscountSettings: false,
    discountTiers: [],
    hasAttributes: false,
    attributes: [],
    variations: [],
  });

  // Load existing product data
  const loadProductData = useCallback(async () => {
    if (!productId) {
      setError("Product ID is required");
      setLoading(false);
      return;
    }
    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(productId)) {
      setError("Invalid product ID format");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const result = await dispatch(fetchProductById(productId) as any);

      if (result.error) {
        console.error("❌ Redux Error:", result.error);
        setError("Product not found or access denied");
        return;
      }

      const product = result.payload;

      if (!product) {
        setError("Product not found");
        return;
      }

      // Handle different property names from API vs transformed product
      const getSellingPrice = () => {
        return (
          product.singleItemSellingPrice ||
          (typeof product.price === "string"
            ? parseFloat(product.price.replace("$", ""))
            : product.price) ||
          0
        );
      };

      const getCostPrice = () => {
        return product.costPrice || product.singleItemCostPrice || 0;
      };

      const getQuantity = () => {
        return product.quantity || product.itemQuantity || 0;
      };

      const getPluUpc = () => {
        return product.pluUpc || product.plu || "";
      };

      const getBrandName = () => {
        return product.brandName || product.brand || "";
      };

      const getMinOrderValue = () => {
        if (product.minOrderValue && product.minOrderValue > 0) {
          return product.minOrderValue;
        }

        // Otherwise calculate: sellingPrice × minSellingQuantity (default 1)
        const sellingPrice = product.singleItemSellingPrice || 0;
        const minSellingQuantity = 1; // Default minimum selling quantity
        const calculatedMinOrderValue = sellingPrice * minSellingQuantity;

        return calculatedMinOrderValue;
      };

      const getDescription = () => {
        return product.description || "";
      };

      const getSupplierId = () => {
        // Check if supplier ID is directly available
        if (product.supplierId) {
          return product.supplierId;
        }
        // Check in productSuppliers array
        if (product.productSuppliers && product.productSuppliers.length > 0) {
          return (
            product.productSuppliers[0].supplierId ||
            product.productSuppliers[0].id ||
            ""
          );
        }
        return "";
      };

      const getPackDiscounts = () => {
        if (!product.packs || product.packs.length === 0) {
          return [];
        }

        const mappedPacks = product.packs.map((pack: any) => ({
          id: pack.id || `pack-${Date.now()}-${Math.random()}`,
          quantity: pack.minimumSellingQuantity || 0,
          discountType:
            pack.percentDiscount && pack.percentDiscount > 0
              ? "percentage"
              : "fixed",
          discountValue:
            pack.percentDiscount && pack.percentDiscount > 0
              ? pack.percentDiscount
              : pack.discountAmount || 0,
          totalPacksQuantity: pack.totalPacksQuantity || 0,
          orderedPacksPrice: pack.orderedPacksPrice || 0,
        }));

        return mappedPacks;
      };

      // Debug: Check variant categories from API
      console.log("Loading variants from API:", 
        (product.variants || []).map((v: any) => ({
          id: v.id,
          name: v.name,
          categoryId: v.categoryId
        }))
      );
      
      // Map product data to form data
      setFormData({
        productName: product.name || "",
        category: product.categoryId || "",
        brandName: getBrandName(),
        price: getSellingPrice().toString(),
        customSku: product.sku || "",
        ean: product.ean || "",
        pluUpc: getPluUpc(),
        individualItemQuantity: "1",
        itemCost: getCostPrice().toString(),
        itemSellingCost: getSellingPrice().toString(),
        minSellingQuantity: "1",
        minOrderValue: getMinOrderValue().toString(),
        msrpPrice: product.msrpPrice?.toString() || "",
        supplierId: getSupplierId(),
        orderValueDiscountType:
          product.percentDiscount && product.percentDiscount > 0
            ? "percentage"
            : product.discountAmount && product.discountAmount > 0
              ? "fixed"
              : "",
        orderValueDiscountValue:
          (product.percentDiscount && product.percentDiscount > 0
            ? product.percentDiscount?.toString()
            : "") ||
          (product.discountAmount && product.discountAmount > 0
            ? product.discountAmount?.toString()
            : "") ||
          "",
        quantity: getQuantity().toString(),
        description: getDescription(),
        imageFile: null,
        imagePreview: product.imageUrl || "",
        hasPackSettings: product.packs && product.packs.length > 0,
        packDiscounts: getPackDiscounts(),
        hasDiscountSettings: false,
        discountTiers: [],
        hasAttributes: product.attributes && product.attributes.length > 0,
        attributes: product.attributes || [],
        variations: (product.variants || []).map((variant: any) => ({
          id: variant.id,
          name: variant.name || `Variant ${variant.id}`,
          category: variant.categoryId || "", // Map categoryId to category
          attributeCombination: variant.attributes || {},
          brandName: variant.brandName || "",
          customSku: variant.sku || "",
          ean: variant.ean || "",
          plu: variant.pluUpc || variant.plu || "",
          pluUpc: variant.pluUpc || variant.plu || "",
          individualItemQuantity: 1,
          itemCost: (
            variant.costPrice ||
            variant.singleItemCostPrice ||
            ""
          ).toString(),
          itemSellingCost: (
            variant.price ||
            variant.singleItemSellingPrice ||
            ""
          ).toString(),
          minSellingQuantity: 1,
          msrpPrice: (variant.msrpPrice || "").toString(),
          minOrderValue: 0,
          orderValueDiscount: (variant.percentDiscount || "").toString(),
          description: variant.description || "",
          quantity: (variant.quantity || variant.itemQuantity || "").toString(),
          price: (variant.price || variant.singleItemSellingPrice || "").toString(),
          discount: (variant.discountAmount || "").toString(),
          supplierId: variant.supplierId || "",
          packDiscounts: variant.packs || variant.packDiscounts || [],
          hasPackSettings:
            (variant.packs || variant.packDiscounts || []).length > 0,
          discountTiers: variant.discountTiers || [],
          hasDiscountTiers: (variant.discountTiers || []).length > 0,
          imageFile: null,
          imagePreview: variant.imagePreview || "",
        })),
      });

      setHasVariants(product.hasVariants || false);

      if (
        product.hasVariants &&
        product.variants &&
        product.variants.length > 0
      ) {
        setShowVariations(true);
      }
    } catch (err) {
      setError("Failed to load product data. Please try again.");
      console.error("Error loading product:", err);
    } finally {
      setLoading(false);
    }
  }, [dispatch, productId]);

  useEffect(() => {
    loadProductData();
    // eslint-disable-next-line
  }, [dispatch, productId, retryCount]);

  // Helper functions
  const handleFormDataChange = useCallback(
    (field: keyof ProductFormData, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  useEffect(() => {
    // Only recalculate if we have the necessary data and minOrderValue is 0 or empty
    const currentMinOrderValue = parseFloat(formData.minOrderValue) || 0;
    const sellingCost = parseFloat(formData.itemSellingCost) || 0;
    const minQuantity = parseInt(formData.minSellingQuantity) || 1;

    // Recalculate if minOrderValue is 0 (likely from API) and we have valid selling data
    if (currentMinOrderValue === 0 && sellingCost > 0 && minQuantity > 0) {
      const calculatedMinOrder = sellingCost * minQuantity;
      setFormData((prev) => ({
        ...prev,
        minOrderValue: calculatedMinOrder.toFixed(2),
      }));
    }
  }, [
    formData.itemSellingCost,
    formData.minSellingQuantity,
    formData.minOrderValue,
  ]);

  // Step 2: Recalculate minOrderValue for variants after form data is loaded from API
  useEffect(() => {
    if (formData.variations && formData.variations.length > 0) {
      const updatedVariations = formData.variations.map((variation) => {
        const currentMinOrderValue =
          parseFloat(String(variation.minOrderValue)) || 0;
        const sellingCost = parseFloat(String(variation.itemSellingCost)) || 0;
        const minQuantity = parseInt(String(variation.minSellingQuantity)) || 1;

        // Recalculate if minOrderValue is 0 (likely from API) and we have valid selling data
        if (currentMinOrderValue === 0 && sellingCost > 0 && minQuantity > 0) {
          const calculatedMinOrder = sellingCost * minQuantity;
          return {
            ...variation,
            minOrderValue: calculatedMinOrder,
          };
        }
        return variation;
      });

      // Only update if there were changes
      const hasChanges = updatedVariations.some(
        (variation, index) =>
          variation.minOrderValue !== formData.variations![index].minOrderValue
      );

      if (hasChanges) {
        setFormData((prev) => ({
          ...prev,
          variations: updatedVariations,
        }));
      }
    }
  }, [formData.variations]);

  const showOptionalFields = !shouldHideFields(
    formData.hasAttributes,
    formData.attributes,
    showVariations
  );

  const hasMultipleAttributeOptions = needsVariations(
    formData.hasAttributes,
    formData.attributes
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!productId) {
      setError("Product ID is required");
      return;
    }

    setIsSubmitting(true);
    const payload = buildApiPayload();

    dispatch(updateProduct({ productId, productData: payload }) as any)
      .then((result: any) => {
        if (!result.error) {
          navigate(`/store/${storeId}/inventory`);
        } else {
          setIsSubmitting(false);
        }
      })
      .catch(() => {
        setIsSubmitting(false);
      });
  };

  const handleNext = () => {
    setShowVariations(true);
  };

  const handleBack = () => {
    setShowVariations(false);
  };

  // Calculate progress percentage based on whether variants are enabled
  const calculateProgress = () => {
    if (hasVariants) {
      const requiredFields = [
        formData.productName,
        formData.category,
        formData.price,
      ];

      const filledFields = requiredFields.filter(
        (field) => field && field.toString().trim() !== ""
      ).length;

      const hasValidAttributes =
        formData.hasAttributes &&
        formData.attributes.length > 0 &&
        formData.attributes.every((attr) => attr.options.length >= 2);

      const attributeScore = hasValidAttributes ? 1 : 0;

      return Math.round(
        ((filledFields + attributeScore) / (requiredFields.length + 1)) * 100
      );
    } else {
      const requiredFields = [
        formData.productName,
        formData.category,
        formData.price,
        formData.pluUpc,
        formData.individualItemQuantity,
        formData.itemCost,
        formData.itemSellingCost,
        formData.minSellingQuantity,
        formData.minOrderValue,
        formData.quantity,
      ];

      const filledFields = requiredFields.filter(
        (field) => field && field.toString().trim() !== ""
      ).length;
      return Math.round((filledFields / requiredFields.length) * 100);
    }
  };

  const progress = calculateProgress();

  useEffect(() => {
    // Fetch user info on mount to ensure user is loaded
    dispatch(fetchUser() as any).then((result: any) => {
      if (result && result.payload) {
        localStorage.setItem("clientId", result.payload.clientId || "");
      }
    });
  }, []);

  // Handle barcode data from navigation state
  useEffect(() => {
    if (location.state?.scannedPLU) {
      setFormData((prev) => ({
        ...prev,
        pluUpc: location.state.scannedPLU,
      }));
    }
  }, [location.state]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0f4d57] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Assuming Header component is available or needs to be imported */}
        {/* <Header /> */}
        <div className="px-4 py-8 mx-auto max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Error Loading Product
              </h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleRetry}
                  className="bg-[#0f4d57] text-white px-6 py-2 rounded-lg hover:bg-[#0d3f47] transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate(`/store/${storeId}/inventory`)}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Back to Inventory
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-teal-400/20 to-green-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
      </div>

      {/* Enhanced Header with Milestone Progress */}
      <div className="relative z-10 bg-white/80 backdrop-blur-sm shadow-xl border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between h-auto sm:h-24 py-4 sm:py-0 gap-4 sm:gap-0">
            <div className="flex items-center space-x-3 sm:space-x-6">
              <button
                onClick={() => (showVariations ? handleBack() : navigate(-1))}
                className="group p-2 sm:p-3 text-gray-600 hover:text-[#0f4d57] hover:bg-gray-100/80 rounded-full transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 transform group-hover:-translate-x-1 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div className="flex flex-col">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#0f4d57] to-[#16a085] bg-clip-text text-transparent transition-all duration-300">
                  {showVariations
                    ? "Update Product Variations"
                    : "Update Product"}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1 font-medium">
                  {showVariations
                    ? "Modify variations of your product with updated attributes"
                    : "Update product information and settings"}
                </p>
              </div>
            </div>

            {/* Enhanced Milestone Progress Indicator */}
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 lg:space-x-8 w-full sm:w-auto">
              <div className="flex items-center space-x-3 sm:space-x-6 order-1 sm:order-2">
                <div
                  className={`flex items-center space-x-2 sm:space-x-3 px-3 py-2 sm:px-4 rounded-full transition-all duration-500 transform ${
                    !showVariations
                      ? "bg-[#0f4d57] text-white shadow-lg scale-105 shadow-[#0f4d57]/20"
                      : "bg-green-100 text-green-700 border border-green-200 shadow-green-100/50 shadow-md"
                  }`}
                >
                  <div
                    className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                      !showVariations ? "bg-white" : "bg-green-500"
                    }`}
                  ></div>
                  <span className="text-xs sm:text-sm font-semibold">
                    Product Details
                  </span>
                </div>
                <div
                  className={`w-4 sm:w-8 h-0.5 ${
                    showVariations
                      ? "bg-gradient-to-r from-[#0f4d57] to-green-500 shadow-md"
                      : "bg-gray-300"
                  }`}
                ></div>
                <div
                  className={`flex items-center space-x-2 sm:space-x-3 px-3 py-2 sm:px-4 rounded-full transition-all duration-500 transform ${
                    showVariations
                      ? "bg-[#0f4d57] text-white shadow-lg scale-105 shadow-[#0f4d57]/20"
                      : "bg-gray-100 text-gray-500 border border-gray-200"
                  }`}
                >
                  <div
                    className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                      showVariations ? "bg-white" : "bg-gray-400"
                    }`}
                  ></div>
                  <span className="text-xs sm:text-sm font-semibold">
                    Variations
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form Content */}
      <div className="relative z-10">
        {/* Product Variants Toggle Section */}
        {!showVariations && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200/50 mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                      Product Variants
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {hasVariants
                        ? "This product has multiple variations with different attributes"
                        : "Enable this to create product variations (e.g., different sizes, colors, etc.)"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
                  <span
                    className={`text-xs sm:text-sm font-medium transition-colors duration-200 ${!hasVariants ? "text-gray-900" : "text-gray-500"}`}
                  >
                    Simple Product
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasVariants}
                      onChange={(e) => {
                        setHasVariants(e.target.checked);
                        if (e.target.checked) {
                          handleFormDataChange("hasAttributes", true);
                        }
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 sm:w-14 sm:h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 sm:after:h-6 sm:after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-indigo-600 shadow-lg"></div>
                  </label>
                  <span
                    className={`text-xs sm:text-sm font-medium transition-colors duration-200 ${hasVariants ? "text-gray-900" : "text-gray-500"}`}
                  >
                    With Variants
                  </span>
                </div>
              </div>

              {hasVariants && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <svg
                      className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Variant Mode Enabled</p>
                      <p className="text-blue-700">
                        You can modify attributes and update specific variations
                        with their individual details (vendor, SKU, pricing,
                        etc.) in the next step.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto p-4 sm:p-6">
          <div>
            {!showVariations ? (
              <div className="space-y-6 sm:space-y-8">
                {/* Product Basic Information */}
                <div className="">
                  <ProductBasicInfo
                    formData={formData}
                    onFormDataChange={handleFormDataChange}
                    showOptionalFields={
                      hasVariants ? false : showOptionalFields
                    }
                    isVariantMode={hasVariants}
                    suppliers={suppliers}
                    suppliersLoading={suppliersLoading}
                    suppliersError={suppliersError}
                    categories={productCategories}
                    categoriesLoading={categoriesLoading}
                  />
                </div>

                {/* Configuration Sections */}
                {!hasVariants && showOptionalFields && (
                  <div className="grid grid-cols-1 gap-6 sm:gap-8">
                    <div className="">
                      <PackConfiguration
                        hasPackSettings={formData.hasPackSettings}
                        onToggle={(value) =>
                          handleFormDataChange("hasPackSettings", value)
                        }
                        packDiscounts={formData.packDiscounts}
                        onPackDiscountsChange={(discounts) =>
                          handleFormDataChange("packDiscounts", discounts)
                        }
                        itemSellingPrice={parseFloat(formData.itemSellingCost) || 0}
                      />
                    </div>
                  </div>
                )}

                {/* Attributes Configuration */}
                <div className="">
                  <AttributesConfiguration
                    hasAttributes={hasVariants ? true : formData.hasAttributes}
                    onToggle={
                      hasVariants
                        ? () => {}
                        : (value) =>
                            handleFormDataChange("hasAttributes", value)
                    }
                    attributes={formData.attributes}
                    onAttributesChange={(attributes) =>
                      handleFormDataChange("attributes", attributes)
                    }
                    isVariantMode={hasVariants}
                  />
                </div>

                {/* Enhanced Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between pt-6 sm:pt-8 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200/50 space-y-4 sm:space-y-0">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="group w-full sm:w-auto px-6 sm:px-8 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 transform hover:scale-105 hover:shadow-md flex items-center justify-center space-x-2"
                  >
                    <svg
                      className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-200"
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
                    <span>Cancel</span>
                  </button>{" "}
                  <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                    {progress < 100 && (
                      <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 px-3 sm:px-4 py-2 rounded-lg border border-amber-200">
                        <svg
                          className="w-4 h-4 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-xs sm:text-sm font-medium text-center sm:text-left">
                          {hasVariants
                            ? "Please complete basic info and configure attributes with at least 2 options each"
                            : "Please complete all required fields"}
                        </span>
                      </div>
                    )}

                    {hasVariants ? (
                      // For variant mode, always show Next button
                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={progress < 100}
                        className={`w-full sm:w-auto px-6 sm:px-8 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 ${
                          progress >= 100
                            ? "bg-[#0f4d57] text-white hover:bg-[#0f4d57]/90 shadow-md"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        <span className="text-sm sm:text-base">
                          Next: Configure Variations
                        </span>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    ) : hasMultipleAttributeOptions ? (
                      // For non-variant mode with attributes
                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={progress < 100}
                        className={`w-full sm:w-auto px-6 sm:px-8 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 ${
                          progress >= 100
                            ? "bg-[#0f4d57] text-white hover:bg-[#0f4d57]/90 shadow-md"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        <span className="text-sm sm:text-base">
                          Next: Configure Variations
                        </span>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    ) : (
                      // For simple product mode
                      <button
                        type="submit"
                        disabled={progress < 100 || isSubmitting}
                        className={`w-full sm:w-auto px-6 sm:px-8 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 ${
                          progress >= 100 && !isSubmitting
                            ? "bg-[#0f4d57] text-white hover:bg-[#0f4d57]/90 shadow-md"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span className="text-sm sm:text-base">
                              Updating...
                            </span>
                          </>
                        ) : (
                          <span className="text-sm sm:text-base">
                            Update Product
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 sm:space-y-8">
                {/* Variations Configuration with enhanced styling */}
                <div className="">
                  <VariationsConfiguration
                    variations={formData.variations}
                    attributes={formData.attributes}
                    onVariationsChange={(variations) =>
                      handleFormDataChange("variations", variations)
                    }
                    suppliers={suppliers}
                    suppliersLoading={suppliersLoading}
                    suppliersError={suppliersError}
                    categories={productCategories}
                    categoriesLoading={categoriesLoading}
                    categoriesError={categoriesError}
                  />
                </div>
                {/* Enhanced Action Buttons for Variations */}
                <div className="flex flex-col sm:flex-row items-center justify-between pt-6 sm:pt-8 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200/50 space-y-4 sm:space-y-0">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="group w-full sm:w-auto px-6 sm:px-8 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 transform hover:scale-105 hover:shadow-md flex items-center justify-center space-x-2"
                  >
                    <svg
                      className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-200"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    <span className="text-sm sm:text-base">
                      Back to Product Details
                    </span>
                  </button>

                  <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      className="w-full sm:w-auto px-6 sm:px-8 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 transform hover:scale-105 hover:shadow-md"
                    >
                      <span className="text-sm sm:text-base">Cancel</span>
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full sm:w-auto px-6 sm:px-8 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2 ${
                        isSubmitting
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-[#0f4d57] text-white hover:bg-[#0f4d57]/90"
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span className="text-sm sm:text-base">
                            Updating...
                          </span>
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span className="text-sm sm:text-base">
                            Update a Product with Variations
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateInventory;
