import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToastHelpers } from "~/components/common/ToastProvider";
import { AdminGuard } from "~/components/common/AdminGuard";

interface PendingItem {
  id: string;
  name: string;
  type: "actor" | "musical" | "theater";
  dateCreated?: string;
  creator?: string;
  description?: string;
}

interface ApiActor {
  id: string;
  name: string;
  verified: boolean;
  bio?: string;
  createdAt?: string;
}

interface ApiMusical {
  id: string;
  title: string;
  verified: boolean;
  composer?: string;
  year?: number;
  createdAt?: string;
}

interface ApiTheater {
  id: string;
  name: string;
  verified: boolean;
  city?: string;
  address?: string;
  createdAt?: string;
}

export default function PendingApprovalsPage() {
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<"all" | "actor" | "musical" | "theater">(
    "all"
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { success, error: showError } = useToastHelpers();

  // Check for URL query parameters to set initial filter
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const filterParam = urlParams.get("filter");
    if (filterParam && ["actor", "musical", "theater"].includes(filterParam)) {
      setFilter(filterParam as "actor" | "musical" | "theater");
    }
  }, []);

  const fetchPendingItems = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch all data types
      const [actorsRes, musicalsRes, theatersRes] = await Promise.all([
        fetch("http://localhost:3000/v2/actor", { headers }),
        fetch("http://localhost:3000/v2/musical", { headers }),
        fetch("http://localhost:3000/v2/theater", { headers }),
      ]);

      const [actors, musicals, theaters] = await Promise.all([
        actorsRes.ok ? actorsRes.json() : [],
        musicalsRes.ok ? musicalsRes.json() : [],
        theatersRes.ok ? theatersRes.json() : [],
      ]);

      // Filter for unverified items and convert to common format
      const pendingActors: PendingItem[] = (actors as ApiActor[])
        .filter((actor) => !actor.verified)
        .map((actor) => ({
          id: actor.id,
          name: actor.name,
          type: "actor" as const,
          dateCreated: actor.createdAt,
          description:
            actor.bio?.substring(0, 100) +
            (actor.bio && actor.bio.length > 100 ? "..." : ""),
        }));

      const pendingMusicals: PendingItem[] = (musicals as ApiMusical[])
        .filter((musical) => !musical.verified)
        .map((musical) => ({
          id: musical.id,
          name: musical.title,
          type: "musical" as const,
          dateCreated: musical.createdAt,
          description: `${musical.composer ? `By ${musical.composer}` : ""}${musical.year ? ` (${musical.year})` : ""}`,
        }));

      const pendingTheaters: PendingItem[] = (theaters as ApiTheater[])
        .filter((theater) => !theater.verified)
        .map((theater) => ({
          id: theater.id,
          name: theater.name,
          type: "theater" as const,
          dateCreated: theater.createdAt,
          description: `${theater.city ? `${theater.city}` : ""}${theater.address ? ` - ${theater.address}` : ""}`,
        }));

      const allPending = [
        ...pendingActors,
        ...pendingMusicals,
        ...pendingTheaters,
      ].sort(
        (a, b) =>
          new Date(b.dateCreated || "").getTime() -
          new Date(a.dateCreated || "").getTime()
      );

      setPendingItems(allPending);
    } catch (error) {
      console.error("Failed to fetch pending items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingItems();
  }, []);

  const handleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map((item) => item.id)));
    }
  };

  const handleBulkApprove = async () => {
    if (selectedItems.size === 0) return;

    setIsProcessing(true);
    const token = localStorage.getItem("authToken");
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    try {
      // Group selected items by type for batch processing
      const itemsByType = Array.from(selectedItems).reduce(
        (acc, itemId) => {
          const item = pendingItems.find((p) => p.id === itemId);
          if (item) {
            if (!acc[item.type]) acc[item.type] = [];
            acc[item.type].push(itemId);
          }
          return acc;
        },
        {} as Record<string, string[]>
      );

      // Process approvals for each type
      const approvalPromises = Object.entries(itemsByType).flatMap(
        ([type, ids]) =>
          ids.map((id) =>
            fetch(`http://localhost:3000/v2/${type}/${id}/verify`, {
              method: "PUT",
              headers,
            })
          )
      );

      await Promise.all(approvalPromises);

      // Refresh the list
      await fetchPendingItems();
      setSelectedItems(new Set());

      success(
        "Approval Successful",
        `Successfully approved ${selectedItems.size} items!`
      );
    } catch (error) {
      console.error("Failed to approve items:", error);
      showError(
        "Approval Failed",
        "Failed to approve some items. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedItems.size === 0) return;

    if (
      !confirm(
        `Are you sure you want to delete ${selectedItems.size} items? This action cannot be undone.`
      )
    ) {
      return;
    }

    setIsProcessing(true);
    const token = localStorage.getItem("authToken");
    const headers = { Authorization: `Bearer ${token}` };

    try {
      // Group selected items by type for batch processing
      const itemsByType = Array.from(selectedItems).reduce(
        (acc, itemId) => {
          const item = pendingItems.find((p) => p.id === itemId);
          if (item) {
            if (!acc[item.type]) acc[item.type] = [];
            acc[item.type].push(itemId);
          }
          return acc;
        },
        {} as Record<string, string[]>
      );

      // Process deletions for each type
      const deletionPromises = Object.entries(itemsByType).flatMap(
        ([type, ids]) =>
          ids.map((id) =>
            fetch(`http://localhost:3000/v2/${type}/${id}`, {
              method: "DELETE",
              headers,
            })
          )
      );

      await Promise.all(deletionPromises);

      // Refresh the list
      await fetchPendingItems();
      setSelectedItems(new Set());

      success(
        "Deletion Successful",
        `Successfully deleted ${selectedItems.size} items.`
      );
    } catch (error) {
      console.error("Failed to delete items:", error);
      showError(
        "Deletion Failed",
        "Failed to delete some items. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewItem = (item: PendingItem) => {
    switch (item.type) {
      case "actor":
        navigate(`/actors/${item.id}`);
        break;
      case "musical":
        navigate(`/musicals/${item.id}`);
        break;
      case "theater":
        navigate(`/theaters/${item.id}`);
        break;
    }
  };

  const filteredItems = pendingItems.filter(
    (item) => filter === "all" || item.type === filter
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "actor":
        return "👤";
      case "musical":
        return "🎭";
      case "theater":
        return "🏛️";
      default:
        return "📄";
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      actor: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
      musical:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      theater:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    };

    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex-1 ml-16 md:ml-64 min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-64 mx-auto mb-8"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 bg-gray-300 dark:bg-gray-700 rounded"
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminGuard>
      <div className="flex-1 ml-16 md:ml-64 min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Pending Approvals
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Review and approve items submitted by users
          </p>
        </div>

        {/* Filters and Actions */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded text-sm font-medium ${
                filter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              All ({pendingItems.length})
            </button>
            <button
              onClick={() => setFilter("actor")}
              className={`px-3 py-1 rounded text-sm font-medium ${
                filter === "actor"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              👤 Actors ({pendingItems.filter((i) => i.type === "actor").length}
              )
            </button>
            <button
              onClick={() => setFilter("musical")}
              className={`px-3 py-1 rounded text-sm font-medium ${
                filter === "musical"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              🎭 Musicals (
              {pendingItems.filter((i) => i.type === "musical").length})
            </button>
            <button
              onClick={() => setFilter("theater")}
              className={`px-3 py-1 rounded text-sm font-medium ${
                filter === "theater"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              🏛️ Theaters (
              {pendingItems.filter((i) => i.type === "theater").length})
            </button>
          </div>

          {/* Bulk Actions */}
          {selectedItems.size > 0 && (
            <div className="flex gap-2">
              <button
                onClick={handleBulkApprove}
                disabled={isProcessing}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                ✓ Approve {selectedItems.size}
              </button>
              <button
                onClick={handleBulkReject}
                disabled={isProcessing}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                ✕ Delete {selectedItems.size}
              </button>
            </div>
          )}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No pending approvals
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              All items have been reviewed and approved.
            </p>
          </div>
        ) : (
          <>
            {/* Select All */}
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                checked={
                  selectedItems.size === filteredItems.length &&
                  filteredItems.length > 0
                }
                onChange={handleSelectAll}
                className="mr-2 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label className="text-sm text-gray-700 dark:text-gray-300">
                Select all {filteredItems.length} items
              </label>
            </div>

            {/* Pending Items List */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`p-4 ${index !== filteredItems.length - 1 ? "border-b border-gray-200 dark:border-gray-700" : ""} hover:bg-gray-50 dark:hover:bg-gray-700`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">
                            {getTypeIcon(item.type)}
                          </span>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {item.name}
                          </h3>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeBadge(item.type)}`}
                          >
                            {item.type}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {item.description}
                          </p>
                        )}
                        {item.dateCreated && (
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            Submitted{" "}
                            {new Date(item.dateCreated).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewItem(item)}
                        className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      </div>
    </AdminGuard>
  );
}
