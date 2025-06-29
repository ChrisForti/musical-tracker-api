import { useState, useRef } from "react";
import { Login } from "./Login";

export function Sidebar() {
  const [isDropdownOpen, setDropdownOpen] = useState(false); // Controls the admin dropdown
  const [isLoginOpen, setLoginOpen] = useState(false); // Controls the login panel
  const dropdownRef = useRef<HTMLDivElement>(null);
  const loginRef = useRef<HTMLDivElement>(null);

  return (
    <div className="fixed top-15 left-5 w-48" ref={dropdownRef}>
      {/* Dropdown Trigger with SVG */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
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
                href="/admin/dashboard"
                className="block px-4 py-2 hover:bg-teal-600"
              >
                Dashboard
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
              {/* Login Panel Trigger */}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setLoginOpen((v) => !v);
                }}
                className="block px-4 py-2 hover:bg-teal-600"
              >
                Login
              </a>
              {/* Conditionally Render Login Panel */}
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
  );
}
