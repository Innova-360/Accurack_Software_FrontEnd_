// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import Header from "../../components/Header";
// import type { Product } from "../../data/inventoryData";
// import { productAPI } from "../../services/productAPI";

// const ProductDetails: React.FC = () => {
//   const { productId } = useParams<{ productId: string }>();
//   const navigate = useNavigate();
//   const [product, setProduct] = useState<Product | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchProduct = async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         console.log("Fetching product with ID:", productId);

//         // Try to fetch product from API
//         const productData = await productAPI.getProductById(productId!);
//         console.log("Fetched product data:", productData);
//         setProduct(productData);
//       } catch (err) {
//         console.error("Error fetching product:", err);
//         setError("Product not found");
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (productId) {
//       fetchProduct();
//     }
//   }, [productId]);

//   const handleBack = () => {
//     navigate(-1);
//   };

//   const handleEdit = () => {
//     navigate(`/inventory/edit/${productId}`);
//   };

//   const handleUpdateInventory = () => {
//     console.log("Update inventory for product:", productId);
//   };

//   const handleCreatePurchaseOrder = () => {
//     console.log("Create purchase order for product:", productId);
//   };

//   const handleViewSalesReport = () => {
//     console.log("View sales report for product:", productId);
//   };

//   const handlePrintBarcode = () => {
//     console.log("Print barcode for product:", product?.sku || productId);
//     if (product) {
//       const printWindow = window.open("", "_blank");
//       if (printWindow) {
//         printWindow.document.write(`
//           <html>
//             <head>
//               <title>Barcode - ${product.name}</title>
//               <style>
//                 body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
//                 .barcode { font-size: 24px; font-family: 'Courier New', monospace; margin: 20px 0; }
//                 .product-info { margin: 10px 0; }
//               </style>
//             </head>
//             <body>
//               <h2>${product.name}</h2>
//               <div class="product-info">SKU: ${product.sku}</div>
//               <div class="product-info">PLU: ${product.plu}</div>
//               ${product.ean ? `<div class="product-info">EAN: ${product.ean}</div>` : ""}
//               <div class="barcode">||||| ${product.ean || product.plu} |||||</div>
//               <div class="product-info">Price: ${product.price}</div>
//             </body>
//           </html>
//         `);
//         printWindow.document.close();
//         printWindow.print();
//       }
//     }
//   };

//   if (loading) {
//     return (
//       <>
//         <Header />
//         <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//         </div>
//       </>
//     );
//   }

//   if (error || !product) {
//     return (
//       <>
//         <Header />
//         <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//           <div className="text-center">
//             <h2 className="text-2xl font-bold text-gray-800 mb-4">
//               Product Not Found
//             </h2>
//             <p className="text-gray-600 mb-6">
//               The product you're looking for doesn't exist.
//             </p>
//             <button
//               onClick={handleBack}
//               className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
//             >
//               Go Back
//             </button>
//           </div>
//         </div>
//       </>
//     );
//   }

//   return (
//     <>
//       <Header />
//       <div className="min-h-screen bg-[#f9fafb] pb-6">
//         <div className="max-w-full mx-auto px-4 py-6">
//           {/* Product Header */}
//           <div className="mb-6">
//             <div className="flex items-center">
//               <button
//                 onClick={handleBack}
//                 className="hover:bg-gray-100 rounded-lg transition-colors"
//               >
//                 <svg
//                   className="w-5 h-5 text-gray-600"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M19 12H5m0 0l7 7m-7-7l7-7"
//                   />
//                 </svg>
//               </button>
//               <div className="text-sm text-gray-600 ml-1">
//                 Product / {product.category}
//               </div>
//             </div>
//             <h1 className="text-3xl font-bold text-gray-900 mt-2">
//               {product.name}
//             </h1>
//           </div>

//           {/* Main Content Grid */}
//           <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6">
//             {/* Left Column - 40% width (2/5) */}
//             <div className="lg:col-span-2 space-y-6">
//               {/* Basic Product Information */}
//               <div className="bg-white rounded-lg">
//                 <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-5 p-5">
//                   Basic Product Information
//                 </h2>

//                 <div className="space-y-6 p-6">
//                   <div className="grid grid-cols-2 gap-6">
//                     <div>
//                       <label className="block text-md font-medium text-gray-500 mb-2">
//                         SKU
//                       </label>
//                       <div className="text-md text-gray-800 font-semibold">
//                         {product.sku}
//                       </div>
//                     </div>
//                     <div>
//                       <label className="block text-md font-medium text-gray-500 mb-2">
//                         PLU / UPC
//                       </label>
//                       <div className="text-md text-gray-800 font-semibold">
//                         {product.plu}
//                       </div>
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-md font-medium text-gray-500 mb-2">
//                       Barcode
//                     </label>
//                     <div className="relative bg-[#f9fafb] flex flex-row items-center justify-between p-4 rounded-lg">
//                       <img src="/img.png" alt="img" />
//                       <div className="flex items-center gap-3">
//                         <button
//                           onClick={() => {
//                             // Download barcode functionality
//                             const link = document.createElement("a");
//                             link.href =
//                               "data:text/plain;charset=utf-8,Barcode: " +
//                               (product.ean || product.plu);
//                             link.download = `barcode-${product.sku}.txt`;
//                             link.click();
//                           }}
//                         >
//                           <svg
//                             className="w-6 h-6"
//                             fill="none"
//                             stroke="#003f4a"
//                             viewBox="0 0 24 24"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth={2}
//                               d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
//                             />
//                           </svg>
//                         </button>
//                         <button onClick={handlePrintBarcode}>
//                           <svg
//                             className="w-6 h-6"
//                             fill="none"
//                             stroke="#003f4a"
//                             viewBox="0 0 24 24"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth={2}
//                               d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
//                             />
//                           </svg>
//                         </button>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-2 gap-6">
//                     <div>
//                       <label className="block text-md font-medium text-gray-500 mb-2">
//                         Category
//                       </label>
//                       <div className="text-md text-gray-800 font-semibold">
//                         {product.category}
//                       </div>
//                     </div>
//                     <div>
//                       <label className="block text-md font-medium text-gray-500 mb-2">
//                         Subcategory
//                       </label>
//                       <div className="text-md text-gray-800 font-semibold">
//                         T-Shirts
//                       </div>
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-3">
//                       Variants
//                     </label>
//                     <div className="flex gap-2 flex-wrap">
//                       {["S", "M", "L", "White", "Black", "Blue"].map(
//                         (variant) => (
//                           <span
//                             key={variant}
//                             className="inline-flex items-center px-3 py-1 rounded-full text-sm font-small bg-gray-100 text-gray-700"
//                           >
//                             {variant}
//                           </span>
//                         )
//                       )}
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-3">
//                       Product Status
//                     </label>
//                     <div className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-green-50 text-green-700">
//                       <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
//                       Active
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Pricing & Cost */}
//               <div className="bg-white rounded-lg">
//                 <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-5 p-5">
//                   Pricing & Cost
//                 </h2>

//                 <div className="space-y-6 p-6">
//                   <div className="grid grid-cols-2 gap-6">
//                     <div>
//                       <label className="block text-md font-medium text-gray-500 mb-2">
//                         Cost Price
//                       </label>
//                       <div className="text-md text-gray-800 font-semibold">
//                         ${product.costPrice || "12.00"}
//                       </div>
//                     </div>
//                     <div>
//                       <label className="block text-md font-medium text-gray-500 mb-2">
//                         Selling Price
//                       </label>
//                       <div className="text-md text-gray-800 font-semibold">
//                         {product.price}
//                       </div>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-2 gap-6">
//                     <div>
//                       <label className="block text-md font-medium text-gray-500 mb-2">
//                         MSRP Price
//                       </label>
//                       <div className="text-md text-gray-800 font-semibold">
//                         ${product.msrpPrice || "29.99"}
//                       </div>
//                     </div>
//                     <div>
//                       <label className="block text-md font-medium text-gray-500 mb-2">
//                         Tax Rate
//                       </label>
//                       <div className="text-md text-gray-800 font-semibold">
//                         7.5%
//                       </div>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-2 gap-6">
//                     <div>
//                       <label className="block text-md font-medium text-gray-500 mb-2">
//                         Profit Margin
//                       </label>
//                       <div className="text-md text-gray-800 font-semibold">
//                         {product.profitMargin || "58.49%"}
//                       </div>
//                     </div>
//                     <div>
//                       <label className="block text-md font-medium text-gray-500 mb-2">
//                         Yes - Summer Sale (15%)
//                       </label>
//                       <div className="text-md text-gray-800 font-semibold">
//                         -
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Suppliers */}
//               <div className="bg-white rounded-lg">
//                 <div className="flex justify-between items-center border-b border-gray-200 pb-5 p-5">
//                   <h2 className="text-xl font-semibold text-gray-900">
//                     Suppliers
//                   </h2>
//                   <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
//                     + Add Supplier
//                   </button>
//                 </div>

//                 <div className="p-6">
//                   {/* Table Header */}
//                   <div className="grid grid-cols-5 gap-4 pb-3 mb-4 text-sm font-medium text-gray-500 border-b border-gray-200">
//                     <div>Supplier Name</div>
//                     <div>Contact</div>
//                     <div>Last Cost</div>
//                     <div>Last Purchase</div>
//                     <div>Primary</div>
//                   </div>

//                   {/* Table Rows */}
//                   <div className="space-y-4">
//                     {/* Textile Masters Inc. Row */}
//                     <div className="grid grid-cols-5 gap-4 items-center py-3">
//                       <div className="text-sm text-gray-900 font-medium">
//                         Textile Masters Inc.
//                       </div>
//                       <div className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
//                         contact@textilemaster.com
//                       </div>
//                       <div className="text-sm text-gray-900 font-semibold">
//                         $12.50
//                       </div>
//                       <div className="text-sm text-gray-900">
//                         Jun 15, 2023
//                       </div>
//                       <div className="text-sm">
//                         <span className="text-yellow-500 text-lg">
//                           ★
//                         </span>
//                       </div>
//                     </div>

//                     {/* Apparel Wholesalers Row */}
//                     <div className="grid grid-cols-5 gap-4 items-center py-3">
//                       <div className="text-sm text-gray-900 font-medium">
//                         Apparel Wholesalers
//                       </div>
//                       <div className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
//                         sales@apparelwhole.com
//                       </div>
//                       <div className="text-sm text-gray-900 font-semibold">
//                         $13.25
//                       </div>
//                       <div className="text-sm text-gray-900">
//                         Mar 10, 2023
//                       </div>
//                       <div className="text-sm">
//                         <span className="text-gray-300 text-lg">
//                           ☆
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Right Column - 60% width (3/5) */}
//             <div className="lg:col-span-3 space-y-6">
//               {/* old code, don't remove it */}
//               {/* <div className="bg-white rounded-lg">
//                 <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-5 p-5">
//                   Inventory & Restocking
//                 </h2>

//                 <div className="space-y-6 p-6">
//                   <div className="grid grid-cols-2 gap-6">
//                     <div>
//                       <label className="block text-md font-medium text-gray-500 mb-2">
//                         Current Stock
//                       </label>
//                       <div className="text-md text-gray-800 font-semibold">
//                         {product.quantity} units
//                       </div>
//                     </div>
//                     <div>
//                       <label className="block text-md font-medium text-gray-500 mb-2">
//                         Minimum Stock
//                       </label>
//                       <div className="text-md text-gray-800 font-semibold">
//                         20 units
//                       </div>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-2 gap-6">
//                     <div>
//                       <label className="block text-md font-medium text-gray-500 mb-2">
//                         Reserve Stock
//                       </label>
//                       <div className="text-md text-gray-800 font-semibold">
//                         5 units
//                       </div>
//                     </div>
//                     <div>
//                       <label className="block text-md font-medium text-gray-500 mb-2">
//                         Last Restocked
//                       </label>
//                       <div className="text-md text-gray-800 font-semibold">
//                         Jun 15, 2025
//                       </div>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-2 gap-6">
//                     <div>
//                       <label className="block text-md font-medium text-gray-500 mb-2">
//                         Store
//                       </label>
//                       <div className="text-md text-gray-800 font-semibold">
//                         {product.store?.name || "Main Store"}
//                       </div>
//                     </div>
//                     <div>
//                       <label className="block text-md font-medium text-gray-500 mb-2">
//                         Warehouse
//                       </label>
//                       <div className="text-md text-gray-800 font-semibold">
//                         Warehouse A
//                       </div>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-2 gap-6">
//                     <div>
//                       <label className="block text-md font-medium text-gray-500 mb-2">
//                         Online Stock
//                       </label>
//                       <div className="text-md text-gray-800 font-semibold">
//                         15 units
//                       </div>
//                     </div>
//                     <div>
//                       <label className="block text-md font-medium text-gray-500 mb-2">
//                         Offline Stock
//                       </label>
//                       <div className="flex items-center gap-2">
//                         <div className="text-md text-gray-800 font-semibold">
//                           5 units
//                         </div>
//                         <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 border border-red-200">
//                           Low
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div> */}



//               {/* Inventory & Restocking */}
//               <div className="bg-white rounded-lg">
//                 <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-5 p-5">
//                   Inventory & Restocking
//                 </h2>

//                 <div className="p-6">
//                   {/* Summary Row */}
//                   <div className="grid grid-cols-4 gap-6 mb-6">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-500 mb-1">
//                         Current Stock
//                       </label>
//                       <div className="text-lg text-gray-900 font-semibold">
//                         42 units
//                       </div>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-500 mb-1">
//                         Minimum Stock
//                       </label>
//                       <div className="text-lg text-gray-900 font-semibold">
//                         20 units
//                       </div>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-500 mb-1">
//                         Last Restock
//                       </label>
//                       <div className="text-lg text-gray-900 font-semibold">
//                         Jun 15, 2023
//                       </div>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-500 mb-1">
//                         Last Sold
//                       </label>
//                       <div className="text-lg text-gray-900 font-semibold">
//                         Today, 10:23 AM
//                       </div>
//                     </div>
//                   </div>

//                   {/* Store-wise Stock Section */}
//                   <div>
//                     <h3 className="text-sm font-medium text-gray-900 mb-4">
//                       Store-wise Stock
//                     </h3>
//                     {/* Table Header */}
//                     <div className="grid grid-cols-5 gap-4 py-3 text-sm font-medium text-gray-500 border-b border-gray-200">
//                       <div>Location</div>
//                       <div>Stock</div>
//                       <div>Min. Level</div>
//                       <div>Status</div>
//                       <div>Actions</div>
//                     </div>
//                     {/* Table Rows */}
//                     <div className="space-y-2 mt-2">
//                       {/* Main Store Row */}
//                       <div className="grid grid-cols-5 gap-4 py-3 items-center">
//                         <div className="text-sm text-gray-900 font-medium">
//                           Main Store
//                         </div>
//                         <div className="text-sm text-gray-900 font-semibold">
//                           25 units
//                         </div>
//                         <div className="text-sm text-gray-900">10 units</div>
//                         <div>
//                           <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                             Normal
//                           </span>
//                         </div>
//                         <div>
//                           <button className="text-gray-400 hover:text-gray-600">
//                             <svg
//                               className="w-4 h-4"
//                               fill="none"
//                               stroke="currentColor"
//                               viewBox="0 0 24 24"
//                             >
//                               <path
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 strokeWidth={2}
//                                 d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
//                               />
//                             </svg>
//                           </button>
//                         </div>
//                       </div>

//                       {/* Warehouse Row */}
//                       <div className="grid grid-cols-5 gap-4 py-3 items-center">
//                         <div className="text-sm text-gray-900 font-medium">
//                           Warehouse
//                         </div>
//                         <div className="text-sm text-gray-900 font-semibold">
//                           15 units
//                         </div>
//                         <div className="text-sm text-gray-900">20 units</div>
//                         <div>
//                           <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
//                             Low
//                           </span>
//                         </div>
//                         <div>
//                           <button className="text-gray-400 hover:text-gray-600">
//                             <svg
//                               className="w-4 h-4"
//                               fill="none"
//                               stroke="currentColor"
//                               viewBox="0 0 24 24"
//                             >
//                               <path
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 strokeWidth={2}
//                                 d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
//                               />
//                             </svg>
//                           </button>
//                         </div>
//                       </div>

//                       {/* Online Store Row */}
//                       <div className="grid grid-cols-5 gap-4 py-3 items-center">
//                         <div className="text-sm text-gray-900 font-medium">
//                           Online Store
//                         </div>
//                         <div className="text-sm text-gray-900 font-semibold">
//                           2 units
//                         </div>
//                         <div className="text-sm text-gray-900">5 units</div>
//                         <div>
//                           <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
//                             Critical
//                           </span>
//                         </div>
//                         <div>
//                           <button className="text-gray-400 hover:text-gray-600">
//                             <svg
//                               className="w-4 h-4"
//                               fill="none"
//                               stroke="currentColor"
//                               viewBox="0 0 24 24"
//                             >
//                               <path
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 strokeWidth={2}
//                                 d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
//                               />
//                             </svg>
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>




//               {/* History Section */}
//               <div className="bg-white rounded-lg">
//                 <div className="flex justify-between items-center border-b border-gray-200 pb-5 p-5">
//                   <h2 className="text-xl font-semibold text-gray-900">
//                     History
//                   </h2>
//                   <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
//                     View All
//                   </button>
//                 </div>

//                 <div className="overflow-x-auto p-6">
//                   <table className="min-w-full">
//                     <thead>
//                       <tr className="border-b border-gray-200">
//                         <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
//                           Date & Time
//                         </th>
//                         <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
//                           Type
//                         </th>
//                         <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
//                           Quantity
//                         </th>
//                         <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
//                           Location
//                         </th>
//                         <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
//                           User
//                         </th>
//                         <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
//                           Reference
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       <tr className="border-b border-gray-100 hover:bg-gray-50">
//                         <td className="py-3 px-4 text-sm text-gray-900">
//                           Today 10:21 AM
//                         </td>
//                         <td className="py-3 px-4 text-sm">
//                           <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
//                             Sale
//                           </span>
//                         </td>
//                         <td className="py-3 px-4 text-sm text-gray-900 font-semibold">
//                           -1
//                         </td>
//                         <td className="py-3 px-4 text-sm text-gray-900">
//                           Main Store
//                         </td>
//                         <td className="py-3 px-4 text-sm text-gray-900">
//                           System
//                         </td>
//                         <td className="py-3 px-4 text-sm text-gray-900 font-mono">
//                           INV-001
//                         </td>
//                       </tr>
//                       <tr className="border-b border-gray-100 hover:bg-gray-50">
//                         <td className="py-3 px-4 text-sm text-gray-900">
//                           Yesterday, 3:47 PM
//                         </td>
//                         <td className="py-3 px-4 text-sm">
//                           <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
//                             Sale
//                           </span>
//                         </td>
//                         <td className="py-3 px-4 text-sm text-gray-900 font-semibold">
//                           -2
//                         </td>
//                         <td className="py-3 px-4 text-sm text-gray-900">
//                           Online Store
//                         </td>
//                         <td className="py-3 px-4 text-sm text-gray-900">
//                           System
//                         </td>
//                         <td className="py-3 px-4 text-sm text-gray-900 font-mono">
//                           WEB-002
//                         </td>
//                       </tr>
//                       <tr className="border-b border-gray-100 hover:bg-gray-50">
//                         <td className="py-3 px-4 text-sm text-gray-900">
//                           Jun 15, 2025, 8:30 AM
//                         </td>
//                         <td className="py-3 px-4 text-sm">
//                           <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
//                             Restock
//                           </span>
//                         </td>
//                         <td className="py-3 px-4 text-sm text-gray-900 font-semibold">
//                           +50
//                         </td>
//                         <td className="py-3 px-4 text-sm text-gray-900">
//                           Warehouse
//                         </td>
//                         <td className="py-3 px-4 text-sm text-gray-900">
//                           Mara Johnson
//                         </td>
//                         <td className="py-3 px-4 text-sm text-gray-900 font-mono">
//                           PO-015
//                         </td>
//                       </tr>
//                       <tr className="border-b border-gray-100 hover:bg-gray-50">
//                         <td className="py-3 px-4 text-sm text-gray-900">
//                           Jun 10, 2025, 2:15 PM
//                         </td>
//                         <td className="py-3 px-4 text-sm">
//                           <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
//                             Transfer
//                           </span>
//                         </td>
//                         <td className="py-3 px-4 text-sm text-gray-900 font-semibold">
//                           -10 | +10
//                         </td>
//                         <td className="py-3 px-4 text-sm text-gray-900">
//                           Warehouse → Main Store
//                         </td>
//                         <td className="py-3 px-4 text-sm text-gray-900">
//                           Mara Johnson
//                         </td>
//                         <td className="py-3 px-4 text-sm text-gray-900 font-mono">
//                           TR-003
//                         </td>
//                       </tr>
//                       <tr className="hover:bg-gray-50">
//                         <td className="py-3 px-4 text-sm text-gray-900">
//                           Jun 5, 2025, 10:00 AM
//                         </td>
//                         <td className="py-3 px-4 text-sm">
//                           <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
//                             Restock
//                           </span>
//                         </td>
//                         <td className="py-3 px-4 text-sm text-gray-900 font-semibold">
//                           +25
//                         </td>
//                         <td className="py-3 px-4 text-sm text-gray-900">
//                           Warehouse
//                         </td>
//                         <td className="py-3 px-4 text-sm text-gray-900">
//                           Mara Johnson
//                         </td>
//                         <td className="py-3 px-4 text-sm text-gray-900 font-mono">
//                           PO-010
//                         </td>
//                       </tr>
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>




//         {/* Fixed Action Footer */}
//         <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 z-50">
//           <div className="max-w-full mx-auto px-4 py-3">
//             <div className="flex flex-wrap gap-2 justify-center">
//               <button
//                 onClick={handleEdit}
//                 className="bg-[#003f4a] text-white px-4 py-2 rounded hover:bg-[#002a32] transition-colors flex items-center gap-2 text-sm font-medium border border-[#003f4a]"
//               >
//                 <svg
//                   className="w-4 h-4"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
//                   />
//                 </svg>
//                 Edit Product
//               </button>

//               <button
//                 onClick={handleUpdateInventory}
//                 className="bg-[#003f4a] text-white px-4 py-2 rounded hover:bg-[#002a32] transition-colors flex items-center gap-2 text-sm font-medium border border-[#003f4a]"
//               >
//                 <svg
//                   className="w-4 h-4"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
//                   />
//                 </svg>
//                 Update Inventory
//               </button>

//               <button
//                 onClick={handleCreatePurchaseOrder}
//                 className="bg-[#003f4a] text-white px-4 py-2 rounded hover:bg-[#002a32] transition-colors flex items-center gap-2 text-sm font-medium border border-[#003f4a]"
//               >
//                 <svg
//                   className="w-4 h-4"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
//                   />
//                 </svg>
//                 Create Purchase Order
//               </button>

//               <button
//                 onClick={handleViewSalesReport}
//                 className="bg-[#003f4a] text-white px-4 py-2 rounded hover:bg-[#002a32] transition-colors flex items-center gap-2 text-sm font-medium border border-[#003f4a]"
//               >
//                 <svg
//                   className="w-4 h-4"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
//                   />
//                 </svg>
//                 View Sales Report
//               </button>

//               <button
//                 onClick={handlePrintBarcode}
//                 className="bg-[#003f4a] text-white px-4 py-2 rounded hover:bg-[#002a32] transition-colors flex items-center gap-2 text-sm font-medium border border-[#003f4a]"
//               >
//                 <svg
//                   className="w-4 h-4"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
//                   />
//                 </svg>
//                 Print Barcode
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default ProductDetails;
