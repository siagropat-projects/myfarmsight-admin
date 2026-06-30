# MyFarmSight Web Admin Dashboard

## Project Overview

MyFarmSight Web Admin Dashboard is a comprehensive administrative interface built with React, Vite, TypeScript, and Tailwind CSS. It provides platform administrators with tools to manage farmers, veterinarians, learning content, subscriptions, financials, reports, and system settings. The dashboard serves as the central control panel for the MyFarmSight ecosystem, enabling oversight of all platform operations and user management.

## Tech Stack & Architecture

### Core Technologies
- **Framework**: React 19.2.0 with TypeScript 5.9.3
- **Build Tool**: Vite 7.3.1 with @vitejs/plugin-react-swc 4.2.2
- **Styling**: Tailwind CSS 4.2.1 with @tailwindcss/vite 4.2.1
- **State Management**: Zustand 5.0.11 with persistence middleware
- **Routing**: React Router 7.13.1
- **HTTP Client**: Axios 1.13.6
- **Date Handling**: date-fns 4.1.0
- **Charts**: Recharts 3.8.0
- **Rich Text Editor**: TipTap 3.20.5 (react-quill as alternative)
- **Forms**: React Hook Form 7.71.2
- **Notifications**: Sonner 2.0.7
- **Icons**: Lucide React 0.577.0
- **Linting**: ESLint 9.39.1 with TypeScript ESLint 8.48.0
- **Deployment**: Vercel (vercel.json configuration)

### Architectural Patterns
- **Component-Based Architecture**: Modular React components with clear separation of concerns
- **State Management**: Zustand stores with localStorage persistence for session management
- **Centralized API Client**: Axios instance with interceptors for auth and error handling
- **Layout Pattern**: Consistent layout with sidebar navigation and header
- **Protected Routes**: Route guards for authentication and authorization
- **Responsive Design**: Mobile-first responsive design with Tailwind CSS
- **Type Safety**: Full TypeScript coverage for type safety and developer experience

## Folder Structure

```
myfarmsight-admin/
├── src/
│   ├── App.tsx                     # Root component with routing configuration
│   ├── main.tsx                    # Application entry point
│   ├── index.css                   # Global CSS styles
│   ├── assets/                     # Static assets (images, fonts)
│   │   └── [2 items]
│   ├── components/                 # Reusable UI components
│   │   ├── layout/                # Layout components
│   │   │   ├── AppLayout.tsx      # Main layout wrapper with sidebar and header
│   │   │   ├── Headbar.tsx        # Header with user menu and notifications
│   │   │   ├── Notifications.tsx  # Notification dropdown
│   │   │   └── Sidebar.tsx        # Sidebar navigation
│   │   ├── modules/               # Feature-specific components
│   │   │   └── [25 items]
│   │   └── ui/                    # Generic UI components
│   │       └── [8 items]
│   ├── hooks/                     # Custom React hooks
│   │   └── [1 item]
│   ├── pages/                     # Page components
│   │   ├── Dashboard.tsx          # Admin dashboard with metrics and charts
│   │   ├── ActivityLog.tsx        # System activity log
│   │   ├── Wallet.tsx             # Wallet management
│   │   ├── Support.tsx            # Support ticket management
│   │   ├── NotFound.tsx           # 404 page
│   │   ├── auth/                  # Authentication pages
│   │   │   └── Login.tsx          # Login page
│   │   ├── farmers/               # Farmer management pages
│   │   │   ├── Farmers.tsx        # Farmer list
│   │   │   ├── CreateFarmer.tsx   # Create farmer
│   │   │   └── FarmersDetails.tsx # Farmer details
│   │   ├── vets/                  # Veterinarian management pages
│   │   │   ├── Vets.tsx           # Vet list
│   │   │   ├── CreateVet.tsx      # Create vet
│   │   │   └── VetsDetails.tsx    # Vet details
│   │   ├── lms/                   # Learning Management System pages
│   │   │   ├── LMS.tsx            # Learning content list
│   │   │   ├── Create.tsx         # Create learning content
│   │   │   └── Details.tsx       # Learning content details
│   │   ├── reports/               # Reports page
│   │   │   └── Reports.tsx
│   │   ├── revenue/               # Revenue management page
│   │   │   └── Revenue.tsx
│   │   └── settings/              # Settings page
│   │       └── Settings.tsx
│   ├── stores/                    # Zustand state stores
│   │   ├── auth.ts                # Authentication state
│   │   ├── dashboard.ts           # Dashboard state
│   │   ├── farmers.ts             # Farmer management state
│   │   ├── vets.ts                # Vet management state
│   │   ├── learning.ts            # Learning content state
│   │   ├── revenue.ts             # Revenue state
│   │   ├── reports.ts             # Reports state
│   │   ├── wallet.ts              # Wallet state
│   │   ├── support.ts             # Support state
│   │   ├── activity.ts            # Activity log state
│   │   ├── notifications.ts       # Notification state
│   │   └── settings/              # Settings stores
│   │       ├── accounts.ts        # Admin account management
│   │       ├── settings.ts        # System settings
│   │       └── subscription.ts    # Subscription settings
│   └── utils/                     # Utility functions
│       ├── api.ts                 # Axios API client
│       └── [1 more item]
├── public/                         # Public assets
│   └── [1 item]
├── index.html                      # HTML entry point
├── package.json                    # Dependencies and scripts
├── tsconfig.json                   # TypeScript configuration
├── tsconfig.app.json               # App-specific TypeScript config
├── tsconfig.node.json              # Node-specific TypeScript config
├── vite.config.ts                  # Vite configuration
├── eslint.config.js                # ESLint configuration
├── vercel.json                     # Vercel deployment configuration
└── .env                            # Environment variables (not committed)
```

### Design Patterns Explained

- **Component-Based Architecture**: Each page is a React component that can be composed of smaller, reusable components. This promotes code reusability and maintainability.
- **Layout Pattern**: The `AppLayout` component wraps all authenticated pages, providing a consistent sidebar navigation and header across the application.
- **State Management**: Zustand stores manage application state with localStorage persistence, allowing state to survive page refreshes.
- **API Client Pattern**: A centralized Axios client (`utils/api.ts`) handles all HTTP requests with automatic token injection and error handling.
- **Protected Routes**: React Router guards ensure unauthenticated users are redirected to the login page.
- **Type Safety**: TypeScript provides compile-time type checking, reducing runtime errors and improving developer experience.
- **Responsive Design**: Tailwind CSS enables mobile-first responsive design with utility classes.

## Features & Modules Breakdown

### Authentication Module
- **Login**: Admin login with email and password
- **Session Management**: JWT token storage and automatic token injection
- **Logout**: Secure logout with token clearing
- **Route Protection**: Protected routes that redirect unauthenticated users to login

### Dashboard Module
- **System Overview**: Platform-wide metrics (total users, active farms, revenue)
- **Activity Feed**: Recent platform activities and events
- **Analytics Charts**: Visual representations of key metrics
- **Quick Actions**: Fast access to common admin tasks

### Farmer Management Module
- **Farmer Listing**: Paginated list of all farmers with search and filter
- **Farmer Creation**: Manual farmer account creation
- **Farmer Details**: Detailed farmer profile view
- **Farm Overview**: Farmhouse and batch information
- **Ticket Management**: View and manage farmer support tickets
- **Finance Overview**: Farmer financial data and transactions
- **Account Actions**: Reset password, suspend, activate, soft delete
- **Bulk Operations**: Bulk delete farmers, export to CSV
- **Profile Editing**: Update farmer profile information
- **Farm Editing**: Update farm information

### Veterinarian Management Module
- **Vet Listing**: Paginated list of all veterinarians with verification status
- **Vet Creation**: Manual vet account creation
- **Vet Details**: Detailed vet profile view
- **Business Overview**: Vet business information and verification status
- **VCN Verification**: Verify Veterinary Council Number
- **Business Approval**: Approve or reject vet business applications
- **Ticket Management**: View and manage vet support tickets
- **Finance Overview**: Vet earnings, withdrawals, and transactions
- **Account Actions**: Reset password, suspend, activate, soft delete
- **Bulk Operations**: Bulk delete vets, export to CSV
- **Profile Editing**: Update vet profile information
- **Business Editing**: Update vet business information

### Learning Management System (LMS) Module
- **Content Listing**: Paginated list of learning content
- **Content Creation**: Create new learning articles and videos
- **Content Editing**: Edit existing learning content
- **Content Details**: View full learning content
- **Content Deletion**: Remove learning content
- **Rich Text Editor**: TipTap for creating rich content
- **Media Support**: Image and video uploads
- **Category Management**: Organize content by categories

### Revenue Module
- **Revenue Overview**: Platform-wide revenue analytics
- **Revenue Breakdown**: Revenue by source (subscriptions, commissions, etc.)
- **Revenue Charts**: Visual representations of revenue trends
- **Time Period Filters**: Filter revenue by day, week, month, year

### Reports Module
- **System Reports**: Generate platform-wide reports
- **User Reports**: User activity and engagement reports
- **Financial Reports**: Financial performance reports
- **Export Functionality**: Export reports to CSV

### Wallet Module
- **Wallet Overview**: Platform wallet balance and transactions
- **Transaction History**: View all wallet transactions
- **Escrow Management**: Manage escrow records for vet jobs
- **Withdrawal Processing**: Process withdrawal requests
- **Deposit Management**: View deposit transactions

### Support Module
- **Ticket Listing**: View all support tickets
- **Ticket Details**: View ticket details and responses
- **Ticket Resolution**: Respond to and resolve tickets
- **Ticket Filtering**: Filter tickets by status, priority, user
- **Bulk Operations**: Bulk delete tickets

### Activity Log Module
- **Activity Feed**: System-wide activity log
- **Filtering**: Filter activities by user, action, date
- **Audit Trail**: Track all admin actions for compliance

### Settings Module
- **System Settings**: Platform configuration
- **Account Management**: Manage admin accounts
- **Subscription Settings**: Configure subscription plans
- **Permission Management**: Manage admin roles and permissions
- **Feature Flags**: Enable/disable platform features

### Notifications Module
- **Notification List**: View all notifications
- **Send Notifications**: Broadcast notifications to users
- **Notification History**: Track sent notifications

## Routing & Navigation

### Route Structure

The application uses React Router with the following route structure:

#### Public Routes
- `/login` - Login page
- `/*` - 404 Not Found page

#### Protected Routes (wrapped in AppLayout)
- `/` - Redirects to `/dashboard`
- `/dashboard` - Admin dashboard
- `/settings` - System settings
- `/support` - Support ticket management
- `/activity-log` - Activity log
- `/wallet` - Wallet management

#### Farmer Management Routes
- `/farmers` - Farmer list
- `/farmers/create` - Create new farmer
- `/farmers/:id` - Farmer details

#### Veterinarian Management Routes
- `/vets` - Vet list
- `/vets/create` - Create new vet
- `/vets/:id` - Vet details

#### Learning Management Routes
- `/lms` - Learning content list
- `/lms/create` - Create learning content
- `/lms/:id` - Learning content details

#### Revenue Routes
- `/revenue` - Revenue management

#### Reports Routes
- `/reports` - Reports

### Navigation Components

#### Sidebar
The sidebar provides navigation to all main sections:
- Dashboard
- Farmers
- Vets
- LMS
- Revenue
- Reports
- Wallet
- Activity Log
- Support
- Settings

#### Header
The header includes:
- User profile dropdown
- Notification bell with badge
- Logout button

### Route Guards

Protected routes are wrapped in the `AppLayout` component, which:
- Checks authentication status
- Redirects unauthenticated users to `/login`
- Provides consistent layout across all pages

## Local Setup & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher (or yarn/pnpm)
- **Git**: For cloning the repository
- **Backend API**: Running instance of myfarmsight-be

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd myfarmsight-admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration (see Environment Variables section below).

4. **Start the development server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173` (or the port specified by Vite).

5. **Build for production**
   ```bash
   npm run build
   ```

6. **Preview production build**
   ```bash
   npm run preview
   ```

## Environment Variables (`.env`)

Create a `.env` file in the root directory with the following variables:

```env
VITE_API_URL=https://your-backend-api.com/api/v1
```

### Environment Variable Descriptions

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `https://api.myfarmsight.com/api/v1` |

Note: Environment variables must be prefixed with `VITE_` to be accessible in the Vite application.

## Scripts

The following scripts are available in `package.json`:

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot-reload |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build locally |

### Development Workflow

1. **Start development server**:
   ```bash
   npm run dev
   ```
   This starts Vite's development server with hot module replacement.

2. **Build for production**:
   ```bash
   npm run build
   ```
   This creates an optimized production build in the `dist/` directory.

3. **Preview production build**:
   ```bash
   npm run preview
   ```
   This serves the production build locally for testing.

4. **Run linter**:
   ```bash
   npm run lint
   ```
   This runs ESLint to check for code quality issues.

## State Management

### Zustand Stores

The application uses Zustand for state management with the following stores:

#### Auth Store (`stores/auth.ts`)
- User authentication state
- Token management
- Login/logout functions
- Session persistence with localStorage

#### Dashboard Store (`stores/dashboard.ts`)
- Dashboard metrics and analytics
- Activity feed data
- Chart data

#### Farmers Store (`stores/farmers.ts`)
- Farmer list and details
- Farmer CRUD operations
- Filtering and pagination

#### Vets Store (`stores/vets.ts`)
- Vet list and details
- Vet CRUD operations
- Verification status management

#### Learning Store (`stores/learning.ts`)
- Learning content list and details
- Content CRUD operations
- Category management

#### Revenue Store (`stores/revenue.ts`)
- Revenue data and analytics
- Revenue breakdown by source
- Time period filtering

#### Reports Store (`stores/reports.ts`)
- Report data
- Report generation
- Export functionality

#### Wallet Store (`stores/wallet.ts`)
- Wallet balance
- Transaction history
- Escrow management

#### Support Store (`stores/support.ts`)
- Support ticket list and details
- Ticket status management
- Ticket responses

#### Activity Store (`stores/activity.ts`)
- Activity log data
- Filtering and pagination

#### Notifications Store (`stores/notifications.ts`)
- Notification list
- Notification sending
- Notification history

#### Settings Stores (`stores/settings/`)
- **accounts.ts**: Admin account management
- **settings.ts**: System settings
- **subscription.ts**: Subscription plan configuration

### Persistence

All stores use Zustand's persistence middleware with localStorage:
```typescript
persist(
  (set, get) => ({ ... }),
  {
    name: 'storage-name',
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({ ... }) // Selective persistence
  }
)
```

## API Integration

### API Client

The application uses a centralized Axios client (`utils/api.ts`) with:
- **Automatic token injection**: JWT token added to all requests
- **Error handling**: Centralized error handling with toast notifications
- **Request interceptors**: Add auth headers
- **Response interceptors**: Handle errors and unauthenticated responses

### API Endpoints

The application communicates with the backend API at `/api/v1`:
- Authentication: `/auth/*`
- Admin Dashboard: `/admin/dashboard/*`
- Admin Farmers: `/admin/farmers/*`
- Admin Vets: `/admin/vets/*`
- Admin Learning: `/admin/learning/*`
- Admin Revenue: `/admin/revenue/*`
- Admin Reports: `/admin/reports/*`
- Admin Wallet: `/admin/wallet/*`
- Admin Support: `/admin/support/*`
- Admin Activity: `/admin/activity/*`
- Admin Settings: `/admin/settings/*`
- Admin Notifications: `/admin/notifications/*`

## Component Library

### Layout Components

#### AppLayout
Main layout wrapper that provides:
- Sidebar navigation
- Header with user menu
- Authentication guard
- Consistent page structure

#### Headbar
Header component with:
- Logo and branding
- Notification bell
- User profile dropdown
- Logout button

#### Sidebar
Sidebar navigation with:
- Navigation links
- Active state highlighting
- Collapsible menu items

#### Notifications
Notification dropdown with:
- Notification list
- Mark as read functionality
- Notification count badge

### UI Components

The application includes reusable UI components in `components/ui/` for common patterns like buttons, cards, modals, tables, and forms.

## Deployment

### Vercel Deployment

The application is configured for deployment on Vercel via `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev"
}
```

#### Deployment Steps

1. **Connect to Vercel**
   ```bash
   vercel login
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Set environment variables** in Vercel dashboard:
   - `VITE_API_URL`: Your backend API URL

4. **Deploy to production**
   ```bash
   vercel --prod
   ```

### Manual Deployment

For manual deployment to any hosting provider:

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Upload the `dist/` directory** to your hosting provider

3. **Configure environment variables** on your hosting platform

4. **Set up routing** to handle client-side routing (SPA)

## Performance Considerations

- **Code Splitting**: React Router lazy loading for route-based code splitting
- **Tree Shaking**: Vite automatically removes unused code
- **Image Optimization**: Use optimized images and WebP format
- **Memoization**: Use React.memo for expensive components
- **Virtualization**: Use virtual scrolling for long lists
- **Caching**: Implement API response caching where appropriate

## Security Considerations

- **Token Storage**: JWT tokens stored in localStorage (consider httpOnly cookies for production)
- **API Communication**: All API calls use HTTPS in production
- **Input Validation**: All inputs validated on both client and server
- **Authentication Guards**: Protected routes check authentication status
- **Role-Based Access**: Admin-only routes protected on both client and server
- **XSS Prevention**: React's built-in XSS protection
- **CSRF Protection**: Implement CSRF tokens for state-changing operations

## Accessibility

- **Semantic HTML**: Use semantic HTML elements
- **ARIA Labels**: Add ARIA labels for screen readers
- **Keyboard Navigation**: Ensure all functionality is accessible via keyboard
- **Focus Management**: Proper focus management for modals and dynamic content
- **Color Contrast**: Maintain sufficient color contrast (WCAG AA compliant)
- **Responsive Design**: Mobile-first responsive design

## Browser Support

- **Chrome**: Latest version
- **Firefox**: Latest version
- **Safari**: Latest version
- **Edge**: Latest version

## Troubleshooting

### Common Issues

1. **Build errors**
   ```bash
   # Clear Vite cache
   rm -rf node_modules/.vite
   npm run dev
   ```

2. **Environment variables not working**
   - Ensure variables are prefixed with `VITE_`
   - Restart the development server after changing `.env`

3. **API connection errors**
   - Verify `VITE_API_URL` is correct
   - Ensure backend API is running
   - Check CORS configuration on backend

4. **State not persisting**
   - Verify localStorage is enabled
   - Check store persistence configuration
   - Ensure partialize is correct

5. **Routing issues**
   - Check route definitions in `App.tsx`
   - Verify route guards are working
   - Check for duplicate route paths

## Support

For issues, questions, or contributions, please contact the development team or refer to the project repository.
