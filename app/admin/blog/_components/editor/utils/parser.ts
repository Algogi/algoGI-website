/**
 * Parse HTML to blocks (for backward compatibility with existing HTML content)
 */

import { Block, EditorContent } from "../types";
import { JSONContent } from "@tiptap/core";
import { generateJSON } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Code from "@tiptap/extension-code";
import CodeBlock from "@tiptap/extension-code-block";
import * as blockOps from "../state/blockOperations";

const extensions = [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3, 4],
    },
  }),
  Link,
  Underline,
  Code,
  CodeBlock,
];

export function htmlToBlocks(html: string): EditorContent {
  if (!html || html.trim() === "") {
    return { version: "1.0", blocks: [] };
  }

  if (typeof window === "undefined") {
    // Server-side: return simple paragraph block
    return {
      version: "1.0",
      blocks: [
        blockOps.createParagraphBlock(),
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
        const paragraphBlock = blockOps.createParagraphBlock();
        // Convert text to TipTap JSON
        try {
          const json = generateJSON(text, extensions);
          paragraphBlock.data = { ...paragraphBlock.data, content: json };
        } catch {
          // Fallback to simple text
          paragraphBlock.data = {
            ...paragraphBlock.data,
            content: {
              type: "doc",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text }],
                },
              ],
            },
          };
        }
        blocks.push(paragraphBlock);
      }
    }
  }

  // If no blocks found, create a paragraph with the HTML content
  if (blocks.length === 0) {
    const paragraphBlock = blockOps.createParagraphBlock();
    try {
      const json = generateJSON(html, extensions);
      paragraphBlock.data = { ...paragraphBlock.data, content: json };
    } catch {
      paragraphBlock.data = {
        ...paragraphBlock.data,
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: html }],
            },
          ],
        },
      };
    }
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
    case "p": {
      // Convert all headings and paragraphs to paragraph blocks
      // Headings will be preserved in the TipTap JSON content
      const paragraphBlock = blockOps.createParagraphBlock();
      try {
        const json = generateJSON(element.innerHTML, extensions);
        paragraphBlock.data = { ...paragraphBlock.data, content: json };
      } catch {
        // If it's a heading, preserve the heading structure
        if (tagName.startsWith("h")) {
          const level = parseInt(tagName.charAt(1)) as 1 | 2 | 3 | 4;
          paragraphBlock.data = {
            ...paragraphBlock.data,
            content: {
              type: "doc",
              content: [
                {
                  type: "heading",
                  attrs: { level },
                  content: [{ type: "text", text: element.textContent || "" }],
                },
              ],
            },
          };
        } else {
          paragraphBlock.data = {
            ...paragraphBlock.data,
            content: {
              type: "doc",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: element.textContent || "" }],
                },
              ],
            },
          };
        }
      }
      return paragraphBlock;
    }

    case "img": {
      const imageBlock = blockOps.createImageBlock();
      imageBlock.data = {
        src: element.getAttribute("src") || "",
        alt: element.getAttribute("alt") || "",
      };
      const width = element.getAttribute("width");
      const height = element.getAttribute("height");
      if (width) imageBlock.data.width = parseInt(width);
      if (height) imageBlock.data.height = parseInt(height);
      
      // Check for caption in figure
      const figure = element.closest("figure");
      if (figure) {
        const figcaption = figure.querySelector("figcaption");
        if (figcaption) {
          imageBlock.data.caption = figcaption.textContent || "";
        }
      }
      return imageBlock;
    }

    case "a": {
      // Check if it looks like a button
      if (element.classList.contains("btn-primary") || 
          element.classList.contains("btn-secondary") ||
          element.classList.contains("button") ||
          element.classList.contains("btn")) {
        const buttonBlock = blockOps.createButtonBlock();
        buttonBlock.data = {
          text: element.textContent || "",
          url: element.getAttribute("href") || "#",
          variant: element.classList.contains("btn-secondary") ? "secondary" : "primary",
        };
        return buttonBlock;
      }
      // Otherwise, treat as regular link in paragraph
      const paragraphBlock = blockOps.createParagraphBlock();
      try {
        const json = generateJSON(element.outerHTML, extensions);
        paragraphBlock.data = { ...paragraphBlock.data, content: json };
      } catch {
        paragraphBlock.data = {
          ...paragraphBlock.data,
          content: {
            type: "doc",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: element.textContent || "" }],
              },
            ],
          },
        };
      }
      return paragraphBlock;
    }

    case "pre": {
      const codeElement = element.querySelector("code");
      const codeBlock = blockOps.createCodeBlock();
      codeBlock.data = {
        code: codeElement?.textContent || element.textContent || "",
        language: codeElement?.className.match(/language-(\w+)/)?.[1],
        inline: false,
      };
      return codeBlock;
    }

    case "code": {
      // Check if it's inside a pre (code block) or standalone (inline)
      if (element.parentElement?.tagName.toLowerCase() === "pre") {
        // Already handled by pre case
        return null;
      }
      const codeBlock = blockOps.createCodeBlock();
      codeBlock.data = {
        code: element.textContent || "",
        inline: true,
      };
      return codeBlock;
    }

    case "div": {
      // Check if it's a columns container
      if (element.classList.contains("columns-container")) {
        const columnsBlock = blockOps.createColumnsBlock(2);
        const style = element.getAttribute("style") || "";
        const columnsMatch = style.match(/grid-template-columns:\s*repeat\((\d+)/);
        const gapMatch = style.match(/gap:\s*(\d+)px/);
        
        const columnCount = (columnsMatch ? parseInt(columnsMatch[1]) : 2) as 2 | 3 | 4;
        const gap = gapMatch ? parseInt(gapMatch[1]) : 16;
        
        columnsBlock.data.columnCount = columnCount;
        columnsBlock.data.gap = gap;
        
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
        while (children.length < columnCount) {
          children.push([]);
        }
        
        columnsBlock.data.columns = children;
        return columnsBlock;
      }
      
      // Otherwise, try to extract text content as paragraph
      const text = element.textContent?.trim();
      if (text) {
        const paragraphBlock = blockOps.createParagraphBlock();
        try {
          const json = generateJSON(element.innerHTML, extensions);
          paragraphBlock.data = { ...paragraphBlock.data, content: json };
        } catch {
          paragraphBlock.data = {
            ...paragraphBlock.data,
            content: {
              type: "doc",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text }],
                },
              ],
            },
          };
        }
        return paragraphBlock;
      }
      return null;
    }

    default:
      // For unknown elements, try to extract text content as paragraph
      const text = element.textContent?.trim();
      if (text) {
        const paragraphBlock = blockOps.createParagraphBlock();
        try {
          const json = generateJSON(element.innerHTML, extensions);
          paragraphBlock.data = { ...paragraphBlock.data, content: json };
        } catch {
          paragraphBlock.data = {
            ...paragraphBlock.data,
            content: {
              type: "doc",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text }],
                },
              ],
            },
          };
        }
        return paragraphBlock;
      }
      return null;
  }
}

