"use client";

import { useState } from "react";

import { MathField } from "./MathField";

interface MathLine {
  /** Stable key, so removing a line keeps the other editors in place. */
  key: number;
  latex: string;
}

interface MathAnswerProps {
  /** LaTeX lines separated by "\n", one per step of working. */
  value: string;
  ariaLabel: string;
  onChange: (value: string) => void;
}

function toLines(value: string): MathLine[] {
  const parts = value === "" ? [""] : value.split("\n");
  return parts.map((latex, index) => ({ key: index, latex }));
}

/** Step-by-step math answer: one visual equation editor per line of working. */
export function MathAnswer({ value, ariaLabel, onChange }: MathAnswerProps) {
  const [lines, setLines] = useState<MathLine[]>(() => toLines(value));
  const [nextKey, setNextKey] = useState(lines.length);

  function update(nextLines: MathLine[]) {
    setLines(nextLines);
    onChange(nextLines.map((line) => line.latex).join("\n"));
  }

  function addLine() {
    update([...lines, { key: nextKey, latex: "" }]);
    setNextKey(nextKey + 1);
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <ol className="flex flex-col gap-2">
        {lines.map((line, index) => (
          <li key={line.key} className="flex items-center gap-2">
            <span aria-hidden="true" className="w-6 text-right text-xs text-muted tabular-nums">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <MathField
                initialValue={line.latex}
                ariaLabel={`${ariaLabel}, step ${index + 1}`}
                onChange={(latex) =>
                  update(lines.map((other) => (other.key === line.key ? { ...other, latex } : other)))
                }
              />
            </div>
            {lines.length > 1 && (
              <button
                type="button"
                onClick={() => update(lines.filter((other) => other.key !== line.key))}
                aria-label={`Remove step ${index + 1}`}
                className="inline-flex size-8 items-center justify-center rounded text-muted hover:bg-line hover:text-foreground focus-visible:outline-2"
              >
                ×
              </button>
            )}
          </li>
        ))}
      </ol>
      <button
        type="button"
        onClick={addLine}
        className="self-start rounded border border-line px-3 py-1.5 text-sm hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        + Add step
      </button>
    </div>
  );
}
