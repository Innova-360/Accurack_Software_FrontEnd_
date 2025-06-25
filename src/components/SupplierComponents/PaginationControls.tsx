import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  total,
  limit,
  onPageChange,
  loading = false,
}) => {
  if (totalPages <= 1) {
    return null;
  }

  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, total);

  const handlePrevious = () => {
    if (currentPage > 1 && !loading) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages && !loading) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    if (page !== currentPage && !loading) {
      onPageChange(page);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-200">
      {/* Items info */}
      <div className="text-sm text-gray-700">
        Showing <span className="font-semibold">{startItem}</span> to{' '}
        <span className="font-semibold">{endItem}</span> of{' '}
        <span className="font-semibold">{total}</span> suppliers
      </div>

      {/* Pagination controls */}
      <div className="flex items-center space-x-2">
        {/* Previous button */}
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1 || loading}
          className={`
            flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
            ${
              currentPage === 1 || loading
                ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-[#03414C]'
            }
          `}
        >
          <FaChevronLeft className="mr-1" size={12} />
          Previous
        </button>

        {/* Page numbers */}
        <div className="flex items-center space-x-1">
          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-3 py-2 text-sm text-gray-500">...</span>
              ) : (
                <button
                  onClick={() => handlePageClick(page as number)}
                  disabled={loading}
                  className={`
                    px-3 py-2 text-sm font-medium rounded-md transition-colors
                    ${
                      page === currentPage
                        ? 'bg-[#03414C] text-white'
                        : loading
                        ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-[#03414C]'
                    }
                  `}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Next button */}
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages || loading}
          className={`
            flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
            ${
              currentPage === totalPages || loading
                ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-[#03414C]'
            }
          `}
        >
          Next
          <FaChevronRight className="ml-1" size={12} />
        </button>
      </div>
    </div>
  );
};

export default PaginationControls;
