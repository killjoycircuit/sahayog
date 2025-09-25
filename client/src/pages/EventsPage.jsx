import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { UserContext } from "../context/UserContext";
import {
  Calendar,
  MapPin,
  Target,
  Users,
  Heart,
  Share2,
  Filter,
  Search,
  Plus,
} from "lucide-react";

const EventsPage = () => {
  const { user } = useContext(UserContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });
  const [filters, setFilters] = useState({
    tags: "",
    isActive: true,
    search: "",
  });

  useEffect(() => {
    fetchEvents();
  }, [pagination.currentPage, filters]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: 9,
        isActive: filters.isActive,
      };

      if (filters.tags) {
        params.tags = filters.tags;
      }

      const response = await axios.get("/api/events", { params });
      setEvents(response.data.events);
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        total: response.data.total,
      });
    } catch (err) {
      setError("Failed to fetch events");
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleContribute = async (eventId, amount) => {
    if (!user) {
      toast.error("Please login to contribute");
      return;
    }

    const contributionAmount = parseFloat(amount);
    if (!contributionAmount || contributionAmount <= 0) {
      toast.error("Please enter a valid contribution amount");
      return;
    }

    try {
      const response = await axios.patch(`/api/events/${eventId}/contribute`, {
        amount: contributionAmount,
      });

      // Update the event in the local state
      setEvents(
        events.map((event) =>
          event._id === eventId
            ? { ...event, currentAmount: response.data.currentAmount }
            : event,
        ),
      );

      toast.success(
        `Successfully contributed ₹${contributionAmount.toLocaleString()}!`,
      );
    } catch (err) {
      console.error("Error contributing to event:", err);
      const errorMessage =
        err.response?.data?.error || "Failed to process contribution";
      toast.error(errorMessage);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getProgressPercentage = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  const EventCard = ({ event }) => {
    const [contributionAmount, setContributionAmount] = useState("");
    const [showContribute, setShowContribute] = useState(false);

    const progress = getProgressPercentage(
      event.currentAmount,
      event.amountToRaise,
    );

    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        {/* Event Image */}
        <div className="h-48 bg-gray-200 relative">
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-100 to-teal-200">
              <Heart className="h-16 w-16 text-teal-600" />
            </div>
          )}
          <div className="absolute top-3 right-3">
            <button className="bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors">
              <Share2 className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Event Content */}
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {event.title}
          </h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {event.description}
          </p>

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {event.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
              {event.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{event.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Raised: {formatCurrency(event.currentAmount)}</span>
              <span>Goal: {formatCurrency(event.amountToRaise)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-right text-xs text-gray-500 mt-1">
              {progress.toFixed(1)}% funded
            </div>
          </div>

          {/* Creator Info */}
          <div className="flex items-center mb-4">
            {event.createdBy?.avatar ? (
              <img
                src={event.createdBy.avatar}
                alt={event.createdBy.firstName}
                className="w-8 h-8 rounded-full object-cover mr-2"
              />
            ) : (
              <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white text-sm font-medium mr-2">
                {event.createdBy?.firstName?.charAt(0) || "U"}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">
                {event.createdBy?.firstName} {event.createdBy?.lastName}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(event.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Link
              to={`/events/${event._id}`}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors text-center"
            >
              View Details
            </Link>
            {user && (
              <button
                onClick={() => setShowContribute(!showContribute)}
                className="flex-1 bg-teal-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-700 transition-colors"
              >
                Contribute
              </button>
            )}
          </div>

          {/* Contribution Form */}
          {showContribute && user && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Amount (₹)"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  min="1"
                />
                <button
                  onClick={() => {
                    if (
                      contributionAmount &&
                      parseFloat(contributionAmount) > 0
                    ) {
                      handleContribute(event._id, contributionAmount);
                      setContributionAmount("");
                      setShowContribute(false);
                    }
                  }}
                  className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors"
                >
                  Donate
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading events...</p>
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">All Events</h1>
              <p className="text-gray-600 mt-2">
                Discover and support meaningful causes
              </p>
            </div>
            {user && (
              <Link
                to="/create-event"
                className="bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Create Event
              </Link>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by tags (comma separated)"
                  value={filters.tags}
                  onChange={(e) =>
                    setFilters({ ...filters, tags: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.isActive}
                  onChange={(e) =>
                    setFilters({ ...filters, isActive: e.target.checked })
                  }
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm text-gray-700">Active only</span>
              </label>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {error ? (
          <div className="text-center text-red-600 py-8">
            <p>{error}</p>
            <button
              onClick={fetchEvents}
              className="mt-4 bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No events found
            </h3>
            <p className="text-gray-600 mb-6">
              Be the first to create an event and make a difference!
            </p>
            {user && (
              <Link
                to="/create-event"
                className="bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors inline-flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Create Event
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {events.map((event) => (
                <EventCard key={event._id} event={event} />
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
      </div>
    </div>
  );
};

export default EventsPage;
