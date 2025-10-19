import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginPage from "../../components/pages/admin/LoginPage";
import RegistrationPage from "../../components/pages/admin/RegistrationPage";
import { useGlobalSearch } from "../layout/ui/GlobalSearchProvider";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../common/ToastProvider";
import { useNavigation } from "./NavigationProvider";

export function Sidebar() {
  const navigate = useNavigate();
  const { isAdmin, user, logout } = useAuth();
  const { addToast } = useToast();
  const {
    activeSection,
    setActiveSection,
    isLoginModalOpen,
    setLoginModalOpen,
  } = useNavigation();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>("explore");

  // Global search
  const { searchQuery, setSearchQuery } = useGlobalSearch();

  // Registration state - kept local as it's sidebar-specific
  const [isRegisterOpen, setRegisterOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const loginRef = useRef<HTMLDivElement>(null);
  const registerRef = useRef<HTMLDivElement>(null);

  // Check for mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Toggle sidebar expansion
  const toggleSidebar = () => {
    setIsExpanded((prev) => !prev);
  };

  // Toggle submenu
  const toggleSubmenu = (menu: string) => {
    setOpenSubmenu((prev) => (prev === menu ? null : menu));
  };

  const handleLogout = () => {
    logout();
    addToast({
      type: "success",
      title: "Logged Out",
      message: "You have been successfully logged out.",
    });
  };

  // Calculate sidebar width based on state
  const sidebarWidth = isExpanded ? "w-64" : "w-16";
  const sidebarHoverWidth = isHovered && !isExpanded ? "w-64" : "";

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed left-0 h-screen flex flex-col p-6 top-3 bg-white border-r border-gray-200 text-black dark:bg-gray-900 dark:border-gray-800 dark:text-white ${sidebarWidth} ${sidebarHoverWidth} transition-all duration-300 z-30`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Global Search */}
        <div className="p-4 border-b border-gray-700">
          {isExpanded || isHovered ? (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md leading-5 bg-gray-800 text-gray-100 placeholder-gray-400 focus:outline-none focus:placeholder-gray-300 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const query = (e.target as HTMLInputElement).value;
                    if (query.trim()) {
                      // Navigate to home page which will show search results
                    }
                  }
                }}
              />
            </div>
          ) : (
            /* Collapsed search - just an icon */
            <button
              onClick={() => setIsExpanded(true)}
              className="w-full p-2 text-gray-400 hover:text-teal-400 hover:bg-gray-800 rounded-md transition-colors"
              title="Search"
            >
              <svg
                className="h-5 w-5 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          )}
        </div>

        {/* User Info - Show if logged in */}
        {user && (
          <div className="px-4 py-3 border-b border-gray-700">
            {isExpanded || isHovered ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user.email}
                    </div>
                    {isAdmin && (
                      <div className="text-xs text-teal-600 dark:text-teal-400 font-medium">
                        Administrator
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-2 p-1 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded transition-colors"
                  title="Logout"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex justify-center">
                <button
                  onClick={handleLogout}
                  className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white font-medium text-sm hover:bg-red-600 transition-colors"
                  title="Logout"
                >
                  {user.email?.charAt(0).toUpperCase()}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="py-4 flex-grow">
          <ul className="space-y-2">
            {/* Dashboard */}
            <li>
              <button
                onClick={() => setActiveSection("home")}
                className={`flex items-center w-full px-4 py-2 hover:bg-teal-600 transition-colors ${
                  activeSection === "home" ? "bg-teal-700" : ""
                }`}
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                {(isExpanded || isHovered) && <span>Dashboard</span>}
              </button>
            </li>

            {/* Explore Section */}
            <li>
              <div className="px-4 py-2">
                {(isExpanded || isHovered) && (
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Explore
                  </h3>
                )}
              </div>
              <button
                onClick={() => toggleSubmenu("explore")}
                className="flex items-center justify-between w-full px-4 py-2 hover:bg-teal-600 transition-colors"
              >
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  {(isExpanded || isHovered) && <span>Browse</span>}
                </div>
                {(isExpanded || isHovered) && (
                  <svg
                    className={`w-4 h-4 transition-transform ${openSubmenu === "explore" ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                )}
              </button>

              {openSubmenu === "explore" && (isExpanded || isHovered) && (
                <ul className="ml-6 mt-1 space-y-1">
                  <li>
                    <button
                      onClick={() => setActiveSection("browse")}
                      className={`flex items-center w-full px-3 py-2 text-sm hover:bg-teal-600 rounded ${
                        activeSection === "browse" ? "bg-teal-700" : ""
                      }`}
                    >
                      Search & Filter
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveSection("musicals")}
                      className={`flex items-center w-full px-3 py-2 text-sm hover:bg-teal-600 rounded ${
                        activeSection === "musicals" ? "bg-teal-700" : ""
                      }`}
                    >
                      Musicals
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveSection("actors")}
                      className={`flex items-center w-full px-3 py-2 text-sm hover:bg-teal-600 rounded ${
                        activeSection === "actors" ? "bg-teal-700" : ""
                      }`}
                    >
                      Actors
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveSection("theaters")}
                      className={`flex items-center w-full px-3 py-2 text-sm hover:bg-teal-600 rounded ${
                        activeSection === "theaters" ? "bg-teal-700" : ""
                      }`}
                    >
                      Theaters
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveSection("performances")}
                      className={`flex items-center w-full px-3 py-2 text-sm hover:bg-teal-600 rounded ${
                        activeSection === "performances" ? "bg-teal-700" : ""
                      }`}
                    >
                      Performances
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveSection("calendar")}
                      className={`flex items-center w-full px-3 py-2 text-sm hover:bg-teal-600 rounded ${
                        activeSection === "calendar" ? "bg-teal-700" : ""
                      }`}
                    >
                      Calendar
                    </button>
                  </li>
                </ul>
              )}
            </li>

            {/* Admin Section */}
            {isAdmin && (
              <li>
                <div className="px-4 py-2 mt-4">
                  {(isExpanded || isHovered) && (
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Administration
                    </h3>
                  )}
                </div>
                <button
                  onClick={() => toggleSubmenu("admin")}
                  className="flex items-center justify-between w-full px-4 py-2 hover:bg-teal-600 transition-colors"
                >
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {(isExpanded || isHovered) && <span>Admin Tools</span>}
                  </div>
                  {(isExpanded || isHovered) && (
                    <svg
                      className={`w-4 h-4 transition-transform ${openSubmenu === "admin" ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  )}
                </button>

                {openSubmenu === "admin" && (isExpanded || isHovered) && (
                  <ul className="ml-6 mt-1 space-y-1">
                    <li>
                      <button
                        onClick={() => setActiveSection("admin")}
                        className={`flex items-center w-full px-3 py-2 text-sm hover:bg-teal-600 rounded ${
                          activeSection === "admin" ? "bg-teal-700" : ""
                        }`}
                      >
                        Dashboard
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveSection("pending")}
                        className={`flex items-center w-full px-3 py-2 text-sm hover:bg-teal-600 rounded ${
                          activeSection === "pending" ? "bg-teal-700" : ""
                        }`}
                      >
                        Pending Approvals
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveSection("users")}
                        className={`flex items-center w-full px-3 py-2 text-sm hover:bg-teal-600 rounded ${
                          activeSection === "users" ? "bg-teal-700" : ""
                        }`}
                      >
                        User Management
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveSection("analytics")}
                        className={`flex items-center w-full px-3 py-2 text-sm hover:bg-teal-600 rounded ${
                          activeSection === "analytics" ? "bg-teal-700" : ""
                        }`}
                      >
                        Analytics
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveSection("scheduling")}
                        className={`flex items-center w-full px-3 py-2 text-sm hover:bg-teal-600 rounded ${
                          activeSection === "scheduling" ? "bg-teal-700" : ""
                        }`}
                      >
                        Scheduling
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveSection("notifications")}
                        className={`flex items-center w-full px-3 py-2 text-sm hover:bg-teal-600 rounded ${
                          activeSection === "notifications" ? "bg-teal-700" : ""
                        }`}
                      >
                        Notifications
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveSection("import-export")}
                        className={`flex items-center w-full px-3 py-2 text-sm hover:bg-teal-600 rounded ${
                          activeSection === "import-export" ? "bg-teal-700" : ""
                        }`}
                      >
                        Import/Export
                      </button>
                    </li>
                  </ul>
                )}
              </li>
            )}

            {/* Authentication Section */}
            {!user ? (
              <>
                {/* Login */}
                <li>
                  <button
                    onClick={() => setLoginModalOpen(!isLoginModalOpen)}
                    className={`flex items-center w-full px-4 py-3 hover:bg-teal-600 ${
                      isLoginModalOpen ? "bg-teal-700" : ""
                    }`}
                  >
                    <svg
                      className="w-6 h-6 mr-2"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {(isExpanded || isHovered) && <span>Login</span>}
                  </button>
                </li>

                {/* Register */}
                <li>
                  <button
                    onClick={() => setRegisterOpen((prev) => !prev)}
                    className={`flex items-center w-full px-4 py-3 hover:bg-teal-600 ${
                      isRegisterOpen ? "bg-teal-700" : ""
                    }`}
                  >
                    <svg
                      className="w-6 h-6 mr-2"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M12.5 11a4 4 0 100-8 4 4 0 000 8zM16 11l2 2 4-4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {(isExpanded || isHovered) && <span>Register</span>}
                  </button>
                </li>
              </>
            ) : (
              /* Logout Option - Show when logged in */
              <li>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-3 hover:bg-red-600 text-red-400 hover:text-white"
                >
                  <svg
                    className="w-6 h-6 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  {(isExpanded || isHovered) && <span>Logout</span>}
                </button>
              </li>
            )}
          </ul>
        </nav>
      </div>

      {/* Login Panel - Modal overlay */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div
            ref={loginRef}
            className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-md w-full mx-4"
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-teal-600">Login</h2>
              <button
                onClick={() => setLoginModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
            <LoginPage onLoginSuccess={() => setLoginModalOpen(false)} />
          </div>
        </div>
      )}

      {/* Registration Panel - Modal overlay */}
      {isRegisterOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div
            ref={registerRef}
            className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-lg w-full mx-4"
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-teal-600">
                Create Account
              </h2>
              <button
                onClick={() => setRegisterOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
            <RegistrationPage
              onRegistrationSuccess={() => setRegisterOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
