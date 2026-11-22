export const DiffLineType = {
  SAME: "same",
  ADDED: "added",
  REMOVED: "removed",
} as const;
export type DiffLineType = (typeof DiffLineType)[keyof typeof DiffLineType];

export interface DiffLine {
  type: DiffLineType;
  text: string;
}

/**
 * Line-by-line diff of two answers, using the longest common subsequence.
 * Answers are short (one question each), so the O(n·m) table is fine.
 */
export function diffLines(before: string, after: string): DiffLine[] {
  const a = before.split("\n");
  const b = after.split("\n");

  // common[i][j] = length of the longest common subsequence of a[i:] and b[j:].
  const common = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      common[i][j] = a[i] === b[j] ? common[i + 1][j + 1] + 1 : Math.max(common[i + 1][j], common[i][j + 1]);
    }
  }

  const lines: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      lines.push({ type: DiffLineType.SAME, text: a[i] });
      i++;
      j++;
    } else if (common[i + 1][j] >= common[i][j + 1]) {
      lines.push({ type: DiffLineType.REMOVED, text: a[i++] });
    } else {
      lines.push({ type: DiffLineType.ADDED, text: b[j++] });
    }
  }
  while (i < a.length) lines.push({ type: DiffLineType.REMOVED, text: a[i++] });
  while (j < b.length) lines.push({ type: DiffLineType.ADDED, text: b[j++] });
  return lines;
}
