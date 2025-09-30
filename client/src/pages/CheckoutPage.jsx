import React, { useState, useEffect, useContext } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { UserContext } from '../context/UserContext';
import {
  ArrowLeft,
  Check,
  Mail,
  CreditCard,
  Shield,
  FileText,
  Download,
  Heart,
  Sparkles,
  CheckCircle,
  AlertCircle,
  User,
  Calendar,
  DollarSign
} from 'lucide-react';

const CheckoutPage = () => {
  const { eventId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [event, setEvent] = useState(location.state?.event || null);
  const [amount, setAmount] = useState(location.state?.amount || 0);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [contribution, setContribution] = useState(null);
  const [emailForInvoice, setEmailForInvoice] = useState(user?.email || '');
  const [sendEmailInvoice, setSendEmailInvoice] = useState(true);

  useEffect(() => {
    if (!event && eventId) {
      fetchEvent();
    }
    if (!amount || amount <= 0) {
      toast.error('Invalid contribution amount');
      navigate('/events');
    }
  }, [eventId, amount, event]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/events/${eventId}`);
      setEvent(response.data);
    } catch (err) {
      toast.error('Failed to load campaign details');
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const handleContribution = async () => {
    if (!user) {
      toast.error('Please login to contribute');
      navigate('/login');
      return;
    }

    if (!event || amount <= 0) {
      toast.error('Invalid contribution details');
      return;
    }

    try {
      setProcessing(true);

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const response = await axios.post('/api/contributions', {
        eventId: event._id,
        amount: amount,
        contributorEmail: emailForInvoice
      });

      setContribution(response.data.contribution);
      setCompleted(true);

      // Send email invoice if requested
      if (sendEmailInvoice && emailForInvoice) {
        try {
          await axios.post(`/api/contributions/${response.data.contribution._id}/email-invoice`, {
            email: emailForInvoice
          });
          toast.success('Contribution successful! Invoice sent to your email.');
        } catch (emailErr) {
          toast.success('Contribution successful! (Email sending failed)');
        }
      } else {
        toast.success('Contribution successful!');
      }

    } catch (err) {
      console.error('Error processing contribution:', err);
      const errorMessage = err.response?.data?.error || 'Failed to process contribution';
      toast.error(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (completed && contribution) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Thank You!</h1>
            <p className="text-xl text-gray-600">Your contribution has been processed successfully</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-8 py-6">
              <div className="flex items-center justify-between text-white">
                <div>
                  <h2 className="text-2xl font-bold">Contribution Receipt</h2>
                  <p className="opacity-90">Invoice #{contribution.invoiceNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-90">Date</p>
                  <p className="font-semibold">{formatDate(contribution.contributionDate)}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* Contributor Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Contributor Details
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-600">Name</label>
                      <p className="font-medium">{contribution.invoiceData.contributorName}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Email</label>
                      <p className="font-medium">{contribution.invoiceData.contributorEmail}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Transaction ID</label>
                      <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {contribution.invoiceData.transactionId}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Campaign Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Heart className="h-5 w-5 mr-2" />
                    Campaign Details
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-600">Campaign</label>
                      <p className="font-medium">{contribution.invoiceData.eventTitle}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Creator</label>
                      <p className="font-medium">{contribution.invoiceData.eventCreator}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Status</label>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <Check className="h-4 w-4 mr-1" />
                        {contribution.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amount Section */}
              <div className="bg-gradient-to-r from-teal-50 to-green-50 rounded-xl p-6 mb-8">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Total Contribution</p>
                  <p className="text-4xl font-bold text-teal-600 mb-2">
                    {formatCurrency(contribution.amount)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Thank you for supporting this amazing campaign!
                  </p>
                </div>
              </div>

              {/* Impact Message */}
              <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-8">
                <div className="flex items-start">
                  <Sparkles className="h-6 w-6 text-blue-400 mr-3 mt-1" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">Your Impact</h4>
                    <p className="text-blue-800">
                      Your generous contribution of {formatCurrency(contribution.amount)} brings this campaign closer to its goal. 
                      You're helping turn dreams into reality and making a real difference in the world.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/my-contributions')}
                  className="flex-1 bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors flex items-center justify-center"
                >
                  <FileText className="h-5 w-5 mr-2" />
                  View My Contributions
                </button>
                <button
                  onClick={() => navigate('/events')}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  <Heart className="h-5 w-5 mr-2" />
                  Support More Campaigns
                </button>
              </div>

              {/* Email Confirmation */}
              {sendEmailInvoice && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center text-green-800">
                    <Mail className="h-5 w-5 mr-2" />
                    <span className="text-sm">
                      A detailed invoice has been sent to {emailForInvoice}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-teal-600 transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
              <p className="text-gray-600 mt-1">Complete your contribution</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Shield className="h-4 w-4" />
              <span>Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contribution Details</h2>

              {/* Campaign Summary */}
              <div className="border rounded-lg p-6 mb-8">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    {event?.imageUrl ? (
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-100 to-teal-200">
                        <Heart className="h-6 w-6 text-teal-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{event?.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      by {event?.createdBy?.firstName} {event?.createdBy?.lastName}
                    </p>
                    <div className="text-2xl font-bold text-teal-600">
                      {formatCurrency(amount)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Email for Invoice */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email for Invoice
                    </label>
                    <input
                      type="email"
                      value={emailForInvoice}
                      onChange={(e) => setEmailForInvoice(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Enter your email address"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="sendEmail"
                      checked={sendEmailInvoice}
                      onChange={(e) => setSendEmailInvoice(e.target.checked)}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    />
                    <label htmlFor="sendEmail" className="ml-2 text-sm text-gray-700">
                      Send invoice to my email
                    </label>
                  </div>
                </div>
              </div>

              {/* Payment Method (Mock) */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
                <div className="border-2 border-teal-200 bg-teal-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <CreditCard className="h-6 w-6 text-teal-600 mr-3" />
                    <div>
                      <p className="font-medium text-teal-900">Mock Payment</p>
                      <p className="text-sm text-teal-700">
                        This is a demo - no actual payment will be processed
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                <div className="flex items-start">
                  <Shield className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">Secure Transaction</h4>
                    <p className="text-sm text-blue-800">
                      Your contribution is processed securely. We never store your payment information.
                    </p>
                  </div>
                </div>
              </div>

              {/* Complete Contribution Button */}
              <button
                onClick={handleContribution}
                disabled={processing || !emailForInvoice}
                className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-teal-700 hover:to-teal-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Processing Contribution...
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    Complete Contribution
                  </>
                )}
              </button>

              {processing && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    Please wait while we process your contribution...
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Contribution Amount</span>
                  <span className="font-semibold">{formatCurrency(amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Processing Fee</span>
                  <span className="font-semibold text-green-600">Free</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-lg font-bold text-teal-600">{formatCurrency(amount)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">What happens next?</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    Your contribution will be processed immediately
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    You'll receive an invoice via email
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    Track your contributions in your dashboard
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;