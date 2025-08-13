import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext.js';
import { 
  Search, 
  Filter, 
  Heart, 
  Users, 
  Calendar, 
  Target, 
  TrendingUp,
  MapPin,
  Clock,
  DollarSign,
  ChevronRight,
  Grid3X3,
  List,
  SlidersHorizontal,
  X
} from 'lucide-react';

const ExplorePage = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: 'active',
    sortBy: 'createdAt'
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalEvents: 0,
    hasMore: false
  });

  const categories = [
    'design', 'music', 'technology', 'games', 'publishing', 'film',
    'art', 'food', 'fashion', 'crafts', 'theater', 'comics', 'dance', 'photography'
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Newest First' },
    { value: '-createdAt', label: 'Oldest First' },
    { value: 'endDate', label: 'Ending Soon' },
    { value: '-endDate', label: 'Ending Later' },
    { value: '-targetAmount', label: 'Highest Goal' },
    { value: 'targetAmount', label: 'Lowest Goal' },
    { value: '-raisedAmount', label: 'Most Funded' },
    { value: 'raisedAmount', label: 'Least Funded' }
  ];

  // Fetch campaigns from API
  const fetchCampaigns = async (page = 1, newFilters = filters) => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12'
      });

      // Add status filter
      if (newFilters.status) {
        params.append('status', newFilters.status);
      }

      // Add search filter if provided
      if (newFilters.search && newFilters.search.trim()) {
        params.append('search', newFilters.search.trim());
      }

      // Add category filter if selected
      if (newFilters.category) {
        params.append('category', newFilters.category);
      }

      console.log('Fetching campaigns with params:', params.toString());

      // Make API call to fetch events - Using the correct endpoint /api/events
      const response = await axios.get(`/api/events?${params}`, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('API Response:', response.data);

      // FIXED: Handle the actual response format from your backend
      // Your backend returns { events, pagination } directly (not nested in success)
      if (response.data) {
        const { events, pagination: paginationData } = response.data;
        
        if (page === 1) {
          setCampaigns(events || []);
        } else {
          setCampaigns(prev => [...prev, ...(events || [])]);
        }
        
        setPagination({
          currentPage: paginationData?.currentPage || page,
          totalPages: paginationData?.totalPages || 1,
          totalEvents: paginationData?.totalEvents || events?.length || 0,
          hasMore: paginationData?.hasMore || false
        });
      } else {
        throw new Error('No data received from server');
      }
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      
      // Set appropriate error messages
      if (err.code === 'ECONNABORTED') {
        setError('Request timeout. Please check your internet connection and try again.');
      } else if (err.response) {
        // Server responded with error status
        const status = err.response.status;
        const message = err.response.data?.message || err.response.data?.error || 'Unknown server error';
        
        if (status === 404) {
          setError('API endpoint not found. Please check if the server is running.');
        } else if (status >= 500) {
          setError('Server error. Please try again later.');
        } else {
          setError(`Error ${status}: ${message}`);
        }
      } else if (err.request) {
        // Network error
        setError('Network error. Please check if the server is running and try again.');
      } else {
        // Other errors
        setError(err.message || 'Failed to load campaigns. Please try again.');
      }
      
      // Set empty state on error
      if (page === 1) {
        setCampaigns([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalEvents: 0,
          hasMore: false
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Reset pagination when filters change
    setPagination(prev => ({
      ...prev,
      currentPage: 1,
      hasMore: false
    }));
    
    // Fetch with new filters
    fetchCampaigns(1, newFilters);
  };

  const clearFilters = () => {
    const newFilters = {
      search: '',
      category: '',
      status: 'active',
      sortBy: 'createdAt'
    };
    setFilters(newFilters);
    
    // Reset pagination
    setPagination(prev => ({
      ...prev,
      currentPage: 1,
      hasMore: false
    }));
    
    fetchCampaigns(1, newFilters);
  };

  // Load more campaigns
  const loadMore = () => {
    if (pagination.hasMore && !loading) {
      fetchCampaigns(pagination.currentPage + 1);
    }
  };

  // Navigate to campaign detail
  const handleCampaignClick = (campaignId) => {
    navigate(`/campaign/${campaignId}`);
  };

  // Handle contribution
  const handleContribute = (e, campaign) => {
    e.stopPropagation(); // Prevent card click
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/campaign/${campaign._id}/contribute`);
  };

  // Calculate days remaining
  const getDaysRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const timeDiff = end - now;
    const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return daysRemaining > 0 ? daysRemaining : 0;
  };

  // Format currency
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Animated Progress Bar Component
  const AnimatedProgressBar = ({ current, target, className = "" }) => {
    const [animatedWidth, setAnimatedWidth] = useState(0);
    const percentage = Math.min((current / target) * 100, 100);

    useEffect(() => {
      const timer = setTimeout(() => {
        setAnimatedWidth(percentage);
      }, 100);
      return () => clearTimeout(timer);
    }, [percentage]);

    return (
      <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
        <div 
          className="bg-gradient-to-r from-[#008080] to-[#20B2AA] h-2 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${animatedWidth}%` }}
        />
      </div>
    );
  };

  // Campaign Card Component
  const CampaignCard = ({ campaign }) => (
    <div 
      onClick={() => handleCampaignClick(campaign._id)}
      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden border border-gray-100"
    >
      {/* Campaign Image */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={campaign.images?.length > 0 && campaign.images[0].url ? campaign.images[0].url : 'https://images.unsplash.com/photo-1553484771-371a605b060b?w=400&h=200&fit=crop'}
          alt={campaign.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1553484771-371a605b060b?w=400&h=200&fit=crop';
          }}
        />
        <div className="absolute top-4 left-4">
          <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-[#008080] capitalize">
            {campaign.category}
          </span>
        </div>
        <div className="absolute top-4 right-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 flex items-center space-x-1">
            <Clock className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {getDaysRemaining(campaign.endDate)}d
            </span>
          </div>
        </div>
      </div>

      {/* Campaign Content */}
      <div className="p-6">
        {/* Title and Creator */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#008080] transition-colors">
            {campaign.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {campaign.description}
          </p>
          <div className="flex items-center text-sm text-gray-500">
            <Users className="h-4 w-4 mr-1" />
            <span>
              by {campaign.creator?.firstName || 'Unknown'} {campaign.creator?.lastName || 'User'}
            </span>
          </div>
        </div>

        {/* Funding Progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-2xl font-bold text-gray-900">
              {formatCurrency(campaign.raisedAmount, campaign.currency)}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round((campaign.raisedAmount / campaign.targetAmount) * 100)}%
            </span>
          </div>
          <AnimatedProgressBar 
            current={campaign.raisedAmount} 
            target={campaign.targetAmount} 
            className="mb-2"
          />
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Goal: {formatCurrency(campaign.targetAmount, campaign.currency)}</span>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              <span>{campaign.backers?.length || 0} backers</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        {campaign.tags && campaign.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {campaign.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs"
              >
                {tag}
              </span>
            ))}
            {campaign.tags.length > 3 && (
              <span className="text-xs text-gray-500">+{campaign.tags.length - 3} more</span>
            )}
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={(e) => handleContribute(e, campaign)}
          className="w-full bg-gradient-to-r from-[#008080] to-[#20B2AA] text-white py-3 px-4 rounded-lg font-semibold hover:from-[#006666] hover:to-[#008080] transition-all duration-200 flex items-center justify-center group-hover:scale-[1.02] transform"
        >
          <Heart className="h-4 w-4 mr-2" />
          Back This Project
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl font-bold text-gray-900">Explore Campaigns</h1>
              <p className="text-gray-600 mt-1">
                Discover amazing projects and help bring them to life
              </p>
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center space-x-4">
              <div className="bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-white text-[#008080] shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white text-[#008080] shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search campaigns by title, description, or tags..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080] focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080] focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080] focus:border-transparent"
            >
              <option value="active">Active Campaigns</option>
              <option value="funded">Funded Campaigns</option>
              <option value="expired">Expired Campaigns</option>
              <option value="">All Status</option>
            </select>

            {/* Sort */}
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080] focus:border-transparent"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Clear Filters */}
            {(filters.search || filters.category || filters.status !== 'active' || filters.sortBy !== 'createdAt') && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors flex items-center"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="mb-8">
          <div className="text-sm text-gray-600">
            {pagination.totalEvents > 0 ? (
              <span>
                Showing {campaigns.length} of {pagination.totalEvents} campaigns
                {filters.search || filters.category || filters.status !== 'active' ? ' (filtered)' : ''}
              </span>
            ) : (
              <span>No campaigns found</span>
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <div className="text-red-400 mr-2">⚠️</div>
              <div>
                <p className="text-red-800 font-medium">Failed to load campaigns</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
                <button
                  onClick={() => fetchCampaigns(1)}
                  className="text-red-600 hover:text-red-800 text-sm underline mt-2"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && campaigns.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-t-2 border-b-2 border-[#008080] rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading campaigns...</p>
            </div>
          </div>
        )}

        {/* Campaigns Grid */}
        {!loading && campaigns.length > 0 && (
          <>
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {campaigns.map((campaign) => (
                <CampaignCard key={campaign._id} campaign={campaign} />
              ))}
            </div>

            {/* Load More */}
            {pagination.hasMore && (
              <div className="text-center mt-12">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="bg-[#008080] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#006666] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center mx-auto"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      Load More
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && campaigns.length === 0 && !error && (
          <div className="text-center py-12">
            <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No campaigns found</h3>
            <p className="text-gray-600 mb-6">
              {filters.search || filters.category || filters.status !== 'active' 
                ? 'Try adjusting your search criteria or explore different categories.'
                : 'No campaigns are currently available. Check back later or be the first to create one!'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {(filters.search || filters.category || filters.status !== 'active') && (
                <button
                  onClick={clearFilters}
                  className="bg-[#008080] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#006666] transition-colors"
                >
                  Clear Filters
                </button>
              )}
              <button
                onClick={() => navigate('/create-event')}
                className="border-2 border-[#008080] text-[#008080] px-6 py-3 rounded-lg font-semibold hover:bg-[#008080] hover:text-white transition-colors"
              >
                Create Campaign
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats Footer */}
      <div className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-[#008080] mb-2">
                {pagination.totalEvents.toLocaleString()}
              </div>
              <div className="text-gray-600">
                {filters.status === 'active' ? 'Active' : 'Total'} Campaigns
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#008080] mb-2">
                {campaigns.reduce((sum, campaign) => sum + (campaign.raisedAmount || 0), 0).toLocaleString()}
              </div>
              <div className="text-gray-600">Total Raised</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#008080] mb-2">
                {campaigns.reduce((sum, campaign) => sum + (campaign.backers?.length || 0), 0).toLocaleString()}
              </div>
              <div className="text-gray-600">Total Backers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#008080] mb-2">
                {pagination.totalEvents > 0 
                  ? Math.round(
                      (campaigns.filter(c => c.raisedAmount >= c.targetAmount).length / campaigns.length) * 100
                    )
                  : 0
                }%
              </div>
              <div className="text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;