import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API from '../api';

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'signup');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Update mode if URL changes
  useEffect(() => {
    setIsLogin(searchParams.get('mode') !== 'signup');
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/signup';

      const { data } = await API.post(endpoint, formData);

      // Save user info (including token)
      localStorage.setItem('userInfo', JSON.stringify(data));

      alert('Success!');
      navigate('/dashboard'); // Redirect after login
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        
        <h2 className="text-2xl font-bold text-center mb-6">
          {isLogin ? 'Login to Account' : 'Create New Account'}
        </h2>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                className="w-full mt-1 p-2 border rounded-md focus:ring-blue-500 outline-none"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              className="w-full mt-1 p-2 border rounded-md focus:ring-blue-500 outline-none"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              className="w-full mt-1 p-2 border rounded-md focus:ring-blue-500 outline-none"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:bg-blue-300"
          >
            {loading
              ? 'Processing...'
              : isLogin
              ? 'Login'
              : 'Sign Up'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          {isLogin ? 'New user?' : 'Already have an account?'}{' '}
          <button
            onClick={() =>
              navigate(`/auth?mode=${isLogin ? 'signup' : 'login'}`)
            }
            className="text-blue-600 font-semibold hover:underline"
          >
            {isLogin ? 'Create an account' : 'Login here'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;