import React, { useState, useCallback, useRef, useEffect } from "react";
import { javascript } from "@codemirror/lang-javascript";
import { EditorView, keymap, ViewUpdate } from "@codemirror/view";
import {
  type Extension,
  EditorState,
  StateField,
  StateEffect,
} from "@codemirror/state";
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

// Custom completions
const customCompletions = [
  { label: "option1", type: "keyword" },
  { label: "option2", type: "keyword" },
  { label: "option3", type: "keyword" },
];

// Custom autocomplete function
function customAutocomplete(
  context: CompletionContext
): CompletionResult | null {
  let word = context.matchBefore(/\w+/);
  if (word?.from == word?.to && !context.explicit) return null;
  return {
    from: word?.from ?? context.pos,
    options: customCompletions,
    validFor: /^\w*$/,
  };
}

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
  }),
  autocompletion({ override: [customAutocomplete] }),
  suggestionsField,
  keymap.of([
    {
      key: "Mod-Space",
      run: (view) => {
        view.dispatch({
          effects: setSuggestions.of(customCompletions.map((c) => c.label)),
        });
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

interface SuggestionMenuProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  position: { top: number; left: number };
}

const SuggestionMenu: React.FC<SuggestionMenuProps> = ({
  suggestions,
  onSelect,
  position,
}) => {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const key = parseInt(e.key);
      if (key >= 1 && key <= suggestions.length) {
        onSelect(suggestions[key - 1]);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [suggestions, onSelect]);

  return (
    <div
      style={{
        position: "absolute",
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 1000,
      }}
    >
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSelect(suggestion)}
          className="bg-black text-white px-2 py-1 m-1 rounded focus:outline-none"
        >
          {index + 1}: {suggestion}
        </button>
      ))}
    </div>
  );
};

const Editor: React.FC = () => {
  const [code, setCode] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const editorRef = useRef<EditorView | null>(null);

  const onChange = useCallback((value: string, viewUpdate: ViewUpdate) => {
    setCode(value);
    const newSuggestions = viewUpdate.state.field(suggestionsField);
    setSuggestions(newSuggestions);
  }, []);

  const fetchSuggestions = async (cursorPos: number) => {
    try {
      const response = await fetch("/divinate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: code,
          cursorPosition: cursorPos,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions);
      } else {
        console.error("Failed to fetch suggestions");
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "i" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        const editor = editorRef.current;
        if (editor) {
          const cursorPos = editor.state.selection.main.head;
          const coords = editor.coordsAtPos(cursorPos);
          if (coords) {
            setMenuPosition({ top: coords.top, left: coords.left });
            fetchSuggestions(cursorPos);
          }
        }
      }
    },
    [code]
  );

  const handleSuggestionSelect = useCallback((suggestion: string) => {
    const editor = editorRef.current;
    if (editor) {
      const cursorPos = editor.state.selection.main.head;
      editor.dispatch({
        changes: { from: cursorPos, insert: suggestion },
      });
    }
    setSuggestions([]);
  }, []);

  return (
    <div
      onKeyDown={handleKeyDown}
      style={{ position: "relative", height: "100vh" }}
    >
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
      {suggestions.length > 0 && (
        <SuggestionMenu
          suggestions={suggestions}
          onSelect={handleSuggestionSelect}
          position={menuPosition}
        />
      )}
    </div>
  );
};

export default Editor;
