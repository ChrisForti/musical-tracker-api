import React from "react";

export type SortDirection = "asc" | "desc" | null;

export interface SortConfig {
  key: string;
  direction: SortDirection;
}

interface SortableHeaderProps {
  children: React.ReactNode;
  sortKey: string;
  currentSort: SortConfig;
  onSort: (key: string) => void;
  className?: string;
}

export const SortableHeader: React.FC<SortableHeaderProps> = ({
  children,
  sortKey,
  currentSort,
  onSort,
  className = "",
}) => {
  const isActive = currentSort.key === sortKey;
  const direction = isActive ? currentSort.direction : null;

  const getSortIcon = () => {
    if (!isActive || direction === null) {
      return (
        <svg
          className="w-4 h-4 text-gray-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M5 12a1 1 0 102 0V6.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L5 6.414V12zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
        </svg>
      );
    }

    if (direction === "asc") {
      return (
        <svg
          className="w-4 h-4 text-blue-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
      );
    }

    return (
      <svg
        className="w-4 h-4 text-blue-600"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
    );
  };

  return (
    <th
      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none ${className}`}
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {getSortIcon()}
      </div>
    </th>
  );
};

// Hook to manage sorting state
export function useSort<T>(
  data: T[],
  initialSort?: { key: keyof T; direction: SortDirection }
) {
  const [sortConfig, setSortConfig] = React.useState<SortConfig>({
    key: (initialSort?.key as string) || "",
    direction: initialSort?.direction || null,
  });

  const handleSort = (key: string) => {
    let direction: SortDirection = "asc";

    if (sortConfig.key === key) {
      if (sortConfig.direction === "asc") {
        direction = "desc";
      } else if (sortConfig.direction === "desc") {
        direction = null;
      }
    }

    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig.direction || !sortConfig.key) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aValue = (a as any)[sortConfig.key];
      const bValue = (b as any)[sortConfig.key];

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortConfig.direction === "asc" ? 1 : -1;
      if (bValue == null) return sortConfig.direction === "asc" ? -1 : 1;

      // Handle different data types
      if (typeof aValue === "string" && typeof bValue === "string") {
        const comparison = aValue
          .toLowerCase()
          .localeCompare(bValue.toLowerCase());
        return sortConfig.direction === "asc" ? comparison : -comparison;
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.direction === "asc"
          ? aValue - bValue
          : bValue - aValue;
      }

      if (typeof aValue === "boolean" && typeof bValue === "boolean") {
        const aNum = aValue ? 1 : 0;
        const bNum = bValue ? 1 : 0;
        return sortConfig.direction === "asc" ? aNum - bNum : bNum - aNum;
      }

      // Handle Date objects
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortConfig.direction === "asc"
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }

      // Fallback to string comparison
      const aStr = String(aValue);
      const bStr = String(bValue);
      const comparison = aStr.toLowerCase().localeCompare(bStr.toLowerCase());
      return sortConfig.direction === "asc" ? comparison : -comparison;
    });
  }, [data, sortConfig]);

  return {
    sortedData,
    sortConfig,
    handleSort,
    resetSort: () => setSortConfig({ key: "", direction: null }),
  };
}
