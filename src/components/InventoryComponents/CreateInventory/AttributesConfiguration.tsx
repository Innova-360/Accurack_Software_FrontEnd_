import React from "react";
import type { Attribute } from "./types";
import { generateId } from "./utils";

interface AttributesConfigurationProps {
  hasAttributes: boolean;
  onToggle: (value: boolean) => void;
  attributes: Attribute[];
  onAttributesChange: (attributes: Attribute[]) => void;
}

const AttributesConfiguration: React.FC<AttributesConfigurationProps> = ({
  hasAttributes,
  onToggle,
  attributes,
  onAttributesChange,
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
    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <svg
              className="w-6 h-6 text-purple-600"
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
            <h3 className="text-xl font-bold text-gray-900">
              Product Attributes
            </h3>
            <p className="text-gray-600 text-sm">
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
          <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600 shadow-lg"></div>
        </label>
      </div>

      {hasAttributes && (
        <div className="space-y-6 border-t pt-6 animate-fadeIn">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <svg
                className="w-4 h-4 mr-2 text-purple-600"
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
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center space-x-2"
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
              className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <input
                  type="text"
                  placeholder="Attribute Name (e.g., Color, Size, Material)"
                  value={attribute.name}
                  onChange={(e) =>
                    updateAttribute(attribute.id, e.target.value)
                  }
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent mr-3 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => removeAttribute(attribute.id)}
                  className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 transform hover:scale-105 shadow-md"
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
                  <span className="text-sm font-semibold text-gray-700 flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-purple-600"
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
                  </span>
                  <button
                    type="button"
                    onClick={() => addAttributeOption(attribute.id)}
                    className="px-3 py-1 bg-green-500 text-white rounded-lg text-xs hover:bg-green-600 transition-all duration-200 transform hover:scale-105 shadow-sm flex items-center space-x-1"
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

                {attribute.options.map((option) => (
                  <div
                    key={option.id}
                    className="flex items-center gap-3 animate-slideIn"
                  >
                    <input
                      type="text"
                      placeholder="Option value (e.g., Red, Large, Cotton)"
                      value={option.value}
                      onChange={(e) =>
                        updateAttributeOption(
                          attribute.id,
                          option.id,
                          e.target.value
                        )
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        removeAttributeOption(attribute.id, option.id)
                      }
                      className="px-3 py-2 bg-red-400 text-white rounded-lg text-xs hover:bg-red-500 transition-all duration-200 transform hover:scale-105 shadow-sm"
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
