import React from "react";
import { useAuth } from "~/hooks/useAuth";
import { useNavigation } from "~/components/layout/NavigationProvider";
import { AdminDashboard } from "./admin/AdminDashboard";
import { AnalyticsDashboard } from "./analytics/AnalyticsDashboard";
import { SchedulingCalendar } from "./scheduling/SchedulingCalendar";
import EmailNotifications from "./admin/EmailNotifications";
import ImportExportSystem from "./admin/ImportExportSystem";
import PendingApprovalsPage from "./admin/PendingApprovalsPage";
import { ActorManagement } from "./actors/ActorManagement";
import { MusicalManagement } from "./musicals/MusicalManagement";
import { TheaterManagement } from "./theaters/TheaterManagement";
import PerformanceManagement from "./performances/PerformanceManagement";
import { PublicSearch } from "./public/PublicSearch";
import { UserPage } from "../../routes/UserPage";

const AdminOnly = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin } = useAuth();
  return isAdmin ? (
    <>{children}</>
  ) : (
    <div className="p-8 text-center text-gray-500">Admin access required</div>
  );
};

export const MainDashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { activeSection, setActiveSection } = useNavigation();

  // Handle auth state changes
  React.useEffect(() => {
    if (!user && activeSection !== "browse" && activeSection !== "calendar") {
      // Only reset to home if not browsing public content
      if (
        activeSection === "admin" ||
        activeSection === "pending" ||
        activeSection === "analytics" ||
        activeSection === "scheduling" ||
        activeSection === "notifications" ||
        activeSection === "import-export" ||
        activeSection === "users"
      ) {
        setActiveSection("home");
      }
    } else if (user && isAdmin && activeSection === "home") {
      setTimeout(() => setActiveSection("admin"), 100);
    }
  }, [user, isAdmin, activeSection, setActiveSection]);

  const sections = {
    browse: () => <PublicSearch />,
    musicals: () => <MusicalManagement />,
    actors: () => <ActorManagement />,
    theaters: () => <TheaterManagement />,
    performances: () => <PerformanceManagement />,
    calendar: () => (
      <div className="p-8 text-center">
        Public performance calendar coming soon...
      </div>
    ),
    admin: () => (
      <AdminOnly>
        <AdminDashboard />
      </AdminOnly>
    ),
    pending: () => (
      <AdminOnly>
        <PendingApprovalsPage />
      </AdminOnly>
    ),
    analytics: () => (
      <AdminOnly>
        <AnalyticsDashboard />
      </AdminOnly>
    ),
    scheduling: () => (
      <AdminOnly>
        <SchedulingCalendar />
      </AdminOnly>
    ),
    notifications: () => (
      <AdminOnly>
        <EmailNotifications />
      </AdminOnly>
    ),
    "import-export": () => (
      <AdminOnly>
        <ImportExportSystem />
      </AdminOnly>
    ),
    users: () => (
      <AdminOnly>
        <UserPage />
      </AdminOnly>
    ),
    home: () => <HomePage />,
  };

  const Component = sections[activeSection] || sections.home;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Component />
    </div>
  );
};

const HomePage = () => {
  const { user, isAdmin } = useAuth();
  const { setActiveSection, setLoginModalOpen } = useNavigation();

  const actions = [
    { section: "musicals" as const, label: "Manage Musicals" },
    { section: "actors" as const, label: "Manage Actors" },
    { section: "theaters" as const, label: "Manage Theaters" },
    { section: "performances" as const, label: "Manage Performances" },
  ];

  const adminActions = [
    { section: "admin" as const, label: "Admin Dashboard" },
    { section: "analytics" as const, label: "View Analytics" },
    { section: "scheduling" as const, label: "Manage Schedule" },
    { section: "notifications" as const, label: "Email Notifications" },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Musical Theater Tracker
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          {user
            ? `Welcome back, ${user.email}!`
            : "Discover amazing musical theater performances."}
        </p>
        {!user && (
          <div className="mt-6">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Sign in to access your dashboard and manage your musical theater
              collection.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setLoginModalOpen(true)}
                className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md font-medium transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => setActiveSection("browse")}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium transition-colors"
              >
                Browse Public Content
              </button>
            </div>
          </div>
        )}
      </div>

      {user && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {actions.map(({ section, label }) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className="block w-full text-left px-3 py-2 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900 rounded"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {isAdmin && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <h3 className="text-lg font-semibold mb-4">Admin Tools</h3>
              <div className="space-y-2">
                {adminActions.map(({ section, label }) => (
                  <button
                    key={section}
                    onClick={() => setActiveSection(section)}
                    className="block w-full text-left px-3 py-2 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900 rounded"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MainDashboard;
