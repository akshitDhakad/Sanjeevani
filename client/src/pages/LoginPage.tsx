/**
 * Login Page
 * Wrapper page for login form
 */

import { LoginForm } from '../features/auth/LoginForm';

export function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}

