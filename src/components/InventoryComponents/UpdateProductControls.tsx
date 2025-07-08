import React from "react";

interface UpdateProductControlsProps {
  searchTerm: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isSearching?: boolean; // Add prop to indicate search loading state
}

const UpdateProductControls: React.FC<UpdateProductControlsProps> = ({
  searchTerm,
  onSearchChange,
  isSearching = false,
}) => {
  return (
    <div className="border border-gray-300 px-4 sm:px-6 lg:px-10 py-4 sm:py-5 rounded-lg rounded-b-none border-b-0">
      <h2 className="text-base sm:text-lg font-semibold mb-4">
        Inventory Items
      </h2>
      <div className="flex justify-center">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search inventory..."
            className="border border-gray-300 rounded px-4 py-2 w-full pr-10"
            value={searchTerm}
            onChange={onSearchChange}
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="inline-block rounded-full h-4 w-4 border-b-2 border-[#0f4d57] animate-spin"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdateProductControls;
