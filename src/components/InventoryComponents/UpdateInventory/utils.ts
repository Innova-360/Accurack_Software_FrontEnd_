export const generateId = () => Math.random().toString(36).substr(2, 9);

export const needsVariations = (hasAttributes: boolean, attributes: any[]) => {
  if (!hasAttributes || attributes.length === 0) return false;
  return attributes.some(
    (attr) => attr.options.filter((opt: any) => opt.value.trim()).length > 1
  );
};

export const shouldHideFields = (
  hasAttributes: boolean,
  attributes: any[],
  showVariations: boolean
) => {
  return needsVariations(hasAttributes, attributes) && !showVariations;
};
