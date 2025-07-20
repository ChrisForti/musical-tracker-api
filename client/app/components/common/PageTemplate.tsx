// /Users/fortis/repos/musical-tracker-api/client/app/components/common/PageTemplate.tsx

import React, { type ReactNode } from "react";

interface PageTemplateProps {
  children: React.ReactNode;
  title: string;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
  backButton?: {
    label: string;
    onClick: () => void;
  };
}
export function PageTemplate({
  children,
  title,
  actionButton,
  backButton,
}: PageTemplateProps) {
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          {backButton && (
            <button
              onClick={backButton.onClick}
              className="mr-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md flex items-center"
            >
              <span className="mr-1">←</span> {backButton.label}
            </button>
          )}
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {title}
          </h1>
        </div>

        {actionButton && (
          <button
            onClick={actionButton.onClick}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md"
          >
            {actionButton.label}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
