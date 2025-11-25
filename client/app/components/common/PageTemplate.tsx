// /Users/fortis/repos/musical-tracker-api/client/app/components/common/PageTemplate.tsx

import React, { type ReactNode } from "react";
import { Breadcrumb } from "./Breadcrumb";

interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: React.ReactNode;
}

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
  breadcrumbs?: BreadcrumbItem[];
  showBreadcrumbs?: boolean;
}
export function PageTemplate({
  children,
  title,
  actionButton,
  backButton,
  breadcrumbs,
  showBreadcrumbs = true,
}: PageTemplateProps) {
  return (
    <div className="container mx-auto p-4 lg:p-6">
      {/* Breadcrumb Navigation */}
      {showBreadcrumbs && (
        <div className="mb-4 overflow-x-auto">
          <Breadcrumb items={breadcrumbs} />
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {backButton && (
            <button
              onClick={backButton.onClick}
              className="w-fit px-3 py-2 sm:px-4 sm:py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center shadow-md border-2 border-blue-600 text-sm sm:text-base"
            >
              <span className="mr-1">←</span>
              <span className="hidden sm:inline">{backButton.label}</span>
              <span className="sm:hidden">Back</span>
            </button>
          )}
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white break-words">
            {title}
          </h1>
        </div>

        {actionButton && (
          <button
            onClick={actionButton.onClick}
            className="w-fit sm:w-auto px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md text-sm sm:text-base whitespace-nowrap"
          >
            {actionButton.label}
          </button>
        )}
      </div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}
