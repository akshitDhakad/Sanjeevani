# Quick Test Reference: Login & Register

## 🚀 Quick Start

1. Start dev server: `pnpm dev`
2. Open browser: `http://localhost:5173`
3. MSW automatically mocks API calls (check console for confirmation)

## 🔑 Test Credentials

| Role      | Email                   | Password   | Redirects To           |
| --------- | ----------------------- | ---------- | ---------------------- |
| Customer  | `customer@example.com`  | `password` | `/customer/dashboard`  |
| Caregiver | `caregiver@example.com` | `password` | `/caregiver/dashboard` |
| Admin     | `admin@example.com`     | `password` | `/admin`               |

## ✅ Quick Test Steps

### Login Test (30 seconds)

1. Go to `/login`
2. Enter: `customer@example.com` / `password`
3. Click "Sign In"
4. ✅ Should redirect to customer dashboard

### Register Test (1 minute)

1. Go to `/register`
2. Fill form:
   - Name: `Test User`
   - Email: `newuser@example.com` (must be unique)
   - Password: `password123`
   - Role: `Customer`
3. Click "Create Account"
4. ✅ Should redirect to customer dashboard

### Error Test (30 seconds)

1. Go to `/login`
2. Enter: `wrong@example.com` / `wrong`
3. Click "Sign In"
4. ✅ Should show error message

## 🔍 Verify It Works

**Check Browser DevTools:**

- **Network Tab**: See API calls to `/auth/login` or `/auth/register`
- **Application Tab → LocalStorage**: See `auth_token` after login/register
- **Console Tab**: See MSW messages confirming mock server is active

## 🐛 Common Issues

| Issue            | Solution                                 |
| ---------------- | ---------------------------------------- |
| MSW not working  | Restart dev server, check console        |
| 404 on register  | Verify handlers.ts has register endpoint |
| No redirect      | Check routes in AppRouter.tsx            |
| Token not stored | Check localStorage, verify API response  |

## 📝 What Was Fixed

- ✅ Added missing `/auth/register` endpoint handler in `handlers.ts`
- ✅ Register now creates new users and returns token
- ✅ All test credentials work with password: `password`
