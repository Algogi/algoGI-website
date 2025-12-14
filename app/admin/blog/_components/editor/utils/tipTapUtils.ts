/**
 * TipTap utility functions for converting between TipTap JSON and HTML
 */

import { JSONContent, generateHTML } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Code from "@tiptap/extension-code";
import CodeBlock from "@tiptap/extension-code-block";

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

/**
 * Convert TipTap JSON content to HTML
 */
export function tipTapJSONToHTML(json: JSONContent): string {
  try {
    return generateHTML(json, extensions);
  } catch (error) {
    console.error("Error converting TipTap JSON to HTML:", error);
    return "";
  }
}

/**
 * Extract plain text from TipTap JSON content
 */
export function tipTapJSONToText(json: JSONContent): string {
  if (!json) return "";
  
  if (typeof json === "string") return json;
  
  if (json.text) return json.text;
  
  if (json.content && Array.isArray(json.content)) {
    return json.content.map(tipTapJSONToText).join("");
  }
  
  return "";
}

