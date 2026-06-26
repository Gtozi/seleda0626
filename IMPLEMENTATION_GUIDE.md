# Implementation Guide - Security & Performance Improvements

## 🎯 Quick Start

This guide will help you integrate the new security and performance improvements into your Hotel ERP system.

---

## 📦 Step 1: Install Dependencies

```bash
# Navigate to project directory
cd "c:/Users/zeray/Downloads/remix_-remix_-hotel-erp---front-office-console (4)"

# Install testing dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitest/ui

# Install additional runtime dependencies (if not already installed)
npm install zod@^4.4.3

# Verify installation
npm list vitest zod
```

---

## 🔧 Step 2: Update package.json Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "dev": "tsx server.ts",
    "build": "vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs",
    "start": "node dist/server.cjs",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "lint": "tsc --noEmit"
  }
}
```

---

## 🛡️ Step 3: Integrate Error Boundary

Update your `src/App.tsx`:

```typescript
import ErrorBoundary from './components/ErrorBoundary';
import { useERP } from './context/ERPContext';

function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Optional: Send to error tracking service
        console.error('App Error:', error, errorInfo);
      }}
    >
      <ERPProvider>
        <MasterHotelERP />
      </ERPProvider>
    </ErrorBoundary>
  );
}

export default App;
```

---

## 🔐 Step 4: Update Authentication Flow

### A. Update LoginPage Component

Replace the current authentication logic in `src/components/LoginPage.tsx`:

```typescript
import { login } from '../lib/auth';
import { loginSchema } from '../schemas/validationSchemas';

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate input
    try {
      loginSchema.parse({ email, password });
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
        return;
      }
    }

    setIsLoading(true);

    // Use secure authentication
    const result = await login(email, password);
    
    setIsLoading(false);

    if (result.success && result.user) {
      onLoginSuccess(result.user);
    } else {
      setError(result.error || 'Login failed');
    }
  };

  // ... rest of component
}
```

### B. Update App.tsx User State

Remove `localStorage` usage:

```typescript
// BEFORE (INSECURE):
const [currentUser, setCurrentUser] = useState<User | null>(() => {
  const cached = localStorage.getItem('hotel_erp_user');
  return cached ? JSON.parse(cached) : null;
});

// AFTER (SECURE):
const [currentUser, setCurrentUser] = useState<User | null>(null);

// Verify session on mount
React.useEffect(() => {
  const checkSession = async () => {
    const user = await verifySession();
    if (user) {
      setCurrentUser(user);
    }
  };
  checkSession();
}, []);

const handleLogout = async () => {
  await logout();
  setCurrentUser(null);
  setPlatformView('direct');
};
```

---

## 🔒 Step 5: Add Permission Checks

### A. Update Components with Permission Validation

Example in `ReservationsModule.tsx`:

```typescript
import { hasPermission, validatePermission } from '../../lib/permissions';
import { LoadingButton } from '../Shared/LoadingStates';

export default function ReservationsModule() {
  const { systemUsers, userProfile } = useERP();
  const [isDeleting, setIsDeleting] = useState(false);

  // Get current user from systemUsers (not localStorage)
  const currentUser = React.useMemo(() => {
    return systemUsers.find(u => u.email === userProfile.email) || null;
  }, [systemUsers, userProfile.email]);

  // Client-side check (UI only)
  const canEditRates = hasPermission(currentUser, 'editRatePlans');

  // Server-side validation (for actual operations)
  const handleDeleteReservation = async (id: string) => {
    setIsDeleting(true);

    // ALWAYS validate on server before sensitive operations
    const permissionResult = await validatePermission('deleteReservations');
    
    if (!permissionResult.allowed) {
      alert(`Permission denied: ${permissionResult.reason}`);
      setIsDeleting(false);
      return;
    }

    // Proceed with deletion
    try {
      await deleteReservation(id);
      alert('Reservation deleted successfully');
    } catch (error) {
      alert('Failed to delete reservation');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      {/* Only show button if user has permission (UI) */}
      {canEditRates && (
        <LoadingButton
          isLoading={isDeleting}
          onClick={() => handleDeleteReservation(reservationId)}
          variant="danger"
        >
          Delete Reservation
        </LoadingButton>
      )}
    </div>
  );
}
```

---

## ✅ Step 6: Add Input Validation

### A. Update Reservation Form

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reservationInputSchema, ReservationInput } from '../../schemas/validationSchemas';

export default function ReservationForm() {
  const form = useForm<ReservationInput>({
    resolver: zodResolver(reservationInputSchema),
    defaultValues: {
      adults: 2,
      children: 0,
    },
  });

  const onSubmit = async (data: ReservationInput) => {
    // Data is already validated by Zod
    try {
      await addReservation(data);
      alert('Reservation created successfully');
    } catch (error) {
      alert('Failed to create reservation');
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div>
        <label>Guest Name</label>
        <input {...form.register('guestName')} />
        {form.formState.errors.guestName && (
          <span className="text-red-600 text-xs">
            {form.formState.errors.guestName.message}
          </span>
        )}
      </div>

      <div>
        <label>Email</label>
        <input {...form.register('guestEmail')} type="email" />
        {form.formState.errors.guestEmail && (
          <span className="text-red-600 text-xs">
            {form.formState.errors.guestEmail.message}
          </span>
        )}
      </div>

      {/* ... other fields ... */}

      <LoadingButton
        type="submit"
        isLoading={form.formState.isSubmitting}
        variant="primary"
      >
        Create Reservation
      </LoadingButton>
    </form>
  );
}
```

---

## 🔄 Step 7: Use Transactions for Critical Operations

### A. Update Check-In Flow

```typescript
import { checkInTransaction } from '../../lib/transactions';
import { OverlayLoader } from '../Shared/LoadingStates';

export default function CheckInOutModule() {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckIn = async (reservationId: string, roomNumber: string) => {
    setIsProcessing(true);

    // Use transaction to ensure atomicity
    const result = await checkInTransaction(reservationId, roomNumber);

    setIsProcessing(false);

    if (result.success) {
      alert('Check-in successful!');
      // Refresh data
      refetchReservations();
    } else {
      alert(`Check-in failed: ${result.error}`);
    }
  };

  return (
    <div>
      <OverlayLoader
        isVisible={isProcessing}
        message="Processing check-in..."
      />

      <button onClick={() => handleCheckIn(resId, roomNum)}>
        Check In
      </button>
    </div>
  );
}
```

---

## 🎨 Step 8: Add Loading States

### A. Update Dashboard Module

```typescript
import {
  ReservationListSkeleton,
  MetricsSkeleton,
  ContentLoader,
} from '../Shared/LoadingStates';

export default function DashboardModule() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await fetchReservations();
      await fetchRooms();
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Metrics with skeleton */}
      {isLoading ? (
        <MetricsSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-4 gap-4">
          <MetricCard title="Occupancy" value={occupancyPercentage} />
          {/* ... other metrics ... */}
        </div>
      )}

      {/* Reservations with content loader */}
      <ContentLoader
        isLoading={isLoading}
        error={error}
        onRetry={loadData}
        skeleton={<ReservationListSkeleton count={5} />}
      >
        <ReservationList reservations={reservations} />
      </ContentLoader>
    </div>
  );
}
```

---

## 🧪 Step 9: Write Tests

### A. Create Test for Reservation Module

Create `src/components/FrontDesk/ReservationsModule.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReservationsModule } from './ReservationsModule';
import { ERPProvider } from '../../context/ERPContext';

describe('ReservationsModule', () => {
  it('should render reservation form', () => {
    render(
      <ERPProvider>
        <ReservationsModule />
      </ERPProvider>
    );

    expect(screen.getByText(/Create Reservation/i)).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    render(
      <ERPProvider>
        <ReservationsModule />
      </ERPProvider>
    );

    const submitButton = screen.getByText(/Create Reservation/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
    });
  });

  it('should create reservation successfully', async () => {
    const mockAddReservation = vi.fn();
    
    render(
      <ERPProvider value={{ addReservation: mockAddReservation }}>
        <ReservationsModule />
      </ERPProvider>
    );

    // Fill form
    fireEvent.change(screen.getByLabelText(/Guest Name/i), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'john@example.com' },
    });
    // ... fill other fields ...

    // Submit
    fireEvent.click(screen.getByText(/Create Reservation/i));

    await waitFor(() => {
      expect(mockAddReservation).toHaveBeenCalledWith(
        expect.objectContaining({
          guestName: 'John Doe',
          guestEmail: 'john@example.com',
        })
      );
    });
  });
});
```

### B. Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test -- --watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

---

## 🚀 Step 10: Server-Side Implementation

You need to create server-side endpoints. Update `server.ts`:

```typescript
import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());
app.use(cookieParser());

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  // TODO: Validate credentials against database
  const user = await validateUserCredentials(email, password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Generate tokens
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  // Set httpOnly cookies
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.json({ success: true, user });
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({ success: true });
});

// Verify session endpoint
app.get('/api/auth/verify', async (req, res) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ error: 'No token' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await getUserById(decoded.userId);
    res.json({ user });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Permission validation endpoint
app.post('/api/auth/validate-permission', async (req, res) => {
  const { action } = req.body;
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ allowed: false, reason: 'Not authenticated' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await getUserById(decoded.userId);
    
    // Check permission
    const allowed = checkUserPermission(user, action);
    
    if (!allowed) {
      // Log denial
      await logAuditEvent({
        action: 'PERMISSION_DENIED',
        user: user.id,
        details: `Denied access to: ${action}`,
        severity: 'Medium',
      });
    }

    res.json({ allowed, reason: allowed ? null : 'Insufficient privileges' });
  } catch (error) {
    res.status(401).json({ allowed: false, reason: 'Invalid token' });
  }
});

// Transaction endpoints
app.post('/api/transactions/check-in', async (req, res) => {
  const { reservationId, roomNumber } = req.body;

  try {
    // Start transaction
    const result = await supabase.rpc('check_in_reservation', {
      p_reservation_id: reservationId,
      p_room_number: roomNumber,
    });

    res.json({ success: true, data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ... other transaction endpoints ...

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

---

## ✅ Verification Checklist

After implementation, verify:

- [ ] Error boundary catches and displays errors
- [ ] Login uses httpOnly cookies (check DevTools → Application → Cookies)
- [ ] Tokens not visible in localStorage
- [ ] Permission checks validate on server
- [ ] Input validation prevents invalid data
- [ ] Loading states show during async operations
- [ ] Transactions ensure data consistency
- [ ] Tests run successfully (`npm test`)
- [ ] No console errors in production build

---

## 🐛 Troubleshooting

### Issue: "Module not found" errors

**Solution**: Install missing dependencies
```bash
npm install
```

### Issue: Tests failing

**Solution**: Check test setup
```bash
# Verify vitest is installed
npm list vitest

# Run tests with verbose output
npm test -- --reporter=verbose
```

### Issue: TypeScript errors

**Solution**: Update tsconfig.json
```json
{
  "compilerOptions": {
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  }
}
```

### Issue: Cookies not being set

**Solution**: Check server configuration
- Ensure `cookie-parser` middleware is installed
- Verify `secure` flag matches environment (false for localhost)
- Check `sameSite` setting

---

## 📚 Additional Resources

- See `IMPROVEMENTS.md` for detailed documentation
- Check example tests in `src/utils/billing.test.ts`
- Review schemas in `src/schemas/validationSchemas.ts`

---

## 🎉 Success!

You've successfully implemented critical security and performance improvements! Your Hotel ERP system is now:

✅ More secure (httpOnly cookies, server-side validation)  
✅ More reliable (error boundaries, transactions)  
✅ Better UX (loading states, skeletons)  
✅ More maintainable (tests, validation schemas)

Next steps: Implement React Query for advanced data fetching and caching!
