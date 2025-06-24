// Define the type for a transaction
export interface Transaction {
  id: string;
  transactionId: string;
  dateTime: string;
  customer: string;
  items: number;
  total: number;
  tax: number;
  payment: string;
  status: string;
  cashier: string;
}

// Mock data for transactions
export const mockTransactions: Transaction[] = [
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
    status: 'Completed',
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
    status: 'Completed',
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
    status: 'Pending',
    cashier: 'Carol White'
  },
  {
    id: '6',
    transactionId: 'TXN-2024-006',
    dateTime: '2024-06-18 10:15 AM',
    customer: 'Mark Johnson',
    items: 4,
    total: 89.99,
    tax: 6.67,
    payment: 'Digital',
    status: 'Completed',
    cashier: 'Alice Johnson'
  },
  {
    id: '7',
    transactionId: 'TXN-2024-007',
    dateTime: '2024-06-18 02:30 PM',
    customer: 'Lisa Chen',
    items: 2,
    total: 45.50,
    tax: 3.37,
    payment: 'Card',
    status: 'Completed',
    cashier: 'Bob Chen'
  }
];
