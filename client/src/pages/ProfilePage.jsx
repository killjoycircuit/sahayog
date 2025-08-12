import { useState, useEffect, useContext } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext.js';
import { User, Mail, Edit3, Save, X, Camera, LogOut } from 'lucide-react';

const ProfilePage = () => {
  const { user, setUser, ready } = useContext(UserContext); // Get user, setUser, and ready state from context
  const navigate = useNavigate();

  const [editMode, setEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  // When user data is available from context, populate the local state
  useEffect(() => {
    if (user) {
      setEditedProfile(user);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!editedProfile.firstName?.trim()) newErrors.firstName = 'First name is required';
    if (!editedProfile.lastName?.trim()) newErrors.lastName = 'Last name is required';
    if (!editedProfile.username?.trim()) newErrors.username = 'Username is required';
    if (!editedProfile.email?.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(editedProfile.email)) newErrors.email = 'Email is invalid';
    return newErrors;
  };

  const handleSave = async () => {
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    setIsSaving(true);
    setErrors({});
    setSuccess('');
    try {
      // NOTE: You still need to implement the PUT route on your backend.
      // This example assumes it will be '/api/profile'.
      // MOCK SAVE - This part remains a simulation until backend is ready.
      // const { data: updatedData } = await axios.put('/api/profile', editedProfile);
      const updatedData = editedProfile; // Using local data for simulation
      
      setUser(updatedData); // Update the global context with new data
      setEditMode(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setErrors({ save: error.response?.data?.error || 'Failed to update profile' });
      console.error('Profile update error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(user);
    setEditMode(false);
    setErrors({});
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/logout');
      setUser(null); // Clear the user from context
      navigate('/login'); // Redirect to login
    } catch (error) {
      console.error('Logout failed:', error);
      setUser(null); // Force clear user and redirect
      navigate('/login');
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  // 1. Wait until the context has finished fetching profile data
  if (!ready) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center">
          <div className="w-8 h-8 border-t-2 border-b-2 border-[#008080] rounded-full animate-spin mr-3"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  // 2. If fetch is done and there's no user, redirect to login
  if (ready && !user) {
    return <Navigate to={'/login'} />;
  }

  // The rest of your JSX remains the same, but uses 'user' from context
  // instead of 'profile' from local state for displaying data.
  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-[#008080] rounded-full flex items-center justify-center mb-4 relative">
            {user.avatar ? (
              <img src={user.avatar} alt="Profile" className="h-16 w-16 rounded-full object-cover"/>
            ) : (
              <span className="text-xl font-semibold text-white">{getInitials(user.firstName, user.lastName)}</span>
            )}
            {editMode && (
              <button className="absolute -bottom-1 -right-1 bg-white border-2 border-[#008080] rounded-full p-1 hover:bg-gray-50 transition-colors">
                <Camera className="h-3 w-3 text-[#008080]" />
              </button>
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.firstName} {user.lastName}</h1>
          <p className="text-gray-600">@{user.username}</p>
        </div>

        <div className="flex justify-center gap-4 mb-8">
          {!editMode ? (
            <>
              <button onClick={() => setEditMode(true)} className="flex items-center px-4 py-2 bg-[#008080] text-white rounded-lg hover:bg-[#006666] transition-colors"><Edit3 className="h-4 w-4 mr-2" />Edit Profile</button>
              <button onClick={handleLogout} className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"><LogOut className="h-4 w-4 mr-2" />Logout</button>
            </>
          ) : (
            <>
              <button onClick={handleSave} disabled={isSaving} className="flex items-center px-4 py-2 bg-[#008080] text-white rounded-lg hover:bg-[#006666] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {isSaving ? (<><div className="w-4 h-4 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>Saving...</>) : (<><Save className="h-4 w-4 mr-2" />Save Changes</>)}
              </button>
              <button onClick={handleCancel} disabled={isSaving} className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"><X className="h-4 w-4 mr-2" />Cancel</button>
            </>
          )}
        </div>
        
        {success && (<div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">{success}</div>)}
        {errors.save && (<div className="mb-6 bg-[#ff6b6b]/10 border border-[#ff6b6b] text-[#ff6b6b] px-4 py-3 rounded-lg">{errors.save}</div>)}

        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-3">Profile Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-5 w-5 text-gray-400" /></div>
                <input id="firstName" name="firstName" type="text" value={editMode ? editedProfile.firstName || '' : user.firstName} onChange={handleInputChange} disabled={!editMode} className={`block w-full pl-10 pr-3 py-3 border ${ errors.firstName ? 'border-[#ff6b6b]' : 'border-gray-300' } text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-[#008080] disabled:bg-gray-50 disabled:text-gray-500 transition-colors`} placeholder="First Name"/>
              </div>
              {errors.firstName && (<p className="mt-1 text-sm text-[#ff6b6b]">{errors.firstName}</p>)}
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-5 w-5 text-gray-400" /></div>
                <input id="lastName" name="lastName" type="text" value={editMode ? editedProfile.lastName || '' : user.lastName} onChange={handleInputChange} disabled={!editMode} className={`block w-full pl-10 pr-3 py-3 border ${ errors.lastName ? 'border-[#ff6b6b]' : 'border-gray-300' } text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-[#008080] disabled:bg-gray-50 disabled:text-gray-500 transition-colors`} placeholder="Last Name"/>
              </div>
              {errors.lastName && (<p className="mt-1 text-sm text-[#ff6b6b]">{errors.lastName}</p>)}
            </div>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-gray-400 font-medium">@</span></div>
                <input id="username" name="username" type="text" value={editMode ? editedProfile.username || '' : user.username} onChange={handleInputChange} disabled={!editMode} className={`block w-full pl-8 pr-3 py-3 border ${ errors.username ? 'border-[#ff6b6b]' : 'border-gray-300' } text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-[#008080] disabled:bg-gray-50 disabled:text-gray-500 transition-colors`} placeholder="Username"/>
              </div>
              {errors.username && (<p className="mt-1 text-sm text-[#ff6b6b]">{errors.username}</p>)}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-gray-400" /></div>
                <input id="email" name="email" type="email" value={editMode ? editedProfile.email || '' : user.email} onChange={handleInputChange} disabled={!editMode} className={`block w-full pl-10 pr-3 py-3 border ${ errors.email ? 'border-[#ff6b6b]' : 'border-gray-300' } text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-[#008080] disabled:bg-gray-50 disabled:text-gray-500 transition-colors`} placeholder="Email Address"/>
              </div>
              {errors.email && (<p className="mt-1 text-sm text-[#ff6b6b]">{errors.email}</p>)}
            </div>
          </div>
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">
                <p><span className="font-medium">User ID:</span> {user._id}</p>
                <p className="mt-1"><span className="font-medium">Member since:</span> Account created</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;