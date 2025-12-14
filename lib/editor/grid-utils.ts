/**
 * Utility functions for grid layout calculations and parsing
 */

export interface GridColumn {
  span: number;
  content: string;
}

export interface GridRow {
  columns: GridColumn[];
}

/**
 * Calculate total span of columns in a row
 */
export function calculateTotalSpan(columns: GridColumn[]): number {
  return columns.reduce((total, col) => total + col.span, 0);
}

/**
 * Validate that columns in a row total exactly 12
 */
export function validateRowSpan(columns: GridColumn[]): boolean {
  return calculateTotalSpan(columns) === 12;
}

/**
 * Parse HTML string to extract grid structure
 */
export function parseGridFromHTML(html: string): GridRow[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const rows: GridRow[] = [];

  const rowElements = doc.querySelectorAll("[data-grid-row]");
  rowElements.forEach((rowEl) => {
    const columns: GridColumn[] = [];
    const columnElements = rowEl.querySelectorAll("[data-grid-column]");

    columnElements.forEach((colEl) => {
      const span = parseInt(colEl.getAttribute("data-span") || "12", 10);
      columns.push({
        span,
        content: colEl.innerHTML,
      });
    });

    if (columns.length > 0) {
      rows.push({ columns });
    }
  });

  return rows;
}

/**
 * Generate responsive CSS classes for column span
 */
export function getColumnClass(span: number, breakpoint?: "sm" | "md" | "lg" | "xl"): string {
  const prefix = breakpoint ? `${breakpoint}:` : "";
  return `${prefix}col-span-${span}`;
}

/**
 * Convert grid structure to HTML
 */
export function gridToHTML(rows: GridRow[]): string {
  return rows
    .map((row) => {
      const columnsHTML = row.columns
        .map(
          (col) =>
            `<div data-grid-column data-span="${col.span}" class="grid-column">${col.content}</div>`
        )
        .join("");
      return `<div data-grid-row class="grid-row">${columnsHTML}</div>`;
    })
    .join("");
}

/**
 * Adjust column spans to fit within 12 columns
 */
export function adjustColumnSpans(columns: GridColumn[]): GridColumn[] {
  const total = calculateTotalSpan(columns);
  if (total === 12) return columns;

  // If total is less than 12, distribute remaining space
  if (total < 12) {
    const remaining = 12 - total;
    const adjusted = [...columns];
    // Add remaining to last column
    if (adjusted.length > 0) {
      adjusted[adjusted.length - 1].span += remaining;
    }
    return adjusted;
  }

  // If total is more than 12, proportionally reduce
  if (total > 12) {
    const ratio = 12 / total;
    return columns.map((col) => ({
      ...col,
      span: Math.max(1, Math.round(col.span * ratio)),
    }));
  }

  return columns;
}

