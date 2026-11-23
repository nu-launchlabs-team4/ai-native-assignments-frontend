"use client";

import dynamic from "next/dynamic";

import { useTheme } from "@/lib/theme";

// Monaco needs the browser, so it never renders on the server.
// @monaco-editor/react loads the editor itself from a CDN on first use.
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <EditorLoading />,
});

function EditorLoading() {
  return (
    <div role="status" className="flex h-full items-center justify-center text-sm text-muted">
      Loading editor…
    </div>
  );
}

interface CodeEditorProps {
  value: string;
  /** Monaco language id, such as "python". */
  language: string;
  /** Accessible name for the editor's text area. */
  ariaLabel: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}

/** Code editor for the student's work. */
export function CodeEditor({ value, language, ariaLabel, onChange, readOnly = false }: CodeEditorProps) {
  const theme = useTheme();

  return (
    // Monaco sizes itself to its parent, so give it a box with a definite size.
    <div className="relative h-full min-h-80 lg:min-h-0">
      <div className="absolute inset-0">
        <MonacoEditor
          height="100%"
          theme={theme === "dark" ? "vs-dark" : "light"}
          language={language}
          value={value}
          onChange={(next) => onChange?.(next ?? "")}
          options={{
            ariaLabel,
            automaticLayout: true,
            fontSize: 14,
            minimap: { enabled: false },
            readOnly,
            scrollBeyondLastLine: false,
            tabSize: 4,
          }}
        />
      </div>
    </div>
  );
}
