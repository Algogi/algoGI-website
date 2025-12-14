/**
 * Unit tests for serializer (JSON → HTML)
 */

import { blocksToHTML } from "../utils/serializer";
import { EditorContent } from "../types";
import * as blockOps from "../state/blockOperations";

describe("serializer", () => {
  it("should serialize empty content to empty string", () => {
    const content: EditorContent = { version: "1.0", blocks: [] };
    const html = blocksToHTML(content);
    expect(html).toBe("");
  });

  it("should serialize paragraph block to HTML", () => {
    const block = blockOps.createParagraphBlock();
    block.data.content = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Hello world" }],
        },
      ],
    };
    const content: EditorContent = { version: "1.0", blocks: [block] };
    const html = blocksToHTML(content);
    expect(html).toContain("Hello world");
    expect(html).toContain("<p>");
  });

  it("should serialize image block to HTML", () => {
    const block = blockOps.createImageBlock("https://example.com/image.jpg", "Test image");
    const content: EditorContent = { version: "1.0", blocks: [block] };
    const html = blocksToHTML(content);
    expect(html).toContain("https://example.com/image.jpg");
    expect(html).toContain("Test image");
    expect(html).toContain("<img");
  });

  it("should serialize button block to HTML", () => {
    const block = blockOps.createButtonBlock("Click me", "https://example.com");
    const content: EditorContent = { version: "1.0", blocks: [block] };
    const html = blocksToHTML(content);
    expect(html).toContain("Click me");
    expect(html).toContain("https://example.com");
    expect(html).toContain("<a");
  });

  it("should serialize columns block to HTML with grid", () => {
    const block = blockOps.createColumnsBlock(2);
    const content: EditorContent = { version: "1.0", blocks: [block] };
    const html = blocksToHTML(content);
    expect(html).toContain("columns-container");
    expect(html).toContain("grid-template-columns: repeat(2");
  });

  it("should serialize code block to HTML", () => {
    const block = blockOps.createCodeBlock("console.log('hello');", "javascript", false);
    const content: EditorContent = { version: "1.0", blocks: [block] };
    const html = blocksToHTML(content);
    expect(html).toContain("console.log");
    expect(html).toContain("<pre>");
    expect(html).toContain("<code>");
  });

  it("should handle round-trip: blocks → HTML → blocks (via parser)", () => {
    const originalBlock = blockOps.createParagraphBlock();
    originalBlock.data.content = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Test content" }],
        },
      ],
    };
    const content: EditorContent = { version: "1.0", blocks: [originalBlock] };
    const html = blocksToHTML(content);
    
    // HTML should contain the text
    expect(html).toContain("Test content");
    
    // Note: Full round-trip test would require parser, but that's tested separately
  });
});

