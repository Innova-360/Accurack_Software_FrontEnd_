import React from "react";

interface UpdateProductControlsProps {
  searchTerm: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const UpdateProductControls: React.FC<UpdateProductControlsProps> = ({
  searchTerm,
  onSearchChange,
}) => {
  return (
    <div className="border border-gray-300 px-4 sm:px-6 lg:px-10 py-4 sm:py-5 rounded-lg rounded-b-none border-b-0">
      <h2 className="text-base sm:text-lg font-semibold mb-4">
        Inventory Items
      </h2>
      <div className="flex justify-center">
        <input
          type="text"
          placeholder="Search inventory..."
          className="border border-gray-300 rounded px-4 py-2 w-full"
          value={searchTerm}
          onChange={onSearchChange}
        />
      </div>
    </div>
  );
};

export default UpdateProductControls;
