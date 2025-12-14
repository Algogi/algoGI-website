import { Node, mergeAttributes } from "@tiptap/core";
import Image from "@tiptap/extension-image";

export interface ResizableImageOptions {
  inline: boolean;
  allowBase64: boolean;
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    resizableImage: {
      setResizableImage: (options: {
        src: string;
        alt?: string;
        width?: number;
        height?: number;
        align?: "left" | "right" | "center" | "full-width";
        aspectRatio?: boolean;
      }) => ReturnType;
      setImageWidth: (width: number) => ReturnType;
      setImageHeight: (height: number) => ReturnType;
      setImageAlign: (align: "left" | "right" | "center" | "full-width") => ReturnType;
    };
  }
}

export const ResizableImage = Image.extend<ResizableImageOptions>({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => {
          const width = element.getAttribute("data-width") || element.getAttribute("width");
          return width ? parseInt(width, 10) : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.width) {
            return {};
          }
          return {
            width: attributes.width.toString(),
            "data-width": attributes.width.toString(),
          };
        },
      },
      height: {
        default: null,
        parseHTML: (element) => {
          const height = element.getAttribute("data-height") || element.getAttribute("height");
          return height ? parseInt(height, 10) : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.height) {
            return {};
          }
          return {
            height: attributes.height.toString(),
            "data-height": attributes.height.toString(),
          };
        },
      },
      align: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-align"),
        renderHTML: (attributes) => {
          if (!attributes.align) {
            return {};
          }
          return {
            "data-align": attributes.align,
          };
        },
      },
      aspectRatio: {
        default: false,
        parseHTML: (element) => element.getAttribute("data-aspect-ratio") === "true",
        renderHTML: (attributes) => {
          if (!attributes.aspectRatio) {
            return {};
          }
          return {
            "data-aspect-ratio": "true",
          };
        },
      },
    };
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setResizableImage:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
      setImageWidth:
        (width: number) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, { width });
        },
      setImageHeight:
        (height: number) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, { height });
        },
      setImageAlign:
        (align: "left" | "right" | "center" | "full-width") =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, { align });
        },
    };
  },
});

