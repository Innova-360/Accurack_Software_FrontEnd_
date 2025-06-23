# Accurack Software Frontend - Copilot Instructions

## Project Overview

This is the **Accurack Software Frontend** - a modern React-based inventory management system with comprehensive authentication capabilities. The application is built for retail and warehouse inventory tracking with features for user management, product cataloging, and real-time inventory updates.

## Tech Stack & Architecture

- **Frontend Framework**: React 19.1.0 with TypeScript
- **Build Tool**: Vite 6.3.5
- **State Management**: Redux Toolkit with React Redux
- **Styling**: TailwindCSS 4.1.10 (latest version)
- **HTTP Client**: Axios with interceptors
- **Routing**: React Router DOM 7.6.2
- **Date Handling**: Day.js and date-fns
- **Icons**: React Icons

## Project Structure & Conventions

### Directory Structure

```
src/
├── components/           # Reusable UI components
│   ├── reusablecomponents/  # Generic reusable components
├── pages/               # Route-specific page components
│   ├── Login/           # Authentication pages
│   ├── Signup/
│   ├── OtpPage/
│   ├── Inventory/       # Core inventory management
├── store/               # Redux store configuration
│   ├── slices/          # Redux slices (authSlice, etc.)
├── services/            # API service layer
├── routes/              # React Router configuration
├── hooks/               # Custom React hooks
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── constants/           # Application constants
├── context/             # React context providers
├── layouts/             # Layout components
└── styles/              # Global styles
```

### Code Style & Patterns

#### Component Patterns

- Use **functional components** with hooks
- Follow **PascalCase** for component names
- Use **React.FC** type annotation for components
- Prefer **named exports** over default exports for utilities
- Use **default exports** for page components

#### State Management

- **Redux Toolkit** is the primary state management solution
- All API calls must go through Redux slices using `createAsyncThunk`
- Never call APIs directly from components - always use Redux actions
- Use `useAppSelector` and `useAppDispatch` custom hooks (not raw Redux hooks)

#### Styling Guidelines

- **TailwindCSS** is the primary styling solution
- Brand colors: Primary `#0f4d57` (teal-900 equivalent)
- Use utility classes, avoid custom CSS unless absolutely necessary
- Responsive design: mobile-first approach
- Consistent spacing using Tailwind's spacing scale

#### API Integration

- All API calls go through the centralized `apiClient` (axios instance)
- Token-based authentication with automatic token injection via interceptors
- Error handling at both service and component levels
- Loading states managed through Redux

## Key Features & Modules

### 1. Authentication System

- **Login**: Email/password authentication
- **Signup**: User registration with super-admin capabilities
- **OTP Verification**: Two-factor authentication support
- **Token Management**: Automatic token refresh and storage

### 2. Inventory Management

- **Product Listing**: Comprehensive product catalog
- **CRUD Operations**: Create, Read, Update, Delete inventory items
- **Search & Filter**: Product search by SKU, PLU, name
- **Categories**: BEVERAGES, DAIRY, BAKERY, PRODUCE, etc.
- **Bulk Operations**: Upload and batch inventory updates

### 3. Store Management

- Multi-store support
- Store selection and switching
- Store-specific inventory tracking

## Development Guidelines

### When Adding New Features

1. **Plan First**: Always create a plan and ask for confirmation before implementing
2. **Component Structure**: Follow the established folder structure
3. **State Management**: Add new slices for complex state, use local state for simple UI state
4. **API Integration**: Create service functions in `services/` directory
5. **Type Safety**: Define TypeScript interfaces in `types/` directory
6. **Testing**: Write tests for critical business logic

### When Making Changes

1. **Analyze Impact**: Consider how changes affect existing functionality
2. **Maintain Consistency**: Follow existing patterns and conventions
3. **Update Documentation**: Update relevant documentation files
4. **Error Handling**: Implement proper error handling and user feedback
5. **Performance**: Consider performance implications, especially for inventory operations

### API Integration Rules

- **Never bypass Redux**: All API calls must go through Redux slices
- **Use apiClient**: Always use the configured axios instance
- **Handle Errors**: Implement proper error handling in slices
- **Loading States**: Always show loading states for async operations
- **Token Management**: Leverage automatic token injection

### UI/UX Guidelines

- **Consistency**: Maintain consistent styling with the brand colors
- **Accessibility**: Ensure components are accessible
- **Responsive**: All components should work on mobile and desktop
- **User Feedback**: Provide clear feedback for user actions
- **Loading States**: Show appropriate loading indicators

## Common Tasks & Examples

### Adding a New Page

1. Create component in `src/pages/[PageName]/[PageName].tsx`
2. Add route in `src/routes/index.tsx`
3. Add navigation if needed
4. Update any relevant state slices

### Adding API Integration

1. Create async thunk in appropriate slice
2. Handle fulfilled/rejected cases
3. Update component to dispatch action
4. Add loading/error handling in UI

### Adding New Component

1. Create in appropriate folder (`components/` or `pages/`)
2. Follow TypeScript and React.FC patterns
3. Use TailwindCSS for styling
4. Add to exports if reusable

## Important Notes

- This is a **production application** for inventory management
- **Security is critical** - always validate user input and handle authentication properly
- **Performance matters** - consider lazy loading for large inventory lists
- **User experience** - provide clear feedback and error messages
- **Data integrity** - ensure inventory operations maintain data consistency

## Environment Variables

```env
VITE_API_URL=http://localhost:4000/api/v1  # Backend API URL
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Questions to Ask Before Implementation

1. Does this change affect existing inventory operations?
2. Should this feature work across multiple stores?
3. Does this require authentication/authorization?
4. What error scenarios should be handled?
5. How will this scale with large inventory datasets?
6. Should this be responsive/mobile-friendly?
7. Does this need to integrate with the backend API?

Remember: Always plan, analyze, then confirm and ask me before making any changes to ensure the integrity of the inventory management system.
You have access to whole codebase but change only neccessary files. And don't remove any spaces, extra lines, even if they are unneccessary.
don't remove any big amount of code, just comment it and write your own beneath it.
