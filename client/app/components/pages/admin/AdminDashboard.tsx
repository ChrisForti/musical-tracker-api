import React, { useState, useEffect } from "react";
import { AdminGuard } from "~/components/common/AdminGuard";
import { ActivityFeed } from "~/components/common/ActivityFeed";
import { useNavigation } from "~/components/layout/NavigationProvider";
import { UserPage } from "~/routes/UserPage";
import { ActorManagement } from "~/components/pages/actors/ActorManagement";
import { MusicalManagement } from "~/components/pages/musicals/MusicalManagement";
import { TheaterManagement } from "~/components/pages/theaters/TheaterManagement";
import PerformanceManagement from "~/components/pages/performances/PerformanceManagement";
import RoleManagement from "~/components/pages/roles/RoleManagement";
import { CastingManagement } from "~/components/pages/castings/CastingManagement";
import PendingApprovalsPage from "~/components/pages/admin/PendingApprovalsPage";

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
  users: {
    total: number;
    admins: number;
    verified: number;
  };
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState<string>("dashboard");
  const { setActiveSection } = useNavigation();

  // Reset to dashboard on component mount
  useEffect(() => {
    console.log("AdminDashboard mounted");
    setCurrentSection("dashboard");
  }, []);

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
          usersRes,
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
          fetch("http://localhost:3000/v2/user/all", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const [
          actors,
          musicals,
          performances,
          theaters,
          roles,
          castings,
          users,
        ] = await Promise.all([
          actorsRes.ok ? actorsRes.json() : [],
          musicalsRes.ok ? musicalsRes.json() : [],
          performancesRes.ok ? performancesRes.json() : [],
          theatersRes.ok ? theatersRes.json() : [],
          rolesRes.ok ? rolesRes.json() : [],
          castingsRes.ok ? castingsRes.json() : [],
          usersRes.ok ? usersRes.json() : [],
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
          users: {
            total: users.length,
            admins: users.filter((u: any) => u.role === "admin").length,
            verified: users.filter((u: any) => u.emailVerified).length,
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
      section: "actors",
      icon: "👤",
    },
    {
      title: "Musicals",
      total: stats.musicals.total,
      verified: stats.musicals.verified,
      pending: stats.musicals.pending,
      color: "purple",
      section: "musicals",
      icon: "🎭",
    },
    {
      title: "Performances",
      total: stats.performances.total,
      verified: stats.performances.upcoming,
      pending: stats.performances.past,
      color: "blue",
      section: "performances",
      icon: "🎪",
      labels: { verified: "Upcoming", pending: "Past" },
    },
    {
      title: "Theaters",
      total: stats.theaters.total,
      verified: stats.theaters.verified,
      pending: stats.theaters.pending,
      color: "green",
      section: "theaters",
      icon: "🏛️",
    },
    {
      title: "Roles",
      total: stats.roles.total,
      verified: 0,
      pending: 0,
      color: "amber",
      section: "roles",
      icon: "🎪",
      simple: true,
    },
    {
      title: "Castings",
      total: stats.castings.total,
      verified: stats.castings.active,
      pending: stats.castings.total - stats.castings.active,
      color: "red",
      section: "castings",
      icon: "🎬",
      labels: { verified: "Active", pending: "Inactive" },
    },
    {
      title: "Users",
      total: stats.users.total,
      verified: stats.users.admins,
      pending: stats.users.verified,
      color: "blue",
      section: "users",
      icon: "👥",
      labels: { verified: "Admins", pending: "Verified" },
    },
  ];

  // Function to render current section
  const renderCurrentSection = () => {
    if (currentSection === "dashboard") {
      return (
        <>
          {/* Statistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {statCards.map((card) => (
              <div
                key={card.title}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">
                    <span className="text-lg sm:text-xl">{card.icon}</span>
                    <span className="ml-2">{card.title}</span>
                  </h3>
                  <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {card.total}
                  </span>
                </div>

                {!card.simple && (
                  <div className="space-y-2 mb-4">
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

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSection(card.section);
                  }}
                  className={`w-full mt-4 px-4 py-2 bg-${card.color}-600 hover:bg-${card.color}-700 text-white rounded-md text-sm font-medium transition-colors`}
                >
                  Manage {card.title}
                </button>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => setActiveSection("pending")}
                className="flex items-center justify-center px-4 py-3 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 rounded-md hover:bg-yellow-200 dark:hover:bg-yellow-900/75 transition-colors"
              >
                <span className="text-lg mr-2">⏳</span>
                Review Pending
              </button>
              <button
                onClick={() => setCurrentSection("actors")}
                className="flex items-center justify-center px-4 py-3 bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200 rounded-md hover:bg-teal-200 dark:hover:bg-teal-900/75 transition-colors"
              >
                <span className="text-lg mr-2">👤</span>
                Add Actor
              </button>
              <button
                onClick={() => setCurrentSection("musicals")}
                className="flex items-center justify-center px-4 py-3 bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 rounded-md hover:bg-purple-200 dark:hover:bg-purple-900/75 transition-colors"
              >
                <span className="text-lg mr-2">🎭</span>
                Add Musical
              </button>
              <button
                onClick={() => setCurrentSection("theaters")}
                className="flex items-center justify-center px-4 py-3 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 rounded-md hover:bg-green-200 dark:hover:bg-green-900/75 transition-colors"
              >
                <span className="text-lg mr-2">🏛️</span>
                Add Theater
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-6 sm:mt-8">
            <ActivityFeed />
          </div>

          {/* Pending Items Alert */}
          {stats &&
            (stats.actors.pending > 0 ||
              stats.musicals.pending > 0 ||
              stats.theaters.pending > 0) && (
              <div className="mt-6 sm:mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 sm:p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                      Pending Approvals Required
                    </h3>
                    <div className="space-y-1">
                      {stats.actors.pending > 0 && (
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          • {stats.actors.pending} actors awaiting verification
                        </p>
                      )}
                      {stats.musicals.pending > 0 && (
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          • {stats.musicals.pending} musicals awaiting approval
                        </p>
                      )}
                      {stats.theaters.pending > 0 && (
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          • {stats.theaters.pending} theaters awaiting
                          verification
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setActiveSection("pending")}
                      className="mt-3 inline-flex items-center px-3 py-2 border border-yellow-300 dark:border-yellow-600 shadow-sm text-sm leading-4 font-medium rounded-md text-yellow-700 dark:text-yellow-200 bg-yellow-100 dark:bg-yellow-900/50 hover:bg-yellow-200 dark:hover:bg-yellow-900/75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                    >
                      Review All Pending Items
                    </button>
                  </div>
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
        </>
      );
    }

    // Render different sections
    switch (currentSection) {
      case "actors":
        return <ActorManagement />;
      case "musicals":
        return <MusicalManagement />;
      case "performances":
        return <PerformanceManagement />;
      case "theaters":
        return <TheaterManagement />;
      case "roles":
        return <RoleManagement onBackToAdmin={() => setCurrentSection("dashboard")} />;
      case "castings":
        return <CastingManagement onBackToAdmin={() => setCurrentSection("dashboard")} />;
      case "users":
        return <UserPage />;
      case "pending":
        return <PendingApprovalsPage />;
      default:
        return null;
    }
  };

  return (
    <AdminGuard>
      <div className="max-w-7xl mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {currentSection === "dashboard"
              ? "Admin Dashboard"
              : `Manage ${currentSection.charAt(0).toUpperCase() + currentSection.slice(1)}`}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {currentSection === "dashboard"
              ? "Overview of all musical theater data and pending approvals"
              : `Manage ${currentSection} from the admin panel`}
          </p>
        </div>

        {/* Render current section */}
        {renderCurrentSection()}
      </div>
    </AdminGuard>
  );
}
