import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./slices/counterSlice";
import authReducer from "./slices/authSlice";
import uiReducer from "./slices/uiSlice";
import searchReducer from "./slices/searchSlice";
import storeReducer from "./slices/storeSlice";
import supplierReducer from "./slices/supplierSlice";
import employeeReducer from "./slices/employeeSlice";
import userReducer from "./slices/userSlice";
import inventorySupplierReducer from "./slices/inventorySupplierSlice";
import customerReducer from "./slices/customerSlice";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    auth: authReducer,
    ui: uiReducer,
    search: searchReducer,
    stores: storeReducer,
    suppliers: supplierReducer,
    employees: employeeReducer,
    user: userReducer,
    inventorySuppliers: inventorySupplierReducer,
    customers: customerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
