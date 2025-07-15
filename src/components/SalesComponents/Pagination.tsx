import React from 'react';


interface PaginationProps {
  currentPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  totalItems: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  totalItems,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 space-y-4 sm:space-y-0">
      <div className="text-sm sm:text-base text-gray-600">
        Showing {startIndex}-{endIndex} of {totalItems}
      </div>

      {/* Centered Page Numbers */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded text-sm sm:text-base
    ${currentPage === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white hover:bg-gray-50 text-gray-700 cursor-pointer'}
  `}
        >
          Previous
        </button>
        <div className="flex flex-wrap gap-1">
          {/* Page Numbers */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`text-sm rounded ${pageNum === currentPage
                  ? 'px-2 py-2 sm:px-3 sm:py-2 border border-gray-300 rounded text-sm sm:text-base bg-[#0f4d57] text-white shadow-lg'
                  : 'px-2 py-2 sm:px-3 sm:py-2 border border-gray-300 rounded text-sm sm:text-base bg-white hover:bg-gray-50'
                  }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded text-sm sm:text-base
    ${currentPage === totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white hover:bg-gray-50 text-gray-700 cursor-pointer'}
  `}
        >
          Next
        </button>
      </div>

      {/* Rows per page on the right 
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-500">Rows per page:</span>
        <select
          value={rowsPerPage}
          onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
          className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
      </div>
      */}
    </div>



  );
};

export default Pagination;
