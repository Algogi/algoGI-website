/**
 * Unit tests for parser (HTML → JSON)
 */

import { htmlToBlocks } from "../utils/parser";
import { EditorContent } from "../types";

describe("parser", () => {
  it("should parse empty HTML to empty blocks", () => {
    const content = htmlToBlocks("");
    expect(content.blocks.length).toBe(0);
  });

  it("should parse paragraph HTML to paragraph block", () => {
    const html = "<p>Hello world</p>";
    const content = htmlToBlocks(html);
    expect(content.blocks.length).toBeGreaterThan(0);
    expect(content.blocks[0].type).toBe("paragraph");
  });

  it("should parse heading HTML to heading block", () => {
    const html = "<h1>Main Title</h1>";
    const content = htmlToBlocks(html);
    expect(content.blocks.length).toBeGreaterThan(0);
    expect(content.blocks[0].type).toBe("heading");
    if (content.blocks[0].type === "heading") {
      expect(content.blocks[0].data.level).toBe(1);
    }
  });

  it("should parse image HTML to image block", () => {
    const html = '<img src="https://example.com/image.jpg" alt="Test" />';
    const content = htmlToBlocks(html);
    expect(content.blocks.length).toBeGreaterThan(0);
    expect(content.blocks[0].type).toBe("image");
    if (content.blocks[0].type === "image") {
      expect(content.blocks[0].data.src).toBe("https://example.com/image.jpg");
      expect(content.blocks[0].data.alt).toBe("Test");
    }
  });

  it("should parse button HTML to button block", () => {
    const html = '<a href="https://example.com" class="btn-primary">Click me</a>';
    const content = htmlToBlocks(html);
    expect(content.blocks.length).toBeGreaterThan(0);
    expect(content.blocks[0].type).toBe("button");
    if (content.blocks[0].type === "button") {
      expect(content.blocks[0].data.url).toBe("https://example.com");
      expect(content.blocks[0].data.text).toBe("Click me");
    }
  });

  it("should parse columns HTML to columns block", () => {
    const html = '<div class="columns-container" style="display: grid; grid-template-columns: repeat(2, 1fr);"><div class="column-1"><p>Col 1</p></div><div class="column-2"><p>Col 2</p></div></div>';
    const content = htmlToBlocks(html);
    expect(content.blocks.length).toBeGreaterThan(0);
    expect(content.blocks[0].type).toBe("columns");
    if (content.blocks[0].type === "columns") {
      expect(content.blocks[0].data.columnCount).toBe(2);
      expect(content.blocks[0].data.columns.length).toBe(2);
    }
  });

  it("should parse code block HTML to code block", () => {
    const html = "<pre><code>console.log('hello');</code></pre>";
    const content = htmlToBlocks(html);
    expect(content.blocks.length).toBeGreaterThan(0);
    expect(content.blocks[0].type).toBe("code");
    if (content.blocks[0].type === "code") {
      expect(content.blocks[0].data.code).toContain("console.log");
      expect(content.blocks[0].data.inline).toBe(false);
    }
  });
});

