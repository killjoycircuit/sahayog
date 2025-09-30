import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { UserContext } from "../context/UserContext";
import {
  Heart,
  Calendar,
  DollarSign,
  FileText,
  Mail,
  TrendingUp,
  Eye,
  Download,
  Filter,
  Search,
  ChevronRight,
  Award,
  Target,
} from "lucide-react";

const MyContributionsPage = () => {
  const { user } = useContext(UserContext);
  const [contributions, setContributions] = useState([]);
  const [stats, setStats] = useState({
    totalContributions: 0,
    totalAmount: 0,
    avgContribution: 0,
    completedContributions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });
  const [selectedContribution, setSelectedContribution] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [emailingInvoice, setEmailingInvoice] = useState(false);

  useEffect(() => {
    if (user) {
      fetchContributions();
      fetchStats();
    }
  }, [user, pagination.currentPage]);

  const fetchContributions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/contributions/user/${user.id}`, {
        params: {
          page: pagination.currentPage,
          limit: 6,
        },
      });

      setContributions(response.data.contributions);
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        total: response.data.total,
      });
    } catch (err) {
      setError("Failed to fetch contributions");
      console.error("Error fetching contributions:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`/api/contributions/stats/${user.id}`);
      setStats(response.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const handleViewInvoice = async (contributionId) => {
    try {
      const response = await axios.get(
        `/api/contributions/${contributionId}/invoice`,
      );
      setSelectedContribution(response.data.invoice);
      setShowInvoiceModal(true);
    } catch (err) {
      toast.error("Failed to load invoice");
      console.error("Error fetching invoice:", err);
    }
  };

  const handleEmailInvoice = async (contributionId, email) => {
    try {
      setEmailingInvoice(true);
      await axios.post(`/api/contributions/${contributionId}/email-invoice`, {
        email: email || user.email,
      });
      toast.success("Invoice sent to your email!");
    } catch (err) {
      toast.error("Failed to send invoice email");
      console.error("Error sending invoice email:", err);
    } finally {
      setEmailingInvoice(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getProgressPercentage = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  const ContributionCard = ({ contribution }) => {
    const progress = getProgressPercentage(
      contribution.eventId.currentAmount,
      contribution.eventId.amountToRaise,
    );

    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        {/* Event Image */}
        <div className="h-32 bg-gray-200 relative">
          {contribution.eventId.imageUrl ? (
            <img
              src={contribution.eventId.imageUrl}
              alt={contribution.eventId.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-100 to-teal-200">
              <Heart className="h-8 w-8 text-teal-600" />
            </div>
          )}
          <div className="absolute top-2 right-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                contribution.status === "completed"
                  ? "bg-green-100 text-green-800"
                  : contribution.status === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {contribution.status}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
            {contribution.eventId.title}
          </h3>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-1" />
              {formatDate(contribution.contributionDate)}
            </div>
            <div className="text-lg font-bold text-teal-600">
              {formatCurrency(contribution.amount)}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Campaign Progress</span>
              <span>{progress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-teal-500 to-teal-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => handleViewInvoice(contribution._id)}
              className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
            >
              <Eye className="h-4 w-4 mr-1" />
              View Invoice
            </button>
            <button
              onClick={() => handleEmailInvoice(contribution._id)}
              disabled={emailingInvoice}
              className="flex-1 bg-teal-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-teal-700 transition-colors flex items-center justify-center disabled:opacity-50"
            >
              <Mail className="h-4 w-4 mr-1" />
              Email Invoice
            </button>
          </div>
        </div>
      </div>
    );
  };

  const StatsCard = ({
    icon: Icon,
    title,
    value,
    subtitle,
    color = "teal",
  }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full bg-${color}-100 mr-4`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  const InvoiceModal = () => {
    if (!selectedContribution) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Invoice Details
              </h2>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Invoice Number
                  </label>
                  <p className="text-lg font-semibold">
                    {selectedContribution.invoiceNumber}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Date
                  </label>
                  <p className="text-lg">
                    {formatDate(selectedContribution.contributionDate)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Contributor
                  </label>
                  <p className="text-lg">
                    {selectedContribution.contributorName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Email
                  </label>
                  <p className="text-lg">
                    {selectedContribution.contributorEmail}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Campaign
                </label>
                <p className="text-lg">{selectedContribution.eventTitle}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Campaign Creator
                </label>
                <p className="text-lg">{selectedContribution.eventCreator}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Transaction ID
                  </label>
                  <p className="text-lg font-mono">
                    {selectedContribution.transactionId}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Status
                  </label>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      selectedContribution.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {selectedContribution.status}
                  </span>
                </div>
              </div>

              <div className="bg-teal-50 p-4 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-3xl font-bold text-teal-600">
                    {formatCurrency(selectedContribution.amount)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => handleEmailInvoice(selectedContribution._id)}
                disabled={emailingInvoice}
                className="flex-1 bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors disabled:opacity-50"
              >
                {emailingInvoice ? "Sending..." : "Email Invoice"}
              </button>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Please Login
          </h1>
          <p className="text-gray-600 mb-6">
            You need to be logged in to view your contributions.
          </p>
          <Link
            to="/login"
            className="bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors"
          >
            Login Now
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your contributions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Contributions
          </h1>
          <p className="text-gray-600">
            Track your support for amazing campaigns
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            icon={Heart}
            title="Total Contributions"
            value={stats.totalContributions}
            subtitle="campaigns supported"
          />
          <StatsCard
            icon={DollarSign}
            title="Total Amount"
            value={formatCurrency(stats.totalAmount)}
            subtitle="contributed"
          />
          <StatsCard
            icon={TrendingUp}
            title="Average Contribution"
            value={formatCurrency(stats.avgContribution)}
            subtitle="per campaign"
          />
          <StatsCard
            icon={Award}
            title="Completed"
            value={stats.completedContributions}
            subtitle="successful contributions"
          />
        </div>

        {/* Contributions Grid */}
        {error ? (
          <div className="text-center text-red-600 py-8">
            <p>{error}</p>
            <button
              onClick={fetchContributions}
              className="mt-4 bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : contributions.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No contributions yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start supporting amazing campaigns and make a difference!
            </p>
            <Link
              to="/events"
              className="bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors inline-flex items-center gap-2"
            >
              <Target className="h-5 w-5" />
              Explore Campaigns
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {contributions.map((contribution) => (
                <ContributionCard
                  key={contribution._id}
                  contribution={contribution}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={() =>
                    setPagination({
                      ...pagination,
                      currentPage: pagination.currentPage - 1,
                    })
                  }
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <span className="px-4 py-2 text-gray-700">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>

                <button
                  onClick={() =>
                    setPagination({
                      ...pagination,
                      currentPage: pagination.currentPage + 1,
                    })
                  }
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Invoice Modal */}
        {showInvoiceModal && <InvoiceModal />}
      </div>
    </div>
  );
};

export default MyContributionsPage;
