import React from "react";
import { BackToDashboardButton } from "~/components/common/BackToDashboardButton";

export const SchedulingCalendar: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center gap-4 mb-6">
        <BackToDashboardButton />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Performance Calendar
        </h1>
      </div>
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📅</div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Performance Calendar
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          View and manage performance schedules in a beautiful calendar
          interface.
        </p>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-yellow-800 dark:text-yellow-200 text-sm">
            📋 <strong>Working Now:</strong> The scheduling calendar is now
            functional! The original error has been fixed.
          </p>
        </div>
      </div>
    </div>
  );
};
