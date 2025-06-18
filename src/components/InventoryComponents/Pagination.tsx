import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  onPageChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 space-y-4 sm:space-y-0">
      <span className="text-sm sm:text-base text-gray-600">
        Showing {totalItems === 0 ? 0 : startIndex + 1} to{" "}
        {Math.min(endIndex, totalItems)} of {totalItems} results
      </span>
      <div className="flex flex-wrap items-center gap-2">
        <button
          className={`px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded text-sm sm:text-base ${
            currentPage === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white hover:bg-gray-50"
          }`}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>

        {/* Page numbers */}
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (pageNumber) => {
              // Show first page, last page, current page, and pages around current page
              if (
                pageNumber === 1 ||
                pageNumber === totalPages ||
                (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
              ) {
                return (
                  <button
                    key={pageNumber}
                    className={`px-2 py-2 sm:px-3 sm:py-2 border border-gray-300 rounded text-sm sm:text-base ${
                      currentPage === pageNumber
                        ? "bg-[#0f4d57] text-white"
                        : "bg-white hover:bg-gray-50"
                    }`}
                    onClick={() => onPageChange(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                );
              } else if (
                pageNumber === currentPage - 2 ||
                pageNumber === currentPage + 2
              ) {
                return (
                  <span
                    key={pageNumber}
                    className="px-1 sm:px-2 text-sm sm:text-base"
                  >
                    ...
                  </span>
                );
              }
              return null;
            }
          )}
        </div>

        <button
          className={`px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded text-sm sm:text-base ${
            currentPage === totalPages || totalPages === 0
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white hover:bg-gray-50"
          }`}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
