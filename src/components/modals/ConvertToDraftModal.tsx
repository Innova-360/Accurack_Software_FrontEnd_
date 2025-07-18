import React, { useState } from 'react';
import { X, Save, FileText } from 'lucide-react';
import { SpecialButton } from '../buttons';
import type { InvoiceResponseData } from '../../types/invoice';

interface ConvertToDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notes: string, dueDate?: string) => void;
  invoice: InvoiceResponseData;
  loading?: boolean;
}

const ConvertToDraftModal: React.FC<ConvertToDraftModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  invoice,
  loading = false,
}) => {
  const [notes, setNotes] = useState(`Draft created from invoice ${invoice.invoiceNumber}`);
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(notes, dueDate || undefined);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Convert to Draft
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Invoice:</strong> {invoice.invoiceNumber}
          </p>
          <p className="text-sm text-blue-600">
            <strong>Customer:</strong> {invoice.customerName}
          </p>
          <p className="text-sm text-blue-600">
            <strong>Amount:</strong> ${invoice.totalAmount.toFixed(2)}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Add notes for this draft..."
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date (Optional)
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <SpecialButton
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </SpecialButton>
            <SpecialButton
              type="submit"
              variant="primary"
              disabled={loading || !notes.trim()}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? (
                "Converting..."
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Convert to Draft
                </>
              )}
            </SpecialButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConvertToDraftModal;
