# SELEDA Mobile App Architecture

## Overview
This document outlines the architecture for the SELEDA ERP mobile application, designed to provide staff with on-the-go access to critical hotel operations including reservations, check-in/out, housekeeping management, and revenue management.

## Technology Stack

### Core Framework
- **React Native** with Expo for cross-platform development (iOS and Android)
- **TypeScript** for type safety
- **Expo Router** for file-based navigation

### State Management
- **Zustand** for global state management
- **React Query (TanStack Query)** for server state caching and synchronization

### UI Components
- **React Native Paper** for Material Design components
- **React Native Reanimated** for smooth animations
- **React Native Gesture Handler** for advanced gestures

### Networking
- **Axios** for API communication
- **Supabase JS Client** for real-time subscriptions and direct database access

### Storage
- **AsyncStorage** for local data persistence
- **SecureStore** for sensitive data (auth tokens, API keys)

### Other Libraries
- **React Native Maps** for location-based features
- **React Native Camera** for QR code scanning (room access, guest IDs)
- **React Native Push Notifications** for real-time alerts
- **Date-fns** for date manipulation
- **Zod** for runtime validation

## Project Structure

```
seleda-mobile/
├── app/                          # Expo Router pages
│   ├── (auth)/                   # Auth group
│   │   ├── login.tsx
│   │   ├── forgot-password.tsx
│   │   └── mfa-setup.tsx
│   ├── (tabs)/                   # Main tab navigation
│   │   ├── index.tsx            # Dashboard
│   │   ├── reservations.tsx     # Reservations tab
│   │   ├── housekeeping.tsx     # Housekeeping tab
│   │   ├── guests.tsx           # Guest management tab
│   │   └── settings.tsx         # Settings tab
│   ├── reservations/
│   │   ├── [id].tsx            # Reservation detail
│   │   ├── check-in.tsx        # Check-in flow
│   │   └── check-out.tsx       # Check-out flow
│   ├── housekeeping/
│   │   ├── [roomId].tsx        # Room detail
│   │   └── tasks.tsx           # Task assignment
│   ├── rms/                     # Revenue Management
│   │   ├── pricing.tsx         # Pricing recommendations
│   │   └── competitors.tsx     # Competitor rates
│   └── _layout.tsx             # Root layout
├── components/
│   ├── common/                  # Shared components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── Modal.tsx
│   ├── reservations/            # Reservation components
│   │   ├── ReservationCard.tsx
│   │   ├── GuestInfo.tsx
│   │   └── RoomAssignment.tsx
│   ├── housekeeping/            # Housekeeping components
│   │   ├── RoomStatusCard.tsx
│   │   ├── TaskList.tsx
│   │   └── CleaningTimer.tsx
│   └── rms/                     # RMS components
│       ├── PricingChart.tsx
│       ├── RecommendationCard.tsx
│       └── CompetitorComparison.tsx
├── lib/
│   ├── api/                     # API clients
│   │   ├── client.ts           # Axios configuration
│   │   ├── rms.ts              # RMS API
│   │   ├── reservations.ts     # Reservations API
│   │   └── housekeeping.ts     # Housekeeping API
│   ├── supabase/               # Supabase client
│   │   └── client.ts
│   ├── storage/                # Storage utilities
│   │   ├── asyncStorage.ts
│   │   └── secureStore.ts
│   └── utils/                  # Utilities
│       ├── validation.ts       # Zod schemas
│       ├── formatting.ts       # Date/currency formatting
│       └── constants.ts        # App constants
├── hooks/
│   ├── useAuth.ts              # Authentication hook
│   ├── useReservations.ts      # Reservations hook
│   ├── useHousekeeping.ts      # Housekeeping hook
│   └── useRMS.ts               # RMS hook
├── stores/
│   ├── authStore.ts            # Auth state
│   ├── reservationStore.ts     # Reservation state
│   └── uiStore.ts              # UI state
├── types/
│   ├── api.ts                  # API types
│   ├── reservation.ts          # Reservation types
│   └── rms.ts                  # RMS types
├── config/
│   ├── app.config.js           # Expo configuration
│   └── env.ts                  # Environment variables
└── assets/                     # Images, fonts, icons
```

## Core Modules

### 1. Authentication Module
- Login with email/password
- MFA support (TOTP)
- Biometric authentication (Face ID / Touch ID)
- Session management with token refresh
- Role-based access control

### 2. Dashboard Module
- Real-time KPIs (occupancy, ADR, RevPAR)
- Today's arrivals and departures
- Housekeeping status overview
- Quick actions (new reservation, check-in, check-out)
- Revenue snapshot
- Alerts and notifications

### 3. Reservations Module
- Reservation list with filters
- Reservation detail view
- Guest information display
- Room assignment interface
- Check-in workflow (ID verification, payment collection)
- Check-out workflow (folio review, payment processing)
- Modification and cancellation

### 4. Housekeeping Module
- Room status grid (Clean, Dirty, Inspected, Out of Order)
- Task assignment to staff
- Cleaning timer
- Room inspection checklist
- Lost & found reporting
- Maintenance request submission

### 5. Guest Management Module
- Guest profile view
- Stay history
- Preferences and notes
- Communication log
- Corporate account information

### 6. Revenue Management Module
- Pricing recommendations dashboard
- Competitor rate comparison
- Occupancy forecast visualization
- Rate adjustment approval workflow
- Channel manager status

### 7. Settings Module
- User profile management
- Notification preferences
- Language selection
- Theme selection (light/dark)
- Offline mode settings

## API Integration

### REST API Endpoints
The mobile app will consume the existing backend API:

```
/api/auth/*                    # Authentication
/api/rms/*                     # Revenue Management
/api/reservations/*            # Reservations
/api/housekeeping/*            # Housekeeping
/api/guests/*                  # Guest management
/api/reports/*                 # Reports
```

### Real-time Subscriptions
Using Supabase real-time for live updates:

```typescript
// Subscribe to reservation changes
supabase
  .channel('reservations')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'reservations'
  }, (payload) => {
    // Update local state
  })
  .subscribe();

// Subscribe to room status changes
supabase
  .channel('rooms')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'rooms'
  }, (payload) => {
    // Update room status
  })
  .subscribe();
```

## Offline Support

### Data Caching Strategy
- Cache critical data on app load (room types, rates, guest profiles)
- Queue API requests when offline
- Sync when connection restored
- Conflict resolution using timestamps

### Offline Capabilities
- View reservation details (cached)
- Update room status (queued)
- Submit housekeeping tasks (queued)
- View pricing recommendations (cached)

## Security

### Authentication
- JWT tokens stored in SecureStore
- Automatic token refresh
- Session timeout after inactivity
- Biometric authentication for sensitive actions

### Data Protection
- HTTPS for all API calls
- Certificate pinning
- Encrypted local storage for sensitive data
- Screen capture prevention (iOS) / blocking (Android)

### Role-Based Access
- Admin: Full access
- Manager: All except system settings
- Front Desk: Reservations, check-in/out, guest info
- Housekeeping: Room status, tasks
- Revenue Manager: RMS, pricing

## Push Notifications

### Notification Types
1. **New Reservation**: Alert for new bookings
2. **Check-in Reminder**: Reminder for upcoming arrivals
3. **Housekeeping Alert**: Room status change
4. **Pricing Alert**: RMS recommendation
5. **System Alert**: Maintenance, errors

### Implementation
```typescript
import * as Notifications from 'expo-notifications';

// Request permissions
const { status } = await Notifications.requestPermissionsAsync();

// Schedule notification
await Notifications.scheduleNotificationAsync({
  content: {
    title: 'New Reservation',
    body: 'John Doe - Room 101 - Check-in today',
    data: { reservationId: '123' },
  },
  trigger: null,
});
```

## Performance Optimization

### Strategies
- Code splitting with Expo Router
- Image optimization and caching
- Lazy loading for heavy components
- Debounced search inputs
- Pagination for long lists
- Memoization for expensive calculations

### Monitoring
- Performance monitoring with Expo Updates
- Error tracking with Sentry
- Analytics for user behavior

## Testing Strategy

### Unit Tests
- Jest for utility functions
- React Native Testing Library for components

### Integration Tests
- API integration tests
- State management tests

### E2E Tests
- Detox for end-to-end testing
- Critical user flows (check-in, check-out, room status update)

## Deployment

### Build Configuration
- **Development**: Expo Go
- **Staging**: TestFlight (iOS) / Internal Testing (Android)
- **Production**: App Store / Google Play Store

### CI/CD Pipeline
1. Code push triggers build
2. Automated tests run
3. Build artifacts generated
4. Deploy to staging
5. Manual approval for production
6. Deploy to production stores

## Future Enhancements

### Phase 2 Features
- Voice commands for housekeeping
- AR for room inspection
- Integration with property management systems
- Advanced analytics dashboard
- Multi-property support

### Phase 3 Features
- AI-powered guest recommendations
- Predictive maintenance
- Smart room controls integration
- Staff scheduling optimization
- Advanced revenue forecasting

## Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI
- iOS Simulator / Android Emulator (or physical device)

### Installation
```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Run on iOS
npx expo run:ios

# Run on Android
npx expo run:android
```

### Environment Variables
```env
API_URL=https://api.seleda.com
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SENTRY_DSN=your_sentry_dsn
```

## Conclusion

This mobile app architecture provides a solid foundation for extending the SELEDA ERP to mobile devices, enabling staff to perform critical operations from anywhere in the property. The architecture prioritizes:
- **Performance**: Fast load times and smooth animations
- **Reliability**: Offline support and error handling
- **Security**: Secure authentication and data protection
- **Usability**: Intuitive interface and role-based access
- **Scalability**: Modular design for future enhancements
