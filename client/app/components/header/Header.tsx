import NotificationDropdown from "./NotificationDropdown";
import UserDropdown from "./UserDropdown";
import React, { useState } from "react";

// Define interface for props
interface HeaderProps {
  onClick?: () => void;
  onToggle?: () => void;
}

// Define the Header component as a React functional component
export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 dark:border-gray-800 dark:bg-gray-900 pl-16 md:pl-64">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Logo/Title - Hidden on smaller screens since it's in sidebar */}
        <div className="flex-1">
          <h1 className=" font-fantasy text-4xl text-teal-600">
            Musical Tracker
          </h1>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <a
            href="/"
            className="text-gray-700 hover:text-teal-600 dark:text-gray-300 dark:hover:text-teal-500"
          >
            Home
          </a>
          <a
            href="/about"
            className="text-gray-700 hover:text-teal-600 dark:text-gray-300 dark:hover:text-teal-500"
          >
            About
          </a>
        </nav>

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          <button
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Notifications"
          >
            <svg
              className="w-6 h-6 text-gray-700 dark:text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              ></path>
            </svg>
          </button>

          <button
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="User menu"
          >
            <svg
              className="w-6 h-6 text-gray-700 dark:text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              ></path>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
