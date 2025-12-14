/**
 * Serialize blocks to HTML for storage
 */

import { EditorContent, Block, TextBlock, ImageBlock, ButtonBlock, ColumnsBlock, CodeBlock } from "../types";
import { tipTapJSONToHTML } from "./tipTapUtils";

export function blocksToHTML(content: EditorContent): string {
  const { blocks } = content;
  return blocks.map((block) => blockToHTML(block)).join("\n");
}

function blockToHTML(block: Block): string {
  switch (block.type) {
    case "paragraph": {
      const textBlock = block as TextBlock;
      const html = tipTapJSONToHTML(textBlock.data.content);
      return html;
    }

    case "image": {
      const imageBlock = block as ImageBlock;
      const { src, alt, caption, width, height } = imageBlock.data;
      
      let imgTag = `<img src="${escapeHTML(src)}" alt="${escapeHTML(alt || "")}"`;
      
      if (width) imgTag += ` width="${width}"`;
      if (height) imgTag += ` height="${height}"`;
      
      imgTag += ` />`;
      
      if (caption) {
        return `<figure>${imgTag}<figcaption>${escapeHTML(caption)}</figcaption></figure>`;
      }
      return imgTag;
    }

    case "button": {
      const buttonBlock = block as ButtonBlock;
      const { text, url, variant } = buttonBlock.data;
      const variantClass = variant === "secondary" ? "btn-secondary" : "btn-primary";
      return `<a href="${escapeHTML(url)}" class="${variantClass}">${escapeHTML(text)}</a>`;
    }

    case "columns": {
      const columnsBlock = block as ColumnsBlock;
      const { columnCount, columns, gap } = columnsBlock.data;
      const gapStyle = gap ? `gap: ${gap}px;` : "";
      const gridCols = `grid-template-columns: repeat(${columnCount}, 1fr);`;
      
      // Responsive: stack on mobile
      const columnsHTML = columns
        .map((col: Block[], index: number) => {
          const colBlocks = col.map((b) => blockToHTML(b)).join("");
          return `<div class="column-${index + 1}">${colBlocks}</div>`;
        })
        .join("");
      
      return `<div class="columns-container" style="display: grid; ${gridCols} ${gapStyle}">${columnsHTML}</div>`;
    }

    case "code": {
      const codeBlock = block as CodeBlock;
      const { code, language, inline } = codeBlock.data;
      
      if (inline) {
        return `<code>${escapeHTML(code)}</code>`;
      }
      
      const langAttr = language ? ` class="language-${escapeHTML(language)}"` : "";
      return `<pre><code${langAttr}>${escapeHTML(code)}</code></pre>`;
    }

    default:
      return "";
  }
}

function escapeHTML(text: string): string {
  if (typeof window === "undefined") {
    // Server-side: basic escaping
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

