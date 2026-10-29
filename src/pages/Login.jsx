import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import Button from '../components/ui/Button.jsx';
import { Input, Label } from '../components/ui/Field.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('admin@soleshire.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/vendors';

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const result = login(email, password);
    setSubmitting(false);
    if (result.ok) {
      navigate(from, { replace: true });
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-accent px-4">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-8 shadow-flat">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-lg font-bold text-white">
            R
          </div>
          <h1 className="text-lg font-semibold text-ink">
            Reapit Emulator Console
          </h1>
          <p className="mt-1 text-sm text-inkmuted">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="rounded-xl border border-danger-border bg-danger-bg px-3 py-2 text-xs text-danger">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" loading={submitting}>
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-inkmuted">
          Demo credentials — admin@soleshire.com / Emulator@123
        </p>
      </div>
    </div>
  );
}
