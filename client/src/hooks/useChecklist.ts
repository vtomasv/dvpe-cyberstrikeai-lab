import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "dvpe-csai-lab.progress.v1";

type Progress = Record<string, boolean>;

function readStorage(): Progress {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Progress;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStorage(progress: Progress) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    /* noop */
  }
}

export function useChecklist() {
  const [progress, setProgress] = useState<Progress>(() => readStorage());

  useEffect(() => {
    writeStorage(progress);
  }, [progress]);

  const toggle = useCallback((id: string) => {
    setProgress((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const setDone = useCallback((id: string, value: boolean) => {
    setProgress((prev) => ({ ...prev, [id]: value }));
  }, []);

  const reset = useCallback(() => setProgress({}), []);

  const isDone = useCallback((id: string) => Boolean(progress[id]), [progress]);

  const completedCount = useCallback(
    (ids: string[]) => ids.reduce((acc, id) => acc + (progress[id] ? 1 : 0), 0),
    [progress],
  );

  return { progress, toggle, setDone, reset, isDone, completedCount };
}
