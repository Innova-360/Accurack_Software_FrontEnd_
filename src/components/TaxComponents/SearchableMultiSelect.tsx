import React, { useState, useRef, useEffect } from "react";
import type { EntityOption } from "../../types/tax";

interface SearchableMultiSelectProps {
  label: string;
  options: EntityOption[];
  selectedValues: string[];
  onChange: (selectedIds: string[]) => void;
  placeholder?: string;
  loading?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
  maxHeight?: string;
}

const SearchableMultiSelect: React.FC<SearchableMultiSelectProps> = ({
  label,
  options,
  selectedValues,
  onChange,
  placeholder = "Search and select...",
  loading = false,
  error,
  disabled = false,
  className = "",
  maxHeight = "max-h-48",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get selected option objects
  const selectedOptions = options.filter((option) =>
    selectedValues.includes(option.id)
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleOption = (optionId: string) => {
    if (selectedValues.includes(optionId)) {
      onChange(selectedValues.filter((id) => id !== optionId));
    } else {
      onChange([...selectedValues, optionId]);
    }
  };

  const handleRemoveOption = (optionId: string) => {
    onChange(selectedValues.filter((id) => id !== optionId));
  };

  const handleClearAll = () => {
    onChange([]);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>

      {/* Selected items display */}
      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {selectedOptions.map((option) => (
            <span
              key={option.id}
              className="inline-flex items-center px-2 py-1 text-xs bg-[#0f4d57] text-white rounded-full"
            >
              {option.name}
              {option.type && (
                <span className="ml-1 text-gray-300">({option.type})</span>
              )}
              <button
                type="button"
                onClick={() => handleRemoveOption(option.id)}
                className="ml-1 hover:text-gray-300"
                disabled={disabled}
              >
                ×
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs text-gray-500 hover:text-gray-700 px-2"
            disabled={disabled}
          >
            Clear all
          </button>
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent ${
            error ? "border-red-500" : "border-gray-300"
          } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
        />

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
        >
          <svg
            className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          className={`absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg ${maxHeight} overflow-y-auto`}
        >
          {loading ? (
            <div className="p-3 text-center text-gray-500">
              <div className="animate-spin w-5 h-5 border-2 border-[#0f4d57] border-t-transparent rounded-full mx-auto"></div>
              <span className="mt-2 block text-sm">Loading...</span>
            </div>
          ) : filteredOptions.length === 0 ? (
            <div className="p-3 text-center text-gray-500">
              {searchTerm ? "No options found" : "No options available"}
            </div>
          ) : (
            filteredOptions.map((option) => (
              <div
                key={option.id}
                onClick={() => handleToggleOption(option.id)}
                className={`p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                  selectedValues.includes(option.id) ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedValues.includes(option.id)}
                      onChange={() => {}} // Handled by parent div click
                      className="mr-3 text-[#0f4d57] focus:ring-[#0f4d57]"
                    />
                    <div>
                      <span className="font-medium">{option.name}</span>
                      {option.type && (
                        <span className="ml-2 text-sm text-gray-500">
                          ({option.type})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-500 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default SearchableMultiSelect;
