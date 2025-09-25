import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom"; // 1. Import useParams
import axios from "axios";
import { UserContext } from "../context/UserContext.js";
import {
  Upload,
  X,
  Plus,
  Target,
  FileText,
  Tag,
  Link as LinkIcon,
  Image,
} from "lucide-react";

const EventFormPage = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const { id } = useParams(); // 2. Get the event ID from the URL if it exists

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amountToRaise: "",
    tags: [],
    imageFile: null,
    imageUrl: "",
  });

  const [currentTag, setCurrentTag] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  // 3. New useEffect to fetch event data when in "edit" mode
  useEffect(() => {
    if (!id) {
      // If there's no ID, we are in "create" mode, so do nothing.
      return;
    }

    // If there is an ID, fetch the existing event data.
    axios
      .get(`/api/events/${id}`)
      .then((response) => {
        const {
          title,
          description,
          amountToRaise,
          tags,
          imageUrl,
          imageFile,
        } = response.data;
        setFormData({
          title,
          description,
          amountToRaise,
          tags: tags || [],
          imageUrl: imageUrl || "",
          imageFile: null, // We don't pre-fill file inputs
        });

        // Set the image preview if an image exists
        if (imageUrl) {
          setImagePreview(imageUrl);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch event data:", err);
        setError("Could not load event data for editing.");
      });
  }, [id]);

  // Redirect if user is not logged in
  React.useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }
      setFormData((prev) => ({ ...prev, imageFile: file, imageUrl: "" }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setFormData((prev) => ({ ...prev, imageUrl: url, imageFile: null }));
    if (url) {
      setImagePreview(url);
    }
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()],
      }));
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleTagKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError("Title is required");
      return false;
    }
    if (!formData.description.trim()) {
      setError("Description is required");
      return false;
    }
    if (!formData.amountToRaise || formData.amountToRaise <= 0) {
      setError("Please enter a valid amount to raise");
      return false;
    }
    return true;
  };

  // 4. Update handleSubmit to handle both create (POST) and edit (PUT)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    const submitData = new FormData();
    submitData.append("title", formData.title);
    submitData.append("description", formData.description);
    submitData.append("amountToRaise", formData.amountToRaise);
    submitData.append("tags", JSON.stringify(formData.tags));
    if (formData.imageFile) {
      submitData.append("imageFile", formData.imageFile);
    }
    if (formData.imageUrl) {
      submitData.append("imageUrl", formData.imageUrl);
    }

    try {
      if (id) {
        // If ID exists, we are updating an existing event
        await axios.put(`/api/events/${id}`, submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        // Otherwise, we are creating a new event
        await axios.post("/api/events", submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      navigate("/my-campaigns"); // Redirect after success
    } catch (err) {
      setError(
        err.response?.data?.error ||
          `Failed to ${id ? "update" : "create"} event`,
      );
      console.error(`Error ${id ? "updating" : "creating"} event:`, err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            {/* 5. Dynamically change title based on mode */}
            <h1 className="text-2xl font-bold text-gray-900">
              {id ? "Edit Event" : "Create New Event"}
            </h1>
            <p className="text-gray-600 mt-1">
              {id
                ? "Update the details of your campaign."
                : "Share your cause and rally community support"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            {/* Form fields remain the same */}
            <div className="mb-6">
              <label
                htmlFor="title"
                className="flex items-center text-sm font-medium text-gray-700 mb-2"
              >
                <FileText className="h-4 w-4 mr-2" />
                Event Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="description"
                className="flex items-center text-sm font-medium text-gray-700 mb-2"
              >
                <FileText className="h-4 w-4 mr-2" />
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="6"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="amountToRaise"
                className="flex items-center text-sm font-medium text-gray-700 mb-2"
              >
                <Target className="h-4 w-4 mr-2" />
                Fundraising Goal (INR) *
              </label>
              <input
                type="number"
                id="amountToRaise"
                name="amountToRaise"
                value={formData.amountToRaise}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                min="1"
                required
              />
            </div>
            <div className="mb-6">
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Tag className="h-4 w-4 mr-2" />
                Tags
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Add tags and press Enter"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-teal-50 text-teal-700 text-sm rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-teal-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="mb-6">
              <label className="flex items-center text-sm font-medium text-gray-700 mb-4">
                <Image className="h-4 w-4 mr-2" />
                Event Image
              </label>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="imageUpload"
                    className="block text-sm text-gray-600 mb-2"
                  >
                    Upload Image File
                  </label>
                  <input
                    type="file"
                    id="imageUpload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                  />
                </div>
                <div className="flex items-center">
                  <div className="flex-1 border-t border-gray-300"></div>
                  <span className="px-4 text-sm text-gray-500">OR</span>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>
                <div>
                  <label
                    htmlFor="imageUrl"
                    className="block text-sm text-gray-600 mb-2"
                  >
                    Image URL
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                    <input
                      type="url"
                      id="imageUrl"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleImageUrlChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
                {imagePreview && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Preview:</p>
                    <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
              >
                {/* 6. Dynamically change button text based on mode */}
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Saving...
                  </div>
                ) : id ? (
                  "Update Event"
                ) : (
                  "Create Event"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventFormPage;
