import { useState, useRef, useEffect } from "react";
import LoginPage from "../../components/pages/admin/LoginPage";
import RegistrationPage from "../../components/pages/admin/RegistrationPage";
import AdminPage from "../../components/pages/admin/AdminPage";

type AdminProps = {
  closeAdmin: () => void;
};

export function Sidebar({ closeAdmin }: AdminProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  // Original state
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [isRegisterOpen, setRegisterOpen] = useState(false);
  const [showAdminPage, setShowAdminPage] = useState(false);
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
              <h2 className="text-xl font-semibold text-teal-600">Create Account</h2>
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
            <RegistrationPage onRegistrationSuccess={() => setRegisterOpen(false)} />
          </div>
        </div>
      )}

      {/* Admin Page */}
      {showAdminPage && (
        <div
          className="fixed bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 z-40 transition-all duration-300"
          style={{
            left: isExpanded || (isHovered && !isExpanded) ? "16rem" : "4rem",
            top: "4rem", // Account for header height
            right: 0,
            height: "calc(100vh - 4rem)", // Full height minus header
          }}
        >
          <div className="h-full overflow-auto">
            <AdminPage closeAdmin={() => setShowAdminPage(false)} />
          </div>
        </div>
      )}
    </>
  );
}
