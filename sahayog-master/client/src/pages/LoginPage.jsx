import { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { UserContext } from '../context/UserContext.js'; // Import the context
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { setUser } = useContext(UserContext); // Get the setUser function from context
  const navigate = useNavigate(); // Hook for programmatic navigation

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleSubmit = async () => {
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // The global axios config in App.jsx handles the 'withCredentials' part
      const response = await axios.post('/api/login', formData);
      
      // *** UPDATED LOGIC ***
      setUser(response.data); // 1. Set the user in the global context
      alert(`Welcome back, ${response.data.firstName || response.data.username}!`);
      navigate('/profile'); // 2. Navigate to the profile page

    } catch (error) {
      if (error.response) {
        const { status } = error.response;
        if (status === 404) setErrors({ email: 'User not found' });
        else if (status === 422) setErrors({ password: 'Password is incorrect' });
        else setErrors({ submit: 'Login failed. Please try again.' });
      } else {
        setErrors({ submit: 'Network error. Please try again.' });
        console.error('Login error:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-[#008080] rounded-full flex items-center justify-center mb-4">
            <LogIn className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Sign in to your account</p>
        </div>
        <div className="mt-8 space-y-6">
          <div>
            <label htmlFor="email" className="sr-only">Email address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-gray-400" /></div>
              <input id="email" name="email" type="email" autoComplete="email" value={formData.email} onChange={handleInputChange} onKeyPress={handleKeyPress} className={`block w-full pl-10 pr-3 py-3 border ${ errors.email ? 'border-[#ff6b6b]' : 'border-gray-300' } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-[#008080] transition-colors`} placeholder="Email address"/>
            </div>
            {errors.email && (<p className="mt-1 text-sm text-[#ff6b6b]">{errors.email}</p>)}
          </div>
          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-gray-400" /></div>
              <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={formData.password} onChange={handleInputChange} onKeyPress={handleKeyPress} className={`block w-full pl-10 pr-10 py-3 border ${ errors.password ? 'border-[#ff6b6b]' : 'border-gray-300' } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-[#008080] transition-colors`} placeholder="Password"/>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600 focus:outline-none">
                  {showPassword ? (<EyeOff className="h-5 w-5" />) : (<Eye className="h-5 w-5" />)}
                </button>
              </div>
            </div>
            {errors.password && (<p className="mt-1 text-sm text-[#ff6b6b]">{errors.password}</p>)}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-[#008080] focus:ring-[#008080] border-gray-300 rounded"/>
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">Remember me</label>
            </div>
            <div className="text-sm">
              <a href="/forgot-password" className="font-medium text-[#008080] hover:text-[#006666] transition-colors">Forgot your password?</a>
            </div>
          </div>
          {errors.submit && (<div className="bg-[#ff6b6b]/10 border border-[#ff6b6b] text-[#ff6b6b] px-4 py-3 rounded-lg">{errors.submit}</div>)}
          <div>
            <button type="button" onClick={handleSubmit} disabled={isLoading} className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[#008080] hover:bg-[#006666] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#008080] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {isLoading ? (<div className="flex items-center"><div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>Signing in...</div>) : ('Sign in')}
            </button>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Don't have an account?{' '}<button onClick={() => navigate('/register')} className="font-medium text-[#008080] hover:text-[#006666] transition-colors bg-transparent border-none cursor-pointer">Create one here</button></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;