import React, { useState, useEffect } from "react";
import type { TaxAssignment, EntityOption } from "../../types/tax";
import SearchableMultiSelect from "./SearchableMultiSelect";

interface EnhancedEntitySelectorProps {
  assignments: TaxAssignment[];
  onChange: (assignments: TaxAssignment[]) => void;
  disabled?: boolean;
  className?: string;
}

interface EntityType {
  key: "product" | "category" | "customer" | "store" | "supplier";
  label: string;
  description: string;
  icon: string;
}

const EnhancedEntitySelector: React.FC<EnhancedEntitySelectorProps> = ({
  assignments,
  onChange,
  disabled = false,
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState<EntityType["key"]>("product");
  const [entityData, setEntityData] = useState<
    Record<EntityType["key"], EntityOption[]>
  >({
    product: [],
    category: [],
    customer: [],
    store: [],
    supplier: [],
  });
  const [loading, setLoading] = useState<Record<EntityType["key"], boolean>>({
    product: false,
    category: false,
    customer: false,
    store: false,
    supplier: false,
  });
  const [searchTerms, setSearchTerms] = useState<
    Record<EntityType["key"], string>
  >({
    product: "",
    category: "",
    customer: "",
    store: "",
    supplier: "",
  });

  const entityTypes: EntityType[] = [
    {
      key: "product",
      label: "Products",
      description: "Apply tax to specific products",
      icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
    },
    {
      key: "category",
      label: "Categories",
      description: "Apply tax to product categories",
      icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
    },
    {
      key: "customer",
      label: "Customers",
      description: "Apply tax to specific customers",
      icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    },
    {
      key: "store",
      label: "Stores",
      description: "Apply tax to specific store locations",
      icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
    },
    {
      key: "supplier",
      label: "Suppliers",
      description: "Apply tax to products from specific suppliers",
      icon: "M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M10.5 6L12 7l1.5-1M6 10h.01M6 14h.01M6 18h.01M18 10h.01M18 14h.01M18 18h.01",
    },
  ];

  // Mock data for demonstration
  const mockEntityData: Record<EntityType["key"], EntityOption[]> = {
    product: [
      { id: "prod-1", name: "Premium Coffee Beans", type: "BEVERAGES" },
      { id: "prod-2", name: "Organic Milk", type: "DAIRY" },
      { id: "prod-3", name: "iPhone 15 Pro", type: "ELECTRONICS" },
      { id: "prod-4", name: "MacBook Pro", type: "ELECTRONICS" },
      { id: "prod-5", name: "Artisan Bread", type: "BAKERY" },
      { id: "prod-6", name: "Gold Necklace", type: "LUXURY" },
      { id: "prod-7", name: "Diamond Ring", type: "LUXURY" },
    ],
    category: [
      { id: "cat-1", name: "Electronics", type: "Main Category" },
      { id: "cat-2", name: "Beverages", type: "Main Category" },
      { id: "cat-3", name: "Dairy", type: "Main Category" },
      { id: "cat-4", name: "Bakery", type: "Main Category" },
      { id: "cat-5", name: "Luxury Items", type: "Main Category" },
      { id: "cat-6", name: "Produce", type: "Main Category" },
      { id: "cat-7", name: "Frozen Foods", type: "Main Category" },
    ],
    customer: [
      { id: "cust-1", name: "Premium Customers", type: "Customer Group" },
      { id: "cust-2", name: "Regular Customers", type: "Customer Group" },
      { id: "cust-3", name: "Wholesale Customers", type: "Customer Group" },
      { id: "cust-4", name: "Corporate Clients", type: "Customer Group" },
      { id: "cust-5", name: "VIP Members", type: "Customer Group" },
    ],
    store: [
      { id: "store-1", name: "Downtown Branch", type: "Physical Store" },
      { id: "store-2", name: "Mall Location", type: "Physical Store" },
      { id: "store-3", name: "Online Store", type: "E-commerce" },
      { id: "store-4", name: "Warehouse Outlet", type: "Outlet" },
      { id: "store-5", name: "Airport Branch", type: "Physical Store" },
    ],
    supplier: [
      { id: "supp-1", name: "Coffee Co.", type: "Beverage Supplier" },
      { id: "supp-2", name: "Dairy Farm Inc.", type: "Dairy Supplier" },
      { id: "supp-3", name: "Apple Inc.", type: "Electronics" },
      { id: "supp-4", name: "Local Bakery", type: "Food Supplier" },
      { id: "supp-5", name: "Luxury Goods Ltd.", type: "Luxury Supplier" },
      { id: "supp-6", name: "Fresh Produce Ltd.", type: "Produce Supplier" },
    ],
  };

  useEffect(() => {
    // Simulate loading entity data
    const loadEntityData = async (entityType: EntityType["key"]) => {
      setLoading((prev) => ({ ...prev, [entityType]: true }));

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setEntityData((prev) => ({
        ...prev,
        [entityType]: mockEntityData[entityType],
      }));

      setLoading((prev) => ({ ...prev, [entityType]: false }));
    };

    // Load data for all entity types
    entityTypes.forEach((type) => {
      if (entityData[type.key].length === 0) {
        loadEntityData(type.key);
      }
    });
  }, []);

  const getSelectedEntitiesForType = (
    entityType: EntityType["key"]
  ): EntityOption[] => {
    const typeAssignments = assignments.filter(
      (a) => a.targetType === entityType
    );
    return typeAssignments.map((assignment) => ({
      id: assignment.targetId,
      name: assignment.targetName,
      type: entityType,
    }));
  };

  const handleEntitySelectionChange = (
    entityType: EntityType["key"],
    selectedEntities: EntityOption[]
  ) => {
    // Remove existing assignments for this entity type
    const otherAssignments = assignments.filter(
      (a) => a.targetType !== entityType
    );

    // Create new assignments for selected entities
    const newAssignments: TaxAssignment[] = selectedEntities.map((entity) => ({
      id: `assignment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      taxId: "", // Will be set when tax is saved
      targetType: entityType,
      targetId: entity.id,
      targetName: entity.name,
    }));

    // Combine and update
    onChange([...otherAssignments, ...newAssignments]);
  };

  const getAssignmentSummary = () => {
    const summary = entityTypes
      .map((type) => ({
        type: type.label,
        count: assignments.filter((a) => a.targetType === type.key).length,
      }))
      .filter((item) => item.count > 0);

    return summary;
  };

  const getTotalAssignments = () => {
    return assignments.length;
  };

  const clearAllAssignments = () => {
    onChange([]);
  };

  const filteredEntityData = (entityType: EntityType["key"]) => {
    const searchTerm = searchTerms[entityType].toLowerCase();
    if (!searchTerm) return entityData[entityType];

    return entityData[entityType].filter(
      (entity) =>
        entity.name.toLowerCase().includes(searchTerm) ||
        entity.type?.toLowerCase().includes(searchTerm)
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Assignment Scope
          </h3>
          <div className="text-sm text-gray-500 mt-1">
            Total: {getTotalAssignments()} assignments
          </div>
        </div>
        {getTotalAssignments() > 0 && (
          <button
            onClick={clearAllAssignments}
            disabled={disabled}
            className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="text-sm text-gray-600 mb-4">
        Define which entities this tax should apply to. You can assign the tax
        to specific products, categories, customers, stores, or suppliers. Leave
        empty to apply to all entities.
      </div>

      {/* Assignment Summary */}
      {getTotalAssignments() > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            Current Assignments
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {getAssignmentSummary().map((item, index) => (
              <div key={index} className="text-sm">
                <span className="text-blue-700 font-medium">{item.count}</span>
                <span className="text-blue-600 ml-1">{item.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Entity Type Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {entityTypes.map((type) => {
            const assignmentCount = assignments.filter(
              (a) => a.targetType === type.key
            ).length;

            return (
              <button
                key={type.key}
                onClick={() => setActiveTab(type.key)}
                disabled={disabled}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                  activeTab === type.key
                    ? "border-[#0f4d57] text-[#0f4d57]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={type.icon}
                  />
                </svg>
                <span>{type.label}</span>
                {assignmentCount > 0 && (
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-[#0f4d57] rounded-full">
                    {assignmentCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="py-4">
        {entityTypes.map((type) => {
          if (activeTab !== type.key) return null;

          const selectedEntities = getSelectedEntitiesForType(type.key);
          const availableEntities = filteredEntityData(type.key);

          return (
            <div key={type.key} className="space-y-4">
              {/* Tab Description */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-[#0f4d57] bg-opacity-10 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-[#0f4d57]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={type.icon}
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {type.label}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {type.description}
                    </p>
                    {selectedEntities.length > 0 && (
                      <p className="text-sm text-green-600 mt-1">
                        {selectedEntities.length} {type.label.toLowerCase()}{" "}
                        selected
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search {type.label}
                  </label>
                  <input
                    type="text"
                    value={searchTerms[type.key]}
                    onChange={(e) =>
                      setSearchTerms((prev) => ({
                        ...prev,
                        [type.key]: e.target.value,
                      }))
                    }
                    placeholder={`Search ${type.label.toLowerCase()}...`}
                    disabled={disabled || loading[type.key]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>{" "}
                {/* Entity Selection */}
                <SearchableMultiSelect
                  label={`Select ${type.label}`}
                  options={availableEntities}
                  selectedValues={selectedEntities.map((e) => e.id)}
                  onChange={(selectedIds) => {
                    const selectedEntitiesFromIds = availableEntities.filter(
                      (entity) => selectedIds.includes(entity.id)
                    );
                    handleEntitySelectionChange(
                      type.key,
                      selectedEntitiesFromIds
                    );
                  }}
                  placeholder={
                    loading[type.key]
                      ? "Loading..."
                      : `Select ${type.label.toLowerCase()}...`
                  }
                  disabled={disabled || loading[type.key]}
                />
              </div>

              {/* Entity Grid Display */}
              {selectedEntities.length > 0 && (
                <div className="space-y-3">
                  <h5 className="text-sm font-medium text-gray-900">
                    Selected {type.label}
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedEntities.map((entity) => (
                      <div
                        key={entity.id}
                        className="bg-white border border-gray-200 rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {entity.name}
                            </p>
                            {entity.type && (
                              <p className="text-xs text-gray-500 truncate">
                                {entity.type}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              const updatedSelection = selectedEntities.filter(
                                (e) => e.id !== entity.id
                              );
                              handleEntitySelectionChange(
                                type.key,
                                updatedSelection
                              );
                            }}
                            disabled={disabled}
                            className="ml-2 text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Help Text */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-blue-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      <strong>Tip:</strong> If no {type.label.toLowerCase()} are
                      selected, the tax will apply to all{" "}
                      {type.label.toLowerCase()}. Select specific items to
                      restrict the tax scope.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EnhancedEntitySelector;
