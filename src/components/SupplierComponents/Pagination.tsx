import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems
}) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getVisiblePages = () => {
    const pages = [];
    const delta = 2; // Show 2 pages before and after current page

    for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
      pages.push(i);
    }

    return pages;
  };
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-white border-opacity-20" style={{ backgroundColor: '#03414CF0' }}>
      <div className="text-sm text-white mb-2 sm:mb-0">
        Showing <span className="font-medium">{startItem}</span> to{' '}
        <span className="font-medium">{endItem}</span> of{' '}
        <span className="font-medium">{totalItems}</span> results
      </div>

      <div className="flex items-center space-x-1">        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-2 py-1 text-sm border rounded ${
            currentPage === 1
              ? 'text-white opacity-50 border-white border-opacity-30 cursor-not-allowed'
              : 'text-white border-white border-opacity-50 hover:bg-white hover:bg-opacity-20'
          }`}
        >
          <FaChevronLeft size={12} />
        </button>

        {/* Page Numbers */}
        {getVisiblePages().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 text-sm border rounded ${
              page === currentPage
                ? 'bg-white text-black border-white'
                : 'text-white border-white border-opacity-50 hover:bg-white hover:bg-opacity-20'
            }`}
          >
            {page}
          </button>
        ))}

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-2 py-1 text-sm border rounded ${
            currentPage === totalPages
              ? 'text-white opacity-50 border-white border-opacity-30 cursor-not-allowed'
              : 'text-white border-white border-opacity-50 hover:bg-white hover:bg-opacity-20'
          }`}
        >
          <FaChevronRight size={12} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
