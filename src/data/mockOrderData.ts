import type { OrderItem } from "../types/orderProcessing";

// Mock order data for frontend testing
export const mockOrderData: OrderItem[] = [
  {
    id: "ord_001",
    customerId: "cust_001",
    customerName: "John Smith",
    status: "pending",
    paymentAmount: 150.75,
    paymentType: "CARD",
    driverName: "Mike Johnson",
    createdAt: "2025-01-15T10:30:00Z",
    updatedAt: "2025-01-15T10:30:00Z",
    storeId: "store_001",
    isValidated: false,
  },
  {
    id: "ord_002",
    customerId: "cust_002",
    customerName: "Sarah Davis",
    status: "shipped",
    paymentAmount: 89.5,
    paymentType: "CASH",
    driverName: "David Wilson",
    createdAt: "2025-01-14T14:45:00Z",
    updatedAt: "2025-01-15T09:20:00Z",
    storeId: "store_001",
    isValidated: true,
    validatedAt: "2025-01-14T15:00:00Z",
  },
  {
    id: "ord_003",
    customerId: "cust_003",
    customerName: "Robert Brown",
    status: "delivered",
    paymentAmount: 245.0,
    paymentType: "BANK_TRANSFER",
    driverName: "Lisa Anderson",
    createdAt: "2025-01-13T16:20:00Z",
    updatedAt: "2025-01-14T11:30:00Z",
    storeId: "store_001",
    isValidated: true,
    validatedAt: "2025-01-13T17:00:00Z",
  },
  {
    id: "ord_004",
    customerId: "cust_004",
    customerName: "Emily Johnson",
    status: "completed",
    paymentAmount: 75.25,
    paymentType: "DIGITAL_WALLET",
    driverName: "Tom Garcia",
    createdAt: "2025-01-12T09:15:00Z",
    updatedAt: "2025-01-13T08:45:00Z",
    storeId: "store_001",
    isValidated: false,
  },
  {
    id: "ord_005",
    customerId: "cust_005",
    customerName: "Michael Wilson",
    status: "processing",
    paymentAmount: 320.8,
    paymentType: "CHECK",
    driverName: "Anna Martinez",
    createdAt: "2025-01-11T13:40:00Z",
    updatedAt: "2025-01-12T10:15:00Z",
    storeId: "store_001",
    isValidated: false,
  },
  {
    id: "ord_006",
    customerId: "cust_006",
    customerName: "Jessica Taylor",
    status: "cancelled",
    paymentAmount: 180.0,
    paymentType: "CARD",
    driverName: "Chris Rodriguez",
    createdAt: "2025-01-10T11:25:00Z",
    updatedAt: "2025-01-11T15:30:00Z",
    storeId: "store_001",
    isValidated: false,
  },
  {
    id: "ord_007",
    customerId: "cust_007",
    customerName: "Daniel Anderson",
    status: "pending",
    paymentAmount: 95.6,
    paymentType: "CASH",
    driverName: "Jennifer Lee",
    createdAt: "2025-01-09T08:50:00Z",
    updatedAt: "2025-01-09T08:50:00Z",
    storeId: "store_001",
    isValidated: false,
  },
  {
    id: "ord_008",
    customerId: "cust_008",
    customerName: "Amanda Clark",
    status: "shipped",
    paymentAmount: 210.45,
    paymentType: "BANK_TRANSFER",
    driverName: "Kevin Thompson",
    createdAt: "2025-01-08T15:10:00Z",
    updatedAt: "2025-01-09T12:20:00Z",
    storeId: "store_001",
    isValidated: true,
    validatedAt: "2025-01-08T16:00:00Z",
  },
  {
    id: "ord_009",
    customerId: "cust_009",
    customerName: "Christopher White",
    status: "delivered",
    paymentAmount: 134.75,
    paymentType: "DIGITAL_WALLET",
    driverName: "Nicole Harris",
    createdAt: "2025-01-07T12:35:00Z",
    updatedAt: "2025-01-08T14:50:00Z",
    storeId: "store_001",
    isValidated: true,
    validatedAt: "2025-01-07T13:00:00Z",
  },
  {
    id: "ord_010",
    customerId: "cust_010",
    customerName: "Ashley Lewis",
    status: "completed",
    paymentAmount: 67.9,
    paymentType: "CARD",
    driverName: "Brian Walker",
    createdAt: "2025-01-06T10:20:00Z",
    updatedAt: "2025-01-07T09:15:00Z",
    storeId: "store_001",
    isValidated: true,
    validatedAt: "2025-01-06T11:00:00Z",
  },
];

export const getFilteredOrders = (
  searchTerm?: string,
  statusFilter?: string,
  paymentFilter?: string,
  driverFilter?: string
) => {
  let filteredOrders = [...mockOrderData];

  if (searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    filteredOrders = filteredOrders.filter(
      (order) =>
        order.customerName.toLowerCase().includes(searchLower) ||
        order.id.toLowerCase().includes(searchLower) ||
        order.driverName.toLowerCase().includes(searchLower)
    );
  }

  if (statusFilter && statusFilter !== "All") {
    filteredOrders = filteredOrders.filter(
      (order) => order.status === statusFilter
    );
  }

  if (paymentFilter && paymentFilter !== "All") {
    filteredOrders = filteredOrders.filter(
      (order) => order.paymentType === paymentFilter
    );
  }

  if (driverFilter) {
    filteredOrders = filteredOrders.filter((order) =>
      order.driverName.toLowerCase().includes(driverFilter.toLowerCase())
    );
  }

  return filteredOrders;
};

export const addMockOrder = (orderData: Partial<OrderItem>): OrderItem => {
  const newOrder: OrderItem = {
    id: `ord_${String(mockOrderData.length + 1).padStart(3, "0")}`,
    customerId: orderData.customerId || "cust_new",
    customerName: orderData.customerName || "New Customer",
    status: orderData.status || "pending",
    paymentAmount: orderData.paymentAmount || 0,
    paymentType: orderData.paymentType || "CASH",
    driverName: orderData.driverName || "Unassigned",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    storeId: orderData.storeId || "store_001",
    isValidated: orderData.isValidated || false,
    validatedAt: orderData.validatedAt,
  };

  mockOrderData.unshift(newOrder); // Add to beginning
  return newOrder;
};

export const updateMockOrder = (
  orderId: string,
  updates: Partial<OrderItem>
): OrderItem | null => {
  const orderIndex = mockOrderData.findIndex((order) => order.id === orderId);
  if (orderIndex === -1) return null;

  const updatedOrder = {
    ...mockOrderData[orderIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  mockOrderData[orderIndex] = updatedOrder;
  return updatedOrder;
};

export const deleteMockOrder = (orderId: string): boolean => {
  const orderIndex = mockOrderData.findIndex((order) => order.id === orderId);
  if (orderIndex === -1) return false;

  mockOrderData.splice(orderIndex, 1);
  return true;
};
