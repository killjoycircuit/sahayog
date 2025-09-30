import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { UserContext } from '../context/UserContext';
import {
  Heart,
  ArrowLeft,
  Check,
  Star,
  TrendingUp,
  Users,
  Target,
  ChevronRight,
  Gift,
  Sparkles
} from 'lucide-react';

const ContributionPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [progress, setProgress] = useState(0);
  const [animatingProgress, setAnimatingProgress] = useState(false);
  const [step, setStep] = useState(1); // 1: Select Amount, 2: Progress Animation, 3: Proceed to Checkout

  const predefinedAmounts = [100, 500, 1000, 2000];

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  useEffect(() => {
    if (event) {
      const currentProgress = (event.currentAmount / event.amountToRaise) * 100;
      setProgress(currentProgress);
    }
  }, [event]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/events/${eventId}`);
      setEvent(response.data);
    } catch (err) {
      toast.error('Failed to load campaign details');
      console.error('Error fetching event:', err);
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setCustomAmount(value);
      setSelectedAmount(null);
    }
  };

  const getSelectedAmount = () => {
    return selectedAmount || (customAmount ? parseInt(customAmount) : 0);
  };

  const animateProgressBar = () => {
    if (!event) return;
    
    setAnimatingProgress(true);
    setStep(2);
    
    const currentProgress = (event.currentAmount / event.amountToRaise) * 100;
    const contributionAmount = getSelectedAmount();
    const newTotal = event.currentAmount + contributionAmount;
    const newProgress = Math.min((newTotal / event.amountToRaise) * 100, 100);
    
    // Animate from current progress to new progress
    let animatedProgress = currentProgress;
    const increment = (newProgress - currentProgress) / 50; // 50 steps for smooth animation
    
    const animationInterval = setInterval(() => {
      animatedProgress += increment;
      if (animatedProgress >= newProgress) {
        animatedProgress = newProgress;
        clearInterval(animationInterval);
        setTimeout(() => {
          setStep(3);
          setAnimatingProgress(false);
        }, 1000);
      }
      setProgress(animatedProgress);
    }, 30);
  };

  const handleProceedToCheckout = () => {
    const amount = getSelectedAmount();
    if (amount <= 0) {
      toast.error('Please select a valid contribution amount');
      return;
    }
    
    if (!user) {
      toast.error('Please login to contribute');
      navigate('/login');
      return;
    }

    animateProgressBar();
  };

  const handleGoToCheckout = () => {
    navigate(`/checkout/${eventId}`, {
      state: {
        amount: getSelectedAmount(),
        event: event
      }
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const GradientProgressBar = ({ progress, animated = false }) => (
    <div className="relative">
      <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden shadow-inner">
        <div
          className={`h-6 rounded-full bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 relative overflow-hidden transition-all duration-1000 ease-out ${
            animated ? 'animate-pulse' : ''
          }`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
        </div>
      </div>
      <div className="flex justify-between text-sm text-gray-600 mt-2">
        <span>₹{event?.currentAmount?.toLocaleString() || 0}</span>
        <span className="font-medium">{progress.toFixed(1)}%</span>
        <span>₹{event?.amountToRaise?.toLocaleString() || 0}</span>
      </div>
    </div>
  );

  const AmountCard = ({ amount, isSelected, onClick, popular = false }) => (
    <div
      onClick={() => onClick(amount)}
      className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
        isSelected
          ? 'border-teal-500 bg-teal-50 shadow-lg'
          : 'border-gray-200 bg-white hover:border-teal-300 hover:shadow-md'
      }`}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center">
            <Star className="h-3 w-3 mr-1" />
            POPULAR
          </span>
        </div>
      )}
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-900 mb-2">
          {formatCurrency(amount)}
        </div>
        <div className="text-sm text-gray-600">
          {amount === 100 && "Perfect for first-time supporters"}
          {amount === 500 && "Great way to show support"}
          {amount === 1000 && "Make a meaningful impact"}
          {amount === 2000 && "Become a key supporter"}
        </div>
      </div>
      {isSelected && (
        <div className="absolute top-2 right-2">
          <div className="bg-teal-500 rounded-full p-1">
            <Check className="h-4 w-4 text-white" />
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading campaign details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Campaign Not Found</h1>
          <p className="text-gray-600 mb-6">The campaign you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/events')}
            className="bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors"
          >
            Browse Campaigns
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/events')}
            className="flex items-center text-gray-600 hover:text-teal-600 transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Campaigns
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Support This Campaign</h1>
              <p className="text-gray-600 mt-1">Help bring this amazing project to life</p>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                <span>{Math.floor(Math.random() * 150) + 50} supporters</span>
              </div>
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>{progress.toFixed(1)}% funded</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mb-4">
                    <Gift className="h-8 w-8 text-teal-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Contribution</h2>
                  <p className="text-gray-600">Every contribution makes a difference. Select an amount that feels right for you.</p>
                </div>

                {/* Predefined Amounts */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {predefinedAmounts.map((amount, index) => (
                    <AmountCard
                      key={amount}
                      amount={amount}
                      isSelected={selectedAmount === amount}
                      onClick={handleAmountSelect}
                      popular={index === 1} // Make 500 popular
                    />
                  ))}
                </div>

                {/* Custom Amount */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Or enter a custom amount
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-lg">₹</span>
                    </div>
                    <input
                      type="text"
                      value={customAmount}
                      onChange={handleCustomAmountChange}
                      placeholder="Enter amount"
                      className={`block w-full pl-8 pr-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-lg ${
                        customAmount ? 'border-teal-500 bg-teal-50' : 'border-gray-300'
                      }`}
                    />
                  </div>
                </div>

                {/* Continue Button */}
                <button
                  onClick={handleProceedToCheckout}
                  disabled={getSelectedAmount() <= 0}
                  className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-teal-700 hover:to-teal-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  Continue with {formatCurrency(getSelectedAmount())}
                  <ChevronRight className="h-5 w-5 ml-2" />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mb-6">
                  <Sparkles className="h-8 w-8 text-teal-600 animate-pulse" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Making an Impact!</h2>
                <p className="text-gray-600 mb-8">
                  Your contribution of <span className="font-bold text-teal-600">{formatCurrency(getSelectedAmount())}</span> is helping this campaign reach its goal.
                </p>
                
                <div className="mb-8">
                  <GradientProgressBar progress={progress} animated={animatingProgress} />
                </div>

                <div className="animate-pulse">
                  <div className="flex items-center justify-center text-teal-600">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600 mr-3"></div>
                    Calculating impact...
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Contribute!</h2>
                <p className="text-gray-600 mb-8">
                  Your contribution will help push this campaign to <span className="font-bold text-teal-600">{progress.toFixed(1)}%</span> of its goal.
                </p>
                
                <div className="mb-8">
                  <GradientProgressBar progress={progress} />
                </div>

                <div className="bg-teal-50 rounded-lg p-6 mb-8">
                  <h3 className="font-semibold text-gray-900 mb-2">Your Contribution Summary</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Amount:</span>
                    <span className="text-2xl font-bold text-teal-600">{formatCurrency(getSelectedAmount())}</span>
                  </div>
                </div>

                <button
                  onClick={handleGoToCheckout}
                  className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-teal-700 hover:to-teal-800 transition-all duration-300 flex items-center justify-center"
                >
                  Proceed to Checkout
                  <ChevronRight className="h-5 w-5 ml-2" />
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              {/* Campaign Image */}
              <div className="h-48 bg-gray-200 rounded-lg mb-6 overflow-hidden">
                {event.imageUrl ? (
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-100 to-teal-200">
                    <Heart className="h-12 w-12 text-teal-600" />
                  </div>
                )}
              </div>

              {/* Campaign Info */}
              <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                {event.title}
              </h3>
              
              <p className="text-gray-600 text-sm mb-6 line-clamp-3">
                {event.description}
              </p>

              {/* Stats */}
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Raised:</span>
                  <span className="font-semibold">{formatCurrency(event.currentAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Goal:</span>
                  <span className="font-semibold">{formatCurrency(event.amountToRaise)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Progress:</span>
                  <span className="font-semibold text-teal-600">{progress.toFixed(1)}%</span>
                </div>
              </div>

              {/* Creator Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center">
                  {event.createdBy?.avatar ? (
                    <img
                      src={event.createdBy.avatar}
                      alt={event.createdBy.firstName}
                      className="w-10 h-10 rounded-full object-cover mr-3"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                      {event.createdBy?.firstName?.charAt(0) || "U"}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {event.createdBy?.firstName} {event.createdBy?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">Campaign Creator</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default ContributionPage;