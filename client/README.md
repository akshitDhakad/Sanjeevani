# Home-First Elderly Care Platform

A production-ready React (TypeScript + Vite) application for a two-sided marketplace connecting families with verified caregivers, offering short-term care services, device rentals, subscriptions, and telehealth integration.

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
VITE_API_BASE=http://localhost:4000
VITE_ENV=development
```

## 📁 Project Structure

```
src/
├── api/              # API contracts and client
│   ├── client.ts     # Typed fetch wrapper
│   └── schema.ts     # Zod schemas for validation
├── components/       # Atomic UI components
├── features/         # Feature modules
│   ├── auth/         # Authentication
│   ├── onboarding/   # Caregiver onboarding wizard
│   ├── bookings/     # Booking management
│   └── subscriptions/# Subscription management
├── hooks/            # Reusable hooks
├── mocks/            # MSW mock handlers
├── pages/            # Page components
├── routes/           # Routing configuration
├── services/         # API service functions
└── utils/            # Utility functions
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Mock API (MSW)

The application uses MSW (Mock Service Worker) for API mocking in development and tests. All API endpoints are mocked and can be navigated without a backend.

**Test Credentials:**
- Email: `customer@example.com` / `caregiver@example.com` / `admin@example.com`
- Password: `password`

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests
- `npm run lint` - Lint and fix code
- `npm run format` - Format code with Prettier

### Code Style

- ESLint with TypeScript support
- Prettier for code formatting
- Strict TypeScript mode enabled
- Functional components with hooks
- Service layer pattern for API calls

## 🏗️ Architecture

### State Management

- **React Query**: Server state and caching
- **Context API**: Authentication and UI state
- **React Hook Form**: Form state management

### Key Patterns

1. **Service Layer**: All API calls are abstracted in `src/services/`
2. **Type Safety**: Full TypeScript coverage with Zod runtime validation
3. **Component Composition**: Atomic components composed into features
4. **Protected Routes**: Role-based route protection
5. **Mock API**: MSW for development and testing

## 🔐 Security & Privacy

### Authentication

- JWT tokens stored in localStorage (development)
- **Production Note**: Use httpOnly cookies for token storage (requires backend support)
- Token refresh mechanism included

### Privacy Compliance

- GDPR and Indian privacy law considerations
- Document masking for sensitive data
- Secure file upload handling

### Input Validation

- Client-side: Zod schemas with React Hook Form
- Server-side: Placeholder comments indicate required validation

## 📦 Deployment

### Vercel / Netlify

1. Connect your repository
2. Set environment variables
3. Build command: `npm run build`
4. Output directory: `dist`

### Docker

```bash
# Build image
docker build -t home-first-care .

# Run container
docker run -p 80:80 home-first-care
```

### Kubernetes

See deployment examples in `k8s/` directory (create as needed).

## 🔌 API Integration

### Backend Requirements

The frontend expects RESTful APIs with the following endpoints:

- `POST /auth/login` - User authentication
- `GET /auth/me` - Get current user
- `GET /caregivers` - List caregivers (with filters)
- `POST /caregivers` - Create caregiver profile
- `POST /bookings` - Create booking
- `GET /bookings` - List bookings
- `POST /payments/checkout` - Create payment session
- `GET /admin/reports` - Admin analytics

See `src/api/schema.ts` and `src/services/` for complete API contracts.

### Payment Integration

**Current**: Mock payment flow  
**Production**: Replace with Stripe Checkout Session API

### Teleconsult Integration

Placeholder hooks available in components. Integrate with your telehealth provider API.

## 📊 Analytics & Tracking

### CAC & LTV Tracking

Data collection fields are prepared for:
- Customer Acquisition Cost (CAC)
- Lifetime Value (LTV)
- User behavior tracking

Add analytics hooks in components as needed (e.g., Google Analytics, Mixpanel).

## 🎯 MVP Scope (6-12 weeks)

### Completed Features

- ✅ User authentication (customer, caregiver, admin)
- ✅ Caregiver onboarding wizard with verification
- ✅ Customer dashboard (bookings, subscriptions)
- ✅ Caregiver dashboard (jobs, profile)
- ✅ Admin panel (verification, reports)
- ✅ Public caregiver search/listing
- ✅ Mock payment flow
- ✅ MSW API mocking

### Future Enhancements

- Real-time booking updates
- Teleconsult video integration
- IoT device monitoring dashboard
- Advanced analytics
- Mobile app (React Native)

## 🧭 Product Notes

### Go-to-Market Strategy

- **Start City Selection**: Focus on cities with high elderly population and caregiver supply gap
- **Pilot Program**: Launch with 100 families and 50 caregivers
- **Verification**: Background checks and document verification required
- **Pricing**: Flexible hourly rates and subscription plans

## 🤝 Contributing

1. Follow the coding standards (ESLint + Prettier)
2. Write tests for new features
3. Update types and schemas as needed
4. Document API changes

## 📝 License

[Your License Here]

## 🆘 Support

For issues and questions, please open an issue in the repository.

---

**Built with**: React, TypeScript, Vite, Tailwind CSS, React Query, MSW, Vitest

