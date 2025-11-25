/**
 * Print utilities for creating print-friendly views
 */

/**
 * Print styles that should be applied when printing
 */
export const printStyles = `
  @media print {
    /* Hide non-essential elements */
    nav, .sidebar, .no-print, button, .export-button, .search-controls {
      display: none !important;
    }
    
    /* Page setup */
    @page {
      margin: 0.5in;
      size: letter;
    }
    
    body {
      font-size: 12pt !important;
      line-height: 1.4 !important;
      color: #000 !important;
      background: white !important;
    }
    
    /* Typography */
    h1 { font-size: 18pt !important; margin-bottom: 12pt !important; }
    h2 { font-size: 16pt !important; margin-bottom: 10pt !important; }
    h3 { font-size: 14pt !important; margin-bottom: 8pt !important; }
    
    /* Layout */
    .print-container {
      max-width: none !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    
    /* Tables */
    table {
      border-collapse: collapse !important;
      width: 100% !important;
      margin-bottom: 20pt !important;
    }
    
    th, td {
      border: 1px solid #000 !important;
      padding: 6pt !important;
      text-align: left !important;
      vertical-align: top !important;
    }
    
    th {
      background: #f0f0f0 !important;
      font-weight: bold !important;
    }
    
    /* Page breaks */
    .page-break {
      page-break-before: always !important;
    }
    
    .avoid-break {
      page-break-inside: avoid !important;
    }
    
    /* Remove shadows and backgrounds */
    .print-friendly {
      box-shadow: none !important;
      background: white !important;
      border: 1px solid #ccc !important;
      border-radius: 0 !important;
    }
    
    /* Grid layouts for print */
    .print-grid {
      display: block !important;
    }
    
    .print-grid > div {
      display: block !important;
      margin-bottom: 12pt !important;
      width: 100% !important;
    }
  }
`;

/**
 * Hook for managing print functionality
 */
export function usePrint() {
  const openPrintView = (content: string, title = "Print View") => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow pop-ups to use the print feature");
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <style>
            ${printStyles}
            
            /* Additional print-specific styles */
            body {
              font-family: 'Times New Roman', serif;
              margin: 0;
              padding: 20px;
            }
            
            .print-header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
            }
            
            .print-footer {
              margin-top: 30px;
              padding-top: 10px;
              border-top: 1px solid #ccc;
              font-size: 10pt;
              text-align: center;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${content}
            <div class="print-footer">
              Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();

    // Wait a bit for content to load, then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const printCurrentPage = () => {
    window.print();
  };

  return { openPrintView, printCurrentPage };
}

/**
 * Generate print-friendly casting sheet HTML
 */
export function generateCastingSheet(
  performance: any,
  castings: any[]
): string {
  return `
    <div class="print-header">
      <h1>${performance.musical?.title || "Musical Performance"}</h1>
      <h2>Cast List</h2>
      <p>
        <strong>Date:</strong> ${new Date(performance.date).toLocaleDateString()}<br>
        ${performance.time ? `<strong>Time:</strong> ${performance.time}<br>` : ""}
        <strong>Theater:</strong> ${performance.theater?.name || "TBD"}<br>
        ${performance.theater?.address ? `<strong>Address:</strong> ${performance.theater.address}<br>` : ""}
      </p>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 40%;">Character</th>
          <th style="width: 40%;">Actor</th>
          <th style="width: 20%;">Contact</th>
        </tr>
      </thead>
      <tbody>
        ${castings
          .map(
            (casting) => `
          <tr>
            <td><strong>${casting.role?.characterName || "Unknown Role"}</strong></td>
            <td>${casting.actor?.name || "TBD"}</td>
            <td style="font-size: 10pt;">${casting.actor?.email || ""}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>

    ${
      castings.length === 0
        ? `
      <p style="text-align: center; font-style: italic; margin: 40px 0;">
        No cast members assigned yet.
      </p>
    `
        : ""
    }

    <div class="page-break">
      <h2>Production Notes</h2>
      <div style="border: 1px solid #ccc; padding: 20px; min-height: 200px;">
        <p style="color: #666; font-style: italic;">
          Use this space for production notes, rehearsal schedules, or other important information.
        </p>
      </div>
    </div>
  `;
}

/**
 * Generate print-friendly program HTML
 */
export function generateProgram(
  performance: any,
  castings: any[],
  musical: any
): string {
  return `
    <div class="print-header">
      <h1>${musical?.title || "Musical Performance"}</h1>
      <p style="font-size: 14pt; margin: 10px 0;">
        ${musical?.composer ? `Music by ${musical.composer}` : ""}<br>
        ${musical?.lyricist && musical.lyricist !== musical?.composer ? `Lyrics by ${musical.lyricist}` : ""}
      </p>
      <div style="margin: 20px 0; font-size: 12pt;">
        <strong>${new Date(performance.date).toLocaleDateString()}</strong>
        ${performance.time ? ` at ${performance.time}` : ""}<br>
        <strong>${performance.theater?.name || "Theater TBD"}</strong><br>
        ${performance.theater?.address || ""}
      </div>
    </div>

    <div class="avoid-break">
      <h2>Cast</h2>
      <table style="margin-bottom: 30px;">
        <tbody>
          ${castings
            .map(
              (casting) => `
            <tr>
              <td style="font-weight: bold; width: 50%; border-right: 2px solid #000;">
                ${casting.role?.characterName || "Unknown Role"}
              </td>
              <td style="width: 50%; padding-left: 15px;">
                ${casting.actor?.name || "TBD"}
              </td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>

    ${
      musical?.synopsis
        ? `
      <div class="avoid-break">
        <h2>Synopsis</h2>
        <p style="text-align: justify; line-height: 1.6;">
          ${musical.synopsis}
        </p>
      </div>
    `
        : ""
    }

    <div class="page-break">
      <h2>Production Team</h2>
      <table>
        <tbody>
          <tr>
            <td style="font-weight: bold;">Director</td>
            <td>_________________________________</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Musical Director</td>
            <td>_________________________________</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Choreographer</td>
            <td>_________________________________</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Stage Manager</td>
            <td>_________________________________</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Technical Director</td>
            <td>_________________________________</td>
          </tr>
        </tbody>
      </table>

      <div style="margin-top: 40px;">
        <h2>Special Thanks</h2>
        <div style="border: 1px solid #ccc; padding: 20px; min-height: 150px;">
          <p style="color: #666; font-style: italic;">
            Space for acknowledgments, special thanks, and sponsor recognition.
          </p>
        </div>
      </div>
    </div>
  `;
}
