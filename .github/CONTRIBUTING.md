# Contributing to Accurack Software Frontend

Thank you for your interest in contributing to Accurack Software Frontend! This document provides guidelines and processes for contributing to this inventory management system.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- Basic knowledge of React, TypeScript, and Redux

### Development Setup

1. Fork the repository
2. Clone your fork: `git clone <your-fork-url>`
3. Install dependencies: `npm install`
4. Start development server: `npm run dev`

## 📋 Development Workflow

### 1. Analysis Phase

Before making any changes, always:

- **Understand the existing codebase**
- **Identify affected components and files**
- **Review related documentation**
- **Check for existing similar implementations**

### 2. Planning Phase

Create a detailed plan that includes:

- **Component structure and hierarchy**
- **State management requirements**
- **API integration needs**
- **UI/UX considerations**
- **Testing strategy**

### 3. Implementation Phase

Follow these steps:

- **Create feature branch**: `git checkout -b feature/your-feature-name`
- **Follow coding standards** (see below)
- **Write clean, documented code**
- **Test thoroughly**
- **Update documentation**

### 4. Review Phase

Before submitting:

- **Run all quality checks**: `npm run lint`
- **Build successfully**: `npm run build`
- **Test manually on different screen sizes**
- **Verify error handling**

## 🎯 Feature Request Process

### Automated Analysis & Approval

We use GitHub Actions to analyze and approve feature requests:

1. **Submit Feature Request**

   - Go to Actions tab
   - Run "Feature Request Analysis & Implementation"
   - Provide detailed feature description
   - Set appropriate priority level

2. **Automated Analysis**

   - Codebase analysis runs automatically
   - Implementation plan is generated
   - Approval issue is created

3. **Review & Approval**
   - Review the generated analysis and plan
   - Comment with `/approve`, `/request-changes`, or `/reject`
   - Implementation proceeds only after approval

### Manual Feature Requests

If you prefer manual process:

1. Create detailed GitHub issue
2. Include mockups/wireframes if UI changes
3. Specify business requirements
4. Wait for maintainer review and approval

## 💻 Coding Standards

### TypeScript

- Use strict TypeScript configuration
- Define interfaces for all data structures
- Avoid `any` type - use proper typing
- Use type annotations for function parameters and returns

```typescript
// ✅ Good
interface Product {
  id: string;
  name: string;
  quantity: number;
}

const updateProduct = (product: Product): Promise<Product> => {
  // implementation
};

// ❌ Bad
const updateProduct = (product: any): any => {
  // implementation
};
```

### React Components

- Use functional components with hooks
- Follow React.FC pattern for typing
- Use PascalCase for component names
- Keep components focused and single-purpose

```typescript
// ✅ Good
interface Props {
  title: string;
  onClose: () => void;
}

const Modal: React.FC<Props> = ({ title, onClose }) => {
  return (
    <div className="modal">
      <h2>{title}</h2>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default Modal;
```

### Redux/State Management

- Use Redux Toolkit for all state management
- Create async thunks for API calls
- Handle loading and error states
- Use proper TypeScript typing for slices

```typescript
// ✅ Good
export const fetchProducts = createAsyncThunk(
  "inventory/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/products");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch products"
      );
    }
  }
);
```

### Styling Guidelines

- Use TailwindCSS utility classes
- Follow brand color scheme (`#0f4d57` primary)
- Ensure responsive design (mobile-first)
- Use consistent spacing and typography

```typescript
// ✅ Good
<button className="bg-[#0f4d57] text-white px-4 py-2 rounded-xl shadow-md hover:bg-teal-800 transition-colors">
  Save Product
</button>

// ❌ Avoid custom CSS unless necessary
<button style={{ backgroundColor: '#0f4d57', padding: '8px 16px' }}>
  Save Product
</button>
```

### File Naming & Organization

- Use PascalCase for component files: `ProductCard.tsx`
- Use camelCase for utility files: `apiHelpers.ts`
- Group related files in folders
- Use descriptive, meaningful names

```
src/
├── components/
│   ├── ProductCard.tsx        # ✅ Good
│   ├── product-card.tsx       # ❌ Bad
│   └── pc.tsx                 # ❌ Bad
├── utils/
│   ├── apiHelpers.ts          # ✅ Good
│   ├── formatters.ts          # ✅ Good
```

## 🧪 Testing Guidelines

### Manual Testing Checklist

- [ ] Component renders correctly
- [ ] All interactive elements work
- [ ] Responsive design works on mobile/desktop
- [ ] Loading states display properly
- [ ] Error handling works correctly
- [ ] API integration functions properly

### Testing Different Scenarios

- **Happy Path**: Normal user flow works
- **Error Cases**: Network failures, invalid data
- **Edge Cases**: Empty states, large datasets
- **Responsive**: Mobile, tablet, desktop views

## 🔄 Pull Request Process

### PR Requirements

1. **Descriptive Title**: Clear, concise description
2. **Detailed Description**: What, why, and how
3. **Screenshots**: For UI changes
4. **Testing Notes**: How to test the changes
5. **Breaking Changes**: Document any breaking changes

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Manual testing completed
- [ ] Responsive design verified
- [ ] Error handling tested

## Screenshots

[Include screenshots for UI changes]

## Additional Notes

[Any additional context or notes]
```

### Review Process

1. **Automated Checks**: All CI checks must pass
2. **Code Review**: At least one maintainer review required
3. **Testing**: Manual testing verification
4. **Documentation**: Update docs if needed

## 🚨 Important Guidelines

### Security Considerations

- Never commit sensitive data (API keys, passwords)
- Validate all user inputs
- Handle authentication properly
- Use environment variables for configuration

### Performance Considerations

- Optimize for large inventory datasets
- Use lazy loading where appropriate
- Minimize bundle size
- Consider memory usage

### Accessibility

- Use semantic HTML elements
- Provide proper ARIA labels
- Ensure keyboard navigation works
- Maintain good color contrast

## 🐛 Bug Reports

### Bug Report Template

```markdown
**Bug Description**
Clear description of the bug

**Steps to Reproduce**

1. Go to...
2. Click on...
3. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**

- Browser: [e.g., Chrome 91]
- OS: [e.g., Windows 10]
- Screen size: [e.g., 1920x1080]

**Screenshots**
If applicable, add screenshots
```

## 📞 Getting Help

### Communication Channels

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Code Reviews**: For technical discussions during PR review

### Resources

- **Project Documentation**: Check existing docs first
- **API Flow Guide**: `API_FLOW_GUIDE.md`
- **Copilot Instructions**: `.copilot/instructions.md`

## 🎉 Recognition

Contributors who make significant improvements will be:

- Listed in project contributors
- Acknowledged in release notes
- Invited to become project maintainers (for regular contributors)

Thank you for contributing to Accurack Software Frontend! 🚀
