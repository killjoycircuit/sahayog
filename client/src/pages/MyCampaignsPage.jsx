import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { UserContext } from "../context/UserContext";
import { Plus, Heart, Edit, Trash2 } from "lucide-react";

const MyCampaignsPage = () => {
  const { user, ready } = useContext(UserContext);
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (ready) {
      if (!user) {
        navigate("/login");
        return;
      }

      const fetchMyCampaigns = async () => {
        try {
          setLoading(true);
          const { data } = await axios.get("/api/my-events");
          setCampaigns(data);
          setError(null);
        } catch (err) {
          setError("Failed to fetch your campaigns. Please try again later.");
          console.error("Error fetching campaigns:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchMyCampaigns();
    }
  }, [user, ready, navigate]);

  // --- START: ADDED DELETE FUNCTIONALITY ---
  const handleDelete = async (campaignId) => {
    // A simple confirmation dialog. For a better user experience,
    // you might want to replace this with a custom modal component.
    if (
      window.confirm(
        "Are you sure you want to delete this campaign? This action cannot be undone.",
      )
    ) {
      try {
        await axios.delete(`/api/events/${campaignId}`);
        // Update the UI immediately by removing the deleted campaign from the state
        setCampaigns((currentCampaigns) =>
          currentCampaigns.filter((c) => c._id !== campaignId),
        );
        toast.success("Campaign deleted successfully");
      } catch (err) {
        console.error("Error deleting campaign:", err);
        const errorMessage =
          err.response?.data?.error ||
          "Failed to delete the campaign. Please try again.";
        toast.error(errorMessage);
      }
    }
  };
  // --- END: ADDED DELETE FUNCTIONALITY ---

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getProgressPercentage = (current, target) => {
    if (!target || target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  if (!ready || loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your campaigns...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Campaigns</h1>
            <p className="text-gray-600 mt-2">
              Manage your fundraising events here.
            </p>
          </div>
          <Link
            to="/create-event"
            className="bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Create New Campaign
          </Link>
        </div>

        {error ? (
          <div className="text-center text-red-600 py-8 bg-red-50 rounded-lg">
            <p>{error}</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-lg">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              You haven't created any campaigns yet.
            </h3>
            <p className="text-gray-600 mb-6">
              Start a new campaign to make a difference!
            </p>
            <Link
              to="/create-event"
              className="bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Create Campaign
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <div
                key={campaign._id}
                className="bg-white rounded-lg shadow-md overflow-hidden transition-shadow hover:shadow-lg flex flex-col"
              >
                {campaign.imageUrl ? (
                  <img
                    src={campaign.imageUrl}
                    alt={campaign.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 flex items-center justify-center bg-gradient-to-br from-teal-100 to-teal-200">
                    <Heart className="h-16 w-16 text-teal-600" />
                  </div>
                )}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 truncate">
                    {campaign.title}
                  </h3>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>
                        Raised: {formatCurrency(campaign.currentAmount)}
                      </span>
                      <span>
                        Goal: {formatCurrency(campaign.amountToRaise)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-teal-600 h-2 rounded-full"
                        style={{
                          width: `${getProgressPercentage(
                            campaign.currentAmount,
                            campaign.amountToRaise,
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  {/* --- START: ADDED BUTTONS --- */}
                  <div className="mt-auto pt-4 border-t border-gray-200 flex gap-2">
                    <Link
                      to={`/edit-event/${campaign._id}`} // Note: You'll need to create this page
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(campaign._id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                  {/* --- END: ADDED BUTTONS --- */}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCampaignsPage;
