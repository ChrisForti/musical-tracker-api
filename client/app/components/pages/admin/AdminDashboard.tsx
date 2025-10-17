import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminGuard } from "~/components/common/AdminGuard";

interface DashboardStats {
  actors: {
    total: number;
    verified: number;
    pending: number;
  };
  musicals: {
    total: number;
    verified: number;
    pending: number;
  };
  performances: {
    total: number;
    upcoming: number;
    past: number;
  };
  theaters: {
    total: number;
    verified: number;
    pending: number;
  };
  roles: {
    total: number;
  };
  castings: {
    total: number;
    active: number;
  };
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("authToken");

        // Fetch data from all endpoints
        const [
          actorsRes,
          musicalsRes,
          performancesRes,
          theatersRes,
          rolesRes,
          castingsRes,
        ] = await Promise.all([
          fetch("http://localhost:3000/v2/actor", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:3000/v2/musical", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:3000/v2/performance", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:3000/v2/theater", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:3000/v2/role", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:3000/v2/casting", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const [actors, musicals, performances, theaters, roles, castings] =
          await Promise.all([
            actorsRes.ok ? actorsRes.json() : [],
            musicalsRes.ok ? musicalsRes.json() : [],
            performancesRes.ok ? performancesRes.json() : [],
            theatersRes.ok ? theatersRes.json() : [],
            rolesRes.ok ? rolesRes.json() : [],
            castingsRes.ok ? castingsRes.json() : [],
          ]);

        const currentDate = new Date();

        setStats({
          actors: {
            total: actors.length,
            verified: actors.filter((a: any) => a.verified).length,
            pending: actors.filter((a: any) => !a.verified).length,
          },
          musicals: {
            total: musicals.length,
            verified: musicals.filter((m: any) => m.verified).length,
            pending: musicals.filter((m: any) => !m.verified).length,
          },
          performances: {
            total: performances.length,
            upcoming: performances.filter(
              (p: any) => new Date(p.date) > currentDate
            ).length,
            past: performances.filter(
              (p: any) => new Date(p.date) <= currentDate
            ).length,
          },
          theaters: {
            total: theaters.length,
            verified: theaters.filter((t: any) => t.verified).length,
            pending: theaters.filter((t: any) => !t.verified).length,
          },
          roles: {
            total: roles.length,
          },
          castings: {
            total: castings.length,
            active: castings.filter(
              (c: any) => c.status === "active" || !c.status
            ).length,
          },
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-64 mx-auto mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
                >
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center text-gray-500 dark:text-gray-400">
          Failed to load dashboard statistics
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Actors",
      total: stats.actors.total,
      verified: stats.actors.verified,
      pending: stats.actors.pending,
      color: "teal",
      route: "/actors",
      icon: "👤",
    },
    {
      title: "Musicals",
      total: stats.musicals.total,
      verified: stats.musicals.verified,
      pending: stats.musicals.pending,
      color: "purple",
      route: "/musicals",
      icon: "🎭",
    },
    {
      title: "Performances",
      total: stats.performances.total,
      verified: stats.performances.upcoming,
      pending: stats.performances.past,
      color: "blue",
      route: "/performances",
      icon: "🎪",
      labels: { verified: "Upcoming", pending: "Past" },
    },
    {
      title: "Theaters",
      total: stats.theaters.total,
      verified: stats.theaters.verified,
      pending: stats.theaters.pending,
      color: "green",
      route: "/theaters",
      icon: "🏛️",
    },
    {
      title: "Roles",
      total: stats.roles.total,
      verified: 0,
      pending: 0,
      color: "amber",
      route: "/roles",
      icon: "🎪",
      simple: true,
    },
    {
      title: "Castings",
      total: stats.castings.total,
      verified: stats.castings.active,
      pending: stats.castings.total - stats.castings.active,
      color: "red",
      route: "/castings",
      icon: "🎬",
      labels: { verified: "Active", pending: "Inactive" },
    },
  ];

  return (
    <AdminGuard>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Overview of all musical theater data and pending approvals
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(card.route)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {card.icon} {card.title}
              </h3>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {card.total}
              </span>
            </div>

            {!card.simple && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-green-600 dark:text-green-400">
                    {card.labels?.verified || "Verified"}: {card.verified}
                  </span>
                  <span className="text-yellow-600 dark:text-yellow-400">
                    {card.labels?.pending || "Pending"}: {card.pending}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`bg-${card.color}-500 h-2 rounded-full`}
                    style={{
                      width: `${card.total > 0 ? (card.verified / card.total) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}

            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Click to manage →
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate("/musicals/new")}
            className="flex flex-col items-center p-4 text-center border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="text-2xl mb-2">➕</span>
            <span className="text-sm font-medium">Add Musical</span>
          </button>
          <button
            onClick={() => navigate("/actors/new")}
            className="flex flex-col items-center p-4 text-center border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="text-2xl mb-2">👤</span>
            <span className="text-sm font-medium">Add Actor</span>
          </button>
          <button
            onClick={() => navigate("/performances/new")}
            className="flex flex-col items-center p-4 text-center border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="text-2xl mb-2">🎪</span>
            <span className="text-sm font-medium">Add Performance</span>
          </button>
          <button
            onClick={() => navigate("/theaters/new")}
            className="flex flex-col items-center p-4 text-center border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="text-2xl mb-2">🏛️</span>
            <span className="text-sm font-medium">Add Theater</span>
          </button>
        </div>
      </div>

      {/* Pending Approvals */}
      {(stats.actors.pending > 0 ||
        stats.musicals.pending > 0 ||
        stats.theaters.pending > 0) && (
        <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200">
              ⚠️ Items Pending Approval
            </h2>
            <button
              onClick={() => navigate("/admin/pending")}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
            >
              Review All
            </button>
          </div>
          <div className="space-y-3">
            {stats.actors.pending > 0 && (
              <div className="flex justify-between items-center">
                <p className="text-yellow-700 dark:text-yellow-300">
                  • {stats.actors.pending} actors waiting for verification
                </p>
                <button
                  onClick={() => navigate("/admin/pending?filter=actor")}
                  className="px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                >
                  Review Actors
                </button>
              </div>
            )}
            {stats.musicals.pending > 0 && (
              <div className="flex justify-between items-center">
                <p className="text-yellow-700 dark:text-yellow-300">
                  • {stats.musicals.pending} musicals waiting for verification
                </p>
                <button
                  onClick={() => navigate("/admin/pending?filter=musical")}
                  className="px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                >
                  Review Musicals
                </button>
              </div>
            )}
            {stats.theaters.pending > 0 && (
              <div className="flex justify-between items-center">
                <p className="text-yellow-700 dark:text-yellow-300">
                  • {stats.theaters.pending} theaters waiting for verification
                </p>
                <button
                  onClick={() => navigate("/admin/pending?filter=theater")}
                  className="px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                >
                  Review Theaters
                </button>
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-yellow-200 dark:border-yellow-700">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              Total:{" "}
              {stats.actors.pending +
                stats.musicals.pending +
                stats.theaters.pending}{" "}
              items need your attention
            </p>
          </div>
        </div>
      )}
      </div>
    </AdminGuard>
  );
}
