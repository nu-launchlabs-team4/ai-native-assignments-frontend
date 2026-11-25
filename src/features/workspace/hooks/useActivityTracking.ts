
import { useCallback, useEffect } from "react";

export type ActivityEvent =
  | {
      type: "paste";
      timestamp: string;
      questionId: string;
      detail: {
        characters: number;
      };
    }
  | {
      type: "tab_leave" | "tab_return";
      timestamp: string;
      questionId: string;
    };

interface UseActivityTrackingProps {
  questionId: string;
  onActivity: (event: ActivityEvent) => void;
}

export function useActivityTracking({
  questionId,
  onActivity,
}: UseActivityTrackingProps) {
  // Record a paste event with only the number of characters pasted.
  const recordPaste = useCallback(
    (characters: number) => {
      onActivity({
        type: "paste",
        questionId,
        timestamp: new Date().toISOString(),
        detail: {
          characters,
        },
      });
    },
    [questionId, onActivity],
  );

  // Detect when the student leaves or returns to the assignment tab.
  useEffect(() => {
    function handleVisibilityChange() {
      const eventType =
        document.visibilityState === "hidden" ? "tab_leave" : "tab_return";

      onActivity({
        type: eventType,
        questionId,
        timestamp: new Date().toISOString(),
      });
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [questionId, onActivity]);

  return { recordPaste };
}
