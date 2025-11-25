import React from "react";
import { useNavigation } from "~/components/layout/NavigationProvider";

interface BackToAdminButtonProps {
  className?: string;
  onBack?: () => void;
}

export function BackToAdminButton({
  className = "",
  onBack,
}: BackToAdminButtonProps) {
  const { setActiveSection } = useNavigation();

  const handleClick = () => {
    if (onBack) {
      onBack();
    } else {
      setActiveSection("admin");
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors ${className}`}
    >
      <svg
        className="mr-2 h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
      Back to Admin
    </button>
  );
}
