# Accurack Software Frontend

A modern React-based inventory management system built with TypeScript, Redux Toolkit, and TailwindCSS.

## 🚀 Features

### 🔐 Authentication System

- **User Registration & Login** - Secure email/password authentication
- **OTP Verification** - Two-factor authentication support
- **Token Management** - Automatic token handling and refresh
- **Super Admin Registration** - Administrative user creation

### 📦 Inventory Management

- **Product Catalog** - Comprehensive product listing with search and filter
- **CRUD Operations** - Create, Read, Update, Delete inventory items
- **Multi-Category Support** - BEVERAGES, DAIRY, BAKERY, PRODUCE, and more
- **Bulk Operations** - Upload and batch inventory updates
- **SKU & PLU Management** - Product identification and tracking

### 🏪 Store Management

- **Multi-Store Support** - Manage multiple store locations
- **Store Switching** - Easy store selection and context switching
- **Store-Specific Inventory** - Separate inventory tracking per location

### 🎨 Modern UI/UX

- **Responsive Design** - Mobile-first, works on all devices
- **TailwindCSS Styling** - Modern, consistent design system
- **Brand Colors** - Professional teal theme (#0f4d57)
- **Intuitive Navigation** - Clean, user-friendly interface

## 🛠️ Tech Stack

- **Frontend**: React 19.1.0 with TypeScript
- **Build Tool**: Vite 6.3.5
- **State Management**: Redux Toolkit + React Redux
- **Styling**: TailwindCSS 4.1.10
- **HTTP Client**: Axios with interceptors
- **Routing**: React Router DOM 7.6.2
- **Date Handling**: Day.js and date-fns
- **Icons**: React Icons

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── reusablecomponents/  # Generic components
│   ├── Header.tsx       # Main navigation header
│   ├── Cards.tsx        # Card components
│   └── StoreForm.tsx    # Store management form
├── pages/               # Route-specific pages
│   ├── Login/           # Authentication pages
│   ├── Signup/
│   ├── OtpPage/
│   ├── Inventory/       # Core inventory management
│   ├── Home.tsx         # Landing page
│   └── Terms.tsx        # Terms and conditions
├── store/               # Redux store configuration
│   ├── slices/          # Redux slices
│   │   ├── authSlice.ts     # Authentication state
│   │   ├── counterSlice.ts  # Counter example
│   │   └── uiSlice.ts       # UI state
│   ├── hooks.ts         # Custom Redux hooks
│   ├── selectors.ts     # State selectors
│   └── index.ts         # Store configuration
├── services/            # API service layer
│   ├── api.ts           # Axios configuration
│   └── index.ts         # Service exports
├── routes/              # React Router configuration
├── hooks/               # Custom React hooks
├── types/               # TypeScript definitions
├── utils/               # Utility functions
├── constants/           # App constants
└── styles/              # Global styles
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API server running

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd accurack-software-frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:

   ```env
   VITE_API_URL=http://localhost:4000/api/v1
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:5173`

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 🔧 Development Guidelines

### Code Style

- Use **TypeScript** for all new code
- Follow **functional component** patterns with hooks
- Use **Redux Toolkit** for state management
- Apply **TailwindCSS** for styling
- Follow **ESLint** rules

### State Management

- All API calls go through Redux slices using `createAsyncThunk`
- Use `useAppSelector` and `useAppDispatch` custom hooks
- Never call APIs directly from components

### Component Guidelines

- Use `React.FC` type annotation
- Prefer named exports for utilities
- Use default exports for page components
- Follow PascalCase naming convention

### API Integration

- Use the centralized `apiClient` (axios instance)
- Implement proper error handling
- Show loading states for async operations
- Handle authentication tokens automatically

## 🔐 Authentication Flow

1. **User Registration/Login** → Redux Action
2. **API Call** → Backend Authentication
3. **Token Storage** → localStorage + Redux State
4. **Automatic Token Injection** → All subsequent API calls
5. **Token Refresh** → Handled by interceptors

## 📦 Inventory Operations

### Key Features

- **Product Search** - Search by name, SKU, or PLU
- **Category Filtering** - Filter by product categories
- **Quantity Management** - Track stock levels
- **Bulk Updates** - Mass inventory operations
- **Multi-Store** - Store-specific inventory

### Data Structure

```typescript
interface Product {
  name: string;
  quantity: number;
  plu: string;
  sku: string;
  description: string;
  price: string;
  category: string;
  itemsPerUnit: number;
}
```

## 🎨 Design System

### Brand Colors

- **Primary**: `#0f4d57` (Teal-900)
- **Background**: White (`#ffffff`)
- **Text**: Gray shades
- **Accent**: Teal variations

### Typography

- **Headers**: Bold, Teal primary color
- **Body**: Standard gray text
- **Interactive**: Hover states with color transitions

## 🔍 API Documentation

The frontend integrates with a RESTful API. Key endpoints include:

- `POST /auth/login` - User authentication
- `POST /auth/signup/super-admin` - User registration
- `GET /inventory` - Fetch inventory items
- `POST /inventory` - Create inventory item
- `PUT /inventory/:id` - Update inventory item
- `DELETE /inventory/:id` - Delete inventory item

See `API_FLOW_GUIDE.md` for detailed API integration examples.

## 🚦 Environment Variables

| Variable       | Description          | Default                        |
| -------------- | -------------------- | ------------------------------ |
| `VITE_API_URL` | Backend API base URL | `http://localhost:4000/api/v1` |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Workflow

1. **Analyze** - Understand the existing codebase
2. **Plan** - Create implementation plan
3. **Implement** - Write code following guidelines
4. **Test** - Verify functionality
5. **Review** - Get code review approval

## 🐛 Troubleshooting

### Common Issues

**Build Errors**

- Ensure all dependencies are installed: `npm install`
- Check TypeScript errors: `npx tsc --noEmit`
- Verify ESLint compliance: `npm run lint`

**API Connection Issues**

- Verify `VITE_API_URL` environment variable
- Ensure backend server is running
- Check network connectivity

**Authentication Issues**

- Clear localStorage and refresh
- Verify token format and expiration
- Check API endpoints are accessible

## 📄 License

This project is proprietary software for Accurack inventory management system.

## 📞 Support

For technical support or questions about the Accurack inventory management system, please contact the development team.

---

**Built with ❤️ for modern inventory management**
