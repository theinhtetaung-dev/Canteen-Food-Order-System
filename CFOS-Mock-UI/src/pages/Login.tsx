import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { axiosPublic } from '../api/axios';
import toast from 'react-hot-toast';
import { User, Lock, Loader2 } from 'lucide-react';

const Login = () => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // POST /api/auth/login — body: { userName, password }
      // Response: { token, userName, role }
      const response = await axiosPublic.post('/auth/login', {
        userName,
        password,
      });

      const { token, userName: respUserName, role } = response.data;

      login({ userName: respUserName, role }, token);

      toast.success(`Welcome back, ${respUserName}!`);

      if (role === 'Admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Invalid username or password.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Card */}
      <div className="w-full max-w-md">
        {/* Logo / header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4">
            <span className="text-3xl">🍽️</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">CFOS</h1>
          <p className="mt-1 text-sm text-gray-500">Canteen Food Order System</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Sign in to your account</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username field */}
            <div>
              <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="userName"
                  name="userName"
                  type="text"
                  autoComplete="username"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your username"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Quick credential hints */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-2 text-center">Demo Accounts</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setUserName('admin'); setPassword('admin123'); }}
                className="flex flex-col items-center px-3 py-2 rounded-lg bg-orange-50 hover:bg-orange-100 border border-orange-100 transition-colors cursor-pointer"
              >
                <span className="text-xs font-semibold text-orange-700">Admin</span>
                <span className="text-xs text-gray-500">admin / admin123</span>
              </button>
              <button
                type="button"
                onClick={() => { setUserName('user'); setPassword('user123'); }}
                className="flex flex-col items-center px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-100 transition-colors cursor-pointer"
              >
                <span className="text-xs font-semibold text-gray-700">User</span>
                <span className="text-xs text-gray-500">user / user123</span>
              </button>
            </div>
          </div>

          <div className="mt-4 text-center">
            <Link
              to="/"
              className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
