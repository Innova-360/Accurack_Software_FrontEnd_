// This file contains all mock data and will be replaced with API calls
// When backend is ready, just replace these functions with actual API endpoints

export interface Transaction {
  id: string;
  transactionId: string;
  dateTime: string;
  customer: string;
  items: number;
  total: number;
  tax: number;
  payment: 'Cash' | 'Card' | 'Digital';
  status: 'Completed' | 'Pending' | 'Refunded' | 'Shipped' | 'Delivered';
  cashier: string;
}

export interface StatsData {
  todaysSales: number;
  transactions: number;
  customers: number;
  avgTransaction: number;
  productsAvailable: number;
  lowStockItems: number;
}

// Mock data - will be replaced with API calls
const mockTransactions: Transaction[] = [
  {
    id: '1',
    transactionId: 'TXN-2024-005',
    dateTime: '2024-06-16 04:20 PM',
    customer: 'David Lee',
    items: 1,
    total: 14.03,
    tax: 1.04,
    payment: 'Cash',
    status: 'Refunded',
    cashier: 'Bob Chen'
  },
  {
    id: '2',
    transactionId: 'TXN-2024-001',
    dateTime: '2024-06-17 09:15 AM',
    customer: 'John Smith',
    items: 3,
    total: 49.65,
    tax: 3.68,
    payment: 'Card',
    status: 'Delivered',
    cashier: 'Alice Johnson'
  },
  {
    id: '3',
    transactionId: 'TXN-2024-002',
    dateTime: '2024-06-17 04:22 AM',
    customer: 'Sarah Wilson',
    items: 1,
    total: 26.99,
    tax: 2.00,
    payment: 'Cash',
    status: 'Shipped',
    cashier: 'Bob Chen'
  },
  {
    id: '4',
    transactionId: 'TXN-2024-003',
    dateTime: '2024-06-17 09:25 AM',
    customer: 'Mike Davis',
    items: 5,
    total: 137.65,
    tax: 10.20,
    payment: 'Digital',
    status: 'Completed',
    cashier: 'Alice Johnson'
  },
  {
    id: '5',
    transactionId: 'TXN-2024-004',
    dateTime: '2024-06-17 02:41 AM',
    customer: 'Emma Brown',
    items: 2,
    total: 73.42,
    tax: 5.44,
    payment: 'Card',
    status: 'Shipped',
    cashier: 'Carol White'
  },
  {
    id: '6',
    transactionId: 'TXN-2024-006',
    dateTime: '2024-06-18 10:30 AM',
    customer: 'Robert Johnson',
    items: 4,
    total: 89.99,
    tax: 6.75,
    payment: 'Digital',
    status: 'Delivered',
    cashier: 'Alice Johnson'
  },
  {
    id: '7',
    transactionId: 'TXN-2024-007',
    dateTime: '2024-06-18 02:15 PM',
    customer: 'Lisa Martinez',
    items: 2,
    total: 35.50,
    tax: 2.65,
    payment: 'Card',
    status: 'Pending',
    cashier: 'Bob Chen'
  },
    {
    id: '8',
    transactionId: 'TXN-2024-005',
    dateTime: '2024-06-16 04:20 PM',
    customer: 'David Lee',
    items: 1,
    total: 14.03,
    tax: 1.04,
    payment: 'Cash',
    status: 'Refunded',
    cashier: 'Bob Chen'
  },
    {
    id: '9',
    transactionId: 'TXN-2024-005',
    dateTime: '2024-06-16 04:20 PM',
    customer: 'David Lee',
    items: 1,
    total: 14.03,
    tax: 1.04,
    payment: 'Cash',
    status: 'Refunded',
    cashier: 'Bob Chen'
  },
    {
    id: '10',
    transactionId: 'TXN-2024-005',
    dateTime: '2024-06-16 04:20 PM',
    customer: 'David Lee',
    items: 1,
    total: 14.03,
    tax: 1.04,
    payment: 'Cash',
    status: 'Refunded',
    cashier: 'Bob Chen'
  },
    {
    id: '11',
    transactionId: 'TXN-2024-005',
    dateTime: '2024-06-16 04:20 PM',
    customer: 'David Lee',
    items: 1,
    total: 14.03,
    tax: 1.04,
    payment: 'Cash',
    status: 'Refunded',
    cashier: 'Bob Chen'
  },
    {
    id: '12',
    transactionId: 'TXN-2024-005',
    dateTime: '2024-06-16 04:20 PM',
    customer: 'David Lee',
    items: 1,
    total: 14.03,
    tax: 1.04,
    payment: 'Cash',
    status: 'Refunded',
    cashier: 'Bob Chen'
  },
    {
    id: '13',
    transactionId: 'TXN-2024-005',
    dateTime: '2024-06-16 04:20 PM',
    customer: 'David Lee',
    items: 1,
    total: 14.03,
    tax: 1.04,
    payment: 'Cash',
    status: 'Refunded',
    cashier: 'Bob Chen'
  },
];

const mockStatsData: StatsData = {
  todaysSales: 4250.75,
  transactions: 87,
  customers: 72,
  avgTransaction: 48.86,
  productsAvailable: 4,
  lowStockItems: 1
};

// API Service functions - Replace these with actual API calls when backend is ready
export const salesAPI = {
  // GET /api/transactions
  getTransactions: async (): Promise<Transaction[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return Promise.resolve(mockTransactions);
  },

  // GET /api/stats
  getStats: async (): Promise<StatsData> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return Promise.resolve(mockStatsData);
  },

  // POST /api/transactions
  createTransaction: async (transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newTransaction = {
      ...transaction,
      id: Date.now().toString()
    };
    return Promise.resolve(newTransaction);
  },

  // PUT /api/transactions/:id
  updateTransaction: async (id: string, transaction: Partial<Transaction>): Promise<Transaction> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    const existingTransaction = mockTransactions.find(t => t.id === id);
    if (!existingTransaction) {
      throw new Error('Transaction not found');
    }
    const updatedTransaction = { ...existingTransaction, ...transaction };
    return Promise.resolve(updatedTransaction);
  },
  // DELETE /api/transactions/:id
  deleteTransaction: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    console.log(`Deleting transaction ${id}`); // Will be replaced with actual API call
    return Promise.resolve();
  },

  // POST /api/transactions/:id/print
  printTransaction: async (id: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    console.log(`Printing transaction ${id}`); // Will be replaced with actual API call
    return Promise.resolve('Print job sent successfully');
  }
};

// Helper functions for data formatting
export const formatCurrency = (amount: number): string => {
  return `$${amount.toFixed(2)}`;
};

export const formatPercentage = (value: number): string => {
  return `${value > 0 ? '+' : ''}${value}%`;
};