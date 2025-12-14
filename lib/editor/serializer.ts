/**
 * Serialize blocks to HTML for storage
 */

import { Block, EditorContent } from "./blocks/types";

export function blocksToHTML(content: EditorContent): string {
  const { blocks } = content;
  
  return blocks.map((block) => blockToHTML(block)).join("\n");
}

function blockToHTML(block: Block): string {
  switch (block.type) {
    case "heading": {
      const headingBlock = block as any;
      const level = headingBlock.data.level || 1;
      const text = headingBlock.data.text || "";
      const align = block.style?.align || "left";
      return `<h${level} style="text-align: ${align}">${escapeHTML(text)}</h${level}>`;
    }
    
    case "paragraph": {
      const paragraphBlock = block as any;
      const text = paragraphBlock.data.text || "";
      const align = block.style?.align || "left";
      return `<p style="text-align: ${align}">${escapeHTML(text)}</p>`;
    }
    
    case "image": {
      const imageBlock = block as any;
      const { src, alt, caption, width, height } = imageBlock.data;
      const align = block.style?.align || "center";
      let imgTag = `<img src="${escapeHTML(src)}" alt="${escapeHTML(alt || "")}"`;
      
      if (width) imgTag += ` width="${width}"`;
      if (height) imgTag += ` height="${height}"`;
      if (align) imgTag += ` data-align="${align}"`;
      
      imgTag += ` />`;
      
      if (caption) {
        return `<figure>${imgTag}<figcaption>${escapeHTML(caption)}</figcaption></figure>`;
      }
      return imgTag;
    }
    
    case "columns": {
      const columnsBlock = block as any;
      const { columns, children, gap } = columnsBlock.data;
      const gapStyle = gap ? `gap: ${gap}px;` : "";
      const gridCols = `grid-template-columns: repeat(${columns}, 1fr);`;
      
      const columnsHTML = children
        .map((col: Block[], index: number) => {
          const colBlocks = col.map((b) => blockToHTML(b)).join("");
          return `<div class="column-${index + 1}">${colBlocks}</div>`;
        })
        .join("");
      
      return `<div class="columns-container" style="display: grid; ${gridCols} ${gapStyle}">${columnsHTML}</div>`;
    }
    
    case "button": {
      const buttonBlock = block as any;
      const { text, url, variant } = buttonBlock.data;
      const variantClass = variant ? `btn-${variant}` : "btn-primary";
      return `<a href="${escapeHTML(url)}" class="${variantClass}">${escapeHTML(text)}</a>`;
    }
    
    case "spacer": {
      const spacerBlock = block as any;
      const height = spacerBlock.data.height || 40;
      return `<div style="height: ${height}px;"></div>`;
    }
    
    case "divider": {
      const dividerBlock = block as any;
      const { style, color } = dividerBlock.data;
      const borderStyle = style || "solid";
      const borderColor = color || "#e5e7eb";
      return `<hr style="border-style: ${borderStyle}; border-color: ${borderColor};" />`;
    }
    
    case "list": {
      const listBlock = block as any;
      const { items, ordered } = listBlock.data;
      const tag = ordered ? "ol" : "ul";
      const itemsHTML = items.map((item: string) => `<li>${escapeHTML(item)}</li>`).join("");
      return `<${tag}>${itemsHTML}</${tag}>`;
    }
    
    case "quote": {
      const quoteBlock = block as any;
      const { text, author } = quoteBlock.data;
      let quoteHTML = `<blockquote><p>${escapeHTML(text)}</p>`;
      if (author) {
        quoteHTML += `<cite>${escapeHTML(author)}</cite>`;
      }
      quoteHTML += `</blockquote>`;
      return quoteHTML;
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

