import React, { useState, useEffect } from "react";
import type { TaxRule, RuleFieldOption, OperatorOption } from "../../types/tax";

interface RuleRowProps {
  rule: TaxRule;
  onChange: (rule: TaxRule) => void;
  onRemove: () => void;
  disabled?: boolean;
  className?: string;
}

// Available rule fields with their types
const RULE_FIELDS: RuleFieldOption[] = [
  { value: "region", label: "Region", type: "string" },
  { value: "total_amount", label: "Total Amount", type: "number" },
  { value: "customer_type", label: "Customer Type", type: "string" },
  { value: "product_category", label: "Product Category", type: "string" },
  { value: "store_location", label: "Store Location", type: "string" },
  { value: "quantity", label: "Quantity", type: "number" },
];

// Available operators with supported types
const OPERATORS: OperatorOption[] = [
  { value: "==", label: "Equals", supportedTypes: ["string", "number"] },
  { value: "!=", label: "Not Equals", supportedTypes: ["string", "number"] },
  { value: ">=", label: "Greater than or equal", supportedTypes: ["number"] },
  { value: "<=", label: "Less than or equal", supportedTypes: ["number"] },
  { value: ">", label: "Greater than", supportedTypes: ["number"] },
  { value: "<", label: "Less than", supportedTypes: ["number"] },
  { value: "in", label: "In list", supportedTypes: ["array"] },
  { value: "not_in", label: "Not in list", supportedTypes: ["array"] },
];

const RuleRow: React.FC<RuleRowProps> = ({
  rule,
  onChange,
  onRemove,
  disabled = false,
  className = "",
}) => {
  const [localRule, setLocalRule] = useState<TaxRule>(rule);

  // Get the current field configuration
  const currentField = RULE_FIELDS.find(
    (field) => field.value === localRule.conditionField
  );

  // Get available operators for current field type
  const availableOperators = OPERATORS.filter((op) =>
    currentField ? op.supportedTypes.includes(currentField.type) : true
  );

  // Update parent when local rule changes
  useEffect(() => {
    onChange(localRule);
  }, [localRule, onChange]);

  const handleFieldChange = (field: string) => {
    const fieldConfig = RULE_FIELDS.find((f) => f.value === field);
    const newType = fieldConfig?.type || "string";

    // Reset operator and value when field changes
    const availableOps = OPERATORS.filter((op) =>
      op.supportedTypes.includes(newType)
    );
    const defaultOperator = availableOps[0]?.value || "==";

    setLocalRule((prev) => ({
      ...prev,
      conditionField: field as any,
      operator: defaultOperator as any,
      value: newType === "array" ? [] : "",
      type: newType,
    }));
  };

  const handleOperatorChange = (operator: string) => {
    // If switching to/from array operators, reset value
    const isArrayOperator = ["in", "not_in"].includes(operator);
    const wasArrayOperator = ["in", "not_in"].includes(localRule.operator);

    let newValue = localRule.value;
    if (isArrayOperator && !wasArrayOperator) {
      newValue = [];
    } else if (!isArrayOperator && wasArrayOperator) {
      newValue = "";
    }

    setLocalRule((prev) => ({
      ...prev,
      operator: operator as any,
      value: newValue,
      type: isArrayOperator ? "array" : prev.type,
    }));
  };

  const handleValueChange = (value: string) => {
    if (localRule.type === "array") {
      // For array type, split by comma and trim
      const arrayValue = value
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v);
      setLocalRule((prev) => ({ ...prev, value: arrayValue }));
    } else if (localRule.type === "number") {
      setLocalRule((prev) => ({ ...prev, value: parseFloat(value) || 0 }));
    } else {
      setLocalRule((prev) => ({ ...prev, value }));
    }
  };

  const getValuePlaceholder = () => {
    if (localRule.type === "array") {
      return "Enter values separated by commas (e.g., US, CA, UK)";
    } else if (localRule.type === "number") {
      return "Enter a number";
    } else {
      return "Enter value";
    }
  };

  const getDisplayValue = () => {
    if (localRule.type === "array" && Array.isArray(localRule.value)) {
      return localRule.value.join(", ");
    }
    return String(localRule.value || "");
  };

  return (
    <div
      className={`flex items-center gap-3 p-4 bg-gray-50 rounded-lg border ${className}`}
    >
      {/* Field Selection */}
      <div className="flex-1 min-w-0">
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Field
        </label>
        <select
          value={localRule.conditionField}
          onChange={(e) => handleFieldChange(e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
        >
          {RULE_FIELDS.map((field) => (
            <option key={field.value} value={field.value}>
              {field.label}
            </option>
          ))}
        </select>
      </div>

      {/* Operator Selection */}
      <div className="flex-1 min-w-0">
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Operator
        </label>
        <select
          value={localRule.operator}
          onChange={(e) => handleOperatorChange(e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
        >
          {availableOperators.map((operator) => (
            <option key={operator.value} value={operator.value}>
              {operator.label}
            </option>
          ))}
        </select>
      </div>

      {/* Value Input */}
      <div className="flex-1 min-w-0">
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Value
        </label>
        {localRule.type === "number" ? (
          <input
            type="number"
            value={getDisplayValue()}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder={getValuePlaceholder()}
            disabled={disabled}
            step="0.01"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
          />
        ) : (
          <input
            type="text"
            value={getDisplayValue()}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder={getValuePlaceholder()}
            disabled={disabled}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
          />
        )}
      </div>

      {/* Type Badge */}
      <div className="flex-shrink-0">
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Type
        </label>
        <span
          className={`inline-block px-2 py-2 text-xs font-medium rounded-md ${
            localRule.type === "string"
              ? "bg-blue-100 text-blue-800"
              : localRule.type === "number"
                ? "bg-green-100 text-green-800"
                : "bg-purple-100 text-purple-800"
          }`}
        >
          {localRule.type}
        </span>
      </div>

      {/* Remove Button */}
      <div className="flex-shrink-0">
        <label className="block text-xs font-medium text-gray-600 mb-1">
          &nbsp;
        </label>
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Remove rule"
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
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default RuleRow;
