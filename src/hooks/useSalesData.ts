import { useState, useEffect } from 'react';
import { salesAPI } from '../services/salesService';
import type { Transaction, StatsData } from '../services/salesService';

export interface UseSalesDataReturn {
  // Data
  transactions: Transaction[];
  stats: StatsData | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  refreshTransactions: () => Promise<void>;
  refreshStats: () => Promise<void>;
  createTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  printTransaction: (id: string) => Promise<void>;
}

export const useSalesData = (): UseSalesDataReturn => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const [transactionsData, statsData] = await Promise.all([
          salesAPI.getTransactions(),
          salesAPI.getStats()
        ]);
        setTransactions(transactionsData);
        setStats(statsData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const refreshTransactions = async () => {
    try {
      setLoading(true);
      const data = await salesAPI.getTransactions();
      setTransactions(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh transactions');
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = async () => {
    try {
      const data = await salesAPI.getStats();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh stats');
    }
  };

  const createTransaction = async (newTransaction: Omit<Transaction, 'id'>) => {
    try {
      setLoading(true);
      const createdTransaction = await salesAPI.createTransaction(newTransaction);
      setTransactions(prev => [createdTransaction, ...prev]);
      setError(null);
      // Refresh stats after creating
      await refreshStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      setLoading(true);
      const updatedTransaction = await salesAPI.updateTransaction(id, updates);
      setTransactions(prev => 
        prev.map(t => t.id === id ? updatedTransaction : t)
      );
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      setLoading(true);
      await salesAPI.deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
      setError(null);
      // Refresh stats after deleting
      await refreshStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const printTransaction = async (id: string) => {
    try {
      await salesAPI.printTransaction(id);
      // Find the transaction to print
      const transaction = transactions.find(t => t.id === id);
      if (transaction) {
        // Create print content
        const printContent = `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 400px;">
            <h2 style="color: #03414C; text-align: center; margin-bottom: 20px;">Transaction Receipt</h2>
            <hr style="border: 1px solid #03414C;" />
            <div style="margin: 15px 0;">
              <p><strong>Transaction ID:</strong> ${transaction.transactionId}</p>
              <p><strong>Date & Time:</strong> ${transaction.dateTime}</p>
              <p><strong>Customer:</strong> ${transaction.customer}</p>
              <p><strong>Items:</strong> ${transaction.items}</p>
              <p><strong>Subtotal:</strong> $${(transaction.total - transaction.tax).toFixed(2)}</p>
              <p><strong>Tax:</strong> $${transaction.tax.toFixed(2)}</p>
              <p style="font-size: 16px;"><strong>Total:</strong> $${transaction.total.toFixed(2)}</p>
              <p><strong>Payment Method:</strong> ${transaction.payment}</p>
              <p><strong>Status:</strong> ${transaction.status}</p>
              <p><strong>Cashier:</strong> ${transaction.cashier}</p>
            </div>
            <hr style="border: 1px solid #03414C;" />
            <p style="text-align: center; color: #666; margin-top: 20px;">Thank you for your business!</p>
          </div>
        `;
        
        // Open print window
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(printContent);
          printWindow.document.close();
          printWindow.print();
        }
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to print transaction');
      throw err;
    }
  };

  return {
    transactions,
    stats,
    loading,
    error,
    refreshTransactions,
    refreshStats,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    printTransaction
  };
};
