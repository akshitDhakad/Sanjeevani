# Testing Guide: Register and Login Functionality

This guide explains how to test the Register and Login functionality in the Home-First Care application.

## Overview

The application uses **MSW (Mock Service Worker)** to mock API calls during development. This allows you to test authentication without a backend server.

## Prerequisites

1. **Install dependencies** (if not already done):

   ```bash
   cd client
   pnpm install
   ```

2. **Start the development server**:

   ```bash
   pnpm dev
   ```

3. **Verify MSW is running**:
   - Open browser DevTools (F12)
   - Check the Console for MSW initialization messages
   - MSW should automatically start in development mode

## Testing Login

### Test Credentials

The mock server includes pre-configured test users:

| Role      | Email                   | Password   |
| --------- | ----------------------- | ---------- |
| Customer  | `customer@example.com`  | `password` |
| Caregiver | `caregiver@example.com` | `password` |
| Admin     | `admin@example.com`     | `password` |

### Steps to Test Login

1. **Navigate to Login Page**:
   - Go to `http://localhost:3000/login` (or your dev server URL)
   - Or click "Sign in" from the home page

2. **Test Successful Login**:
   - Enter email: `customer@example.com`
   - Enter password: `password`
   - Click "Sign In"
   - **Expected**: Redirects to `/customer/dashboard`

3. **Test Invalid Credentials**:
   - Enter email: `wrong@example.com`
   - Enter password: `wrongpassword`
   - Click "Sign In"
   - **Expected**: Error message "Invalid credentials" appears

4. **Test Form Validation**:
   - Leave fields empty and click "Sign In"
   - **Expected**: Validation errors appear for required fields
   - Enter invalid email format (e.g., `notanemail`)
   - **Expected**: Email validation error appears

5. **Test Role-Based Redirects**:
   - Login as `caregiver@example.com` → Should redirect to `/caregiver/dashboard`
   - Login as `admin@example.com` → Should redirect to `/admin`
   - Login as `customer@example.com` → Should redirect to `/customer/dashboard`

## Testing Registration

### Steps to Test Registration

1. **Navigate to Register Page**:
   - Go to `http://localhost:3000/register`
   - Or click "Sign up" from the login page

2. **Test Successful Registration**:
   - Fill in the form:
     - **Name**: `Test User`
     - **Email**: `newuser@example.com` (must be unique)
     - **Phone**: `+1234567890` (optional)
     - **Password**: `password123`
     - **Role**: Select "Customer" or "Caregiver"
   - Click "Create Account"
   - **Expected**:
     - User is created
     - Token is stored in localStorage
     - Redirects to appropriate dashboard based on role:
       - Customer → `/customer/dashboard`
       - Caregiver → `/caregiver/onboarding`

3. **Test Duplicate Email**:
   - Try registering with an existing email (e.g., `customer@example.com`)
   - **Expected**: Error message "User with this email already exists"

4. **Test Form Validation**:
   - Leave required fields empty
   - **Expected**: Validation errors appear
   - Enter invalid email format
   - **Expected**: Email validation error
   - Enter weak password (if validation rules exist)
   - **Expected**: Password validation error

5. **Test Role Selection**:
   - Register as "Customer" → Should redirect to customer dashboard
   - Register as "Caregiver" → Should redirect to caregiver onboarding

## Manual Testing Checklist

### Login Tests

- [ ] Can login with valid customer credentials
- [ ] Can login with valid caregiver credentials
- [ ] Can login with valid admin credentials
- [ ] Shows error for invalid email
- [ ] Shows error for invalid password
- [ ] Shows error for non-existent user
- [ ] Form validation works (required fields)
- [ ] Email format validation works
- [ ] Redirects to correct dashboard based on role
- [ ] Token is stored in localStorage after login
- [ ] Loading state shows during login
- [ ] Button is disabled during login

### Registration Tests

- [ ] Can register new customer
- [ ] Can register new caregiver
- [ ] Shows error for duplicate email
- [ ] Form validation works (required fields)
- [ ] Email format validation works
- [ ] Phone number is optional
- [ ] Role selection works
- [ ] Redirects to correct page after registration
- [ ] Token is stored in localStorage after registration
- [ ] Loading state shows during registration
- [ ] Button is disabled during registration

## Browser DevTools Testing

### Check Network Requests

1. Open DevTools → Network tab
2. Filter by "Fetch/XHR"
3. Perform login/register actions
4. Verify:
   - Requests go to `/auth/login` or `/auth/register`
   - Status codes are correct (200 for success, 401/409 for errors)
   - Response contains token and user data

### Check LocalStorage

1. Open DevTools → Application tab → Local Storage
2. After successful login/register:
   - Check for `auth_token` key
   - Token should be stored (format: `mock-token-{userId}`)

### Check Console

1. Open DevTools → Console tab
2. Look for:
   - MSW initialization messages
   - Any error messages
   - Network request logs

## Testing Different Scenarios

### Scenario 1: New User Registration Flow

1. Register as a new customer
2. Verify redirect to customer dashboard
3. Logout
4. Login with the same credentials
5. Verify you can access the dashboard

### Scenario 2: Caregiver Registration Flow

1. Register as a new caregiver
2. Verify redirect to caregiver onboarding
3. Complete onboarding (if implemented)
4. Verify access to caregiver dashboard

### Scenario 3: Error Handling

1. Try to login with wrong password
2. Verify error message appears
3. Try to register with existing email
4. Verify error message appears
5. Verify form doesn't submit on validation errors

## Troubleshooting

### MSW Not Working

- **Issue**: API calls are not being intercepted
- **Solution**:
  - Check browser console for MSW errors
  - Verify `import.meta.env.DEV` is true
  - Restart dev server
  - Clear browser cache

### Registration Not Working

- **Issue**: Register endpoint returns 404
- **Solution**:
  - Verify the register handler is in `handlers.ts`
  - Check the endpoint URL matches in `auth.ts`
  - Restart dev server

### Token Not Stored

- **Issue**: localStorage doesn't contain token after login
- **Solution**:
  - Check browser console for errors
  - Verify localStorage is enabled
  - Check if token exists in API response

### Redirect Not Working

- **Issue**: User stays on login/register page after success
- **Solution**:
  - Check browser console for navigation errors
  - Verify routes are configured in `AppRouter.tsx`
  - Check if user role is correctly set

## API Endpoints (Mock)

The following endpoints are mocked:

- `POST /auth/login` - Login user
- `POST /auth/register` - Register new user
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user

## Mock Data

Mock users are stored in memory in `handlers.ts`. They persist during the session but reset when you refresh the page (unless you modify the handlers to use persistent storage).

## Next Steps

For production testing:

1. Replace MSW with actual backend API
2. Update `VITE_API_BASE` environment variable
3. Ensure backend implements the same endpoints
4. Test with real authentication tokens
