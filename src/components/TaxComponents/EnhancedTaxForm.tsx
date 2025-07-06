import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { TaxFormData, TaxRule, TaxAssignment } from "../../types/tax";
import { taxAPI } from "../../services/taxAPI";
import Header from "../Header";
import TaxFormField from "./TaxFormField";
import RuleRow from "./RuleRow";
import EnhancedEntitySelector from "./EnhancedEntitySelector";
import EnhancedTaxPreviewCard from "./EnhancedTaxPreviewCard";

const EnhancedTaxForm: React.FC = () => {
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
  const [activeTab, setActiveTab] = useState<
    "basic" | "assignments" | "rules" | "preview"
  >("basic");
  const [formValid, setFormValid] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  // Track form changes for unsaved warning
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load tax data for editing
  useEffect(() => {
    if (isEditing && id) {
      loadTaxData(id);
    }
  }, [isEditing, id]);

  // Validate form whenever formData changes
  useEffect(() => {
    const isValid = validateForm(false);
    setFormValid(isValid);
    setHasUnsavedChanges(true);
  }, [formData]);

  // Warn user about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

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
        setHasUnsavedChanges(false);
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

  const validateForm = (showErrors: boolean = true): boolean => {
    const newErrors: Partial<TaxFormData> = {};

    // Basic validation
    if (!formData.name.trim()) {
      newErrors.name = "Tax name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Tax name must be at least 2 characters";
    } else if (formData.name.length > 100) {
      newErrors.name = "Tax name must be less than 100 characters";
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
      if (formData.type === "fixed" && rate > 10000) {
        newErrors.rate = "Fixed rate cannot exceed $10,000";
      }
    }

    // Description validation (optional but with limits)
    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    }

    // Rules validation
    if (formData.rules.length > 0) {
      const hasInvalidRules = formData.rules.some((rule) => {
        return (
          !rule.conditionField ||
          !rule.operator ||
          rule.value === "" ||
          rule.value === null
        );
      });

      if (hasInvalidRules) {
        // We'll show specific rule errors in the rule components
      }
    }

    if (showErrors) {
      setErrors(newErrors);
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Auto-navigate to first tab with errors
      if (errors.name || errors.rate || errors.description) {
        setActiveTab("basic");
      }
      return;
    }

    setLoading(true);

    try {
      if (isEditing && id) {
        await taxAPI.updateTax(id, formData);
      } else {
        await taxAPI.createTax(formData);
      }

      setHasUnsavedChanges(false);
      navigate("/taxes");
    } catch (error) {
      console.error("Error saving tax:", error);
      alert(`Failed to ${isEditing ? "update" : "create"} tax`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedWarning(true);
    } else {
      navigate("/taxes");
    }
  };

  const confirmCancel = () => {
    setHasUnsavedChanges(false);
    navigate("/taxes");
  };

  const handleTabChange = (tab: typeof activeTab) => {
    // Validate current tab before switching
    if (tab !== "basic" && activeTab === "basic") {
      if (!formData.name.trim() || !formData.rate.trim()) {
        alert("Please fill in the required basic information first");
        return;
      }
    }
    setActiveTab(tab);
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
              onClick={handleCancel}
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isEditing ? "Edit Tax" : "Create New Tax"}
              </h1>
              <p className="text-gray-600 mt-1">
                {isEditing
                  ? "Update the tax configuration and rules"
                  : "Configure a new tax with rules and assignments"}
              </p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center space-x-4 text-sm">
            <div
              className={`flex items-center ${formData.name && formData.rate ? "text-green-600" : "text-gray-400"}`}
            >
              {formData.name && formData.rate ? (
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <div className="w-4 h-4 mr-1 border-2 border-current rounded-full"></div>
              )}
              Basic Info
            </div>
            <div
              className={`flex items-center ${formData.assignments.length > 0 ? "text-green-600" : "text-gray-400"}`}
            >
              {formData.assignments.length > 0 ? (
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <div className="w-4 h-4 mr-1 border-2 border-current rounded-full"></div>
              )}
              Assignments ({formData.assignments.length})
            </div>
            <div
              className={`flex items-center ${formData.rules.length > 0 ? "text-green-600" : "text-gray-400"}`}
            >
              {formData.rules.length > 0 ? (
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <div className="w-4 h-4 mr-1 border-2 border-current rounded-full"></div>
              )}
              Rules ({formData.rules.length})
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Tab Navigation */}
              <div className="bg-white shadow rounded-lg">
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8 px-6">
                    {[
                      {
                        id: "basic",
                        label: "Basic Info",
                        icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                      },
                      {
                        id: "assignments",
                        label: "Assignments",
                        icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z",
                      },
                      {
                        id: "rules",
                        label: "Rules",
                        icon: "M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
                      },
                      {
                        id: "preview",
                        label: "Preview",
                        icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
                      },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() =>
                          handleTabChange(tab.id as typeof activeTab)
                        }
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                          activeTab === tab.id
                            ? "border-[#0f4d57] text-[#0f4d57]"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
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
                            d={tab.icon}
                          />
                        </svg>
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {/* Basic Info Tab */}
                  {activeTab === "basic" && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          Basic Tax Information
                        </h3>
                        <p className="text-sm text-gray-600 mb-6">
                          Configure the fundamental properties of your tax
                        </p>
                      </div>

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
                          onChange={(value) =>
                            handleInputChange("status", value)
                          }
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
                        placeholder="Optional description or notes about this tax..."
                        error={errors.description}
                        description="Provide additional context about when and how this tax should be applied"
                      />
                    </div>
                  )}

                  {/* Assignments Tab */}
                  {activeTab === "assignments" && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          Assignment Scope
                        </h3>
                        <p className="text-sm text-gray-600 mb-6">
                          Define which entities this tax applies to. Leave empty
                          to apply to all entities.
                        </p>
                      </div>{" "}
                      <EnhancedEntitySelector
                        assignments={formData.assignments}
                        onChange={handleAssignmentsChange}
                      />
                    </div>
                  )}

                  {/* Rules Tab */}
                  {activeTab === "rules" && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Conditional Rules
                          </h3>
                          <p className="text-sm text-gray-600">
                            Define conditions when this tax should apply. All
                            rules must be satisfied (AND logic).
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
                            Tax will apply to all matching entities. Add rules
                            to create specific conditions.
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
                            satisfied (AND logic). The tax will only apply when
                            ALL conditions are met.
                          </div>

                          {formData.rules.map((rule, index) => (
                            <div
                              key={rule.id}
                              className="border border-gray-200 rounded-lg p-4"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">
                                  Rule {index + 1}
                                </span>
                                {index > 0 && (
                                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                    AND
                                  </span>
                                )}
                              </div>
                              <RuleRow
                                rule={rule}
                                onChange={(updatedRule) =>
                                  handleRuleChange(index, updatedRule)
                                }
                                onRemove={() => handleRemoveRule(index)}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Preview Tab */}
                  {activeTab === "preview" && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          Tax Preview
                        </h3>
                        <p className="text-sm text-gray-600 mb-6">
                          Test how your tax configuration will work with
                          different scenarios
                        </p>
                      </div>

                      <EnhancedTaxPreviewCard
                        showTestControls={true}
                        className="border-0 shadow-none"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:ring-offset-2 transition-colors"
                      >
                        Cancel
                      </button>

                      {hasUnsavedChanges && (
                        <span className="text-sm text-amber-600 flex items-center">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                          </svg>
                          Unsaved changes
                        </span>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !formValid}
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

          {/* Side Panel - Quick Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Form Summary */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Form Summary
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">
                      {formData.name || "Not set"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rate:</span>
                    <span className="font-medium">
                      {formData.rate
                        ? `${formData.rate}${formData.type === "percentage" ? "%" : " USD"}`
                        : "Not set"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span
                      className={`font-medium ${formData.status === "active" ? "text-green-600" : "text-red-600"}`}
                    >
                      {formData.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Assignments:</span>
                    <span className="font-medium">
                      {formData.assignments.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rules:</span>
                    <span className="font-medium">{formData.rules.length}</span>
                  </div>
                </div>
              </div>

              {/* Validation Status */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Validation Status
                </h4>
                <div className="space-y-2">
                  <div
                    className={`flex items-center text-sm ${formData.name ? "text-green-600" : "text-red-600"}`}
                  >
                    {formData.name ? (
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    Tax name required
                  </div>
                  <div
                    className={`flex items-center text-sm ${formData.rate ? "text-green-600" : "text-red-600"}`}
                  >
                    {formData.rate ? (
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    Tax rate required
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Unsaved Changes Warning Modal */}
      {showUnsavedWarning && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                <svg
                  className="h-6 w-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-2">
                Unsaved Changes
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  You have unsaved changes. Are you sure you want to leave
                  without saving?
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={() => setShowUnsavedWarning(false)}
                  className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-24 mr-2 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmCancel}
                  className="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-24 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
                >
                  Leave
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedTaxForm;
