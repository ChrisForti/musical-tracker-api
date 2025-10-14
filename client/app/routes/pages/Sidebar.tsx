import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginPage from "../../components/pages/admin/LoginPage";
import AdminPage from "../../components/pages/admin/AdminPage";
import { ThemeToggle } from "../../components/layout/ui/ThemeToggle";
import { useGlobalSearch } from "../../components/layout/ui/GlobalSearchProvider";
type AdminProps = {
  closeAdmin: () => void;
};

export function Sidebar({ closeAdmin }: AdminProps) {
  // Navigation
  const navigate = useNavigate();

  // Global search
  const { searchQuery, setSearchQuery } = useGlobalSearch();

  // State for sidebar behavior
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  // Original state
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [showAdminPage, setShowAdminPage] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const loginRef = useRef<HTMLDivElement>(null);

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
  const toggleSubmenu = (item: string) => {
    setOpenSubmenu((prev) => (prev === item ? null : item));
  };

  // Calculate sidebar width based on state
  const sidebarWidth = isExpanded ? "w-64" : "w-16";
  const sidebarHoverWidth = isHovered && !isExpanded ? "w-64" : "";

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-4 h-screen flex flex-col bg-white border-r border-gray-200 text-black dark:bg-gray-900 dark:border-gray-800 dark:text-white ...`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
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
        </div>

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

        {/* Navigation Menu */}
        <nav className="py-4 flex-grow">
          <ul>
            {/* Admin Dashboard */}
            <li>
              <button
                onClick={() => {
                  setActiveItem("admin");
                  setShowAdminPage(true);
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

            {/* Management Submenu */}
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
          </ul>
        </nav>

        {/* Theme Toggle - Bottom of sidebar */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center justify-center">
            <ThemeToggle />
            {(isExpanded || isHovered) && (
              <span className="ml-2 text-sm text-gray-400">Theme</span>
            )}
          </div>
        </div>

        {/* Login Panel - Now at the bottom of sidebar */}
        {isLoginOpen && (
          <div ref={loginRef} className="my-auto">
            <LoginPage />
          </div>
        )}
      </div>

      {/* Admin Page */}
      {showAdminPage && (
        <div
          className="fixed top-16 right-0 h-[calc(100vh-64px)] bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 z-40 transition-all duration-300 overflow-auto"
          style={{ width: `calc(100% - ${isExpanded ? "16rem" : "4rem"})` }}
        >
          <div className="h-full overflow-auto">
            <AdminPage
              closeAdmin={() => {
                setShowAdminPage(false);
                navigate("/");
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
