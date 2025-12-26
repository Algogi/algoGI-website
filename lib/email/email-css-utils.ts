/**
 * Email-safe CSS utilities
 * These functions ensure compatibility with email clients (especially Outlook)
 */

/**
 * Convert style object to inline CSS string
 */
export function inlineStyles(styles: Record<string, string | number | undefined>): string {
  return Object.entries(styles)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${cssKey}: ${value};`;
    })
    .join(' ');
}

/**
 * Wrap content in table-based layout for email compatibility
 * Tables are the most reliable way to center content in email clients
 */
export function wrapInTable(
  content: string,
  width: string = '600px',
  align: 'left' | 'center' | 'right' = 'center',
  backgroundColor?: string
): string {
  const tableAlign = align === 'center' ? 'center' : align === 'right' ? 'right' : 'left';
  const bgStyle = backgroundColor ? `background-color: ${backgroundColor};` : '';
  
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0; padding: 0; ${bgStyle}">
      <tr>
        <td align="${tableAlign}" style="padding: 0;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="${width}" style="margin: 0 auto; max-width: 100%;">
            <tr>
              <td style="padding: 0;">
                ${content}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}

/**
 * Get font stack with safe fallbacks
 */
export function getFallbackFont(fontFamily?: string): string {
  if (!fontFamily) {
    return 'Arial, Helvetica, sans-serif';
  }
  
  // If already includes fallbacks, return as-is
  if (fontFamily.includes('Arial') || fontFamily.includes('Helvetica') || fontFamily.includes('sans-serif')) {
    return fontFamily;
  }
  
  // Add safe fallbacks
  return `${fontFamily}, Arial, Helvetica, sans-serif`;
}

/**
 * Generate Outlook conditional comments for MSO-specific styles
 */
export function generateOutlookConditional(content: string, condition: string = 'mso'): string {
  return `
    <!--[if ${condition}]>
      ${content}
    <![endif]-->
  `;
}

/**
 * Strip unsafe CSS properties that don't work in emails
 * Removes: flexbox, grid, animations, transforms, etc.
 */
export function stripUnsafeCSS(css: string): string {
  // Remove CSS properties that don't work in email clients
  const unsafePatterns = [
    /display\s*:\s*flex[^;]*;?/gi,
    /display\s*:\s*grid[^;]*;?/gi,
    /flex[^:]*:[^;]*;?/gi,
    /grid[^:]*:[^;]*;?/gi,
    /animation[^:]*:[^;]*;?/gi,
    /transform[^:]*:[^;]*;?/gi,
    /transition[^:]*:[^;]*;?/gi,
    /@keyframes[^{]*\{[^}]*\}/gi,
  ];
  
  let cleaned = css;
  unsafePatterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });
  
  return cleaned.trim();
}

/**
 * Convert padding object to CSS string
 */
export function paddingToCSS(padding?: { top: number; right: number; bottom: number; left: number }): string {
  if (!padding) return '0';
  return `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`;
}

/**
 * Convert margin object to CSS string
 */
export function marginToCSS(margin?: { top: number; bottom: number }): string {
  if (!margin) return '0';
  return `${margin.top}px 0 ${margin.bottom}px 0`;
}

/**
 * Generate table-based column layout for email
 */
export function generateColumnLayout(
  columns: 1 | 2 | 3 | 4,
  content: string[],
  gap: string = '20px',
  width: string = '600px'
): string {
  if (columns === 1) {
    return wrapInTable(content[0] || '', width);
  }
  
  const columnWidth = Math.floor(600 / columns) - 10; // Approximate, accounting for gaps
  const cellStyle = `padding: 0 ${parseInt(gap) / 2}px; vertical-align: top;`;
  
  let cells = '';
  for (let i = 0; i < columns; i++) {
    cells += `
      <td width="${columnWidth}" style="${cellStyle}">
        ${content[i] || '&nbsp;'}
      </td>
    `;
  }
  
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0; padding: 0;">
      <tr>
        ${cells}
      </tr>
    </table>
  `;
}

/**
 * Generate responsive media query for mobile
 */
export function generateMobileStyles(styles: string): string {
  return `
    <style type="text/css">
      @media only screen and (max-width: 600px) {
        ${styles}
      }
    </style>
  `;
}

/**
 * Generate VML (Vector Markup Language) for Outlook gradient support
 * Outlook doesn't support CSS gradients, so we use VML
 */
export function generateVMLGradient(
  colors: string[],
  direction: 'horizontal' | 'vertical' = 'horizontal',
  width: string = '600px',
  height: string = '100px'
): string {
  if (colors.length < 2) {
    return '';
  }
  
  const colorStops = colors.map((color, index) => {
    const position = Math.floor((index / (colors.length - 1)) * 100);
    return `<v:stop position="${position}%" color="${color}" />`;
  }).join('');
  
  return `
    <!--[if mso]>
      <v:rect xmlns:v="urn:schemas-microsoft-com:vml" 
              xmlns:o="urn:schemas-microsoft-com:office:office"
              style="width:${width};height:${height};"
              fillcolor="${colors[0]}">
        <v:fill type="gradient" angle="${direction === 'horizontal' ? '0' : '90'}">
          ${colorStops}
        </v:fill>
      </v:rect>
    <![endif]-->
  `;
}

/**
 * Sanitize HTML for email (remove scripts, unsafe attributes)
 */
export function sanitizeEmailHTML(html: string): string {
  // Remove script tags
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers (onclick, onload, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // Remove javascript: URLs
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  return sanitized;
}

