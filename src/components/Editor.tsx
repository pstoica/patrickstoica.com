import React, { useState, useCallback, useRef } from "react";
import { javascript } from "@codemirror/lang-javascript";
import { EditorView, keymap, ViewUpdate } from "@codemirror/view";
import { type Extension, StateField, StateEffect } from "@codemirror/state";
import { DynamicCodeMirror } from "./DynamicCodeMirror";
import { createTheme } from "@uiw/codemirror-themes";
import { tags as t } from "@lezer/highlight";
import {
  autocompletion,
  CompletionContext,
  type CompletionResult,
} from "@codemirror/autocomplete";

// Custom minimalist theme
const minimalistTheme = createTheme({
  theme: "dark",
  settings: {
    background: "#000000",
    foreground: "#ffffff",
    caret: "#ffffff",
    selection: "#ffffff33",
    selectionMatch: "#ffffff33",
    lineHighlight: "transparent",
  },
  styles: [
    { tag: t.comment, color: "#6a737d" },
    { tag: t.variableName, color: "#ffffff" },
    { tag: [t.string, t.special(t.brace)], color: "#ffffff" },
    { tag: t.number, color: "#ffffff" },
    { tag: t.bool, color: "#ffffff" },
    { tag: t.null, color: "#ffffff" },
    { tag: t.keyword, color: "#ffffff" },
    { tag: t.operator, color: "#ffffff" },
    { tag: t.className, color: "#ffffff" },
    { tag: t.definition(t.typeName), color: "#ffffff" },
    { tag: t.typeName, color: "#ffffff" },
    { tag: t.angleBracket, color: "#ffffff" },
    { tag: t.tagName, color: "#ffffff" },
    { tag: t.attributeName, color: "#ffffff" },
  ],
});

// State field to store current suggestions
const suggestionsField = StateField.define<string[]>({
  create: () => [],
  update(value, tr) {
    for (let e of tr.effects) {
      if (e.is(setSuggestions)) return e.value;
    }
    return value;
  },
});

const setSuggestions = StateEffect.define<string[]>();

// Custom autocomplete function
function customAutocomplete(
  context: CompletionContext
): CompletionResult | null {
  const suggestions = context.state.field(suggestionsField);
  if (suggestions.length === 0) return null;

  return {
    from: context.pos,
    options: suggestions.map((label) => ({ label, type: "text" })),
    validFor: /^\w*$/,
  };
}

// Custom extensions for CodeMirror
const customExtensions: Extension[] = [
  javascript(),
  EditorView.theme({
    "&": {
      fontSize: "24px",
      fontFamily: "Georgia, serif",
    },
    "&.cm-focused": {
      outline: "none !important",
    },
    ".cm-gutters": {
      display: "none",
    },
    ".cm-line": {
      padding: "0 10px",
    },
    ".cm-placeholder": {
      color: "#6a737d",
    },
    // Custom styles for autocomplete popup
    ".cm-tooltip.cm-tooltip-autocomplete": {
      border: "none",
      backgroundColor: "#1c1c1c",
    },
    ".cm-tooltip-autocomplete ul li": {
      fontFamily: "Georgia, serif",
    },
    ".cm-tooltip-autocomplete ul li[aria-selected]": {
      backgroundColor: "#2c2c2c",
    },
  }),
  autocompletion({
    override: [customAutocomplete],
    defaultKeymap: false,
    optionClass: () => "custom-autocomplete-option",
  }),
  suggestionsField,
  keymap.of([
    {
      key: "Mod-i",
      run: (view) => {
        fetchAndShowSuggestions(view);
        return true;
      },
    },
    { key: "Mod-1", run: (view) => selectCompletion(view, 0) },
    { key: "Mod-2", run: (view) => selectCompletion(view, 1) },
    { key: "Mod-3", run: (view) => selectCompletion(view, 2) },
  ]),
];

function selectCompletion(view: EditorView, index: number) {
  const suggestions = view.state.field(suggestionsField);
  if (index < suggestions.length) {
    view.dispatch({
      changes: {
        from: view.state.selection.main.head,
        insert: suggestions[index],
      },
    });
  }
  return true;
}

async function fetchAndShowSuggestions(view: EditorView) {
  const cursorPos = view.state.selection.main.head;
  const content = view.state.doc.toString();

  try {
    const response = await fetch("/divinate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content,
        cursorPosition: cursorPos,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      view.dispatch({
        effects: setSuggestions.of(data.suggestions),
      });
      view.dispatch({ effects: EditorView.scrollIntoView(cursorPos) });
    } else {
      console.error("Failed to fetch suggestions");
    }
  } catch (error) {
    console.error("Error fetching suggestions:", error);
  }

  return true; // Indicate that the command was handled
}

const Editor: React.FC = () => {
  const [code, setCode] = useState("");
  const editorRef = useRef<EditorView | null>(null);

  const onChange = useCallback((value: string, viewUpdate: ViewUpdate) => {
    setCode(value);
  }, []);

  return (
    <div style={{ position: "relative", height: "100vh" }}>
      <DynamicCodeMirror
        autoFocus
        value={code}
        height="100%"
        theme={minimalistTheme}
        extensions={customExtensions}
        onChange={onChange}
        placeholder="Start typing..."
        ref={(editor) => {
          if (editor) {
            editorRef.current = editor.view;
          }
        }}
      />
    </div>
  );
};

export default Editor;
