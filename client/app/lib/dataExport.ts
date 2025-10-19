/**
 * Data export utilities for exporting various data types to CSV and JSON formats
 */

export interface ExportColumn {
  key: string;
  label: string;
  transform?: (value: any) => string;
}

export interface ExportOptions {
  filename: string;
  format: "csv" | "json";
  columns?: ExportColumn[];
  includeTimestamp?: boolean;
}

/**
 * Convert data to CSV format
 */
export function dataToCSV(data: any[], columns: ExportColumn[]): string {
  if (!data || data.length === 0) {
    return "";
  }

  // Create header row
  const headers = columns.map((col) => col.label);
  const csvRows = [headers.join(",")];

  // Process data rows
  data.forEach((item) => {
    const row = columns.map((col) => {
      let value = getNestedValue(item, col.key);

      // Apply transformation if provided
      if (col.transform && value !== null && value !== undefined) {
        value = col.transform(value);
      }

      // Handle null/undefined values
      if (value === null || value === undefined) {
        value = "";
      }

      // Escape and quote the value for CSV
      return escapeCSVValue(String(value));
    });

    csvRows.push(row.join(","));
  });

  return csvRows.join("\n");
}

/**
 * Get nested object value using dot notation (e.g., "theater.name")
 */
function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null;
  }, obj);
}

/**
 * Escape and quote CSV values that contain commas, quotes, or newlines
 */
function escapeCSVValue(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    // Escape quotes by doubling them and wrap in quotes
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Download data as a file
 */
export function downloadData(data: any[], options: ExportOptions): void {
  let content: string;
  let mimeType: string;

  if (options.format === "csv") {
    if (!options.columns) {
      throw new Error("Columns are required for CSV export");
    }
    content = dataToCSV(data, options.columns);
    mimeType = "text/csv";
  } else {
    // JSON format
    content = JSON.stringify(data, null, 2);
    mimeType = "application/json";
  }

  // Add timestamp to filename if requested
  let filename = options.filename;
  if (options.includeTimestamp) {
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, 19);
    const extension = `.${options.format}`;
    filename = filename.replace(extension, `_${timestamp}${extension}`);
  }

  // Create and trigger download
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Predefined column configurations for common data types
 */
export const ExportColumns = {
  actors: [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    {
      key: "verified",
      label: "Verified",
      transform: (value: boolean) => (value ? "Yes" : "No"),
    },
    { key: "role", label: "Role" },
    {
      key: "createdAt",
      label: "Created Date",
      transform: (value: string) => new Date(value).toLocaleDateString(),
    },
  ],

  musicals: [
    { key: "id", label: "ID" },
    { key: "title", label: "Title" },
    { key: "composer", label: "Composer" },
    { key: "lyricist", label: "Lyricist" },
    { key: "genre", label: "Genre" },
    {
      key: "verified",
      label: "Verified",
      transform: (value: boolean) => (value ? "Yes" : "No"),
    },
    {
      key: "createdAt",
      label: "Created Date",
      transform: (value: string) => new Date(value).toLocaleDateString(),
    },
  ],

  performances: [
    { key: "id", label: "ID" },
    { key: "musical.title", label: "Musical" },
    {
      key: "date",
      label: "Date",
      transform: (value: string) => new Date(value).toLocaleDateString(),
    },
    { key: "time", label: "Time" },
    { key: "theater.name", label: "Theater" },
    { key: "theater.city", label: "City" },
    {
      key: "createdAt",
      label: "Created Date",
      transform: (value: string) => new Date(value).toLocaleDateString(),
    },
  ],

  theaters: [
    { key: "id", label: "ID" },
    { key: "name", label: "Theater Name" },
    { key: "city", label: "City" },
    { key: "address", label: "Address" },
    {
      key: "verified",
      label: "Verified",
      transform: (value: boolean) => (value ? "Yes" : "No"),
    },
    {
      key: "createdAt",
      label: "Created Date",
      transform: (value: string) => new Date(value).toLocaleDateString(),
    },
  ],

  roles: [
    { key: "id", label: "ID" },
    { key: "characterName", label: "Character Name" },
    { key: "musical.title", label: "Musical" },
    { key: "musical.composer", label: "Composer" },
    {
      key: "createdAt",
      label: "Created Date",
      transform: (value: string) => new Date(value).toLocaleDateString(),
    },
  ],

  castings: [
    { key: "id", label: "ID" },
    { key: "actor.name", label: "Actor" },
    { key: "role.characterName", label: "Character" },
    { key: "performance.musical.title", label: "Musical" },
    {
      key: "performance.date",
      label: "Performance Date",
      transform: (value: string) => new Date(value).toLocaleDateString(),
    },
    { key: "performance.theater.name", label: "Theater" },
    {
      key: "createdAt",
      label: "Created Date",
      transform: (value: string) => new Date(value).toLocaleDateString(),
    },
  ],

  users: [
    { key: "id", label: "ID" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
    {
      key: "emailVerified",
      label: "Email Verified",
      transform: (value: boolean) => (value ? "Yes" : "No"),
    },
    {
      key: "createdAt",
      label: "Created Date",
      transform: (value: string) => new Date(value).toLocaleDateString(),
    },
  ],
};

/**
 * Export hook for easy integration into components
 */
export function useDataExport() {
  const exportData = (
    data: any[],
    type: keyof typeof ExportColumns,
    format: "csv" | "json" = "csv"
  ) => {
    const columns = ExportColumns[type];
    const filename = `${type}_export.${format}`;

    downloadData(data, {
      filename,
      format,
      columns: format === "csv" ? columns : undefined,
      includeTimestamp: true,
    });
  };

  const exportCustom = (
    data: any[],
    filename: string,
    options: Partial<ExportOptions> = {}
  ) => {
    downloadData(data, {
      filename,
      format: "csv",
      includeTimestamp: true,
      ...options,
    });
  };

  return { exportData, exportCustom };
}
