import { Node, mergeAttributes } from "@tiptap/core";

export interface GridRowOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    gridRow: {
      insertGridRow: () => ReturnType;
    };
    gridColumn: {
      insertGridColumn: (span?: number) => ReturnType;
      setColumnSpan: (span: number) => ReturnType;
    };
  }
}

// Grid Row Extension
export const GridRow = Node.create<GridRowOptions>({
  name: "gridRow",
  group: "block",
  content: "gridColumn+",
  isolating: true,

  addAttributes() {
    return {
      class: {
        default: "grid-row",
        parseHTML: (element) => element.getAttribute("class"),
        renderHTML: (attributes) => {
          if (!attributes.class) {
            return {};
          }
          return {
            class: attributes.class,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-grid-row]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-grid-row": "", class: "grid grid-cols-12 gap-4" }), 0];
  },

  addCommands() {
    return {
      insertGridRow:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            content: [
              {
                type: "gridColumn",
                attrs: { span: 12 },
              },
            ],
          });
        },
    };
  },
});

// Grid Column Extension
export const GridColumn = Node.create({
  name: "gridColumn",
  group: "block",
  content: "block+",
  isolating: true,

  addAttributes() {
    return {
      span: {
        default: 12,
        parseHTML: (element) => {
          const span = element.getAttribute("data-span");
          return span ? parseInt(span, 10) : 12;
        },
        renderHTML: (attributes) => {
          if (!attributes.span) {
            return {};
          }
          return {
            "data-span": attributes.span.toString(),
            style: `grid-column: span ${attributes.span}`,
          };
        },
      },
      class: {
        default: "grid-column",
        parseHTML: (element) => element.getAttribute("class"),
        renderHTML: (attributes) => {
          if (!attributes.class) {
            return {};
          }
          return {
            class: attributes.class,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-grid-column]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const span = HTMLAttributes.span || 12;
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-grid-column": "",
        class: "grid-column",
        style: `grid-column: span ${span}`,
      }),
      0,
    ];
  },

  addCommands() {
    return {
      insertGridColumn:
        (span = 6) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { span },
          });
        },
      setColumnSpan:
        (span: number) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, { span });
        },
    };
  },
});


