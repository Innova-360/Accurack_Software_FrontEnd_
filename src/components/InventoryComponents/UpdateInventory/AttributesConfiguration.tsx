import React from "react";
import type { Attribute } from "./types";
import { generateId } from "./utils";

interface AttributesConfigurationProps {
  hasAttributes: boolean;
  onToggle: (value: boolean) => void;
  attributes: Attribute[];
  onAttributesChange: (attributes: Attribute[]) => void;
  isVariantMode?: boolean; // <-- Add this prop
}

const AttributesConfiguration: React.FC<AttributesConfigurationProps> = ({
  hasAttributes,
  onToggle,
  attributes,
  onAttributesChange,
  isVariantMode = false, // <-- Default to false
}) => {
  const addAttribute = () => {
    const newAttribute: Attribute = {
      id: generateId(),
      name: "",
      options: [{ id: generateId(), value: "" }],
    };
    onAttributesChange([...attributes, newAttribute]);
  };

  const updateAttribute = (id: string, name: string) => {
    onAttributesChange(
      attributes.map((attr) => (attr.id === id ? { ...attr, name } : attr))
    );
  };

  const addAttributeOption = (attributeId: string) => {
    onAttributesChange(
      attributes.map((attr) =>
        attr.id === attributeId
          ? {
              ...attr,
              options: [...attr.options, { id: generateId(), value: "" }],
            }
          : attr
      )
    );
  };

  const updateAttributeOption = (
    attributeId: string,
    optionId: string,
    value: string
  ) => {
    onAttributesChange(
      attributes.map((attr) =>
        attr.id === attributeId
          ? {
              ...attr,
              options: attr.options.map((option) =>
                option.id === optionId ? { ...option, value } : option
              ),
            }
          : attr
      )
    );
  };

  const removeAttributeOption = (attributeId: string, optionId: string) => {
    onAttributesChange(
      attributes.map((attr) =>
        attr.id === attributeId
          ? {
              ...attr,
              options: attr.options.filter((option) => option.id !== optionId),
            }
          : attr
      )
    );
  };

  const removeAttribute = (id: string) => {
    onAttributesChange(attributes.filter((attr) => attr.id !== id));
  };
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 border border-gray-200 hover:shadow-xl transition-all duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-[#03414C]/10 to-[#0f4d57]/10 rounded-xl border border-[#03414C]/20">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-[#03414C]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-[#03414C]">
              Product Attributes
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm">
              Define product variations like color, size, etc.
            </p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={hasAttributes}
            onChange={(e) => onToggle(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-5 sm:w-12 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#03414C]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-[#03414C] shadow-lg"></div>
        </label>
      </div>

      {hasAttributes && (
        <div className="space-y-4 sm:space-y-6 border-t border-[#03414C]/10 pt-4 sm:pt-6 animate-fadeIn">
          {/* Decorative border */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-[#03414C]/20 to-transparent"></div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
            <h4 className="text-sm sm:text-base font-semibold text-[#03414C] flex items-center">
              <svg
                className="w-4 h-4 mr-2 text-[#03414C]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                />
              </svg>
              Attributes
            </h4>
            <button
              type="button"
              onClick={addAttribute}
              className="px-4 py-2 bg-gradient-to-r from-[#03414C] to-[#0f4d57] text-white rounded-lg text-sm hover:from-[#0f4d57] hover:to-[#03414C] transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center space-x-2"
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span>Add Attribute</span>
            </button>
          </div>{" "}
          {attributes.map((attribute) => (
            <div
              key={attribute.id}
              className="p-6 bg-gradient-to-r from-[#03414C]/5 to-[#0f4d57]/5 rounded-xl border border-[#03414C]/20 hover:shadow-lg transition-all duration-300 hover:border-[#03414C]/40 hover:from-[#03414C]/8 hover:to-[#0f4d57]/8 animate-slideIn"
            >
              <div className="flex items-center justify-between mb-4">
                <input
                  type="text"
                  placeholder="Attribute Name (e.g., Color, Size, Material)"
                  value={attribute.name || ""}
                  onChange={(e) =>
                    updateAttribute(attribute.id, e.target.value)
                  }
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C]/20 focus:border-[#03414C] mr-3 transition-all duration-200 hover:border-[#03414C]/30"
                />
                <button
                  type="button"
                  onClick={() => removeAttribute(attribute.id)}
                  className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
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

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#03414C] flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-[#03414C]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m0 0h2m-4 0v4a2 2 0 002 2h2a2 2 0 002-2v-4m-6 0a2 2 0 002-2v-2a2 2 0 00-2-2H9z"
                      />
                    </svg>
                    Options:
                  </span>{" "}
                  <button
                    type="button"
                    onClick={() => addAttributeOption(attribute.id)}
                    className={`px-3 py-2 rounded-lg text-xs transition-all duration-200 transform shadow-sm flex items-center space-x-1 ${
                      !isVariantMode && attribute.options.length >= 1
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#127F92] to-[#16a085] text-white hover:from-[#16a085] hover:to-[#127F92] hover:scale-105"
                    }`}
                    disabled={!isVariantMode && attribute.options.length >= 1}
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    <span>Add Option</span>
                  </button>
                </div>
                {/* Show info if disabled */}
                {!isVariantMode && attribute.options.length >= 1 && (
                  <div className="text-xs text-amber-600 mt-2 p-2 bg-amber-50 rounded-lg flex items-center gap-2 border border-amber-200">
                    <svg
                      className="w-3 h-3 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01"
                      />
                    </svg>
                    <span className="font-medium">
                      Only one option allowed per attribute when variants are
                      off.
                    </span>
                  </div>
                )}
                {attribute.options.map((option) => (
                  <div
                    key={option.id}
                    className="flex items-center gap-3 animate-slideIn"
                  >
                    <input
                      type="text"
                      placeholder="Option value (e.g., Red, Large, Cotton)"
                      value={option.value || ""}
                      onChange={(e) =>
                        updateAttributeOption(
                          attribute.id,
                          option.id,
                          e.target.value
                        )
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C]/20 focus:border-[#03414C] transition-all duration-200 hover:border-[#03414C]/30"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        removeAttributeOption(attribute.id, option.id)
                      }
                      className="px-3 py-2 bg-red-400 text-white rounded-lg text-xs hover:bg-red-500 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AttributesConfiguration;
