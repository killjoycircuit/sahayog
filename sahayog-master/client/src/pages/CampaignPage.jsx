import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext.js';
import {
  Heart,
  Calendar,
  Target,
  Clock,
  Share2,
  Flag,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  CheckCircle,
  AlertCircle,
  Globe,
  Mail,
  Users,
  MapPin,
  DollarSign,
  ArrowLeft,
  TrendingUp
} from 'lucide-react';

const CampaignPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showContributeForm, setShowContributeForm] = useState(false);
  const [contributionAmount, setContributionAmount] = useState('');

  // Predefined contribution amounts
  const quickAmounts = [25, 50, 100, 250, 500, 1000];

  // Fetch campaign data
  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await axios.get(`/api/events/${id}`);
        setCampaign(response.data);
      } catch (err) {
        console.error('Error fetching campaign:', err);
        if (err.response?.status === 404) {
          setError('Campaign not found');
        } else {
          setError('Failed to load campaign details. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCampaign();
    }
  }, [id]);

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
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Handle contribution form toggle
  const handleContribute = () => {
    if (!user) {
      alert('Please log in to contribute to this campaign');
      navigate('/login');
      return;
    }
    setShowContributeForm(true);
  };

  // Handle contribution submission
  const handleProceedToCheckout = async () => {
    if (!contributionAmount || contributionAmount <= 0) {
      alert('Please enter a valid contribution amount');
      return;
    }

    try {
      const response = await axios.post(`/api/events/${id}/back`, {
        amount: parseFloat(contributionAmount)
      });
      
      // Update the campaign data with the new backing
      setCampaign(response.data);
      
      alert(`Thank you for your contribution of ${formatCurrency(contributionAmount, campaign.currency)}!`);
      setShowContributeForm(false);
      setContributionAmount('');
    } catch (err) {
      console.error('Error processing contribution:', err);
      alert(err.response?.data?.error || 'Failed to process contribution. Please try again.');
    }
  };

  // Handle quick amount selection
  const handleQuickAmount = (amount) => {
    setContributionAmount(amount.toString());
  };

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: campaign.title,
          text: campaign.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
        setShowShareModal(true);
      }
    } else {
      setShowShareModal(true);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Link copied to clipboard!');
      setShowShareModal(false);
    });
  };

  // Image navigation
  const nextImage = () => {
    if (campaign.images && campaign.images.length > 1) {
      setCurrentImageIndex((prev) => (prev === campaign.images.length - 1 ? 0 : prev + 1));
    }
  };

  const prevImage = () => {
    if (campaign.images && campaign.images.length > 1) {
      setCurrentImageIndex((prev) => (prev === 0 ? campaign.images.length - 1 : prev - 1));
    }
  };

  const handleBackToCampaigns = () => {
    navigate('/explore');
  };

  // Animated Progress Bar Component
  const AnimatedProgressBar = ({ current, target, className = '' }) => {
    const [animatedWidth, setAnimatedWidth] = useState(0);
    const percentage = Math.min((current / target) * 100, 100);

    useEffect(() => {
      const timer = setTimeout(() => {
        setAnimatedWidth(percentage);
      }, 300);
      return () => clearTimeout(timer);
    }, [percentage]);

    return (
      <div className={`w-full bg-gray-200 rounded-full h-3 ${className}`}>
        <div
          className="bg-gradient-to-r from-[#008080] to-[#20B2AA] h-3 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
          style={{ width: `${animatedWidth}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-t-2 border-b-2 border-[#008080] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaign details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Campaign Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleBackToCampaigns}
            className="bg-[#008080] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#006666] transition-colors"
          >
            Browse Other Campaigns
          </button>
        </div>
      </div>
    );
  }

  if (!campaign) return null;

  const daysRemaining = getDaysRemaining(campaign.endDate);
  const fundingPercentage = Math.round((campaign.raisedAmount / campaign.targetAmount) * 100);
  const isExpired = daysRemaining === 0;
  const isFunded = campaign.status === 'funded';
  const isActive = campaign.status === 'active';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={handleBackToCampaigns}
              className="flex items-center text-gray-600 hover:text-[#008080] transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Campaigns
            </button>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`p-2 rounded-full transition-colors ${
                  isBookmarked ? 'text-[#008080] bg-[#008080]/10' : 'text-gray-600 hover:text-[#008080]'
                }`}
              >
                <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-full text-gray-600 hover:text-[#008080] transition-colors"
              >
                <Share2 className="h-5 w-5" />
              </button>
              <button
                className="p-2 rounded-full text-gray-600 hover:text-red-500 transition-colors"
                title="Report campaign"
              >
                <Flag className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="relative">
                {campaign.images && campaign.images.length > 0 ? (
                  <>
                    <img
                      src={campaign.images[currentImageIndex]?.url}
                      alt={campaign.title}
                      className="w-full h-96 object-cover"
                    />
                    {campaign.images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>

                        {/* Image indicators */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                          {campaign.images.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`w-3 h-3 rounded-full transition-colors ${
                                index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-96 bg-gradient-to-br from-[#008080] to-[#20B2AA] flex items-center justify-center">
                    <div className="text-center text-white">
                      <Target className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-xl font-semibold">{campaign.title}</p>
                    </div>
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      isFunded
                        ? 'bg-green-500 text-white'
                        : isExpired
                          ? 'bg-red-500 text-white'
                          : isActive
                            ? 'bg-[#008080] text-white'
                            : 'bg-gray-500 text-white'
                    }`}
                  >
                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Campaign Details */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              {/* Title and Category */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium capitalize">
                    {campaign.category}
                  </span>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Created {formatDate(campaign.createdAt)}</span>
                  </div>
                </div>

                <h1 className="text-4xl font-bold text-gray-900 mb-4">{campaign.title}</h1>

                <p className="text-xl text-gray-600 leading-relaxed">{campaign.description}</p>
              </div>

              {/* Creator Info */}
              <div className="mb-8 p-6 bg-gray-50 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">About the Creator</h3>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-[#008080] flex items-center justify-center flex-shrink-0">
                    {campaign.creator?.avatar ? (
                      <img
                        src={campaign.creator.avatar}
                        alt="Creator"
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-semibold text-white">
                        {campaign.creator?.firstName?.[0]}
                        {campaign.creator?.lastName?.[0]}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-xl font-semibold text-gray-900">
                      {campaign.creator?.firstName} {campaign.creator?.lastName}
                    </div>
                    <div className="text-gray-600">@{campaign.creator?.username}</div>
                    <div className="flex items-center mt-2 space-x-4">
                      <button className="flex items-center text-[#008080] hover:text-[#006666] transition-colors">
                        <Globe className="h-4 w-4 mr-1" />
                        <span className="text-sm">View Profile</span>
                      </button>
                      <button className="flex items-center text-[#008080] hover:text-[#006666] transition-colors">
                        <Mail className="h-4 w-4 mr-1" />
                        <span className="text-sm">Contact</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {campaign.tags && campaign.tags.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {campaign.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-[#008080]/10 text-[#008080] px-3 py-1 rounded-full text-sm font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Updates */}
              {campaign.updates && campaign.updates.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Updates</h3>
                  <div className="space-y-4">
                    {campaign.updates.slice(0, 3).map((update, index) => (
                      <div key={index} className="border-l-4 border-[#008080] pl-4">
                        <div className="font-semibold text-gray-900">{update.title}</div>
                        <div className="text-gray-600 text-sm mb-1">{formatDate(update.createdAt)}</div>
                        <p className="text-gray-700">{update.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Funding Progress */}
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              {/* Funding Amount */}
              <div className="mb-6">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {formatCurrency(campaign.raisedAmount, campaign.currency)}
                </div>
                <div className="text-gray-600 mb-1">
                  raised of {formatCurrency(campaign.targetAmount, campaign.currency)} goal
                </div>
                <div className="text-2xl font-semibold text-[#008080] mb-4">{fundingPercentage}% funded</div>

                <AnimatedProgressBar current={campaign.raisedAmount} target={campaign.targetAmount} className="mb-4" />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{campaign.backers?.length || 0}</div>
                  <div className="text-gray-600 text-sm">backers</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{daysRemaining}</div>
                  <div className="text-gray-600 text-sm">days to go</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {isActive && !isExpired && (
                  <button
                    onClick={handleContribute}
                    className="w-full bg-gradient-to-r from-[#008080] to-[#20B2AA] text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-[#006666] hover:to-[#008080] transition-all duration-200 flex items-center justify-center group transform hover:scale-[1.02]"
                  >
                    <Heart className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                    Back This Project
                  </button>
                )}

                {isFunded && (
                  <div className="w-full bg-green-500 text-white py-4 px-6 rounded-xl font-semibold text-lg flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Successfully Funded
                  </div>
                )}

                {isExpired && !isFunded && (
                  <div className="w-full bg-gray-400 text-white py-4 px-6 rounded-xl font-semibold text-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Campaign Ended
                  </div>
                )}

                <button
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center ${
                    isBookmarked
                      ? 'bg-[#008080] text-white'
                      : 'border-2 border-[#008080] text-[#008080] hover:bg-[#008080] hover:text-white'
                  }`}
                >
                  <Bookmark className={`h-4 w-4 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
                  {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                </button>
              </div>

              {/* Campaign Timeline */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Started</span>
                  <span>Ends</span>
                </div>
                <div className="flex items-center justify-between text-sm font-medium text-gray-900">
                  <span>{formatDate(campaign.createdAt)}</span>
                  <span>{formatDate(campaign.endDate)}</span>
                </div>
              </div>
            </div>

            {/* Recent Backers */}
            {campaign.backers && campaign.backers.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Backers</h3>
                <div className="space-y-3">
                  {campaign.backers
                    .slice(-5)
                    .reverse()
                    .map((backer, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-[#008080] flex items-center justify-center">
                            <span className="text-xs font-semibold text-white">
                              {backer.user?.firstName?.[0] || 'A'}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {backer.user?.firstName || 'Anonymous'} {backer.user?.lastName || 'Backer'}
                            </div>
                            <div className="text-xs text-gray-500">{formatDate(backer.backedAt)}</div>
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-[#008080]">
                          {formatCurrency(backer.amount, campaign.currency)}
                        </div>
                      </div>
                    ))}
                </div>
                {campaign.backers.length > 5 && (
                  <div className="mt-4 text-center">
                    <button className="text-[#008080] hover:text-[#006666] text-sm font-medium">
                      View all {campaign.backers.length} backers
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contribution Modal */}
      {showContributeForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-6 h-6 text-red-500" />
                  <h3 className="text-xl font-bold text-gray-800">Support This Campaign</h3>
                </div>
                <button
                  onClick={() => setShowContributeForm(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Campaign Summary */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <img
                    src={campaign.images?.[0]?.url || `https://images.unsplash.com/photo-1553484771-371a605b060b?w=400&h=200&fit=crop`}
                    alt={campaign.title}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <h4 className="font-bold text-gray-800 mb-2">{campaign.title}</h4>
                  <div className="text-sm text-gray-600 mb-3">
                    by {campaign.creator?.firstName} {campaign.creator?.lastName}
                  </div>

                  {/* Mini Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-600">Progress</span>
                      <span className="text-xs font-medium text-gray-800">{fundingPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#008080] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${fundingPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Mini Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <div className="font-bold text-gray-800">{formatCurrency(campaign.raisedAmount, campaign.currency)}</div>
                      <div className="text-gray-600">raised</div>
                    </div>
                    <div>
                      <div className="font-bold text-gray-800">{campaign.backers?.length || 0}</div>
                      <div className="text-gray-600">backers</div>
                    </div>
                    <div>
                      <div className="font-bold text-gray-800">{daysRemaining}</div>
                      <div className="text-gray-600">days left</div>
                    </div>
                  </div>
                </div>

                {/* Contribution Form */}
                <div>
                  {/* Quick Amount Buttons */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Choose an amount</label>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {quickAmounts.map((amount) => (
                        <button
                          key={amount}
                          onClick={() => handleQuickAmount(amount)}
                          className={`py-3 px-4 rounded-lg border transition-all ${
                            contributionAmount === amount.toString()
                              ? 'border-[#008080] bg-[#008080]/10 text-[#008080]'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          ${amount}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Amount Input */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Or enter a custom amount</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">
                        $
                      </span>
                      <input
                        type="number"
                        value={contributionAmount}
                        onChange={(e) => setContributionAmount(e.target.value)}
                        placeholder="0.00"
                        min="1"
                        step="0.01"
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080] focus:border-[#008080] text-lg"
                      />
                    </div>
                  </div>

                  {/* Goal Information */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Campaign Goal:</span>
                      <span className="font-medium text-gray-800">{formatCurrency(campaign.targetAmount, campaign.currency)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-1">
                      <span className="text-gray-600">Amount Needed:</span>
                      <span className="font-medium text-gray-800">
                        {formatCurrency(Math.max(0, campaign.targetAmount - campaign.raisedAmount), campaign.currency)}
                      </span>
                    </div>
                  </div>

                  {/* Proceed Button */}
                  <button
                    onClick={handleProceedToCheckout}
                    disabled={!contributionAmount || contributionAmount <= 0}
                    className="w-full bg-[#008080] text-white py-4 px-6 rounded-lg font-medium text-lg hover:bg-[#006666] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Contribute Now
                  </button>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    Your contribution helps make this project possible. Thank you for your support!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Share Campaign</h3>
              <button onClick={() => setShowShareModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">
                ×
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                <input
                  type="text"
                  value={typeof window !== "undefined" ? window.location.href : ""}
                  readOnly
                  className="flex-1 bg-transparent text-sm text-gray-600 outline-none"
                />
                <button
                  onClick={() => copyToClipboard(typeof window !== "undefined" ? window.location.href : "")}
                  className="ml-2 bg-[#008080] text-white px-3 py-1 rounded text-sm hover:bg-[#006666] transition-colors"
                >
                  Copy
                </button>
              </div>

              <div className="flex space-x-2">
                <button className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg text-sm hover:bg-blue-600 transition-colors">
                  Facebook
                </button>
                <button className="flex-1 bg-blue-400 text-white py-2 px-4 rounded-lg text-sm hover:bg-blue-500 transition-colors">
                  Twitter
                </button>
                <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                  LinkedIn
                </button>
                 <button className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg text-sm hover:bg-blue-600 transition-colors">
                  Github
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignPage;