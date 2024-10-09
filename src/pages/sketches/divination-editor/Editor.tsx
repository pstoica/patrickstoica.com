import React, { useState, useCallback, useRef } from "react";
import { javascript } from "@codemirror/lang-javascript";
import { EditorView, keymap, ViewUpdate } from "@codemirror/view";
import { type Extension, StateField, StateEffect } from "@codemirror/state";
import { DynamicCodeMirror } from "../../../components/DynamicCodeMirror";
import { createTheme } from "@uiw/codemirror-themes";
import { tags as t } from "@lezer/highlight";
import {
  autocompletion,
  CompletionContext,
  type CompletionResult,
  acceptCompletion,
  startCompletion,
  moveCompletionSelection,
  completionStatus,
  completionKeymap,
} from "@codemirror/autocomplete";
import { defaultKeymap } from "@codemirror/commands";
import { indentService } from "@codemirror/language";
import { EditorState } from "@codemirror/state";

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
const resetSuggestionsOnChange = StateEffect.define<null>();

const suggestionsField = StateField.define<string[]>({
  create: () => [],
  update(value, tr) {
    for (let e of tr.effects) {
      if (e.is(setSuggestions)) return e.value;
      if (e.is(resetSuggestionsOnChange)) return [];
    }
    // Remove this line to prevent clearing suggestions on document changes
    // if (tr.docChanged || tr.selection) {
    //   return [];
    // }
    return value;
  },
});

const setSuggestions = StateEffect.define<string[]>();

// Custom autocomplete function
function customAutocomplete(
  context: CompletionContext
): CompletionResult | null {
  console.log("customAutocomplete called");
  const suggestions = context.state.field(suggestionsField);
  console.log("Current suggestions:", suggestions);
  if (suggestions.length === 0) return null;

  return {
    from: context.pos,
    options: suggestions.map((label, index) => ({
      label: `${index + 1}. ${label}`,
      type: "text",
      apply: label.split(". ")[1] || label, // Remove the number prefix when applying
    })),
    validFor: /^\w*$/,
  };
}

// Add this utility function at the top of your file
function safeDispatch(view: EditorView, spec: any) {
  const docLength = view.state.doc.length;
  if (spec.changes) {
    const change = spec.changes.toJSON()[0];
    if (change.from > docLength || change.to > docLength) {
      console.warn(
        `Attempted invalid change: ${JSON.stringify(
          change
        )} for doc length ${docLength}`
      );
      return false;
    }
  }
  if (spec.selection) {
    const { anchor, head } = spec.selection;
    if (anchor > docLength || head > docLength) {
      console.warn(
        `Attempted invalid selection: anchor=${anchor}, head=${head} for doc length ${docLength}`
      );
      return false;
    }
  }
  view.dispatch(spec);
  return true;
}

async function fetchAndShowSuggestions(
  view: EditorView,
  wordCount: number = 3
) {
  console.log("fetchAndShowSuggestions called");
  const cursorPos = view.state.selection.main.head;
  const content = view.state.doc.toString();

  try {
    console.log("Sending request to /divinate");
    const response = await fetch("/sketches/divination-editor/divinate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, cursorPosition: cursorPos, wordCount }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Received suggestions:", data.suggestions);

      view.dispatch({
        effects: [
          setSuggestions.of(data.suggestions),
          EditorView.scrollIntoView(cursorPos),
        ],
      });

      startCompletion(view);
      console.log("Completion started");
    } else {
      console.error("Failed to fetch suggestions");
    }
  } catch (error) {
    console.error("Error fetching suggestions:", error);
  }
}

function selectCompletion(view: EditorView, index: number) {
  const suggestions = view.state.field(suggestionsField);
  if (index < suggestions.length) {
    const suggestion = suggestions[index].split(". ")[1] || suggestions[index];
    const from = view.state.selection.main.head;
    const to = Math.min(from + suggestion.length, view.state.doc.length);

    return safeDispatch(view, {
      changes: { from, insert: suggestion },
      selection: { anchor: to, head: to },
      effects: setSuggestions.of([]), // Clear suggestions after selection
    });
  }
  return false;
}

// Custom indentation function
const noIndent = EditorState.transactionFilter.of((tr) => {
  if (!tr.changes.empty && tr.isUserEvent("input.type")) {
    const pos = tr.newSelection.main.head - 1;
    const line = tr.newDoc.lineAt(pos);
    if (line.from === pos && tr.newDoc.sliceString(pos - 1, pos) === "\n") {
      return [
        tr,
        { changes: { from: pos, to: tr.newDoc.lineAt(pos).to, insert: "" } },
      ];
    }
  }
  return tr;
});

// Simplify the custom extensions
const customExtensions: Extension[] = [
  javascript(),
  EditorView.lineWrapping,
  indentService.of((context, pos) => 0), // Always return 0 indentation
  noIndent, // Add the custom indentation function
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
    ".cm-content": {
      maxWidth: "100%",
      wordWrap: "break-word",
    },
    ".cm-placeholder": {
      color: "#6a737d",
    },
  }),
  suggestionsField,
  autocompletion({
    override: [customAutocomplete],
    defaultKeymap: false,
    activateOnTyping: false,
  }),
  EditorView.updateListener.of((update) => {
    // Only reset suggestions if the document changed and it wasn't caused by accepting a completion
    if (
      update.docChanged &&
      !update.transactions.some((tr) => tr.isUserEvent("input.complete"))
    ) {
      update.view.dispatch({
        effects: resetSuggestionsOnChange.of(null),
      });
    }
  }),
  keymap.of([
    ...defaultKeymap.filter(
      (b) => b.key !== "ArrowUp" && b.key !== "ArrowDown" && b.key !== "Enter"
    ),
    {
      key: "Ctrl-i",
      run: (view) => {
        console.log("Ctrl-i pressed");
        fetchAndShowSuggestions(view);
        return true;
      },
    },
    {
      key: "Alt-1",
      run: (view) => selectCompletion(view, 0),
    },
    {
      key: "Alt-2",
      run: (view) => selectCompletion(view, 1),
    },
    {
      key: "Alt-3",
      run: (view) => selectCompletion(view, 2),
    },
    ...Array.from({ length: 9 }, (_, i) => ({
      key: `Ctrl-${i + 1}`,
      run: (view: EditorView) => {
        fetchAndShowSuggestions(view, i + 1);
        return true;
      },
    })),
    {
      key: "ArrowDown",
      run: (view) => {
        if (completionStatus(view.state)) {
          moveCompletionSelection(true)(view);
          return true;
        }
        return false;
      },
    },
    {
      key: "ArrowUp",
      run: (view) => {
        if (completionStatus(view.state)) {
          moveCompletionSelection(false)(view);
          return true;
        }
        return false;
      },
    },
    {
      key: "Enter",
      run: (view) => {
        if (completionStatus(view.state)) {
          acceptCompletion(view);
          view.dispatch({ effects: setSuggestions.of([]) });
          return true;
        }
        return false;
      },
    },
  ]),
];

const Editor: React.FC = () => {
  const [code, setCode] = useState("");
  const editorRef = useRef<EditorView | null>(null);

  const onChange = useCallback((value: string, viewUpdate: ViewUpdate) => {
    setCode(value);
    console.log("Document length:", viewUpdate.state.doc.length);
  }, []);

  const triggerSuggestions = useCallback(() => {
    if (editorRef.current) {
      fetchAndShowSuggestions(editorRef.current);
    }
  }, []);

  return (
    <div style={{ position: "relative", height: "100vh" }}>
      <button onClick={triggerSuggestions}>Get Suggestions</button>
      <DynamicCodeMirror
        autoFocus
        value={code}
        height="calc(100% - 40px)"
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
