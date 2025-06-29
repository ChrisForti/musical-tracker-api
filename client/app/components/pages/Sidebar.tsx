import { useState, useRef } from "react";
import { Login } from "../auth/Login";
import { Admin } from "../pages/Admin"; // Import AdminDashboard

export function Sidebar() {
  const [isDropdownOpen, setDropdownOpen] = useState(false); // Controls the admin dropdown
  const [isLoginOpen, setLoginOpen] = useState(false); // Controls the login panel
  const [showAdminPage, setShowAdminPage] = useState(false); // Controls the admin page visibility
  const dropdownRef = useRef<HTMLDivElement>(null);
  const loginRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      {/* Sidebar */}
      <div className="fixed top-12 left-5 w-48" ref={dropdownRef}>
        <a
          href="#"
          onClick={(event) => {
            event.preventDefault();
            setDropdownOpen((v) => !v);
          }}
          className="text-teal-400 font-bold px-8 py-2 hover:text-teal-600"
          aria-label="Toggle Admin Panel"
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
        </a>
        {/* Admin Dropdown */}
        {isDropdownOpen && (
          <div className="absolute top-full left-0 mt-2 w-48 bg-black text-white rounded shadow-lg z-50">
            <ul className="py-2">
              <li>
                <a
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    setShowAdminPage(true); // Show the admin page
                  }}
                  className="block px-4 py-2 hover:bg-teal-600"
                >
                  Admin Dashboard
                </a>
              </li>
              <li>
                <a
                  href="/admin/users"
                  className="block px-4 py-2 hover:bg-teal-600"
                >
                  Users
                </a>
              </li>
              <li>
                <a
                  href="/admin/settings"
                  className="block px-4 py-2 hover:bg-teal-600"
                >
                  Settings
                </a>
              </li>
              <li>
                <a
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    setLoginOpen((v) => !v);
                  }}
                  className="block px-4 py-2 hover:bg-teal-600"
                >
                  Login
                </a>
                {isLoginOpen && (
                  <div
                    ref={loginRef}
                    className="absolute left-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50"
                  >
                    <Login />
                  </div>
                )}
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Admin Page */}
      {showAdminPage && (
        <div className="absolute top-30 left-50 w-80 bg-white rounded-lg shadow-lg z-50">
          <button
            onClick={() => setShowAdminPage(false)} // Hide the admin page
            className="mb-4 bg-black text-white px-4 py-2 rounded hover:bg-teal-700"
          >
            Back to Sidebar
          </button>
          <Admin />
        </div>
      )}
    </div>
  );
}
