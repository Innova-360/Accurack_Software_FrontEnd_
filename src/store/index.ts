import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./slices/counterSlice";
import authReducer from "./slices/authSlice";
import uiReducer from "./slices/uiSlice";
import searchReducer from "./slices/searchSlice";
import storeReducer from "./slices/storeSlice";
import supplierReducer from "./slices/supplierSlice";
import employeeReducer from "./slices/employeeSlice";
// import productCategoriesReducer from "./slices/productCategoriesSlice";
import salesReducer from "./slices/salesSlice";
import userReducer from "./slices/userSlice";
import inventorySupplierReducer from "./slices/inventorySupplierSlice";
import productsReducer, { productsApi } from "./slices/productsSlice";
import { customerApi } from "./slices/customerSlice";
import roleReducer from "./slices/roleSlice";
import { taxApi } from "./slices/taxSlice";
import { categoryApi } from "./slices/categorySlice";
import { taxReducer } from "./slices/taxSlice";
import customerReducer from "./slices/customerSlice";
import productCategoriesReducer from "./slices/productCategoriesSlice";
import orderProcessingReducer from "./slices/orderProcessingSlice";
import orderTrackingReducer from "./slices/orderTrackingSlice";
import businessReducer from "./slices/businessSlice";
import invoiceReducer from "./slices/invoiceSlice";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    auth: authReducer,
    ui: uiReducer,
    search: searchReducer,
    invoices: invoiceReducer,
    stores: storeReducer,
    suppliers: supplierReducer,
    employees: employeeReducer,
    user: userReducer,
    inventorySuppliers: inventorySupplierReducer,
    products: productsReducer,
    roles: roleReducer,
    tax: taxReducer,
    sales: salesReducer,
    customers: customerReducer,
    productCategories: productCategoriesReducer,
    orders: orderProcessingReducer,
    orderTracking: orderTrackingReducer,
    business: businessReducer,
    [taxApi.reducerPath]: taxApi.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer,
    [customerApi.reducerPath]: customerApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }).concat(
      taxApi.middleware,
      categoryApi.middleware,
      productsApi.middleware,
      customerApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
