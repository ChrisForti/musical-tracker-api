import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginPage from "../../components/pages/admin/LoginPage";
import RegistrationPage from "../../components/pages/admin/RegistrationPage";
import { useGlobalSearch } from "../layout/ui/GlobalSearchProvider";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../common/ToastProvider";

export function Sidebar() {
  const navigate = useNavigate();
  const { isAdmin, user, logout } = useAuth();
  const { addToast } = useToast();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  // Global search
  const { searchQuery, setSearchQuery } = useGlobalSearch();

  // Original state
  const [isLoginOpen, setLoginOpen] = useState(false);
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
      type: 'success', 
      title: 'Logged Out', 
      message: 'You have been successfully logged out.' 
    });
    navigate('/');
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
        {/* Sidebar Header */}
        {/* <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {(isExpanded || isHovered) && (
            <h2 className="text-xl font-bold text-teal-400">Musical Tracker</h2>
          )}
          <button
            onClick={toggleSidebar}
            className="text-teal-400 hover:text-teal-600"
            aria-label="Toggle Sidebar"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 12H21M3 6H21M3 18H21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div> */}

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
                      navigate("/");
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
            {(isExpanded || isHovered) ? (
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
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
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
          <ul>
            {/* Admin Dashboard - Only show to admin users */}
            {isAdmin && (
              <li>
                <button
                  onClick={() => {
                    setActiveItem("admin");
                    navigate("/admin");
                  }}
                  className={`flex items-center w-full px-4 py-3 hover:bg-teal-600 ${
                    activeItem === "admin" ? "bg-teal-700" : ""
                  }`}
                >
                  <svg
                    className="w-6 h-6 mr-2"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 12l9-9 9 9M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {(isExpanded || isHovered) && <span>Admin Dashboard</span>}
                </button>
              </li>
            )}

            {/* Management Submenu - Only show to admin users */}
            {isAdmin && (
              <li>
                <button
                  onClick={() => toggleSubmenu("management")}
                  className={`flex items-center justify-between w-full px-4 py-3 hover:bg-teal-600 ${
                    openSubmenu === "management" ? "bg-teal-700" : ""
                  }`}
                >
                <div className="flex items-center">
                  <svg
                    className="w-6 h-6 mr-2"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M17 20H7C5.9 20 5 19.1 5 18V6C5 4.9 5.9 4 7 4H17C18.1 4 19 4.9 19 6V18C19 19.1 18.1 20 17 20Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M9 9H15M9 13H15M9 17H13"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  {(isExpanded || isHovered) && <span>Management</span>}
                </div>
                {(isExpanded || isHovered) && (
                  <svg
                    className={`w-5 h-5 transform ${
                      openSubmenu === "management" ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M6 9l6 6 6-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>

              {/* Submenu Items */}
              {openSubmenu === "management" && (
                <ul className="bg-gray-800">
                  <li>
                    <a
                      href="/admin/pending"
                      className="flex items-center pl-12 py-2 hover:bg-teal-600"
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveItem("pending");
                        window.location.href = "/admin/pending";
                      }}
                    >
                      {(isExpanded || isHovered) && (
                        <span>Pending Approvals</span>
                      )}
                    </a>
                  </li>
                  <li>
                    <a
                      href="/admin/users"
                      className="flex items-center pl-12 py-2 hover:bg-teal-600"
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveItem("users");
                      }}
                    >
                      {(isExpanded || isHovered) && <span>Users</span>}
                    </a>
                  </li>
                  <li>
                    <a
                      href="/admin/settings"
                      className="flex items-center pl-12 py-2 hover:bg-teal-600"
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveItem("settings");
                      }}
                    >
                      {(isExpanded || isHovered) && <span>Settings</span>}
                    </a>
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
                    onClick={() => setLoginOpen((prev) => !prev)}
                    className={`flex items-center w-full px-4 py-3 hover:bg-teal-600 ${
                      isLoginOpen ? "bg-teal-700" : ""
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
      {isLoginOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div
            ref={loginRef}
            className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-md w-full mx-4"
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-teal-600">Login</h2>
              <button
                onClick={() => setLoginOpen(false)}
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
            <LoginPage onLoginSuccess={() => setLoginOpen(false)} />
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
