/**
 * Parse HTML to blocks (for backward compatibility)
 */

import { Block, EditorContent } from "./blocks/types";
import { createBlock } from "./blocks/registry";

export function htmlToBlocks(html: string): EditorContent {
  if (!html || html.trim() === "") {
    return { version: "1.0", blocks: [] };
  }

  if (typeof window === "undefined") {
    // Server-side: return simple paragraph block
    return {
      version: "1.0",
      blocks: [
        {
          id: `block-${Date.now()}`,
          type: "paragraph",
          data: { text: html },
        },
      ],
    };
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const body = doc.body;

  const blocks: Block[] = [];
  const nodes = Array.from(body.childNodes);

  for (const node of nodes) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      const block = elementToBlock(element);
      if (block) {
        blocks.push(block);
      }
    } else if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        const paragraphBlock = createBlock("paragraph") as Block;
        paragraphBlock.data = { ...paragraphBlock.data, text };
        blocks.push(paragraphBlock);
      }
    }
  }

  // If no blocks found, create a paragraph with the HTML content
  if (blocks.length === 0) {
    const paragraphBlock = createBlock("paragraph") as Block;
    paragraphBlock.data = { ...paragraphBlock.data, text: html };
    blocks.push(paragraphBlock);
  }

  return { version: "1.0", blocks };
}

function elementToBlock(element: HTMLElement): Block | null {
  const tagName = element.tagName.toLowerCase();

  switch (tagName) {
    case "h1":
    case "h2":
    case "h3":
    case "h4":
    case "h5":
    case "h6": {
      const level = parseInt(tagName.charAt(1)) as 1 | 2 | 3 | 4 | 5 | 6;
      const block: any = createBlock("heading");
      block.data.level = level;
      block.data.text = element.textContent || "";
      const align = element.style.textAlign;
      if (align) {
        block.style = { align: align as any };
      }
      return block;
    }

    case "p": {
      const block = createBlock("paragraph") as any;
      block.data.text = element.textContent || "";
      const align = element.style.textAlign;
      if (align) {
        block.style = { align: align as any };
      }
      return block;
    }

    case "img": {
      const block = createBlock("image") as any;
      block.data.src = element.getAttribute("src") || "";
      block.data.alt = element.getAttribute("alt") || "";
      const width = element.getAttribute("width");
      const height = element.getAttribute("height");
      if (width) block.data.width = parseInt(width);
      if (height) block.data.height = parseInt(height);
      const align = element.getAttribute("data-align");
      if (align) {
        block.style = { align: align as any };
      }
      return block;
    }

    case "ul":
    case "ol": {
      const block = createBlock("list") as any;
      block.data.ordered = tagName === "ol";
      block.data.items = Array.from(element.querySelectorAll("li")).map(
        (li) => li.textContent || ""
      );
      return block;
    }

    case "blockquote": {
      const block = createBlock("quote") as any;
      const p = element.querySelector("p");
      block.data.text = p?.textContent || element.textContent || "";
      const cite = element.querySelector("cite");
      if (cite) {
        block.data.author = cite.textContent || "";
      }
      return block;
    }

    case "hr": {
      return createBlock("divider") as Block;
    }

    case "a": {
      // Check if it looks like a button
      if (element.classList.contains("btn") || element.classList.contains("button")) {
        const block = createBlock("button") as any;
        block.data.text = element.textContent || "";
        block.data.url = element.getAttribute("href") || "#";
        return block;
      }
      // Otherwise, treat as regular link in paragraph
      const block = createBlock("paragraph") as any;
      block.data.text = element.textContent || "";
      return block;
    }

    case "div": {
      // Check if it's a columns container
      if (element.classList.contains("columns-container")) {
        const block = createBlock("columns") as any;
        const style = element.getAttribute("style") || "";
        const columnsMatch = style.match(/grid-template-columns:\s*repeat\((\d+)/);
        const gapMatch = style.match(/gap:\s*(\d+)px/);
        
        const columns = columnsMatch ? parseInt(columnsMatch[1]) : 2;
        const gap = gapMatch ? parseInt(gapMatch[1]) : 16;
        
        block.data.columns = columns;
        block.data.gap = gap;
        
        // Parse column children
        const columnDivs = Array.from(element.querySelectorAll(":scope > div[class^='column-']"));
        const children: Block[][] = [];
        
        columnDivs.forEach((colDiv) => {
          const colBlocks: Block[] = [];
          Array.from(colDiv.childNodes).forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const childBlock = elementToBlock(node as HTMLElement);
              if (childBlock) {
                colBlocks.push(childBlock);
              }
            }
          });
          children.push(colBlocks);
        });
        
        // Ensure we have the right number of columns
        while (children.length < columns) {
          children.push([]);
        }
        
        block.data.children = children;
        return block;
      }
      
      // Check if it's a spacer
      const heightMatch = element.style.height?.match(/(\d+)px/);
      if (heightMatch) {
        const block = createBlock("spacer") as any;
        block.data.height = parseInt(heightMatch[1]);
        return block;
      }
      
      // Otherwise, try to extract text content
      const text = element.textContent?.trim();
      if (text) {
        const block = createBlock("paragraph") as any;
        block.data = { ...block.data, text };
        return block;
      }
      return null;
    }

    default:
      // For unknown elements, try to extract text content
      const text = element.textContent?.trim();
      if (text) {
        const block = createBlock("paragraph") as any;
        block.data = { ...block.data, text };
        return block;
      }
      return null;
  }
}

