import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { TaxFormData, TaxRule, TaxAssignment } from "../../types/tax";
import { taxAPI } from "../../services/taxAPI";
import Header from "../Header";
import TaxFormField from "./TaxFormField";
import RuleRow from "./RuleRow";
import EntitySelector from "./EntitySelector";
import TaxPreviewCard from "./TaxPreviewCard";

const TaxForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [formData, setFormData] = useState<TaxFormData>({
    name: "",
    rate: "",
    type: "percentage",
    status: "active",
    description: "",
    productType: "",
    assignments: [],
    rules: [],
  });

  const [errors, setErrors] = useState<Partial<TaxFormData>>({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  // Load tax data for editing
  useEffect(() => {
    if (isEditing && id) {
      loadTaxData(id);
    }
  }, [isEditing, id]);

  const loadTaxData = async (taxId: string) => {
    try {
      setInitialLoading(true);
      const tax = await taxAPI.getTax(taxId);
      if (tax) {
        setFormData({
          name: tax.name,
          rate: tax.rate.toString(),
          type: tax.type,
          status: tax.status,
          description: tax.description || "",
          productType: tax.productType || "",
          assignments: tax.assignments,
          rules: tax.rules,
        });
      } else {
        alert("Tax not found");
        navigate("/taxes");
      }
    } catch (error) {
      console.error("Error loading tax:", error);
      alert("Failed to load tax data");
      navigate("/taxes");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (field: keyof TaxFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleAddRule = () => {
    const newRule: TaxRule = {
      id: `rule_${Date.now()}`,
      taxId: id || "",
      conditionField: "region",
      operator: "==",
      value: "",
      type: "string",
    };

    setFormData((prev) => ({
      ...prev,
      rules: [...prev.rules, newRule],
    }));
  };

  const handleRuleChange = (index: number, updatedRule: TaxRule) => {
    setFormData((prev) => ({
      ...prev,
      rules: prev.rules.map((rule, i) => (i === index ? updatedRule : rule)),
    }));
  };

  const handleRemoveRule = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index),
    }));
  };

  const handleAssignmentsChange = (assignments: TaxAssignment[]) => {
    setFormData((prev) => ({ ...prev, assignments }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<TaxFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tax name is required";
    }

    if (!formData.rate.trim()) {
      newErrors.rate = "Tax rate is required";
    } else {
      const rate = parseFloat(formData.rate);
      if (isNaN(rate) || rate < 0) {
        newErrors.rate = "Tax rate must be a valid positive number";
      }
      if (formData.type === "percentage" && rate > 100) {
        newErrors.rate = "Percentage rate cannot exceed 100%";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (isEditing && id) {
        await taxAPI.updateTax(id, formData);
      } else {
        await taxAPI.createTax(formData);
      }

      navigate("/taxes");
    } catch (error) {
      console.error("Error saving tax:", error);
      alert(`Failed to ${isEditing ? "update" : "create"} tax`);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-[#0f4d57] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tax data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => navigate("/taxes")}
              className="mr-4 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? "Edit Tax" : "Create New Tax"}
            </h1>
          </div>
          <p className="text-gray-600">
            {isEditing
              ? "Update the tax configuration and rules"
              : "Configure a new tax with rules and assignments"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Tax Info */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">
                    Basic Tax Information
                  </h2>
                  <p className="text-sm text-gray-600">
                    Configure the basic properties of your tax
                  </p>
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TaxFormField
                      label="Tax Name"
                      value={formData.name}
                      onChange={(value) => handleInputChange("name", value)}
                      placeholder="e.g., VAT, Sales Tax, Luxury Tax"
                      required
                      error={errors.name}
                    />

                    <TaxFormField
                      label="Tax Rate"
                      type="number"
                      value={formData.rate}
                      onChange={(value) => handleInputChange("rate", value)}
                      placeholder={
                        formData.type === "percentage" ? "7.5" : "50.00"
                      }
                      required
                      error={errors.rate}
                      description={
                        formData.type === "percentage"
                          ? "Enter percentage (e.g., 7.5 for 7.5%)"
                          : "Enter fixed amount (e.g., 50.00 for $50)"
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TaxFormField
                      label="Tax Type"
                      type="select"
                      value={formData.type}
                      onChange={(value) => handleInputChange("type", value)}
                      options={[
                        { value: "percentage", label: "Percentage (%)" },
                        { value: "fixed", label: "Fixed Amount ($)" },
                      ]}
                      required
                    />

                    <TaxFormField
                      label="Status"
                      type="select"
                      value={formData.status}
                      onChange={(value) => handleInputChange("status", value)}
                      options={[
                        { value: "active", label: "Active" },
                        { value: "inactive", label: "Inactive" },
                      ]}
                      required
                    />
                  </div>

                  <TaxFormField
                    label="Product Type (Optional)"
                    type="select"
                    value={formData.productType}
                    onChange={(value) =>
                      handleInputChange("productType", value)
                    }
                    options={[
                      { value: "", label: "All Products" },
                      { value: "luxury", label: "Luxury Items" },
                      { value: "digital", label: "Digital Products" },
                      { value: "perishable", label: "Perishable Goods" },
                      { value: "hazardous", label: "Hazardous Materials" },
                    ]}
                    description="Optionally restrict this tax to specific product types"
                  />

                  <TaxFormField
                    label="Description (Optional)"
                    type="textarea"
                    value={formData.description}
                    onChange={(value) =>
                      handleInputChange("description", value)
                    }
                    placeholder="Optional description or notes about this tax"
                  />
                </div>
              </div>

              {/* Assignment Scope */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">
                    Assignment Scope
                  </h2>
                  <p className="text-sm text-gray-600">
                    Define which entities this tax applies to
                  </p>
                </div>

                <div className="p-6">
                  <EntitySelector
                    assignments={formData.assignments}
                    onChange={handleAssignmentsChange}
                  />
                </div>
              </div>

              {/* Conditional Rules */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">
                        Conditional Rules
                      </h2>
                      <p className="text-sm text-gray-600">
                        Define conditions when this tax should apply
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddRule}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#0f4d57] hover:bg-[#0d3f47] focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:ring-offset-2 transition-colors"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Add Rule
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {formData.rules.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
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
                          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                        />
                      </svg>
                      <p className="text-gray-600 mb-4">
                        No conditional rules defined
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Tax will apply to all matching entities. Add rules to
                        create specific conditions.
                      </p>
                      <button
                        type="button"
                        onClick={handleAddRule}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#0f4d57] hover:bg-[#0d3f47] transition-colors"
                      >
                        Add First Rule
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
                        <strong>Rules Logic:</strong> All rules must be
                        satisfied (AND logic). The tax will only apply when ALL
                        conditions are met.
                      </div>

                      {formData.rules.map((rule, index) => (
                        <RuleRow
                          key={rule.id}
                          rule={rule}
                          onChange={(updatedRule) =>
                            handleRuleChange(index, updatedRule)
                          }
                          onRemove={() => handleRemoveRule(index)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => navigate("/taxes")}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:ring-offset-2 transition-colors"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0f4d57] hover:bg-[#0d3f47] focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                          {isEditing ? "Updating..." : "Creating..."}
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          {isEditing ? "Update Tax" : "Create Tax"}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Tax Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <TaxPreviewCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxForm;
