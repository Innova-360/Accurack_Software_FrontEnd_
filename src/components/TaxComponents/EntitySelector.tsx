import React, { useState, useEffect } from "react";
import type { TaxAssignment, EntityOption } from "../../types/tax";
import SearchableMultiSelect from "./SearchableMultiSelect";

interface EntitySelectorProps {
  assignments: TaxAssignment[];
  onChange: (assignments: TaxAssignment[]) => void;
  disabled?: boolean;
  className?: string;
}

// Mock data for different entity types - In real app, these would come from APIs
const mockEntityData: Record<string, EntityOption[]> = {
  product: [
    { id: "prod1", name: "iPhone 15 Pro", type: "Electronics" },
    { id: "prod2", name: "MacBook Air", type: "Electronics" },
    { id: "prod3", name: "Coffee Beans", type: "Food & Beverage" },
    { id: "prod4", name: "Office Chair", type: "Furniture" },
    { id: "prod5", name: "Wireless Headphones", type: "Electronics" },
  ],
  category: [
    { id: "cat1", name: "Electronics", type: "Product Category" },
    { id: "cat2", name: "Food & Beverage", type: "Product Category" },
    { id: "cat3", name: "Furniture", type: "Product Category" },
    { id: "cat4", name: "Clothing", type: "Product Category" },
    { id: "cat5", name: "Books", type: "Product Category" },
  ],
  customer: [
    { id: "cust1", name: "John Doe", type: "Premium" },
    { id: "cust2", name: "Jane Smith", type: "Regular" },
    { id: "cust3", name: "Acme Corp", type: "Business" },
    { id: "cust4", name: "Tech Solutions Ltd", type: "Business" },
    { id: "cust5", name: "Local Restaurant", type: "Business" },
  ],
  store: [
    { id: "store1", name: "Downtown Store", type: "Main Branch" },
    { id: "store2", name: "Mall Location", type: "Branch" },
    { id: "store3", name: "Airport Store", type: "Branch" },
    { id: "store4", name: "Online Store", type: "Digital" },
  ],
  supplier: [
    { id: "supp1", name: "Apple Inc.", type: "Electronics" },
    { id: "supp2", name: "Local Coffee Co.", type: "Food & Beverage" },
    { id: "supp3", name: "Office Furniture Plus", type: "Furniture" },
    { id: "supp4", name: "Fashion Wholesale", type: "Clothing" },
  ],
};

const EntitySelector: React.FC<EntitySelectorProps> = ({
  assignments,
  onChange,
  disabled = false,
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState<string>("product");
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );

  const entityTypes = [
    { key: "product", label: "Products", icon: "📦" },
    { key: "category", label: "Categories", icon: "🏷️" },
    { key: "customer", label: "Customers", icon: "👤" },
    { key: "store", label: "Stores", icon: "🏪" },
    { key: "supplier", label: "Suppliers", icon: "🏭" },
  ];

  // Get assignments for current active tab
  const currentAssignments = assignments.filter(
    (assignment) => assignment.targetType === activeTab
  );

  const currentSelectedIds = currentAssignments.map(
    (assignment) => assignment.targetId
  );

  // Simulate loading data when tab changes
  useEffect(() => {
    setLoadingStates((prev) => ({ ...prev, [activeTab]: true }));
    const timer = setTimeout(() => {
      setLoadingStates((prev) => ({ ...prev, [activeTab]: false }));
    }, 300);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const handleSelectionChange = (selectedIds: string[]) => {
    // Remove old assignments for this entity type
    const otherAssignments = assignments.filter(
      (assignment) => assignment.targetType !== activeTab
    );

    // Create new assignments for selected entities
    const entityOptions = mockEntityData[activeTab] || [];
    const newAssignments: TaxAssignment[] = selectedIds.map((id) => {
      const entity = entityOptions.find((option) => option.id === id);
      return {
        id: `assignment_${Date.now()}_${id}`,
        taxId: "", // Will be set when tax is saved
        targetType: activeTab as any,
        targetId: id,
        targetName: entity?.name || "Unknown",
      };
    });

    onChange([...otherAssignments, ...newAssignments]);
  };

  const getAssignmentSummary = () => {
    const summary: Record<string, number> = {};
    assignments.forEach((assignment) => {
      summary[assignment.targetType] =
        (summary[assignment.targetType] || 0) + 1;
    });
    return summary;
  };

  const assignmentSummary = getAssignmentSummary();

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Assignment Scope</h3>
        <div className="text-sm text-gray-500">
          Total: {assignments.length} assignments
        </div>
      </div>

      <div className="text-sm text-gray-600 mb-4">
        Define which entities this tax should apply to. You can assign the tax
        to specific products, categories, customers, stores, or suppliers.
      </div>

      {/* Entity Type Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {entityTypes.map((type) => (
            <button
              key={type.key}
              onClick={() => setActiveTab(type.key)}
              disabled={disabled}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === type.key
                  ? "border-[#0f4d57] text-[#0f4d57]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <span className="mr-2">{type.icon}</span>
              {type.label}
              {assignmentSummary[type.key] > 0 && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-[#0f4d57] rounded-full">
                  {assignmentSummary[type.key]}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Entity Selection */}
      <div className="mt-4">
        <SearchableMultiSelect
          label={`Select ${entityTypes.find((t) => t.key === activeTab)?.label || "Entities"}`}
          options={mockEntityData[activeTab] || []}
          selectedValues={currentSelectedIds}
          onChange={handleSelectionChange}
          loading={loadingStates[activeTab]}
          disabled={disabled}
          placeholder={`Search and select ${activeTab}s...`}
          maxHeight="max-h-64"
        />
      </div>

      {/* Assignment Summary */}
      {assignments.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            Assignment Summary
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {Object.entries(assignmentSummary).map(([type, count]) => {
              const entityType = entityTypes.find((t) => t.key === type);
              return (
                <div
                  key={type}
                  className="flex items-center text-sm text-blue-800"
                >
                  <span className="mr-2">{entityType?.icon}</span>
                  <span className="font-medium">{count}</span>
                  <span className="ml-1">{entityType?.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {assignments.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <p className="text-sm">No assignments configured</p>
          <p className="text-xs text-gray-400 mt-1">
            Tax will apply to all applicable entities if no specific assignments
            are made
          </p>
        </div>
      )}
    </div>
  );
};

export default EntitySelector;
