export const generateId = () => Math.random().toString(36).substr(2, 9);

export const needsVariations = (hasAttributes: boolean, attributes: any[]) => {
  if (!hasAttributes || !attributes || attributes.length === 0) return false;
  
  // Check if it's the old structure with options or new structure with simple name/value pairs
  if (attributes.length > 0 && attributes[0].options) {
    // Old structure - check for multiple options
    return attributes.some(
      (attr) => attr.options && attr.options.filter((opt: any) => opt.value && opt.value.trim()).length > 1
    );
  }
  
  // New structure - simple products with simple attributes don't need variations
  // Only return true if we have multiple attributes or complex attribute structures
  return false;
};

export const shouldHideFields = (
  hasAttributes: boolean,
  attributes: any[],
  showVariations: boolean
) => {
  return needsVariations(hasAttributes, attributes) && !showVariations;
};
