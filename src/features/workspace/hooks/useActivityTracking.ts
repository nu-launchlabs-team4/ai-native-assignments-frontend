
import { useCallback, useEffect } from "react";

export type ActivityEvent = {
  type: "paste" | "tab_hidden" | "tab_visible";
  timestamp: string;
  questionId?: string;
};

interface UseActivityTrackingProps {
  questionId: string;
  onActivity: (event: ActivityEvent) => void;
}

export function useActivityTracking({
  questionId,
  onActivity,
}: UseActivityTrackingProps) {
  // Called when the student pastes something into an answer editor.
  const recordPaste = useCallback(() => {
    onActivity({
      type: "paste",
      questionId,
      timestamp: new Date().toISOString(),
    });
  }, [questionId, onActivity]);

  // Detect when the assignment page becomes hidden or visible.
  useEffect(() => {
    function handleVisibilityChange() {
      const eventType =
        document.visibilityState === "hidden" ? "tab_hidden" : "tab_visible";

      onActivity({
        type: eventType,
        questionId,
        timestamp: new Date().toISOString(),
      });
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Clean up the listener when the component unmounts or question changes.
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [questionId, onActivity]);

  return { recordPaste };
}
