import React, { useState, useEffect } from "react";
import { useAuth } from "~/hooks/useAuth";
import { useNavigation } from "~/components/layout/NavigationProvider";
import { ImageUpload } from "~/components/common/ImageUpload";
import { BackToDashboardButton } from "~/components/common/BackToDashboardButton";

interface Performance {
  id: string;
  posterUrl: string;
  date: string;
  theaterName: string;
  theaterId: string;
  musicalName: string;
  productionId?: string;
  posterId?: string;
}

interface Musical {
  id: string;
  name: string;
}

interface Theater {
  id: string;
  name: string;
  city: string;
  verified: boolean;
}

type ViewMode = "list" | "detail" | "form";

export default function PerformanceManagement() {
  // State management
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [musicals, setMusicals] = useState<Musical[]>([]);
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedPerformanceId, setSelectedPerformanceId] = useState<
    string | null
  >(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    date: "",
    productionId: "",
    theaterId: "",
    posterId: "",
    posterUrl: "",
  });
  const [imageError, setImageError] = useState<string | null>(null);

  const { isLoggedIn, isAdmin } = useAuth();
  const { setActiveSection } = useNavigation();

  // API calls
  const fetchPerformances = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("authToken");
      const response = await fetch("http://localhost:3000/v2/performance", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPerformances(data);
      } else {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      console.error("Error fetching performances:", err);
      setError("Failed to load performances. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchReferenceData = async () => {
    const token = localStorage.getItem("authToken");

    try {
      // Fetch musicals
      const musicalsResponse = await fetch("http://localhost:3000/v2/musical", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (musicalsResponse.ok) {
        const musicalsData = await musicalsResponse.json();
        setMusicals(musicalsData);
      }

      // Fetch theaters (only verified ones)
      const theatersResponse = await fetch("http://localhost:3000/v2/theater", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (theatersResponse.ok) {
        const theatersData = await theatersResponse.json();
        setTheaters(
          theatersData.filter((theater: Theater) => theater.verified)
        );
      }
    } catch (err) {
      console.error("Error fetching reference data:", err);
    }
  };

  const fetchPerformanceById = async (id: string) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `http://localhost:3000/v2/performance/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFormData({
          date: data.date || "",
          productionId: data.productionId || "",
          theaterId: data.theaterId || "",
          posterId: data.posterId || "",
          posterUrl: data.posterUrl || "",
        });
      }
    } catch (err) {
      console.error("Error fetching performance:", err);
    }
  };

  const savePerformance = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const url = isEditing
        ? `http://localhost:3000/v2/performance/${selectedPerformanceId}`
        : "http://localhost:3000/v2/performance";

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchPerformances();
        setViewMode("list");
        setSelectedPerformanceId(null);
        setIsEditing(false);
        resetForm();
      } else {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      console.error("Error saving performance:", err);
      setError("Failed to save performance. Please try again.");
    }
  };

  const deletePerformance = async (id: string) => {
    if (confirm("Are you sure you want to delete this performance?")) {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(
          `http://localhost:3000/v2/performance/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          await fetchPerformances();
          if (selectedPerformanceId === id) {
            setViewMode("list");
            setSelectedPerformanceId(null);
          }
        } else {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
      } catch (err) {
        console.error("Error deleting performance:", err);
        setError("Failed to delete performance. Please try again.");
      }
    }
  };

  // Initialize data
  useEffect(() => {
    if (isLoggedIn) {
      fetchPerformances();
      fetchReferenceData();
    }
  }, [isLoggedIn]);

  // Event handlers
  const handleViewDetail = (performance: Performance) => {
    setSelectedPerformanceId(performance.id);
    setViewMode("detail");
  };

  const handleEdit = async (performance: Performance) => {
    setSelectedPerformanceId(performance.id);
    setIsEditing(true);
    await fetchPerformanceById(performance.id);
    setViewMode("form");
  };

  const handleAdd = () => {
    setSelectedPerformanceId(null);
    setIsEditing(false);
    resetForm();
    setViewMode("form");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedPerformanceId(null);
    setIsEditing(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      date: "",
      productionId: "",
      theaterId: "",
      posterId: "",
      posterUrl: "",
    });
    setImageError(null);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    savePerformance();
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Utility functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Filter performances
  const filteredPerformances = performances.filter(
    (performance) =>
      performance.musicalName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      performance.theaterName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      formatDate(performance.date)
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  // Get selected performance
  const selectedPerformance = selectedPerformanceId
    ? performances.find((p) => p.id === selectedPerformanceId)
    : null;

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading performances...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">{error}</div>
        <button
          onClick={() => {
            setError(null);
            fetchPerformances();
          }}
          className="mt-2 text-red-600 hover:text-red-500 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  // Form view
  if (viewMode === "form") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackToList}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            ← Back to Performances
          </button>
          <h2 className="text-2xl font-semibold">
            {isEditing ? "Edit Performance" : "Add New Performance"}
          </h2>
        </div>

        <form onSubmit={handleFormSubmit} className="max-w-md space-y-4">
          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Performance Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="productionId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Musical
            </label>
            <select
              id="productionId"
              name="productionId"
              value={formData.productionId}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a musical...</option>
              {musicals.map((musical) => (
                <option key={musical.id} value={musical.id}>
                  {musical.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="theaterId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Theater
            </label>
            <select
              id="theaterId"
              name="theaterId"
              value={formData.theaterId}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a theater...</option>
              {theaters.map((theater) => (
                <option key={theater.id} value={theater.id}>
                  {theater.name} - {theater.city}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Performance Poster
            </label>
            <ImageUpload
              imageType="poster"
              currentImageUrl={formData.posterUrl}
              onUploadSuccess={(imageData) => {
                setFormData((prev) => ({
                  ...prev,
                  posterId: imageData.imageId,
                  posterUrl: imageData.url,
                }));
              }}
              onUploadError={setImageError}
            />
            {imageError && (
              <p className="mt-1 text-sm text-red-600">{imageError}</p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {isEditing ? "Update Performance" : "Create Performance"}
            </button>
            <button
              type="button"
              onClick={handleBackToList}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Detail view
  if (viewMode === "detail" && selectedPerformance) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackToList}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            ← Back to Performances
          </button>
          <h2 className="text-2xl font-semibold">Performance Details</h2>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">
                {selectedPerformance.musicalName}
              </h3>
              <div className="space-y-2">
                <p>
                  <strong>Date:</strong> {formatDate(selectedPerformance.date)}
                </p>
                <p>
                  <strong>Theater:</strong> {selectedPerformance.theaterName}
                </p>
              </div>

              {isAdmin && (
                <div className="flex gap-2 mt-6">
                  <button
                    onClick={() => handleEdit(selectedPerformance)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Edit Performance
                  </button>
                  <button
                    onClick={() => deletePerformance(selectedPerformance.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Delete Performance
                  </button>
                </div>
              )}
            </div>

            {selectedPerformance.posterUrl && (
              <div>
                <img
                  src={selectedPerformance.posterUrl}
                  alt={`${selectedPerformance.musicalName} performance poster`}
                  className="w-full max-w-sm rounded-lg shadow-md"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <BackToDashboardButton />
          <h2 className="text-2xl font-semibold">Performances</h2>
        </div>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Add Performance
        </button>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <input
          type="text"
          placeholder="Search performances..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Performance List */}
      {filteredPerformances.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {searchTerm
            ? "No performances found matching your search."
            : "No performances found."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Musical
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Theater
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPerformances.map((performance) => (
                <tr
                  key={performance.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleViewDetail(performance)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {performance.posterUrl && (
                        <img
                          src={performance.posterUrl}
                          alt={`${performance.musicalName} poster`}
                          className="w-12 h-16 object-cover rounded mr-4"
                        />
                      )}
                      <div className="text-sm font-medium text-gray-900">
                        {performance.musicalName}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(performance.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {performance.theaterName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetail(performance);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      View
                    </button>
                    {isAdmin && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(performance);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePerformance(performance.id);
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
