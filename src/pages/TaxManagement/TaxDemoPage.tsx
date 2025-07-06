import React, { useState } from "react";
import {
  EnhancedTaxList,
  EnhancedTaxForm,
  EnhancedTaxPreviewCard,
  EnhancedEntitySelector,
  TaxFormField,
  RuleRow,
} from "../../components/TaxComponents";
import type { TaxAssignment, TaxRule } from "../../types/tax";
import Header from "../../components/Header";

const TaxDemoPage: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<
    "list" | "form" | "preview" | "selector" | "components"
  >("list");
  const [assignments, setAssignments] = useState<TaxAssignment[]>([]);

  const demos = [
    {
      id: "list",
      label: "Enhanced Tax List",
      description:
        "Comprehensive tax management with bulk actions and statistics",
    },
    {
      id: "form",
      label: "Enhanced Tax Form",
      description: "Tabbed form interface with real-time validation",
    },
    {
      id: "preview",
      label: "Tax Preview Card",
      description: "Interactive tax calculation preview",
    },
    {
      id: "selector",
      label: "Entity Selector",
      description: "Advanced entity assignment interface",
    },
    {
      id: "components",
      label: "Individual Components",
      description: "Standalone component demonstrations",
    },
  ];

  const sampleRule: TaxRule = {
    id: "sample-rule",
    taxId: "demo-tax",
    conditionField: "region",
    operator: "==",
    value: "US",
    type: "string",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Enhanced Tax Management System Demo
          </h1>
          <p className="mt-2 text-gray-600">
            Explore the comprehensive tax management components with enhanced
            UI/UX features
          </p>
        </div>

        {/* Demo Navigation */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {demos.map((demo) => (
                <button
                  key={demo.id}
                  onClick={() => setActiveDemo(demo.id as typeof activeDemo)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeDemo === demo.id
                      ? "border-[#0f4d57] text-[#0f4d57]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {demo.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            <div className="text-sm text-gray-600">
              {demos.find((d) => d.id === activeDemo)?.description}
            </div>
          </div>
        </div>

        {/* Demo Content */}
        <div className="space-y-8">
          {activeDemo === "list" && (
            <div className="bg-white shadow rounded-lg">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Enhanced Tax List Demo
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Features: Statistics dashboard, bulk operations, advanced
                  filtering, export functionality
                </p>
              </div>
              <div className="p-6">
                <EnhancedTaxList />
              </div>
            </div>
          )}

          {activeDemo === "form" && (
            <div className="bg-white shadow rounded-lg">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Enhanced Tax Form Demo
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Features: Tabbed interface, real-time validation, progress
                  indicators, unsaved changes warning
                </p>
              </div>
              <div className="p-6">
                <EnhancedTaxForm />
              </div>
            </div>
          )}

          {activeDemo === "preview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white shadow rounded-lg">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Tax Preview Card Demo
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Interactive tax calculation with test scenarios
                  </p>
                </div>
                <div className="p-6">
                  <EnhancedTaxPreviewCard showTestControls={true} />
                </div>
              </div>

              <div className="bg-white shadow rounded-lg">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Preview Features
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center text-sm">
                    <svg
                      className="w-4 h-4 text-green-500 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Real-time tax calculation
                  </div>
                  <div className="flex items-center text-sm">
                    <svg
                      className="w-4 h-4 text-green-500 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Multiple product samples
                  </div>
                  <div className="flex items-center text-sm">
                    <svg
                      className="w-4 h-4 text-green-500 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Region and customer type testing
                  </div>
                  <div className="flex items-center text-sm">
                    <svg
                      className="w-4 h-4 text-green-500 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Detailed calculation breakdown
                  </div>
                  <div className="flex items-center text-sm">
                    <svg
                      className="w-4 h-4 text-green-500 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Visual tax application indicators
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeDemo === "selector" && (
            <div className="bg-white shadow rounded-lg">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Enhanced Entity Selector Demo
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Features: Tabbed interface, advanced search, visual assignment
                  summary, bulk operations
                </p>
              </div>
              <div className="p-6">
                <EnhancedEntitySelector
                  assignments={assignments}
                  onChange={setAssignments}
                />
              </div>
            </div>
          )}

          {activeDemo === "components" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* TaxFormField Demo */}
              <div className="bg-white shadow rounded-lg">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    TaxFormField Component
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Reusable form field with validation
                  </p>
                </div>
                <div className="p-6 space-y-4">
                  <TaxFormField
                    label="Tax Name"
                    value="VAT"
                    onChange={() => {}}
                    placeholder="Enter tax name"
                    required
                  />
                  <TaxFormField
                    label="Tax Rate"
                    type="number"
                    value="7.5"
                    onChange={() => {}}
                    placeholder="7.5"
                    description="Enter percentage rate"
                  />
                  <TaxFormField
                    label="Tax Type"
                    type="select"
                    value="percentage"
                    onChange={() => {}}
                    options={[
                      { value: "percentage", label: "Percentage (%)" },
                      { value: "fixed", label: "Fixed Amount ($)" },
                    ]}
                  />
                  <TaxFormField
                    label="Description"
                    type="textarea"
                    value="Value Added Tax for electronics"
                    onChange={() => {}}
                    placeholder="Optional description"
                  />
                </div>
              </div>

              {/* RuleRow Demo */}
              <div className="bg-white shadow rounded-lg">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    RuleRow Component
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Dynamic rule builder interface
                  </p>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
                      Example: Apply tax when region equals "US"
                    </div>
                    <RuleRow
                      rule={sampleRule}
                      onChange={(rule) => console.log("Rule changed:", rule)}
                      onRemove={() => console.log("Rule removed")}
                    />
                  </div>
                </div>
              </div>

              {/* Feature Comparison */}
              <div className="lg:col-span-2 bg-white shadow rounded-lg">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Enhanced vs Original Components
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Feature comparison between original and enhanced versions
                  </p>
                </div>
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Feature
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Original
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Enhanced
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Tax List
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            Basic table with pagination
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                            + Statistics, bulk actions, export
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Tax Form
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            Single page form
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                            + Tabbed interface, progress tracking
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Preview
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            Basic calculation display
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                            + Interactive testing, scenarios
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Entity Selector
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            Simple multi-select
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                            + Tabbed interface, visual summary
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Validation
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            Form submission validation
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                            + Real-time validation, progress
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Mobile Support
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            Basic responsive design
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                            + Mobile-optimized, touch-friendly
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Implementation Guide */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">
            Implementation Guide
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-md font-medium text-blue-800 mb-2">
                Using Enhanced Components
              </h3>
              <pre className="text-xs bg-blue-100 p-3 rounded text-blue-700 overflow-x-auto">
                {`import { 
  EnhancedTaxList,
  EnhancedTaxForm,
  EnhancedTaxPreviewCard 
} from '../components/TaxComponents';

// Use in your pages
<EnhancedTaxList />
<EnhancedTaxForm />
<EnhancedTaxPreviewCard />`}
              </pre>
            </div>
            <div>
              <h3 className="text-md font-medium text-blue-800 mb-2">
                Migration from Original
              </h3>
              <pre className="text-xs bg-blue-100 p-3 rounded text-blue-700 overflow-x-auto">
                {`// Before
import { TaxList } from '../components/TaxComponents';

// After  
import { EnhancedTaxList } from '../components/TaxComponents';

// Drop-in replacement with enhanced features`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxDemoPage;
