import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext.js';
import {
  FileUp,
  X,
  Plus,
  DollarSign,
  Calendar,
  Image,
  Tag,
  BookOpen,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const CreateEventPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    targetAmount: '',
    endDate: '',
    images: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const categories = [
    'design', 'music', 'technology', 'games', 'publishing', 'film',
    'art', 'food', 'fashion', 'crafts', 'theater', 'comics', 'dance', 'photography'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.images.length > 5) {
      setError('You can only upload a maximum of 5 images.');
      return;
    }
    setError('');
    setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => {
      const newImages = [...prev.images];
      newImages.splice(index, 1);
      return { ...prev, images: newImages };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    if (!formData.title || !formData.category || !formData.description || !formData.targetAmount || !formData.endDate || formData.images.length === 0) {
      setError('Please fill in all required fields and upload at least one image.');
      setLoading(false);
      return;
    }

    if (!user) {
      setError('You must be logged in to create a campaign.');
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('category', formData.category);
      data.append('description', formData.description);
      data.append('targetAmount', formData.targetAmount);
      data.append('endDate', formData.endDate);
      formData.images.forEach(image => {
        data.append('images', image);
      });

      const response = await axios.post('/api/event-create', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      setSuccessMessage('Campaign created successfully! Redirecting you now...');
      setTimeout(() => {
        navigate(`/campaign/${response.data._id}`);
      }, 2000);

    } catch (err) {
      console.error('Error creating campaign:', err);
      setError(err.response?.data?.error || 'Failed to create campaign. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl">
        <h1 className="text-4xl font-extrabold text-center mb-6 text-gray-800">
          Start Your Campaign
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Launch your project and connect with backers.
        </p>

        {successMessage && (
          <div className="flex items-center justify-center p-4 mb-6 text-teal-700 bg-teal-100 rounded-lg">
            <CheckCircle className="mr-2 h-5 w-5" />
            <span>{successMessage}</span>
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center p-4 mb-6 text-red-700 bg-red-100 rounded-lg">
            <AlertCircle className="mr-2 h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Campaign Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 transition-colors"
              placeholder="A short, catchy title"
              required
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 transition-colors"
              required
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              id="description"
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 transition-colors"
              placeholder="Tell your story and explain your project..."
              required
            ></textarea>
          </div>

          <div>
            <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700 mb-1">Target Amount (USD)</label>
            <div className="relative mt-1 rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                id="targetAmount"
                name="targetAmount"
                value={formData.targetAmount}
                onChange={handleChange}
                className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 transition-colors"
                placeholder="e.g., 5000"
                min="1"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">Campaign End Date</label>
            <div className="relative mt-1 rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 transition-colors"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700 mb-1">Campaign Images (up to 5)</label>
            <div className="mt-1 flex items-center justify-center w-full">
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FileUp className="w-8 h-8 mb-2 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    SVG, PNG, JPG, or GIF (max 5MB)
                  </p>
                </div>
                <input
                  id="image-upload"
                  type="file"
                  name="images"
                  className="hidden"
                  onChange={handleImageChange}
                  multiple
                  accept="image/jpeg,image/png,image/gif,image/webp"
                />
              </label>
            </div>
          </div>

          {formData.images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative group rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index}`}
                    className="w-full h-24 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-center">
            <button
              type="submit"
              className="w-full px-6 py-3 text-lg font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors focus:outline-none focus:ring-4 focus:ring-teal-300 disabled:bg-teal-400"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="animate-spin mr-2" />
                  Creating Campaign...
                </div>
              ) : (
                <>
                  <Send className="inline-block h-5 w-5 mr-2" />
                  Launch Campaign
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventPage;
