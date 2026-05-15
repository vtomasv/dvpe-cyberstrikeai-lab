import { useCallback, useEffect, useState } from "react";

const PROGRESS_KEY = "dvpe-csai-lab.progress.v1";
const NAV_KEY = "dvpe-csai-lab.nav.v1";

type Progress = Record<string, boolean>;
type Nav = {
  activeModule?: string;
  activeStepByModule?: Record<string, string>;
  activeTabByModule?: Record<string, "manual" | "csai">;
};

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as T;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* noop */
  }
}

export function useChecklist() {
  const [progress, setProgress] = useState<Progress>(() => readJSON<Progress>(PROGRESS_KEY, {}));

  useEffect(() => {
    writeJSON(PROGRESS_KEY, progress);
  }, [progress]);

  const toggle = useCallback((id: string) => {
    setProgress((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const setDone = useCallback((id: string, value: boolean) => {
    setProgress((prev) => ({ ...prev, [id]: value }));
  }, []);

  const reset = useCallback(() => {
    setProgress({});
    writeJSON<Nav>(NAV_KEY, {});
  }, []);

  const isDone = useCallback((id: string) => Boolean(progress[id]), [progress]);

  const completedCount = useCallback(
    (ids: string[]) => ids.reduce((acc, id) => acc + (progress[id] ? 1 : 0), 0),
    [progress],
  );

  return { progress, toggle, setDone, reset, isDone, completedCount };
}

/**
 * Persiste navegación de la guía: módulo activo, paso activo por módulo y
 * pestaña Manual/CSAI por módulo.
 */
export function useLabNav(initialModule: string) {
  const [nav, setNav] = useState<Nav>(() => readJSON<Nav>(NAV_KEY, {}));

  useEffect(() => {
    writeJSON(NAV_KEY, nav);
  }, [nav]);

  const activeModule = nav.activeModule ?? initialModule;
  const activeStepByModule = nav.activeStepByModule ?? {};
  const activeTabByModule = nav.activeTabByModule ?? {};

  const setActiveModule = useCallback((id: string) => {
    setNav((prev) => ({ ...prev, activeModule: id }));
  }, []);

  const setActiveStep = useCallback((moduleId: string, stepId: string) => {
    setNav((prev) => ({
      ...prev,
      activeStepByModule: { ...(prev.activeStepByModule ?? {}), [moduleId]: stepId },
    }));
  }, []);

  const setActiveTab = useCallback((moduleId: string, tab: "manual" | "csai") => {
    setNav((prev) => ({
      ...prev,
      activeTabByModule: { ...(prev.activeTabByModule ?? {}), [moduleId]: tab },
    }));
  }, []);

  return {
    activeModule,
    activeStepByModule,
    activeTabByModule,
    setActiveModule,
    setActiveStep,
    setActiveTab,
  };
}
