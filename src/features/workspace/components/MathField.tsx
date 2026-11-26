"use client";

import type { MathfieldElement } from "mathlive";
import { useEffect, useRef, useState } from "react";

interface MathFieldProps {
  /** LaTeX shown when the field first mounts. Later changes come from typing. */
  initialValue: string;
  ariaLabel: string;
  onChange: (latex: string) => void;
  readOnly?: boolean;
}

/**
 * One visual equation editor (MathLive). Students build math with the keyboard or
 * the on-screen math keyboard, and the value is LaTeX.
 */
export function MathField({ initialValue, ariaLabel, onChange, readOnly = false }: MathFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<MathfieldElement | null>(null);
  // Read once at mount. Afterwards the field owns its value, so prop changes must not reset it.
  const initialValueRef = useRef(initialValue);
  const onChangeRef = useRef(onChange);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    let cancelled = false;

    // MathLive needs the browser, so it loads only on the client.
    import("mathlive").then(({ MathfieldElement, version }) => {
      if (cancelled || !containerRef.current) return;
      // Bundling moves MathLive away from its fonts folder, so load the fonts for this exact version from the CDN.
      MathfieldElement.fontsDirectory = `https://cdn.jsdelivr.net/npm/mathlive@${version.mathlive}/fonts`;
      MathfieldElement.soundsDirectory = null;

      const mathField = new MathfieldElement();
      mathField.value = initialValueRef.current;
      mathField.className = "block w-full rounded-md border border-field bg-surface px-3 py-2 text-lg";
      mathField.addEventListener("input", () => onChangeRef.current(mathField.value));
      containerRef.current.append(mathField);
      fieldRef.current = mathField;
      setIsReady(true);
    });

    return () => {
      cancelled = true;
      fieldRef.current?.remove();
      fieldRef.current = null;
    };
  }, []);

  // Step numbers shift when a line is removed, so keep the label current.
  useEffect(() => {
    fieldRef.current?.setAttribute("aria-label", ariaLabel);
  }, [ariaLabel, isReady]);

  // MathLive's documented switch is the read-only attribute.
  useEffect(() => {
    fieldRef.current?.toggleAttribute("read-only", readOnly);
  }, [readOnly, isReady]);

  return (
    <div ref={containerRef}>
      {!isReady && (
        <p role="status" className="rounded border border-line px-3 py-2 text-sm text-muted">
          Loading math editor…
        </p>
      )}
    </div>
  );
}
