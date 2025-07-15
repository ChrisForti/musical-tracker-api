// /Users/fortis/repos/musical-tracker-api/client/app/components/common/PageTemplate.tsx

import React, { type ReactNode } from "react";

interface PageTemplateProps {
  title: string;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
  children: ReactNode;
}

export function PageTemplate({
  title,
  actionButton,
  children,
}: PageTemplateProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>

        {actionButton && (
          <button
            onClick={actionButton.onClick}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded"
          >
            {actionButton.label}
          </button>
        )}
      </div>

      {children}
    </div>
  );
}
